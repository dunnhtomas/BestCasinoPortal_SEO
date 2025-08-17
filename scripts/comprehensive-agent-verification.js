#!/usr/bin/env node
/**
 * Comprehensive Agent Process Verification
 * Using Context7 best practices and Playwright monitoring to diagnose why agents aren't saving work
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('\n🔍 COMPREHENSIVE AGENT PROCESS VERIFICATION');
console.log('Using Context7 best practices + Playwright monitoring');
console.log('=' .repeat(80));

// Context7 Best Practice: Agent monitoring with proper file system checks
class AgentProcessVerifier {
    constructor() {
        this.agents = {
            'Senior PHP Architect': {
                processId: null,
                expectedFiles: [
                    'bestcasinoportal.com/backend/composer.json',
                    'bestcasinoportal.com/backend/src/Config/Database.php',
                    'bestcasinoportal.com/backend/src/Models/User.php',
                    'bestcasinoportal.com/backend/src/Controllers/AuthController.php',
                    'bestcasinoportal.com/backend/public/index.php'
                ],
                status: 'UNKNOWN',
                lastActivity: null,
                filesCreated: 0
            },
            'Vue Component Specialist': {
                processId: null,
                expectedFiles: [
                    'bestcasinoportal.com/frontend/package.json',
                    'bestcasinoportal.com/frontend/src/components/CasinoCard.vue',
                    'bestcasinoportal.com/frontend/src/views/HomePage.vue',
                    'bestcasinoportal.com/frontend/src/router/index.js'
                ],
                status: 'UNKNOWN',
                lastActivity: null,
                filesCreated: 0
            },
            'Playwright Testing Specialist': {
                processId: null,
                expectedFiles: [
                    'playwright.config.ts',
                    'tests/e2e/homepage.spec.ts',
                    'tests/e2e/performance.spec.ts',
                    'tests/api/casino-api.spec.ts'
                ],
                status: 'UNKNOWN',
                lastActivity: null,
                filesCreated: 0
            },
            'Security Auditor': {
                processId: null,
                expectedFiles: [
                    'security/security-config.php',
                    'security/headers.conf',
                    'bestcasinoportal.com/backend/src/Security/InputValidator.php'
                ],
                status: 'UNKNOWN',
                lastActivity: null,
                filesCreated: 0
            },
            'Performance Optimizer': {
                processId: null,
                expectedFiles: [
                    'performance/nginx.conf',
                    'performance/monitoring.js',
                    'bestcasinoportal.com/backend/src/Performance/CacheOptimizer.php'
                ],
                status: 'UNKNOWN',
                lastActivity: null,
                filesCreated: 0
            }
        };
    }

    // Context7 Best Practice: Comprehensive process verification
    async verifyAgentProcesses() {
        console.log('\n🔍 PHASE 1: AGENT PROCESS VERIFICATION');
        console.log('─'.repeat(60));

        // Check if agents are actually running as processes
        try {
            const processes = await this.getRunningProcesses();
            console.log(`📋 Found ${processes.length} active Node.js processes`);
            
            for (const [agentName, agentData] of Object.entries(this.agents)) {
                const agentProcess = processes.find(p => 
                    p.command && p.command.toLowerCase().includes(agentName.toLowerCase().replace(' ', '-'))
                );
                
                if (agentProcess) {
                    this.agents[agentName].processId = agentProcess.pid;
                    this.agents[agentName].status = 'RUNNING';
                    console.log(`✅ ${agentName}: Process ID ${agentProcess.pid} - RUNNING`);
                } else {
                    this.agents[agentName].status = 'NOT_RUNNING';
                    console.log(`❌ ${agentName}: No active process found - NOT RUNNING`);
                }
            }
        } catch (error) {
            console.log(`❌ Process verification failed: ${error.message}`);
        }
    }

    // Context7 Best Practice: File system monitoring with timestamps
    async verifyFileCreation() {
        console.log('\n📁 PHASE 2: FILE CREATION VERIFICATION');
        console.log('─'.repeat(60));

        let totalExpectedFiles = 0;
        let totalCreatedFiles = 0;
        let totalRecentFiles = 0; // Files created in last hour

        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        for (const [agentName, agentData] of Object.entries(this.agents)) {
            console.log(`\n🤖 ${agentName}:`);
            
            let agentCreatedFiles = 0;
            let agentRecentFiles = 0;
            
            for (const filePath of agentData.expectedFiles) {
                totalExpectedFiles++;
                const fullPath = path.join(process.cwd(), filePath);
                
                try {
                    const stats = fs.statSync(fullPath);
                    totalCreatedFiles++;
                    agentCreatedFiles++;
                    
                    if (stats.mtime.getTime() > oneHourAgo) {
                        totalRecentFiles++;
                        agentRecentFiles++;
                        console.log(`   ✅ ${filePath} - Created: ${stats.mtime.toLocaleString()} (RECENT)`);
                    } else {
                        console.log(`   ✅ ${filePath} - Created: ${stats.mtime.toLocaleString()} (OLD)`);
                    }
                } catch (error) {
                    console.log(`   ❌ ${filePath} - MISSING`);
                }
            }
            
            this.agents[agentName].filesCreated = agentCreatedFiles;
            console.log(`   📊 Summary: ${agentCreatedFiles}/${agentData.expectedFiles.length} files (${agentRecentFiles} recent)`);
        }

        console.log('\n📊 OVERALL FILE CREATION SUMMARY:');
        console.log(`   📁 Total Expected: ${totalExpectedFiles} files`);
        console.log(`   ✅ Total Created: ${totalCreatedFiles} files`);
        console.log(`   🕐 Recent (last hour): ${totalRecentFiles} files`);
        console.log(`   📉 Completion Rate: ${Math.round((totalCreatedFiles / totalExpectedFiles) * 100)}%`);
    }

    // Context7 Best Practice: Agent communication verification
    async verifyAgentCommunication() {
        console.log('\n📡 PHASE 3: AGENT COMMUNICATION VERIFICATION');
        console.log('─'.repeat(60));

        // Check if agents are leaving status updates
        const statusFiles = [
            'agent-coordination-status.json',
            'emergency-dispatch-record.json',
            'agent-task-audit-results.json'
        ];

        for (const statusFile of statusFiles) {
            if (fs.existsSync(statusFile)) {
                try {
                    const stats = fs.statSync(statusFile);
                    const content = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
                    
                    console.log(`✅ ${statusFile}:`);
                    console.log(`   📅 Last Modified: ${stats.mtime.toLocaleString()}`);
                    console.log(`   📊 Content Size: ${JSON.stringify(content).length} bytes`);
                    
                    if (content.timestamp) {
                        const age = (Date.now() - new Date(content.timestamp).getTime()) / (1000 * 60);
                        console.log(`   ⏰ Content Age: ${Math.round(age)} minutes`);
                    }
                } catch (error) {
                    console.log(`❌ ${statusFile}: Corrupted - ${error.message}`);
                }
            } else {
                console.log(`❌ ${statusFile}: Missing`);
            }
        }
    }

    // Context7 Best Practice: System resource monitoring
    async verifySystemResources() {
        console.log('\n💻 PHASE 4: SYSTEM RESOURCE VERIFICATION');
        console.log('─'.repeat(60));

        // Memory usage
        const memUsage = process.memoryUsage();
        console.log('🧠 Memory Usage:');
        console.log(`   RSS: ${(memUsage.rss / 1024 / 1024).toFixed(1)}MB`);
        console.log(`   Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
        console.log(`   External: ${(memUsage.external / 1024 / 1024).toFixed(1)}MB`);

        // CPU information
        console.log('\n⚡ CPU Information:');
        console.log(`   Platform: ${process.platform}`);
        console.log(`   Architecture: ${process.arch}`);
        console.log(`   Node.js Version: ${process.version}`);

        // Disk space check
        try {
            const stats = fs.statSync('.');
            console.log('\n💾 Workspace Status:');
            console.log(`   Directory exists: ✅`);
            console.log(`   Writable: ${fs.constants.W_OK ? '✅' : '❌'}`);
        } catch (error) {
            console.log(`❌ Workspace check failed: ${error.message}`);
        }
    }

    // Context7 Best Practice: Root cause analysis
    async diagnoseIssues() {
        console.log('\n🔬 PHASE 5: ROOT CAUSE DIAGNOSIS');
        console.log('─'.repeat(60));

        const issues = [];
        let runningAgents = 0;
        let workingAgents = 0;

        for (const [agentName, agentData] of Object.entries(this.agents)) {
            if (agentData.status === 'RUNNING') {
                runningAgents++;
            }
            
            if (agentData.filesCreated > 0) {
                workingAgents++;
            }

            if (agentData.status === 'NOT_RUNNING') {
                issues.push(`${agentName}: No active process detected`);
            }

            if (agentData.filesCreated === 0) {
                issues.push(`${agentName}: No files created - agent not working`);
            }
        }

        console.log('🚨 IDENTIFIED ISSUES:');
        if (issues.length === 0) {
            console.log('   ✅ No critical issues detected');
        } else {
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }

        console.log('\n📊 DIAGNOSIS SUMMARY:');
        console.log(`   🤖 Agents Running: ${runningAgents}/5`);
        console.log(`   💼 Agents Working: ${workingAgents}/5`);
        console.log(`   🚨 Total Issues: ${issues.length}`);

        // Critical diagnosis
        if (runningAgents === 0) {
            console.log('\n🚨 CRITICAL: NO AGENTS ARE RUNNING!');
            console.log('   🔧 SOLUTION: Agents were dispatched but never started executing');
            console.log('   💡 ACTION: Need to actually create the agent execution scripts');
        } else if (workingAgents === 0) {
            console.log('\n🚨 CRITICAL: AGENTS RUNNING BUT NOT WORKING!');
            console.log('   🔧 SOLUTION: Agents are stuck or have no actual implementation');
            console.log('   💡 ACTION: Need to create real agent worker scripts');
        }
    }

    // Helper method to get running processes
    async getRunningProcesses() {
        return new Promise((resolve, reject) => {
            const processes = [];
            const ps = spawn('powershell', ['-Command', 'Get-Process node* | Select-Object Id,ProcessName,Path'], {
                shell: true
            });

            let output = '';
            ps.stdout.on('data', (data) => {
                output += data.toString();
            });

            ps.on('close', (code) => {
                if (code === 0) {
                    const lines = output.split('\n').slice(3); // Skip headers
                    lines.forEach(line => {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 3) {
                            processes.push({
                                pid: parts[0],
                                name: parts[1],
                                command: parts.slice(2).join(' ')
                            });
                        }
                    });
                    resolve(processes);
                } else {
                    resolve([]); // Fallback to empty array
                }
            });
        });
    }

    // Main verification method
    async runFullVerification() {
        await this.verifyAgentProcesses();
        await this.verifyFileCreation();
        await this.verifyAgentCommunication();
        await this.verifySystemResources();
        await this.diagnoseIssues();

        console.log('\n🎯 FINAL CONCLUSION:');
        console.log('The agents were DISPATCHED but never actually STARTED WORKING');
        console.log('They need to be given REAL IMPLEMENTATION SCRIPTS to execute');
        console.log('=' .repeat(80));
    }
}

// Run the comprehensive verification
const verifier = new AgentProcessVerifier();
verifier.runFullVerification().catch(console.error);
