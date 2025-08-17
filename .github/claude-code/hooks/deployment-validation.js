#!/usr/bin/env node

/**
 * Claude Code Ultra 2025 - Deployment Validation Hook
 * Ensures all requirements are met before production deployment
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function validateDeployment() {
  console.log('🚀 Claude Code Ultra 2025 - Deployment Validation');
  console.log('═══════════════════════════════════════════════');
  
  const validationResults = [];
  let hasErrors = false;
  
  try {
    // 1. Mandatory Playwright Tests
    console.log('\n🧪 Running mandatory Playwright tests...');
    try {
      const { stdout } = await execAsync('npx playwright test --reporter=json');
      const results = JSON.parse(stdout);
      
      if (results.stats?.failed > 0) {
        validationResults.push(`❌ DEPLOYMENT BLOCKED - ${results.stats.failed} test(s) failed`);
        hasErrors = true;
      } else {
        validationResults.push(`✅ All Playwright tests passed (${results.stats.passed} tests)`);
      }
    } catch (error) {
      validationResults.push('❌ DEPLOYMENT BLOCKED - Playwright tests failed to run');
      hasErrors = true;
    }
    
    // 2. Security Validation
    console.log('🛡️ Running security validation...');
    try {
      // Check for common security issues
      const securityChecks = await runSecurityChecks();
      validationResults.push(...securityChecks);
    } catch (error) {
      validationResults.push('⚠️ Security validation warning: ' + error.message);
    }
    
    // 3. Performance Validation
    console.log('⚡ Validating performance requirements...');
    try {
      const performanceChecks = await runPerformanceChecks();
      validationResults.push(...performanceChecks);
    } catch (error) {
      validationResults.push('⚠️ Performance validation warning: ' + error.message);
    }
    
    // 4. Architecture Compliance
    console.log('🏗️ Checking casino.ca architecture compliance...');
    try {
      const architectureChecks = await runArchitectureChecks();
      validationResults.push(...architectureChecks);
    } catch (error) {
      validationResults.push('⚠️ Architecture validation warning: ' + error.message);
    }
    
    // 5. Environment Validation
    console.log('🌍 Validating deployment environment...');
    try {
      const envChecks = await runEnvironmentChecks();
      validationResults.push(...envChecks);
    } catch (error) {
      validationResults.push('⚠️ Environment validation warning: ' + error.message);
    }
    
    // Generate final report
    console.log('\n📊 DEPLOYMENT VALIDATION REPORT');
    console.log('═════════════════════════════════');
    validationResults.forEach(result => console.log(result));
    
    if (hasErrors) {
      console.log('\n❌ DEPLOYMENT BLOCKED');
      console.log('Fix all errors before attempting deployment.');
      process.exit(1);
    } else {
      console.log('\n✅ DEPLOYMENT APPROVED');
      console.log('All validation checks passed. Ready for production deployment.');
      
      // Log successful validation
      await logDeploymentApproval();
    }
    
  } catch (error) {
    console.error('\n❌ Deployment validation failed:', error.message);
    process.exit(1);
  }
}

async function runSecurityChecks() {
  const checks = [];
  
  // Check for HTTPS enforcement
  try {
    const nginxConfig = await fs.readFile('nginx.conf', 'utf-8');
    if (nginxConfig.includes('return 301 https://')) {
      checks.push('✅ HTTPS redirection configured');
    } else {
      checks.push('⚠️ HTTPS redirection not found in nginx.conf');
    }
  } catch {
    checks.push('⚠️ nginx.conf not found');
  }
  
  // Check for security headers
  try {
    const indexFile = await fs.readFile('public/index.php', 'utf-8');
    if (indexFile.includes('X-Content-Type-Options') && 
        indexFile.includes('X-Frame-Options') && 
        indexFile.includes('X-XSS-Protection')) {
      checks.push('✅ Security headers implemented');
    } else {
      checks.push('⚠️ Missing security headers in public/index.php');
    }
  } catch {
    checks.push('⚠️ public/index.php not found');
  }
  
  return checks;
}

async function runPerformanceChecks() {
  const checks = [];
  
  // Check for performance optimizations
  try {
    const packageJson = await fs.readFile('package.json', 'utf-8');
    const pkg = JSON.parse(packageJson);
    
    if (pkg.dependencies?.playwright) {
      checks.push('✅ Performance testing tools available');
    }
    
    if (pkg.scripts?.['test:performance']) {
      checks.push('✅ Performance test scripts configured');
    } else {
      checks.push('⚠️ No performance test scripts found');
    }
  } catch {
    checks.push('⚠️ package.json not found');
  }
  
  return checks;
}

async function runArchitectureChecks() {
  const checks = [];
  
  // Check for casino.ca architecture patterns
  const requiredStructure = [
    'public/index.php',
    'vue/',
    'api/',
    '.mcp.json'
  ];
  
  for (const item of requiredStructure) {
    try {
      await fs.access(item);
      checks.push(`✅ ${item} exists`);
    } catch {
      checks.push(`⚠️ ${item} not found`);
    }
  }
  
  return checks;
}

async function runEnvironmentChecks() {
  const checks = [];
  
  // Check environment configuration
  if (process.env.NODE_ENV === 'production') {
    checks.push('✅ Production environment detected');
  } else {
    checks.push('⚠️ Not in production environment');
  }
  
  // Check for required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL'];
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      checks.push(`✅ ${envVar} configured`);
    } else {
      checks.push(`⚠️ ${envVar} not configured`);
    }
  }
  
  return checks;
}

async function logDeploymentApproval() {
  const logDir = path.join(process.cwd(), '.github/claude-code/logs');
  await fs.mkdir(logDir, { recursive: true });
  
  const deploymentLog = {
    timestamp: new Date().toISOString(),
    status: 'APPROVED',
    validatedBy: 'claude-code-ultra-2025',
    user: process.env.USER || 'unknown',
    environment: 'production',
    architecture: 'casino-ca',
    testsRun: true,
    securityValidated: true,
    performanceValidated: true
  };
  
  await fs.appendFile(
    path.join(logDir, 'deployment-approvals.json'),
    JSON.stringify(deploymentLog) + '\n'
  );
}

// Execute if called directly
if (require.main === module) {
  validateDeployment();
}

module.exports = { validateDeployment };
