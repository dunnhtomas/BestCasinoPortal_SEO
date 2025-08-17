/**
 * Casino Memory Keeper Integration Script
 * Integrates our memory keeper with the existing BestCasinoPortal project
 */
import { CasinoMemoryKeeper } from './simple-memory-keeper';
export declare class CasinoMemoryIntegration {
    private memoryKeeper;
    private projectRoot;
    constructor(projectRoot?: string);
    initializeProjectMemory(): Promise<void>;
    private saveProjectContext;
    private saveAgentStatus;
    private saveRecentWork;
    saveConversationContext(context: string, category?: 'task' | 'decision' | 'progress' | 'note'): Promise<void>;
    getProjectSummary(): Promise<string>;
    exportProjectContext(outputPath?: string): Promise<{
        success: boolean;
        filePath: string;
        itemCount: number;
    }>;
    getMemoryKeeper(): CasinoMemoryKeeper;
    getStatus(): Promise<any>;
}
export { CasinoMemoryKeeper } from './simple-memory-keeper';
