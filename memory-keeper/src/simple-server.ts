import { CasinoMemoryKeeper } from './simple-memory-keeper';
import { 
  validateContextSaveArgs,
  validateContextGetArgs,
  validateSessionStartArgs,
  type ContextSaveArgs,
  type ContextGetArgs
} from './types';
import * as crypto from 'crypto';

export class SimpleCasinoMemoryServer {
  private memoryKeeper: CasinoMemoryKeeper;

  constructor() {
    this.memoryKeeper = new CasinoMemoryKeeper({
      projectName: 'BestCasinoPortal'
    });
  }

  async handleRequest(method: string, args: any): Promise<any> {
    try {
      switch (method) {
        case 'context_session_start':
          return await this.handleSessionStart(args);
        case 'context_session_list':
          return await this.handleSessionList(args);
        case 'context_save':
          return await this.handleContextSave(args);
        case 'context_get':
          return await this.handleContextGet(args);
        case 'context_delete':
          return await this.handleContextDelete(args);
        case 'context_status':
          return await this.handleContextStatus();
        case 'context_cache_file':
          return await this.handleCacheFile(args);
        case 'context_file_changed':
          return await this.handleFileChanged(args);
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      throw new Error(`Method execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleSessionStart(args: any) {
    const validatedArgs = validateSessionStartArgs(args);
    const session = await this.memoryKeeper.sessionStart(validatedArgs);
    
    return {
      success: true,
      message: `✅ Started session: ${session.name} (${session.id.substring(0, 8)})`,
      sessionId: session.id
    };
  }

  private async handleSessionList(args: any) {
    const limit = args.limit || 10;
    const sessions = await this.memoryKeeper.sessionList(limit);
    
    return {
      success: true,
      sessions,
      message: `Found ${sessions.length} sessions`
    };
  }

  private async handleContextSave(args: any) {
    const validatedArgs = validateContextSaveArgs(args);
    const item = await this.memoryKeeper.contextSave(validatedArgs);
    
    return {
      success: true,
      message: `✅ Saved context: ${item.key} (${item.category || 'note'}, ${item.priority})`,
      item
    };
  }

  private async handleContextGet(args: any) {
    const validatedArgs = validateContextGetArgs(args);
    const items = await this.memoryKeeper.contextGet(validatedArgs);
    
    return {
      success: true,
      items,
      count: items.length,
      message: `Found ${items.length} context item(s)`
    };
  }

  private async handleContextDelete(args: any) {
    const { key, sessionId } = args;
    const deleted = await this.memoryKeeper.contextDelete(sessionId || null, key);
    
    return {
      success: deleted,
      message: deleted ? `✅ Deleted context item: ${key}` : `❌ Context item not found: ${key}`
    };
  }

  private async handleContextStatus() {
    const status = await this.memoryKeeper.getStatus();
    
    return {
      success: true,
      status,
      message: 'Casino Memory Keeper status retrieved'
    };
  }

  private async handleCacheFile(args: any) {
    const { filePath, content } = args;
    if (!filePath || !content) {
      throw new Error('File path and content are required');
    }
    
    const result = await this.memoryKeeper.cacheFile(filePath, content);
    
    return {
      success: true,
      message: `✅ Cached file: ${filePath} (${result.hash.substring(0, 8)})`,
      hash: result.hash
    };
  }

  private async handleFileChanged(args: any) {
    const { filePath, currentContent } = args;
    if (!filePath || !currentContent) {
      throw new Error('File path and current content are required');
    }
    
    const result = await this.memoryKeeper.checkFileChanged(filePath, currentContent);
    
    return {
      success: true,
      changed: result.changed,
      currentHash: result.currentHash,
      previousHash: result.previousHash,
      message: `File ${result.changed ? 'has changed' : 'unchanged'}: ${filePath}`
    };
  }

  getMemoryKeeper(): CasinoMemoryKeeper {
    return this.memoryKeeper;
  }
}
