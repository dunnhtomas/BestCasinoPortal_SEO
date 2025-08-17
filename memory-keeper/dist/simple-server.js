"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCasinoMemoryServer = void 0;
const simple_memory_keeper_1 = require("./simple-memory-keeper");
const types_1 = require("./types");
class SimpleCasinoMemoryServer {
    constructor() {
        this.memoryKeeper = new simple_memory_keeper_1.CasinoMemoryKeeper({
            projectName: 'BestCasinoPortal'
        });
    }
    async handleRequest(method, args) {
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
        }
        catch (error) {
            throw new Error(`Method execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async handleSessionStart(args) {
        const validatedArgs = (0, types_1.validateSessionStartArgs)(args);
        const session = await this.memoryKeeper.sessionStart(validatedArgs);
        return {
            success: true,
            message: `✅ Started session: ${session.name} (${session.id.substring(0, 8)})`,
            sessionId: session.id
        };
    }
    async handleSessionList(args) {
        const limit = args.limit || 10;
        const sessions = await this.memoryKeeper.sessionList(limit);
        return {
            success: true,
            sessions,
            message: `Found ${sessions.length} sessions`
        };
    }
    async handleContextSave(args) {
        const validatedArgs = (0, types_1.validateContextSaveArgs)(args);
        const item = await this.memoryKeeper.contextSave(validatedArgs);
        return {
            success: true,
            message: `✅ Saved context: ${item.key} (${item.category || 'note'}, ${item.priority})`,
            item
        };
    }
    async handleContextGet(args) {
        const validatedArgs = (0, types_1.validateContextGetArgs)(args);
        const items = await this.memoryKeeper.contextGet(validatedArgs);
        return {
            success: true,
            items,
            count: items.length,
            message: `Found ${items.length} context item(s)`
        };
    }
    async handleContextDelete(args) {
        const { key, sessionId } = args;
        const deleted = await this.memoryKeeper.contextDelete(sessionId || null, key);
        return {
            success: deleted,
            message: deleted ? `✅ Deleted context item: ${key}` : `❌ Context item not found: ${key}`
        };
    }
    async handleContextStatus() {
        const status = await this.memoryKeeper.getStatus();
        return {
            success: true,
            status,
            message: 'Casino Memory Keeper status retrieved'
        };
    }
    async handleCacheFile(args) {
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
    async handleFileChanged(args) {
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
    getMemoryKeeper() {
        return this.memoryKeeper;
    }
}
exports.SimpleCasinoMemoryServer = SimpleCasinoMemoryServer;
//# sourceMappingURL=simple-server.js.map