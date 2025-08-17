#!/usr/bin/env node
declare class CasinoMemoryKeeperCLI {
    private memoryKeeper;
    constructor();
    run(): Promise<void>;
    private handleSessionStart;
    private handleSessionList;
    private handleSave;
    private handleGet;
    private handleDelete;
    private handleStatus;
    private handleExport;
    private showHelp;
}
export { CasinoMemoryKeeperCLI };
