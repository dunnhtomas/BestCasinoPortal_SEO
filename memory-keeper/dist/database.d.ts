import { Session, ContextItem, ContextSaveArgs, ContextGetArgs } from './types';
export interface DatabaseStats {
    totalSessions: number;
    totalItems: number;
    currentSessionItems: number;
    databaseSize: number;
}
export declare class DatabaseManager {
    private db;
    private dataDir;
    private dbPath;
    constructor(dataDir?: string);
    private initializeDatabase;
    createSession(args: {
        name: string;
        description?: string;
        projectDir?: string;
        defaultChannel?: string;
    }): Promise<Session>;
    getSession(sessionId: string): Promise<Session | null>;
    listSessions(limit?: number): Promise<Session[]>;
    saveContextItem(sessionId: string, args: ContextSaveArgs): Promise<ContextItem>;
    getContextItems(sessionId: string, args: ContextGetArgs): Promise<ContextItem[]>;
    deleteContextItem(sessionId: string, key: string): Promise<boolean>;
    getStats(): Promise<DatabaseStats>;
    close(): void;
}
