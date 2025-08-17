#!/usr/bin/env node

import { CasinoMemoryKeeper } from './simple-memory-keeper';
import * as path from 'path';
import * as fs from 'fs';

class CasinoMemoryKeeperCLI {
  private memoryKeeper: CasinoMemoryKeeper;

  constructor() {
    const dataDir = process.env.CASINO_MEMORY_DATA_DIR || path.join(process.cwd(), 'casino-memory-data');
    this.memoryKeeper = new CasinoMemoryKeeper({
      dataDir,
      projectName: 'BestCasinoPortal',
    });
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'session:start':
          await this.handleSessionStart(args.slice(1));
          break;
        case 'session:list':
          await this.handleSessionList();
          break;
        case 'save':
          await this.handleSave(args.slice(1));
          break;
        case 'get':
          await this.handleGet(args.slice(1));
          break;
        case 'delete':
          await this.handleDelete(args.slice(1));
          break;
        case 'status':
          await this.handleStatus();
          break;
        case 'export':
          await this.handleExport(args.slice(1));
          break;
        case 'help':
        case '--help':
        case '-h':
          this.showHelp();
          break;
        default:
          console.log(`❌ Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  private async handleSessionStart(args: string[]): Promise<void> {
    const name = args[0];
    if (!name) {
      console.error('❌ Session name is required');
      process.exit(1);
    }

    const session = await this.memoryKeeper.sessionStart({
      name,
      description: args[1] || '',
      projectDir: process.cwd(),
    });

    console.log(`✅ Started session: ${session.name} (${session.id.substring(0, 8)})`);
  }

  private async handleSessionList(): Promise<void> {
    const sessions = await this.memoryKeeper.sessionList(10);
    
    if (sessions.length === 0) {
      console.log('📝 No sessions found');
      return;
    }

    console.log('📋 Recent Sessions:');
    sessions.forEach(session => {
      const created = new Date(session.createdAt).toLocaleDateString();
      console.log(`  • ${session.name} (${session.id.substring(0, 8)}) - ${session.itemCount} items - ${created}`);
    });
  }

  private async handleSave(args: string[]): Promise<void> {
    const key = args[0];
    const value = args[1];
    
    if (!key || !value) {
      console.error('❌ Key and value are required');
      console.error('Usage: casino-memory save <key> <value> [category] [priority]');
      process.exit(1);
    }

    const category = args[2] as any;
    const priority = args[3] as any;

    const item = await this.memoryKeeper.contextSave({
      key,
      value,
      category,
      priority: priority || 'normal',
    });

    console.log(`✅ Saved: ${item.key} (${item.category || 'note'}, ${item.priority})`);
  }

  private async handleGet(args: string[]): Promise<void> {
    const key = args[0];
    const category = args[1] as any;

    const items = await this.memoryKeeper.contextGet({
      key,
      category,
      limit: 10,
    });

    if (items.length === 0) {
      console.log('📝 No items found');
      return;
    }

    console.log(`📄 Found ${items.length} item(s):`);
    items.forEach(item => {
      const date = new Date(item.createdAt).toLocaleDateString();
      console.log(`\n🔑 **${item.key}** (${item.category || 'note'}, ${item.priority}) - ${date}`);
      console.log(`   ${item.value}`);
      if (item.metadata) {
        console.log(`   📋 Metadata: ${JSON.stringify(item.metadata)}`);
      }
    });
  }

  private async handleDelete(args: string[]): Promise<void> {
    const key = args[0];
    
    if (!key) {
      console.error('❌ Key is required');
      process.exit(1);
    }

    const deleted = await this.memoryKeeper.contextDelete(null, key);
    
    if (deleted) {
      console.log(`✅ Deleted: ${key}`);
    } else {
      console.log(`❌ Item not found: ${key}`);
    }
  }

  private async handleStatus(): Promise<void> {
    const status = await this.memoryKeeper.getStatus();
    
    console.log('📊 Casino Memory Keeper Status');
    console.log(`   📁 Data Directory: ${status.dataDir}`);
    console.log(`   🎰 Project: ${status.projectName}`);
    console.log(`   📋 Total Sessions: ${status.totalSessions}`);
    console.log(`   📄 Total Items: ${status.totalItems}`);
    
    if (status.currentSession) {
      console.log(`\n📌 Current Session:`);
      console.log(`   • ${status.currentSession.name} (${status.currentSession.id.substring(0, 8)})`);
      console.log(`   • Items: ${status.currentSession.itemCount}`);
      console.log(`   • Created: ${new Date(status.currentSession.createdAt).toLocaleString()}`);
    } else {
      console.log(`\n⚠️  No active session`);
    }
  }

  private async handleExport(args: string[]): Promise<void> {
    const outputPath = args[0];
    
    const result = await this.memoryKeeper.exportContext(undefined, outputPath);
    
    console.log(`✅ Exported ${result.itemCount} items to: ${result.filePath}`);
  }

  private showHelp(): void {
    console.log(`
🎰 Casino Memory Keeper CLI

Usage:
  casino-memory <command> [args]

Commands:
  session:start <name> [description]  Start a new session
  session:list                        List recent sessions
  save <key> <value> [category] [priority]  Save context item
  get [key] [category]                Get context items
  delete <key>                        Delete context item
  status                              Show status
  export [outputPath]                 Export current session
  help                                Show this help

Categories: task, decision, progress, note, warning, error, critical
Priorities: critical, high, normal, low

Examples:
  casino-memory session:start "Feature Development" "Working on new casino card component"
  casino-memory save "current_task" "Implement responsive design" "task" "high"
  casino-memory get "current_task"
  casino-memory get "" "task"
  casino-memory status

Environment Variables:
  CASINO_MEMORY_DATA_DIR - Data directory (default: ./casino-memory-data)
`);
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new CasinoMemoryKeeperCLI();
  cli.run().catch(console.error);
}

export { CasinoMemoryKeeperCLI };
