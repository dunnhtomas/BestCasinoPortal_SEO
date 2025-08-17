/**
 * Casino Memory Keeper Integration Script
 * Integrates our memory keeper with the existing BestCasinoPortal project
 */

import { CasinoMemoryKeeper } from './simple-memory-keeper';
import * as path from 'path';
import * as fs from 'fs';

export class CasinoMemoryIntegration {
  private memoryKeeper: CasinoMemoryKeeper;
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd();
    
    const dataDir = path.join(this.projectRoot, 'casino-memory-data');
    this.memoryKeeper = new CasinoMemoryKeeper({
      dataDir,
      projectName: 'BestCasinoPortal',
      maxSessions: 50,
      maxItemsPerSession: 5000,
    });
  }

  async initializeProjectMemory(): Promise<void> {
    console.log('🎰 Initializing Casino Memory Keeper for BestCasinoPortal...');

    // Start main project session
    const session = await this.memoryKeeper.sessionStart({
      name: 'BestCasinoPortal Main Development',
      description: 'Main development session for casino portal with reverse engineering, agents, and deployment',
      projectDir: this.projectRoot,
      defaultChannel: 'main-development'
    });

    console.log(`✅ Started main session: ${session.id.substring(0, 8)}`);

    // Save key project context
    await this.saveProjectContext();
    
    // Save agent status
    await this.saveAgentStatus();
    
    // Save recent work context
    await this.saveRecentWork();

    console.log('🎯 Project memory initialized successfully!');
  }

  private async saveProjectContext(): Promise<void> {
    // Save project overview
    await this.memoryKeeper.contextSave({
      key: 'project_overview',
      value: `BestCasinoPortal - Enterprise casino portal with casino.ca reverse engineering, multi-agent orchestration, mandatory Playwright testing, Context7 documentation, and full deployment automation. Tech stack: PHP 8.1+, Vue.js 3+, PostgreSQL, Redis, Nginx, Tailwind CSS.`,
      category: 'note',
      priority: 'critical',
      channel: 'project-info'
    });

    // Save architecture decisions
    await this.memoryKeeper.contextSave({
      key: 'architecture_decision_casino_ca',
      value: 'Using casino.ca proven architecture patterns: Sub-200ms API response times, Core Web Vitals compliance (LCP < 2.5s, FID < 100ms, CLS < 0.1), HTTPS-only with security headers, mobile-first responsive design.',
      category: 'decision',
      priority: 'critical',
      channel: 'architecture'
    });

    // Save testing requirements
    await this.memoryKeeper.contextSave({
      key: 'testing_mandatory_playwright',
      value: 'Zero-tolerance testing policy: All features must have comprehensive Playwright tests. Deployment is blocked on test failures. Cross-browser validation required (Chrome, Firefox, Safari, Edge).',
      category: 'decision',
      priority: 'critical',
      channel: 'testing'
    });

    // Save technology stack
    await this.memoryKeeper.contextSave({
      key: 'tech_stack_enterprise',
      value: 'Backend: PHP 8.1+ with PSR interfaces, Frontend: Vue.js 3+ with TypeScript, Database: PostgreSQL + Redis caching, Infrastructure: Nginx with SSL A+ grade, Testing: Playwright E2E + PHPUnit backend',
      category: 'note',
      priority: 'high',
      channel: 'tech-stack'
    });
  }

  private async saveAgentStatus(): Promise<void> {
    // Multi-agent orchestration status
    await this.memoryKeeper.contextSave({
      key: 'agents_orchestration_status',
      value: 'Multi-agent system active: Senior PHP Architect (backend/API), Vue Component Specialist (frontend), Playwright Testing Specialist (mandatory testing), Security Auditor (enterprise compliance), Performance Optimizer (Core Web Vitals).',
      category: 'progress',
      priority: 'high',
      channel: 'agents'
    });

    // Check if agent files exist and save their status
    const agentFiles = [
      'agents/senior-php-architect-agent.js',
      'agents/vue-component-specialist-agent.js', 
      'agents/playwright-testing-specialist-agent.js',
      'scripts/agent-health-check.js',
      'scripts/agent-dispatch-validation.js'
    ];

    for (const agentFile of agentFiles) {
      const filePath = path.join(this.projectRoot, agentFile);
      if (fs.existsSync(filePath)) {
        await this.memoryKeeper.contextSave({
          key: `agent_file_${path.basename(agentFile, '.js')}`,
          value: `Agent file active: ${agentFile} - Last modified: ${fs.statSync(filePath).mtime.toISOString()}`,
          category: 'progress',
          priority: 'normal',
          channel: 'agents'
        });
      }
    }
  }

  private async saveRecentWork(): Promise<void> {
    // Save current development focus
    await this.memoryKeeper.contextSave({
      key: 'current_focus_memory_keeper',
      value: 'Implementing MCP Memory Keeper for long project context management. This enables persistent context across Claude sessions, preventing loss during compaction and maintaining development continuity.',
      category: 'task',
      priority: 'high',
      channel: 'current-work'
    });

    // Save deployment status
    await this.memoryKeeper.contextSave({
      key: 'deployment_status_ready',
      value: 'Server infrastructure ready: Ubuntu 24.04 hardened, passwordless SSH configured, automated deployment scripts created, CTO agent confirmed live deployment readiness.',
      category: 'progress',
      priority: 'high',
      channel: 'deployment'
    });

    // Save testing status
    await this.memoryKeeper.contextSave({
      key: 'testing_validation_complete',
      value: 'Backend PHP validation passed with zero errors, Playwright test suites functional, agent verification tests confirm real output generation. All critical systems validated.',
      category: 'progress',
      priority: 'high',
      channel: 'testing'
    });
  }

  async saveConversationContext(context: string, category: 'task' | 'decision' | 'progress' | 'note' = 'note'): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.memoryKeeper.contextSave({
      key: `conversation_context_${Date.now()}`,
      value: context,
      category,
      priority: 'normal',
      channel: 'conversation',
      metadata: { timestamp, source: 'claude_conversation' }
    });
  }

  async getProjectSummary(): Promise<string> {
    const items = await this.memoryKeeper.contextGet({
      priorities: ['critical', 'high'],
      limit: 20,
      sort: 'updated_desc'
    });

    if (items.length === 0) {
      return 'No project context available. Run initializeProjectMemory() first.';
    }

    let summary = '🎰 BestCasinoPortal Project Summary\n\n';
    
    const categories = ['note', 'decision', 'task', 'progress'];
    for (const category of categories) {
      const categoryItems = items.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        summary += `**${category.toUpperCase()}:**\n`;
        categoryItems.forEach(item => {
          summary += `• ${item.key}: ${item.value.substring(0, 100)}${item.value.length > 100 ? '...' : ''}\n`;
        });
        summary += '\n';
      }
    }

    return summary;
  }

  async exportProjectContext(outputPath?: string): Promise<{ success: boolean; filePath: string; itemCount: number }> {
    return await this.memoryKeeper.exportContext(undefined, outputPath);
  }

  getMemoryKeeper(): CasinoMemoryKeeper {
    return this.memoryKeeper;
  }

  async getStatus(): Promise<any> {
    return await this.memoryKeeper.getStatus();
  }
}

// Auto-initialize if this file is run directly
if (require.main === module) {
  const integration = new CasinoMemoryIntegration();
  integration.initializeProjectMemory().catch(console.error);
}

export { CasinoMemoryKeeper } from './simple-memory-keeper';
