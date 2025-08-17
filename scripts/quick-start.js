#!/usr/bin/env node

/**
 * Quick Start Script for BestCasinoPortal Reverse Engineering Suite
 * Provides interactive setup and execution commands
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class QuickStartWizard {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = {};
  }

  async start() {
    console.log(chalk.blue.bold('🎰 BestCasinoPortal.com Reverse Engineering Suite'));
    console.log(chalk.blue.bold('🚀 Quick Start Wizard'));
    console.log('');
    console.log(chalk.gray('This wizard will help you set up and execute the complete'));
    console.log(chalk.gray('reverse engineering analysis of casino.ca and PRD creation.'));
    console.log('');

    await this.gatherConfiguration();
    await this.setupEnvironment();
    await this.executeAnalysis();
  }

  async gatherConfiguration() {
    console.log(chalk.yellow.bold('📋 Configuration Setup'));
    console.log('');

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'analysisType',
        message: 'What type of analysis would you like to run?',
        choices: [
          { name: '🔍 Complete Analysis (Playwright + DataForSEO + PRD)', value: 'complete' },
          { name: '🎭 Playwright Only (Technical Analysis)', value: 'playwright' },
          { name: '📊 DataForSEO Only (SEO Analysis)', value: 'dataforseo' },
          { name: '📝 PRD Generation Only', value: 'prd' },
          { name: '🤖 CTO Sub-Agent Activation', value: 'cto' }
        ]
      },
      {
        type: 'input',
        name: 'dataforSeoLogin',
        message: 'DataForSEO Login (optional for Playwright-only):',
        when: (answers) => answers.analysisType === 'complete' || answers.analysisType === 'dataforseo',
        validate: (input) => input.length > 0 || 'DataForSEO login is required for SEO analysis'
      },
      {
        type: 'password',
        name: 'dataforSeoPassword', 
        message: 'DataForSEO Password:',
        when: (answers) => answers.analysisType === 'complete' || answers.analysisType === 'dataforseo',
        validate: (input) => input.length > 0 || 'DataForSEO password is required for SEO analysis'
      },
      {
        type: 'list',
        name: 'deploymentPhase',
        message: 'Which development phase to prepare for?',
        choices: [
          { name: '🏗️ Foundation (Weeks 1-4)', value: 'foundation' },
          { name: '⚙️ Development (Weeks 5-8)', value: 'development' },
          { name: '🚀 Optimization (Weeks 9-12)', value: 'optimization' },
          { name: '📦 Deployment (Weeks 13-16)', value: 'deployment' }
        ],
        when: (answers) => answers.analysisType === 'complete' || answers.analysisType === 'cto'
      },
      {
        type: 'checkbox',
        name: 'browsers',
        message: 'Select browsers for Playwright testing:',
        choices: [
          { name: 'Chrome (Desktop)', value: 'chromium-desktop', checked: true },
          { name: 'Firefox (Desktop)', value: 'firefox-desktop', checked: true },
          { name: 'Safari (Desktop)', value: 'webkit-desktop', checked: true },
          { name: 'Chrome (Mobile)', value: 'mobile-chrome', checked: true },
          { name: 'Safari (Mobile)', value: 'mobile-safari', checked: false },
          { name: 'Tablet (iPad)', value: 'tablet', checked: false }
        ],
        when: (answers) => answers.analysisType === 'complete' || answers.analysisType === 'playwright'
      },
      {
        type: 'confirm',
        name: 'enableVerbose',
        message: 'Enable verbose output for detailed logs?',
        default: false
      }
    ]);

    this.config = answers;
    
    // Set environment variables
    if (answers.dataforSeoLogin) {
      process.env.DATAFORSEO_LOGIN = answers.dataforSeoLogin;
    }
    if (answers.dataforSeoPassword) {
      process.env.DATAFORSEO_PASSWORD = answers.dataforSeoPassword;
    }
  }

  async setupEnvironment() {
    console.log('');
    console.log(chalk.yellow.bold('🔧 Environment Setup'));
    console.log('');

    const setupSpinner = ora('Setting up project environment...').start();
    
    try {
      // Create necessary directories
      await fs.ensureDir(path.join(this.projectRoot, 'reverse-engineering', 'results'));
      await fs.ensureDir(path.join(this.projectRoot, 'reverse-engineering', 'dataforseo-results'));
      await fs.ensureDir(path.join(this.projectRoot, 'prd'));
      
      setupSpinner.succeed('Environment setup complete');
      
    } catch (error) {
      setupSpinner.fail(`Environment setup failed: ${error.message}`);
      throw error;
    }
  }

  async executeAnalysis() {
    console.log('');
    console.log(chalk.yellow.bold('🚀 Executing Analysis'));
    console.log('');

    switch (this.config.analysisType) {
      case 'complete':
        await this.runCompleteAnalysis();
        break;
      case 'playwright':
        await this.runPlaywrightAnalysis();
        break;
      case 'dataforseo':
        await this.runDataForSEOAnalysis();
        break;
      case 'prd':
        await this.generatePRD();
        break;
      case 'cto':
        await this.activateCTOAgent();
        break;
    }

    await this.displayResults();
  }

  async runCompleteAnalysis() {
    console.log(chalk.blue('🔍 Running Complete Analysis Suite...'));
    console.log('');

    // Step 1: Playwright Analysis
    await this.runPlaywrightAnalysis();
    
    // Step 2: DataForSEO Analysis  
    await this.runDataForSEOAnalysis();
    
    // Step 3: Generate PRD
    await this.generatePRD();
    
    // Step 4: Activate CTO Sub-Agent
    await this.activateCTOAgent();
  }

  async runPlaywrightAnalysis() {
    const playwrightSpinner = ora('Executing Playwright reverse engineering...').start();
    
    try {
      await this.executeCommand('npm run analyze:playwright', {
        cwd: this.projectRoot,
        timeout: 300000 // 5 minutes
      });
      
      playwrightSpinner.succeed('✅ Playwright analysis completed');
      
    } catch (error) {
      playwrightSpinner.fail(`❌ Playwright analysis failed: ${error.message}`);
      throw error;
    }
  }

  async runDataForSEOAnalysis() {
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      console.log(chalk.yellow('⚠️ Skipping DataForSEO analysis - credentials not provided'));
      return;
    }

    const dataforSeoSpinner = ora('Executing DataForSEO analysis...').start();
    
    try {
      await this.executeCommand('npm run analyze:dataforseo', {
        cwd: this.projectRoot,
        timeout: 600000 // 10 minutes
      });
      
      dataforSeoSpinner.succeed('✅ DataForSEO analysis completed');
      
    } catch (error) {
      dataforSeoSpinner.fail(`❌ DataForSEO analysis failed: ${error.message}`);
      throw error;
    }
  }

  async generatePRD() {
    const prdSpinner = ora('Generating comprehensive PRD...').start();
    
    try {
      await this.executeCommand('npm run generate:prd', {
        cwd: this.projectRoot,
        timeout: 60000 // 1 minute
      });
      
      prdSpinner.succeed('✅ PRD generation completed');
      
    } catch (error) {
      prdSpinner.fail(`❌ PRD generation failed: ${error.message}`);
      throw error;
    }
  }

  async activateCTOAgent() {
    const ctoSpinner = ora('Activating CTO Sub-Agent system...').start();
    
    try {
      const phase = this.config.deploymentPhase || 'foundation';
      await this.executeCommand(`npm run cto:activate -- --phase ${phase}`, {
        cwd: this.projectRoot,
        timeout: 30000 // 30 seconds
      });
      
      ctoSpinner.succeed('✅ CTO Sub-Agent activated');
      
    } catch (error) {
      ctoSpinner.fail(`❌ CTO Sub-Agent activation failed: ${error.message}`);
      throw error;
    }
  }

  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        cwd: this.projectRoot,
        timeout: 120000,
        env: { ...process.env }
      };

      const finalOptions = { ...defaultOptions, ...options };
      
      const child = exec(command, finalOptions, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });

      if (this.config.enableVerbose) {
        child.stdout?.on('data', (data) => {
          console.log(chalk.gray(data.toString()));
        });
        
        child.stderr?.on('data', (data) => {
          console.error(chalk.red(data.toString()));
        });
      }
    });
  }

  async displayResults() {
    console.log('');
    console.log(chalk.green.bold('🎉 Analysis Complete!'));
    console.log(''.padEnd(50, '='));
    console.log('');

    // Check for generated files
    const resultsFiles = [
      { path: 'reverse-engineering/results/comprehensive-analysis-report.md', name: 'Playwright Analysis Report' },
      { path: 'reverse-engineering/dataforseo-results/comprehensive-seo-report.md', name: 'DataForSEO Analysis Report' },
      { path: 'prd/bestcasinoportal-comprehensive-prd.md', name: 'Comprehensive PRD' },
      { path: 'prd/cto-agent-instructions.md', name: 'CTO Sub-Agent Instructions' },
      { path: 'prd/cto-agent-state.json', name: 'CTO Agent State' }
    ];

    console.log(chalk.blue.bold('📁 Generated Files:'));
    for (const file of resultsFiles) {
      const filePath = path.join(this.projectRoot, file.path);
      if (await fs.pathExists(filePath)) {
        console.log(chalk.green(`✅ ${file.name}: ${file.path}`));
      } else {
        console.log(chalk.gray(`⏭️ ${file.name}: Not generated (skipped)`));
      }
    }

    console.log('');
    console.log(chalk.blue.bold('🎯 Key Insights:'));
    console.log('• Casino.ca technical architecture reverse engineered');
    console.log('• SEO strategy and competitive analysis completed');
    console.log('• Comprehensive PRD created for BestCasinoPortal.com');
    console.log('• CTO Sub-Agent configured for autonomous development');
    console.log('• Multi-agent orchestration ready for execution');

    console.log('');
    console.log(chalk.blue.bold('🚀 Next Steps:'));
    console.log('1. Review the comprehensive analysis reports');
    console.log('2. Execute: npm run cto:status - Monitor agent coordination');
    console.log('3. Execute: npm run agents:coordinate - Manual agent coordination');
    console.log('4. Execute: npm run deploy:preparation - Prepare for deployment');
    console.log('5. Begin autonomous development with specialized agents');

    console.log('');
    console.log(chalk.yellow('💡 Pro Tip: Use "npm run help" for all available commands'));
  }
}

async function main() {
  try {
    const wizard = new QuickStartWizard();
    await wizard.start();
    
  } catch (error) {
    console.error('');
    console.error(chalk.red.bold('❌ Quick Start Failed:'), error.message);
    console.error('');
    console.error(chalk.gray('Troubleshooting:'));
    console.error(chalk.gray('1. Ensure Node.js 18+ is installed'));
    console.error(chalk.gray('2. Run "npm install" to install dependencies')); 
    console.error(chalk.gray('3. Check DataForSEO credentials if using SEO analysis'));
    console.error(chalk.gray('4. Ensure network connectivity to casino.ca'));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Quick start interrupted by user');
  process.exit(0);
});

if (require.main === module) {
  main();
}
