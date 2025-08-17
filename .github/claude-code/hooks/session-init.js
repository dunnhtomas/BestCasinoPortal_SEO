#!/usr/bin/env node

/**
 * Claude Code Ultra 2025 - Session Initialization Hook
 * Initializes enterprise-grade session tracking and validation
 */

const fs = require('fs').promises;
const path = require('path');

async function initSession() {
  try {
    const sessionData = JSON.parse(process.argv[2] || '{}');
    
    console.log('🚀 Claude Code Ultra 2025 Enterprise Session Started');
    console.log(`📅 Session ID: ${sessionData.session_id || 'unknown'}`);
    console.log(`👤 User: ${process.env.USER || 'unknown'}`);
    console.log(`📁 Workspace: ${sessionData.cwd || process.cwd()}`);
    console.log(`🤖 Model: ${sessionData.model?.display_name || 'Claude Sonnet 4'}`);
    
    // Initialize session logging
    const logDir = path.join(process.cwd(), '.github/claude-code/logs');
    await fs.mkdir(logDir, { recursive: true });
    
    const sessionLog = {
      sessionId: sessionData.session_id,
      startTime: new Date().toISOString(),
      user: process.env.USER || 'unknown',
      workspace: sessionData.cwd || process.cwd(),
      model: sessionData.model?.display_name || 'Claude Sonnet 4',
      version: sessionData.version || '3.0.0',
      architecture: 'casino-ca-enterprise',
      features: ['mcp', 'sub-agents', 'hooks', 'cli-integration'],
      security: 'enterprise-grade'
    };
    
    await fs.writeFile(
      path.join(logDir, 'current-session.json'),
      JSON.stringify(sessionLog, null, 2)
    );
    
    // Validate environment
    await validateEnvironment();
    
    console.log('✅ Session initialized successfully');
    
  } catch (error) {
    console.error('❌ Session initialization failed:', error.message);
    process.exit(1);
  }
}

async function validateEnvironment() {
  const checks = [];
  
  // Check for Claude CLI
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('claude --version');
    checks.push('✅ Claude CLI installed');
  } catch {
    checks.push('⚠️ Claude CLI not found - install with: npm install -g @anthropic-ai/claude-code');
  }
  
  // Check for Playwright
  try {
    await fs.access(path.join(process.cwd(), 'playwright.config.ts'));
    checks.push('✅ Playwright configured');
  } catch {
    checks.push('⚠️ Playwright not configured - run: npx playwright install');
  }
  
  // Check for MCP configuration
  try {
    await fs.access(path.join(process.cwd(), '.mcp.json'));
    checks.push('✅ MCP configuration found');
  } catch {
    checks.push('⚠️ .mcp.json not found - MCP servers not configured');
  }
  
  // Check for CLAUDE.md
  try {
    await fs.access(path.join(process.cwd(), 'CLAUDE.md'));
    checks.push('✅ CLAUDE.md configuration found');
  } catch {
    checks.push('⚠️ CLAUDE.md not found - project context missing');
  }
  
  console.log('\n🔍 Environment Validation:');
  checks.forEach(check => console.log(`  ${check}`));
  console.log('');
}

// Execute if called directly
if (require.main === module) {
  initSession();
}

module.exports = { initSession };
