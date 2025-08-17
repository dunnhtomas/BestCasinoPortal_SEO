/**
 * MCP Memory Keeper Integration Test
 * 
 * This test verifies that our MCP Memory Keeper integration is working properly
 * and can be accessed through the MCP protocol for our casino portal project.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs').promises;

test.describe('MCP Memory Keeper Integration', () => {
  const projectRoot = path.resolve(__dirname, '..');
  const memoryDataDir = path.join(projectRoot, 'memory-data');

  test('should have initialized memory keeper properly', async () => {
    // Check that memory data directory exists
    const memoryDirExists = await fs.access(memoryDataDir).then(() => true).catch(() => false);
    expect(memoryDirExists).toBeTruthy();

    // Check that project context file exists
    const contextFile = path.join(memoryDataDir, 'casino-portal-context.json');
    const contextExists = await fs.access(contextFile).then(() => true).catch(() => false);
    expect(contextExists).toBeTruthy();

    if (contextExists) {
      const contextData = JSON.parse(await fs.readFile(contextFile, 'utf8'));
      expect(contextData.project.name).toBe('BestCasinoPortal_SEO');
      expect(contextData.project.channel).toBe('casino-portal-unified');
      expect(contextData.project.architecture).toBe('casino.ca');
    }
  });

  test('should have saved context entries', async () => {
    const contextHistoryFile = path.join(memoryDataDir, 'context-history.json');
    const historyExists = await fs.access(contextHistoryFile).then(() => true).catch(() => false);
    expect(historyExists).toBeTruthy();

    if (historyExists) {
      const historyData = JSON.parse(await fs.readFile(contextHistoryFile, 'utf8'));
      expect(Array.isArray(historyData)).toBeTruthy();
      expect(historyData.length).toBeGreaterThan(0);

      // Check for test context entry
      const testEntry = historyData.find(entry => entry.key === 'memory_keeper_test');
      expect(testEntry).toBeDefined();
      expect(testEntry.category).toBe('testing');
      expect(testEntry.project).toBe('BestCasinoPortal_SEO');
    }
  });

  test('should have created checkpoint', async () => {
    const backupsDir = path.join(memoryDataDir, 'backups');
    const backupsExist = await fs.access(backupsDir).then(() => true).catch(() => false);
    expect(backupsExist).toBeTruthy();

    if (backupsExist) {
      const backupFiles = await fs.readdir(backupsDir);
      const checkpointFiles = backupFiles.filter(file => 
        file.startsWith('checkpoint-mcp-memory-keeper-integration-') && 
        file.endsWith('.json')
      );
      expect(checkpointFiles.length).toBeGreaterThan(0);

      if (checkpointFiles.length > 0) {
        const latestCheckpoint = path.join(backupsDir, checkpointFiles[0]);
        const checkpointData = JSON.parse(await fs.readFile(latestCheckpoint, 'utf8'));
        expect(checkpointData.name).toBe('mcp-memory-keeper-integration');
        expect(checkpointData.project).toBe('BestCasinoPortal_SEO');
        expect(checkpointData.context).toBeDefined();
        expect(checkpointData.projectState).toBeDefined();
      }
    }
  });

  test('should have generated project summary', async () => {
    const summaryFile = path.join(memoryDataDir, 'project-summary.json');
    const summaryExists = await fs.access(summaryFile).then(() => true).catch(() => false);
    expect(summaryExists).toBeTruthy();

    if (summaryExists) {
      const summaryData = JSON.parse(await fs.readFile(summaryFile, 'utf8'));
      expect(summaryData.project).toBe('BestCasinoPortal_SEO');
      expect(summaryData.channel).toBe('casino-portal-unified');
      expect(summaryData.overview).toBeDefined();
      expect(summaryData.nextSteps).toBeDefined();
      expect(Array.isArray(summaryData.nextSteps)).toBeTruthy();
    }
  });

  test('should have proper MCP configuration', async () => {
    const mcpConfigFile = path.join(projectRoot, '.mcp', 'config.json');
    const configExists = await fs.access(mcpConfigFile).then(() => true).catch(() => false);
    expect(configExists).toBeTruthy();

    if (configExists) {
      const configData = JSON.parse(await fs.readFile(mcpConfigFile, 'utf8'));
      expect(configData.mcpServers).toBeDefined();
      expect(configData.mcpServers['memory-keeper']).toBeDefined();
      
      const memoryKeeperConfig = configData.mcpServers['memory-keeper'];
      expect(memoryKeeperConfig.command).toBe('npx');
      expect(memoryKeeperConfig.args).toContain('mcp-memory-keeper');
      expect(memoryKeeperConfig.env).toBeDefined();
      expect(memoryKeeperConfig.env.PROJECT_NAME).toBe('BestCasinoPortal_SEO');
      expect(memoryKeeperConfig.env.CHANNEL).toBe('casino-portal-unified');
    }
  });

  test('should support casino portal specific categories and priorities', async () => {
    const { MEMORY_CONFIG } = require('../scripts/memory-keeper-integration.js');
    
    expect(MEMORY_CONFIG.projectName).toBe('BestCasinoPortal_SEO');
    expect(MEMORY_CONFIG.channel).toBe('casino-portal-unified');
    
    // Check categories
    expect(MEMORY_CONFIG.categories.ARCHITECTURE).toBe('architecture');
    expect(MEMORY_CONFIG.categories.TESTING).toBe('testing');
    expect(MEMORY_CONFIG.categories.SECURITY).toBe('security');
    expect(MEMORY_CONFIG.categories.PERFORMANCE).toBe('performance');
    
    // Check priorities
    expect(MEMORY_CONFIG.priorities.CRITICAL).toBe('critical');
    expect(MEMORY_CONFIG.priorities.HIGH).toBe('high');
    expect(MEMORY_CONFIG.priorities.NORMAL).toBe('normal');
  });
});

test.describe('MCP Memory Keeper Casino Portal Features', () => {
  test('should track casino portal architecture decisions', async () => {
    const { CasinoPortalMemoryKeeper } = require('../scripts/memory-keeper-integration.js');
    const memoryKeeper = new CasinoPortalMemoryKeeper();
    
    // Test saving architecture decision
    const result = await memoryKeeper.saveContext(
      'architecture_decision_test',
      'Using Vue.js 3+ with Composition API for frontend components',
      'architecture',
      'high'
    );
    
    expect(result.success).toBeTruthy();
    expect(result.key).toBe('architecture_decision_test');
  });

  test('should track agent progress and reports', async () => {
    const { CasinoPortalMemoryKeeper } = require('../scripts/memory-keeper-integration.js');
    const memoryKeeper = new CasinoPortalMemoryKeeper();
    
    // Test getting agent report
    const report = await memoryKeeper.getAgentReport('senior-php-architect');
    expect(report).toBeDefined();
    expect(typeof report.exists).toBe('boolean');
    expect(report.summary).toBeDefined();
  });

  test('should capture project state with key files', async () => {
    const { CasinoPortalMemoryKeeper } = require('../scripts/memory-keeper-integration.js');
    const memoryKeeper = new CasinoPortalMemoryKeeper();
    
    const projectState = await memoryKeeper.captureProjectState();
    expect(projectState).toBeDefined();
    expect(projectState.timestamp).toBeDefined();
    expect(projectState.files).toBeDefined();
    expect(projectState.agents).toBeDefined();
    
    // Should check for key casino portal files
    expect(projectState.files['package.json']).toBeDefined();
    expect(projectState.files['.mcp/config.json']).toBeDefined();
  });
});

test.describe('MCP Memory Keeper Performance and Reliability', () => {
  test('should handle errors gracefully', async () => {
    const { CasinoPortalMemoryKeeper } = require('../scripts/memory-keeper-integration.js');
    const memoryKeeper = new CasinoPortalMemoryKeeper();
    
    // Test with invalid parameters
    const result = await memoryKeeper.saveContext('', '', '', '');
    expect(result).toBeDefined();
    // Should still succeed even with empty values
  });

  test('should create backups efficiently', async () => {
    const { CasinoPortalMemoryKeeper } = require('../scripts/memory-keeper-integration.js');
    const memoryKeeper = new CasinoPortalMemoryKeeper();
    
    const checkpointResult = await memoryKeeper.createCheckpoint(
      'test-checkpoint',
      'Test checkpoint for MCP Memory Keeper integration'
    );
    
    expect(checkpointResult.success).toBeTruthy();
    expect(checkpointResult.path).toBeDefined();
    expect(checkpointResult.timestamp).toBeDefined();
  });

  test('should generate comprehensive summaries', async () => {
    const { CasinoPortalMemoryKeeper } = require('../scripts/memory-keeper-integration.js');
    const memoryKeeper = new CasinoPortalMemoryKeeper();
    
    const summary = await memoryKeeper.generateProjectSummary();
    expect(summary).toBeDefined();
    expect(summary.project).toBe('BestCasinoPortal_SEO');
    expect(summary.overview).toBeDefined();
    expect(summary.nextSteps).toBeDefined();
    expect(Array.isArray(summary.nextSteps)).toBeTruthy();
  });
});
