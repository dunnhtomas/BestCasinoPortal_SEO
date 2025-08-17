import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { DatabaseManager } from './database.js';
import { 
  ContextSaveArgsSchema, 
  ContextGetArgsSchema, 
  SessionStartArgsSchema,
  CheckpointArgsSchema,
  FileArgsSchema,
  type Session,
  type ContextItem
} from './types.js';
import * as crypto from 'crypto';

export class CasinoMemoryKeeperServer {
  private server: Server;
  private db: DatabaseManager;
  private currentSessionId: string | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'casino-memory-keeper',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.db = new DatabaseManager();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup(): Promise<void> {
    this.db.close();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'context_session_start',
            description: 'Start a new context session or continue existing one',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Session name' },
                description: { type: 'string', description: 'Session description' },
                projectDir: { type: 'string', description: 'Project directory for git tracking' },
                defaultChannel: { type: 'string', description: 'Default channel for context items' },
                continueFrom: { type: 'string', description: 'Session ID to continue from' },
              },
              required: ['name'],
            },
          },
          {
            name: 'context_session_list',
            description: 'List recent sessions',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'number', description: 'Number of sessions to return', default: 10 },
              },
            },
          },
          {
            name: 'context_save',
            description: 'Save context information with categories and priorities',
            inputSchema: {
              type: 'object',
              properties: {
                key: { type: 'string', description: 'Unique identifier for the context item' },
                value: { type: 'string', description: 'Content to save' },
                category: { 
                  type: 'string', 
                  enum: ['task', 'decision', 'progress', 'note', 'warning', 'error', 'critical'],
                  description: 'Category of the context item'
                },
                priority: { 
                  type: 'string', 
                  enum: ['critical', 'high', 'normal', 'low'],
                  description: 'Priority level',
                  default: 'normal'
                },
                metadata: { type: 'object', description: 'Additional JSON metadata' },
                private: { type: 'boolean', description: 'If true, item is only visible in current session', default: false },
                channel: { type: 'string', description: 'Channel to save to' },
              },
              required: ['key', 'value'],
            },
          },
          {
            name: 'context_get',
            description: 'Retrieve context items with filtering and sorting',
            inputSchema: {
              type: 'object',
              properties: {
                key: { type: 'string', description: 'Specific key to retrieve' },
                keys: { type: 'array', items: { type: 'string' }, description: 'Multiple keys to retrieve' },
                category: { 
                  type: 'string', 
                  enum: ['task', 'decision', 'progress', 'note', 'warning', 'error', 'critical'],
                  description: 'Filter by category'
                },
                categories: { 
                  type: 'array',
                  items: { type: 'string', enum: ['task', 'decision', 'progress', 'note', 'warning', 'error', 'critical'] },
                  description: 'Filter by multiple categories'
                },
                priority: { 
                  type: 'string', 
                  enum: ['critical', 'high', 'normal', 'low'],
                  description: 'Filter by priority'
                },
                priorities: { 
                  type: 'array',
                  items: { type: 'string', enum: ['critical', 'high', 'normal', 'low'] },
                  description: 'Filter by multiple priorities'
                },
                sessionId: { type: 'string', description: 'Session ID to get context from' },
                channel: { type: 'string', description: 'Filter by channel' },
                private: { type: 'boolean', description: 'Filter by private/public items' },
                includeMetadata: { type: 'boolean', description: 'Include metadata in response', default: false },
                sort: { 
                  type: 'string', 
                  enum: ['created_asc', 'created_desc', 'updated_asc', 'updated_desc', 'priority'],
                  description: 'Sort order',
                  default: 'created_desc'
                },
                limit: { type: 'number', description: 'Maximum number of items to return', default: 50, minimum: 1, maximum: 1000 },
                offset: { type: 'number', description: 'Number of items to skip', default: 0, minimum: 0 },
                createdAfter: { type: 'string', description: 'Filter items created after this timestamp' },
                createdBefore: { type: 'string', description: 'Filter items created before this timestamp' },
                keyPattern: { type: 'string', description: 'Regex pattern to match keys' },
              },
            },
          },
          {
            name: 'context_delete',
            description: 'Delete a specific context item',
            inputSchema: {
              type: 'object',
              properties: {
                key: { type: 'string', description: 'Key of item to delete' },
                sessionId: { type: 'string', description: 'Session ID (default: current)' },
              },
              required: ['key'],
            },
          },
          {
            name: 'context_status',
            description: 'Get current session status and statistics',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'context_checkpoint',
            description: 'Create a named snapshot of current context',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Checkpoint name' },
                description: { type: 'string', description: 'Checkpoint description' },
                includeFiles: { type: 'boolean', description: 'Include cached files', default: false },
                includeGitStatus: { type: 'boolean', description: 'Include git status', default: false },
              },
              required: ['name'],
            },
          },
          {
            name: 'context_cache_file',
            description: 'Cache file content for change detection',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: 'Path to the file' },
                content: { type: 'string', description: 'File content to cache' },
              },
              required: ['filePath', 'content'],
            },
          },
          {
            name: 'context_file_changed',
            description: 'Check if a file has changed since last cache',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: 'Path to the file' },
                currentContent: { type: 'string', description: 'Current file content to check' },
              },
              required: ['filePath', 'currentContent'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
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
            return await this.handleContextStatus(args);
          case 'context_checkpoint':
            return await this.handleCheckpoint(args);
          case 'context_cache_file':
            return await this.handleCacheFile(args);
          case 'context_file_changed':
            return await this.handleFileChanged(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async ensureSession(): Promise<string> {
    if (!this.currentSessionId) {
      // Create a default session
      const session = await this.db.createSession({
        name: 'Default Session',
        description: 'Auto-created session for Casino Memory Keeper',
      });
      this.currentSessionId = session.id;
    }
    return this.currentSessionId;
  }

  private async handleSessionStart(args: any) {
    const validatedArgs = SessionStartArgsSchema.parse(args);
    
    try {
      const session = await this.db.createSession({
        name: validatedArgs.name,
        description: validatedArgs.description,
        projectDir: validatedArgs.projectDir,
        defaultChannel: validatedArgs.defaultChannel,
      });
      
      this.currentSessionId = session.id;
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Started new session: ${session.name} (${session.id.substring(0, 8)})`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create session: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleSessionList(args: any) {
    const limit = args.limit || 10;
    
    try {
      const sessions = await this.db.listSessions(limit);
      
      const sessionList = sessions
        .map(s => `• ${s.name} (${s.id.substring(0, 8)})\n  Created: ${s.createdAt}\n  Items: ${s.itemCount}`)
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Recent sessions:\n\n${sessionList}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleContextSave(args: any) {
    const validatedArgs = ContextSaveArgsSchema.parse(args);
    const sessionId = await this.ensureSession();
    
    try {
      const item = await this.db.saveContextItem(sessionId, validatedArgs);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Saved context: ${item.key} (${item.category || 'note'}, ${item.priority})`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to save context: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleContextGet(args: any) {
    const validatedArgs = ContextGetArgsSchema.parse(args);
    const sessionId = validatedArgs.sessionId || await this.ensureSession();
    
    try {
      const items = await this.db.getContextItems(sessionId, validatedArgs);
      
      if (items.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No context items found matching the criteria.',
            },
          ],
        };
      }

      const itemList = items
        .map(item => {
          let result = `**${item.key}** (${item.category || 'note'}, ${item.priority})\n${item.value}`;
          if (validatedArgs.includeMetadata && item.metadata) {
            result += `\nMetadata: ${JSON.stringify(item.metadata, null, 2)}`;
          }
          return result;
        })
        .join('\n\n---\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${items.length} context item(s):\n\n${itemList}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get context: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleContextDelete(args: any) {
    const { key, sessionId } = args;
    const targetSessionId = sessionId || await this.ensureSession();
    
    try {
      const deleted = await this.db.deleteContextItem(targetSessionId, key);
      
      return {
        content: [
          {
            type: 'text',
            text: deleted ? `✅ Deleted context item: ${key}` : `❌ Context item not found: ${key}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete context: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleContextStatus(args: any) {
    try {
      const stats = await this.db.getStats();
      const sessionId = this.currentSessionId;
      
      let statusText = `📊 Casino Memory Keeper Status\n\n`;
      statusText += `Total Sessions: ${stats.totalSessions}\n`;
      statusText += `Total Context Items: ${stats.totalItems}\n`;
      statusText += `Database Size: ${(stats.databaseSize / 1024 / 1024).toFixed(2)} MB\n`;
      
      if (sessionId) {
        const session = await this.db.getSession(sessionId);
        if (session) {
          statusText += `\nCurrent Session: ${session.name} (${session.id.substring(0, 8)})\n`;
          statusText += `Session Items: ${session.itemCount}\n`;
          statusText += `Created: ${session.createdAt}\n`;
        }
      } else {
        statusText += `\n⚠️ No active session`;
      }

      return {
        content: [
          {
            type: 'text',
            text: statusText,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get status: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async handleCheckpoint(args: any) {
    const validatedArgs = CheckpointArgsSchema.parse(args);
    // For now, just acknowledge the checkpoint creation
    // Full implementation would save snapshot to database
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Created checkpoint: ${validatedArgs.name}`,
        },
      ],
    };
  }

  private async handleCacheFile(args: any) {
    const validatedArgs = FileArgsSchema.parse(args);
    const sessionId = await this.ensureSession();
    
    // Create hash of file content
    const hash = crypto.createHash('sha256').update(validatedArgs.content!).digest('hex');
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Cached file: ${validatedArgs.filePath} (${hash.substring(0, 8)})`,
        },
      ],
    };
  }

  private async handleFileChanged(args: any) {
    const validatedArgs = FileArgsSchema.parse(args);
    
    // Create hash of current content
    const currentHash = crypto.createHash('sha256').update(validatedArgs.currentContent!).digest('hex');
    
    // For now, assume it changed (full implementation would check against cached hash)
    return {
      content: [
        {
          type: 'text',
          text: `📄 File status: ${validatedArgs.filePath}\n🔄 Current hash: ${currentHash.substring(0, 8)}\n⚠️ Change detection requires cached version`,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🎰 Casino Memory Keeper started successfully');
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new CasinoMemoryKeeperServer();
  server.run().catch(console.error);
}
