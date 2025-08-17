import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { 
  Session, 
  ContextItem, 
  ContextSaveArgs, 
  ContextGetArgs, 
  SessionStartArgs,
  validateContextSaveArgs,
  validateContextGetArgs,
  validateSessionStartArgs
} from './types';

export interface CasinoMemoryKeeperConfig {
  dataDir?: string;
  projectName?: string;
  maxSessions?: number;
  maxItemsPerSession?: number;
}

export class CasinoMemoryKeeper {
  private dataDir: string;
  private sessionsFile: string;
  private contextsDir: string;
  private currentSessionId: string | null = null;
  private config: CasinoMemoryKeeperConfig;

  constructor(config: CasinoMemoryKeeperConfig = {}) {
    this.config = {
      dataDir: config.dataDir || path.join(process.cwd(), 'casino-memory-data'),
      projectName: config.projectName || 'BestCasinoPortal',
      maxSessions: config.maxSessions || 100,
      maxItemsPerSession: config.maxItemsPerSession || 10000,
      ...config
    };

    this.dataDir = this.config.dataDir!;
    this.sessionsFile = path.join(this.dataDir, 'sessions.json');
    this.contextsDir = path.join(this.dataDir, 'contexts');

    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.contextsDir)) {
      fs.mkdirSync(this.contextsDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionsFile)) {
      fs.writeFileSync(this.sessionsFile, JSON.stringify([], null, 2));
    }
  }

  private loadSessions(): Session[] {
    try {
      const data = fs.readFileSync(this.sessionsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  private saveSessions(sessions: Session[]): void {
    try {
      fs.writeFileSync(this.sessionsFile, JSON.stringify(sessions, null, 2));
    } catch (error) {
      console.error('Failed to save sessions:', error);
      throw new Error('Failed to save sessions');
    }
  }

  private getContextFile(sessionId: string): string {
    return path.join(this.contextsDir, `${sessionId}.json`);
  }

  private loadContextItems(sessionId: string): ContextItem[] {
    const contextFile = this.getContextFile(sessionId);
    try {
      if (fs.existsSync(contextFile)) {
        const data = fs.readFileSync(contextFile, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error(`Failed to load context for session ${sessionId}:`, error);
      return [];
    }
  }

  private saveContextItems(sessionId: string, items: ContextItem[]): void {
    const contextFile = this.getContextFile(sessionId);
    try {
      fs.writeFileSync(contextFile, JSON.stringify(items, null, 2));
    } catch (error) {
      console.error(`Failed to save context for session ${sessionId}:`, error);
      throw new Error('Failed to save context items');
    }
  }

  // Public API Methods

  async sessionStart(args: SessionStartArgs): Promise<Session> {
    const validatedArgs = validateSessionStartArgs(args);
    const sessions = this.loadSessions();
    
    const session: Session = {
      id: validatedArgs.id || uuidv4(),
      name: validatedArgs.name,
      description: validatedArgs.description,
      projectDir: validatedArgs.projectDir,
      defaultChannel: validatedArgs.defaultChannel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0
    };

    sessions.unshift(session);
    
    // Keep only the most recent sessions
    if (sessions.length > this.config.maxSessions!) {
      const removedSessions = sessions.splice(this.config.maxSessions!);
      // Clean up context files for removed sessions
      removedSessions.forEach(s => {
        const contextFile = this.getContextFile(s.id);
        if (fs.existsSync(contextFile)) {
          fs.unlinkSync(contextFile);
        }
      });
    }

    this.saveSessions(sessions);
    this.currentSessionId = session.id;
    
    return session;
  }

  async sessionList(limit: number = 10): Promise<Session[]> {
    const sessions = this.loadSessions();
    return sessions.slice(0, limit);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const sessions = this.loadSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  private async ensureSession(): Promise<string> {
    if (!this.currentSessionId) {
      const session = await this.sessionStart({
        name: `${this.config.projectName} Auto Session`,
        description: 'Auto-created session for Casino Memory Keeper'
      });
      this.currentSessionId = session.id;
    }
    return this.currentSessionId;
  }

  async contextSave(args: ContextSaveArgs): Promise<ContextItem> {
    const validatedArgs = validateContextSaveArgs(args);
    const sessionId = await this.ensureSession();
    
    const items = this.loadContextItems(sessionId);
    
    // Check if item with this key already exists
    const existingIndex = items.findIndex(item => item.key === validatedArgs.key);
    
    const contextItem: ContextItem = {
      id: existingIndex >= 0 ? items[existingIndex].id : uuidv4(),
      sessionId,
      key: validatedArgs.key,
      value: validatedArgs.value,
      category: validatedArgs.category,
      priority: validatedArgs.priority || 'normal',
      metadata: validatedArgs.metadata,
      private: validatedArgs.private || false,
      channel: validatedArgs.channel,
      createdAt: existingIndex >= 0 ? items[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      items[existingIndex] = contextItem;
    } else {
      items.unshift(contextItem);
    }

    // Keep only the most recent items
    if (items.length > this.config.maxItemsPerSession!) {
      items.splice(this.config.maxItemsPerSession!);
    }

    this.saveContextItems(sessionId, items);

    // Update session item count
    const sessions = this.loadSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex >= 0) {
      sessions[sessionIndex].itemCount = items.length;
      sessions[sessionIndex].updatedAt = new Date().toISOString();
      this.saveSessions(sessions);
    }

    return contextItem;
  }

  async contextGet(args: ContextGetArgs): Promise<ContextItem[]> {
    const validatedArgs = validateContextGetArgs(args);
    const sessionId = validatedArgs.sessionId || await this.ensureSession();
    
    let items = this.loadContextItems(sessionId);

    // Apply filters
    if (validatedArgs.key) {
      items = items.filter(item => item.key === validatedArgs.key);
    }

    if (validatedArgs.keys && validatedArgs.keys.length > 0) {
      items = items.filter(item => validatedArgs.keys!.includes(item.key));
    }

    if (validatedArgs.category) {
      items = items.filter(item => item.category === validatedArgs.category);
    }

    if (validatedArgs.categories && validatedArgs.categories.length > 0) {
      items = items.filter(item => item.category && validatedArgs.categories!.includes(item.category));
    }

    if (validatedArgs.priority) {
      items = items.filter(item => item.priority === validatedArgs.priority);
    }

    if (validatedArgs.priorities && validatedArgs.priorities.length > 0) {
      items = items.filter(item => validatedArgs.priorities!.includes(item.priority));
    }

    if (validatedArgs.channel) {
      items = items.filter(item => item.channel === validatedArgs.channel);
    }

    if (validatedArgs.private !== undefined) {
      items = items.filter(item => item.private === validatedArgs.private);
    }

    if (validatedArgs.createdAfter) {
      items = items.filter(item => item.createdAt > validatedArgs.createdAfter!);
    }

    if (validatedArgs.createdBefore) {
      items = items.filter(item => item.createdAt < validatedArgs.createdBefore!);
    }

    if (validatedArgs.keyPattern) {
      const regex = new RegExp(validatedArgs.keyPattern, 'i');
      items = items.filter(item => regex.test(item.key));
    }

    // Apply sorting
    if (validatedArgs.sort) {
      switch (validatedArgs.sort) {
        case 'created_asc':
          items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          break;
        case 'created_desc':
          items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          break;
        case 'updated_asc':
          items.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
          break;
        case 'updated_desc':
          items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          break;
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
          items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
          break;
      }
    }

    // Apply pagination
    const start = validatedArgs.offset || 0;
    const end = start + (validatedArgs.limit || 50);
    
    return items.slice(start, end);
  }

  async contextDelete(sessionId: string | null, key: string): Promise<boolean> {
    const targetSessionId = sessionId || await this.ensureSession();
    const items = this.loadContextItems(targetSessionId);
    
    const initialLength = items.length;
    const filteredItems = items.filter(item => item.key !== key);
    
    if (filteredItems.length < initialLength) {
      this.saveContextItems(targetSessionId, filteredItems);
      
      // Update session item count
      const sessions = this.loadSessions();
      const sessionIndex = sessions.findIndex(s => s.id === targetSessionId);
      if (sessionIndex >= 0) {
        sessions[sessionIndex].itemCount = filteredItems.length;
        sessions[sessionIndex].updatedAt = new Date().toISOString();
        this.saveSessions(sessions);
      }
      
      return true;
    }
    
    return false;
  }

  async getStatus(): Promise<{
    currentSession: Session | null;
    totalSessions: number;
    totalItems: number;
    dataDir: string;
    projectName: string;
  }> {
    const sessions = this.loadSessions();
    const currentSession = this.currentSessionId ? await this.getSession(this.currentSessionId) : null;
    
    // Count total items across all sessions
    let totalItems = 0;
    for (const session of sessions) {
      const items = this.loadContextItems(session.id);
      totalItems += items.length;
    }

    return {
      currentSession,
      totalSessions: sessions.length,
      totalItems,
      dataDir: this.dataDir,
      projectName: this.config.projectName!
    };
  }

  async cacheFile(filePath: string, content: string): Promise<{ hash: string; cached: boolean }> {
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    
    // Save as context item for now (could be enhanced with separate file cache)
    await this.contextSave({
      key: `file_cache:${filePath}`,
      value: JSON.stringify({
        filePath,
        content,
        hash,
        size: content.length,
        cachedAt: new Date().toISOString()
      }),
      category: 'note',
      priority: 'low',
      private: true,
      metadata: { type: 'file_cache', hash, filePath }
    });

    return { hash, cached: true };
  }

  async checkFileChanged(filePath: string, currentContent: string): Promise<{
    changed: boolean;
    previousHash?: string;
    currentHash: string;
  }> {
    const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
    
    // Look for cached file
    const cachedItems = await this.contextGet({
      key: `file_cache:${filePath}`,
      private: true
    });

    if (cachedItems.length > 0) {
      const cached = JSON.parse(cachedItems[0].value);
      return {
        changed: cached.hash !== currentHash,
        previousHash: cached.hash,
        currentHash
      };
    }

    return {
      changed: true, // No cache means it's "changed"
      currentHash
    };
  }

  async exportContext(sessionId?: string, outputPath?: string): Promise<{
    success: boolean;
    filePath: string;
    itemCount: number;
  }> {
    const targetSessionId = sessionId || await this.ensureSession();
    const session = await this.getSession(targetSessionId);
    const items = this.loadContextItems(targetSessionId);
    
    const exportData = {
      session,
      items,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const fileName = `casino-memory-export-${targetSessionId.substring(0, 8)}-${Date.now()}.json`;
    const filePath = outputPath || path.join(this.dataDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    
    return {
      success: true,
      filePath,
      itemCount: items.length
    };
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  setCurrentSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }
}
