"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const uuid_1 = require("uuid");
class DatabaseManager {
    constructor(dataDir) {
        this.dataDir = dataDir || process.env.CASINO_MEMORY_DATA_DIR || './casino-memory-data';
        this.dbPath = path.join(this.dataDir, 'context.db');
        // Ensure data directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        this.db = new sqlite3.Database(this.dbPath);
        this.initializeDatabase();
    }
    initializeDatabase() {
        // Enable WAL mode for better performance
        this.db.run('PRAGMA journal_mode=WAL;');
        this.db.run('PRAGMA synchronous=NORMAL;');
        this.db.run('PRAGMA cache_size=10000;');
        this.db.run('PRAGMA temp_store=memory;');
        // Create tables
        this.db.serialize(() => {
            // Sessions table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          project_dir TEXT,
          default_channel TEXT,
          git_branch TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          item_count INTEGER DEFAULT 0
        )
      `);
            // Context items table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS context_items (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          category TEXT,
          priority TEXT DEFAULT 'normal',
          metadata TEXT,
          private INTEGER DEFAULT 0,
          channel TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
          UNIQUE(session_id, key)
        )
      `);
            // Checkpoints table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS checkpoints (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          include_files INTEGER DEFAULT 0,
          include_git_status INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        )
      `);
            // File cache table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS file_cache (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          file_path TEXT NOT NULL,
          content_hash TEXT NOT NULL,
          content TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
          UNIQUE(session_id, file_path)
        )
      `);
            // Create indexes for better performance
            this.db.run('CREATE INDEX IF NOT EXISTS idx_context_items_session ON context_items(session_id);');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_context_items_category ON context_items(category);');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_context_items_priority ON context_items(priority);');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_context_items_channel ON context_items(channel);');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_context_items_created ON context_items(created_at);');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_context_items_key ON context_items(key);');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_file_cache_session ON file_cache(session_id);');
            this.db.run('CREATE INDEX IF NOT EXISTS idx_file_cache_path ON file_cache(file_path);');
        });
    }
    // Session management
    createSession(args) {
        return new Promise((resolve, reject) => {
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            this.db.run(`INSERT INTO sessions (id, name, description, project_dir, default_channel, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, args.name, args.description || '', args.projectDir || '', args.defaultChannel || '', now, now], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        id,
                        name: args.name,
                        description: args.description,
                        projectDir: args.projectDir,
                        defaultChannel: args.defaultChannel,
                        createdAt: now,
                        updatedAt: now,
                        itemCount: 0
                    });
                }
            });
        });
    }
    getSession(sessionId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row) {
                    resolve({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        projectDir: row.project_dir,
                        defaultChannel: row.default_channel,
                        gitBranch: row.git_branch,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                        itemCount: row.item_count
                    });
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    listSessions(limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM sessions ORDER BY updated_at DESC LIMIT ?', [limit], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        projectDir: row.project_dir,
                        defaultChannel: row.default_channel,
                        gitBranch: row.git_branch,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                        itemCount: row.item_count
                    })));
                }
            });
        });
    }
    // Context item management
    saveContextItem(sessionId, args) {
        return new Promise((resolve, reject) => {
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            this.db.run(`INSERT OR REPLACE INTO context_items 
         (id, session_id, key, value, category, priority, metadata, private, channel, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                id, sessionId, args.key, args.value, args.category || null, args.priority || 'normal',
                args.metadata ? JSON.stringify(args.metadata) : null, args.private ? 1 : 0,
                args.channel || null, now, now
            ], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    // Update session item count
                    resolve({
                        id,
                        sessionId,
                        key: args.key,
                        value: args.value,
                        category: args.category,
                        priority: args.priority || 'normal',
                        metadata: args.metadata,
                        private: args.private || false,
                        channel: args.channel,
                        createdAt: now,
                        updatedAt: now
                    });
                }
            });
        });
    }
    getContextItems(sessionId, args) {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM context_items WHERE session_id = ?';
            const params = [sessionId];
            // Add filters
            if (args.key) {
                query += ' AND key = ?';
                params.push(args.key);
            }
            if (args.keys && args.keys.length > 0) {
                query += ` AND key IN (${args.keys.map(() => '?').join(',')})`;
                params.push(...args.keys);
            }
            if (args.category) {
                query += ' AND category = ?';
                params.push(args.category);
            }
            if (args.categories && args.categories.length > 0) {
                query += ` AND category IN (${args.categories.map(() => '?').join(',')})`;
                params.push(...args.categories);
            }
            if (args.priority) {
                query += ' AND priority = ?';
                params.push(args.priority);
            }
            if (args.priorities && args.priorities.length > 0) {
                query += ` AND priority IN (${args.priorities.map(() => '?').join(',')})`;
                params.push(...args.priorities);
            }
            if (args.channel) {
                query += ' AND channel = ?';
                params.push(args.channel);
            }
            if (args.private !== undefined) {
                query += ' AND private = ?';
                params.push(args.private ? 1 : 0);
            }
            if (args.createdAfter) {
                query += ' AND created_at > ?';
                params.push(args.createdAfter);
            }
            if (args.createdBefore) {
                query += ' AND created_at < ?';
                params.push(args.createdBefore);
            }
            if (args.keyPattern) {
                query += ' AND key REGEXP ?';
                params.push(args.keyPattern);
            }
            // Add sorting
            if (args.sort) {
                switch (args.sort) {
                    case 'created_asc':
                        query += ' ORDER BY created_at ASC';
                        break;
                    case 'created_desc':
                        query += ' ORDER BY created_at DESC';
                        break;
                    case 'updated_asc':
                        query += ' ORDER BY updated_at ASC';
                        break;
                    case 'updated_desc':
                        query += ' ORDER BY updated_at DESC';
                        break;
                    case 'priority':
                        query += ' ORDER BY CASE priority WHEN "critical" THEN 1 WHEN "high" THEN 2 WHEN "normal" THEN 3 WHEN "low" THEN 4 END';
                        break;
                }
            }
            // Add pagination
            if (args.limit) {
                query += ' LIMIT ?';
                params.push(args.limit);
            }
            if (args.offset) {
                query += ' OFFSET ?';
                params.push(args.offset);
            }
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows.map(row => ({
                        id: row.id,
                        sessionId: row.session_id,
                        key: row.key,
                        value: row.value,
                        category: row.category,
                        priority: row.priority,
                        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
                        private: Boolean(row.private),
                        channel: row.channel,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at
                    })));
                }
            });
        });
    }
    deleteContextItem(sessionId, key) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM context_items WHERE session_id = ? AND key = ?', [sessionId, key], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    getStats() {
        return new Promise((resolve, reject) => {
            this.db.get(`
        SELECT 
          (SELECT COUNT(*) FROM sessions) as total_sessions,
          (SELECT COUNT(*) FROM context_items) as total_items
      `, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    // Get database file size
                    const stats = fs.statSync(this.dbPath);
                    resolve({
                        totalSessions: row.total_sessions,
                        totalItems: row.total_items,
                        currentSessionItems: 0, // Will be updated by caller
                        databaseSize: stats.size
                    });
                }
            });
        });
    }
    close() {
        this.db.close();
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=database.js.map