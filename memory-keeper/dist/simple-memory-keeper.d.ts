import { Session, ContextItem, ContextSaveArgs, ContextGetArgs, SessionStartArgs } from './types';
export interface CasinoMemoryKeeperConfig {
    dataDir?: string;
    projectName?: string;
    maxSessions?: number;
    maxItemsPerSession?: number;
}
export declare class CasinoMemoryKeeper {
    private dataDir;
    private sessionsFile;
    private contextsDir;
    private currentSessionId;
    private config;
    constructor(config?: CasinoMemoryKeeperConfig);
    private ensureDirectories;
    private loadSessions;
    private saveSessions;
    private getContextFile;
    private loadContextItems;
    private saveContextItems;
    sessionStart(args: SessionStartArgs): Promise<Session>;
    sessionList(limit?: number): Promise<Session[]>;
    getSession(sessionId: string): Promise<Session | null>;
    private ensureSession;
    contextSave(args: ContextSaveArgs): Promise<ContextItem>;
    contextGet(args: ContextGetArgs): Promise<ContextItem[]>;
    contextDelete(sessionId: string | null, key: string): Promise<boolean>;
    getStatus(): Promise<{
        currentSession: Session | null;
        totalSessions: number;
        totalItems: number;
        dataDir: string;
        projectName: string;
    }>;
    cacheFile(filePath: string, content: string): Promise<{
        hash: string;
        cached: boolean;
    }>;
    checkFileChanged(filePath: string, currentContent: string): Promise<{
        changed: boolean;
        previousHash?: string;
        currentHash: string;
    }>;
    exportContext(sessionId?: string, outputPath?: string): Promise<{
        success: boolean;
        filePath: string;
        itemCount: number;
    }>;
    getCurrentSessionId(): string | null;
    setCurrentSessionId(sessionId: string): void;
}
