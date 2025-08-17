import { CasinoMemoryKeeper } from './simple-memory-keeper';
export declare class SimpleCasinoMemoryServer {
    private memoryKeeper;
    constructor();
    handleRequest(method: string, args: any): Promise<any>;
    private handleSessionStart;
    private handleSessionList;
    private handleContextSave;
    private handleContextGet;
    private handleContextDelete;
    private handleContextStatus;
    private handleCacheFile;
    private handleFileChanged;
    getMemoryKeeper(): CasinoMemoryKeeper;
}
