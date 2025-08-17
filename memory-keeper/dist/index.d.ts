export declare class CasinoMemoryKeeperServer {
    private server;
    private db;
    private currentSessionId;
    constructor();
    private setupErrorHandling;
    private cleanup;
    private setupToolHandlers;
    private ensureSession;
    private handleSessionStart;
    private handleSessionList;
    private handleContextSave;
    private handleContextGet;
    private handleContextDelete;
    private handleContextStatus;
    private handleCheckpoint;
    private handleCacheFile;
    private handleFileChanged;
    run(): Promise<void>;
}
