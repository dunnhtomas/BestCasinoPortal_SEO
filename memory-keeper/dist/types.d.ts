export interface Session {
    id: string;
    name: string;
    description?: string;
    projectDir?: string;
    defaultChannel?: string;
    gitBranch?: string;
    createdAt: string;
    updatedAt: string;
    itemCount: number;
}
export type ContextCategory = 'task' | 'decision' | 'progress' | 'note' | 'warning' | 'error' | 'critical';
export type ContextPriority = 'critical' | 'high' | 'normal' | 'low';
export interface ContextItem {
    id: string;
    sessionId: string;
    key: string;
    value: string;
    category?: ContextCategory;
    priority: ContextPriority;
    metadata?: any;
    private: boolean;
    channel?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ContextSaveArgs {
    key: string;
    value: string;
    category?: ContextCategory;
    priority?: ContextPriority;
    metadata?: any;
    private?: boolean;
    channel?: string;
}
export interface ContextGetArgs {
    key?: string;
    keys?: string[];
    category?: ContextCategory;
    categories?: ContextCategory[];
    priority?: ContextPriority;
    priorities?: ContextPriority[];
    sessionId?: string;
    channel?: string;
    private?: boolean;
    includeMetadata?: boolean;
    sort?: 'created_asc' | 'created_desc' | 'updated_asc' | 'updated_desc' | 'priority';
    limit?: number;
    offset?: number;
    createdAfter?: string;
    createdBefore?: string;
    keyPattern?: string;
}
export interface SessionStartArgs {
    id?: string;
    name: string;
    description?: string;
    projectDir?: string;
    defaultChannel?: string;
    continueFrom?: string;
}
export interface CheckpointArgs {
    name: string;
    description?: string;
    includeFiles?: boolean;
    includeGitStatus?: boolean;
}
export interface FileArgs {
    filePath: string;
    content?: string;
    currentContent?: string;
}
export declare function validateContextSaveArgs(args: any): ContextSaveArgs;
export declare function validateContextGetArgs(args: any): ContextGetArgs;
export declare function validateSessionStartArgs(args: any): SessionStartArgs;
