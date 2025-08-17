// Simple types without zod dependency
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

// Validation functions
export function validateContextSaveArgs(args: any): ContextSaveArgs {
  if (!args.key || typeof args.key !== 'string') {
    throw new Error('Key is required and must be a string');
  }
  if (!args.value || typeof args.value !== 'string') {
    throw new Error('Value is required and must be a string');
  }
  
  const validCategories: ContextCategory[] = ['task', 'decision', 'progress', 'note', 'warning', 'error', 'critical'];
  const validPriorities: ContextPriority[] = ['critical', 'high', 'normal', 'low'];
  
  if (args.category && !validCategories.includes(args.category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }
  
  if (args.priority && !validPriorities.includes(args.priority)) {
    throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
  }
  
  return {
    key: args.key,
    value: args.value,
    category: args.category,
    priority: args.priority || 'normal',
    metadata: args.metadata,
    private: Boolean(args.private),
    channel: args.channel,
  };
}

export function validateContextGetArgs(args: any): ContextGetArgs {
  const validCategories: ContextCategory[] = ['task', 'decision', 'progress', 'note', 'warning', 'error', 'critical'];
  const validPriorities: ContextPriority[] = ['critical', 'high', 'normal', 'low'];
  const validSorts = ['created_asc', 'created_desc', 'updated_asc', 'updated_desc', 'priority'];
  
  if (args.category && !validCategories.includes(args.category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }
  
  if (args.categories && !Array.isArray(args.categories)) {
    throw new Error('Categories must be an array');
  }
  
  if (args.priority && !validPriorities.includes(args.priority)) {
    throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
  }
  
  if (args.priorities && !Array.isArray(args.priorities)) {
    throw new Error('Priorities must be an array');
  }
  
  if (args.sort && !validSorts.includes(args.sort)) {
    throw new Error(`Invalid sort. Must be one of: ${validSorts.join(', ')}`);
  }
  
  if (args.limit && (typeof args.limit !== 'number' || args.limit < 1 || args.limit > 1000)) {
    throw new Error('Limit must be a number between 1 and 1000');
  }
  
  if (args.offset && (typeof args.offset !== 'number' || args.offset < 0)) {
    throw new Error('Offset must be a non-negative number');
  }
  
  return {
    key: args.key,
    keys: args.keys,
    category: args.category,
    categories: args.categories,
    priority: args.priority,
    priorities: args.priorities,
    sessionId: args.sessionId,
    channel: args.channel,
    private: args.private,
    includeMetadata: Boolean(args.includeMetadata),
    sort: args.sort || 'created_desc',
    limit: args.limit || 50,
    offset: args.offset || 0,
    createdAfter: args.createdAfter,
    createdBefore: args.createdBefore,
    keyPattern: args.keyPattern,
  };
}

export function validateSessionStartArgs(args: any): SessionStartArgs {
  if (!args.name || typeof args.name !== 'string') {
    throw new Error('Session name is required and must be a string');
  }
  
  return {
    id: args.id,
    name: args.name,
    description: args.description,
    projectDir: args.projectDir,
    defaultChannel: args.defaultChannel,
    continueFrom: args.continueFrom,
  };
}
