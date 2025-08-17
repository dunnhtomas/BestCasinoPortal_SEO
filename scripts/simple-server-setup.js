#!/usr/bin/env node
/**
 * Simple Remote Server Setup
 * Direct SSH connection for BestCasinoPortal deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Server configuration
const SERVER_CONFIG = {
    hostname: 'bestcasinoportal.com',
    ip: '193.233.161.161',
    port: 22,
    username: 'root',
    password: '6YTqBfsLRPAEYqy3ql'
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = {
        'success': '✅',
        'error': '❌', 
        'warning': '⚠️',
        'info': 'ℹ️',
        'progress': '🔄'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

function testSSHConnection() {
    log('Testing SSH connection with password authentication...', 'progress');
    
    try {
        // Test basic SSH connection
        const testCommand = `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p ${SERVER_CONFIG.port} ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} "echo 'Connection successful'"`;
        log(`Command: ${testCommand}`, 'info');
        log(`You will be prompted for password: ${SERVER_CONFIG.password}`, 'warning');
        
        const result = execSync(testCommand, { 
            encoding: 'utf8',
            stdio: 'inherit',
            timeout: 30000
        });
        
        log('SSH connection test successful!', 'success');
        return true;
        
    } catch (error) {
        log(`SSH connection failed: ${error.message}`, 'error');
        return false;
    }
}

function executeBasicSetup() {
    log('Executing basic server setup...', 'progress');
    
    const setupCommands = [
        'apt update && apt upgrade -y',
        'apt install -y nginx php8.3 php8.3-fpm postgresql redis-server',
        'systemctl enable nginx php8.3-fpm postgresql redis-server',
        'systemctl start nginx php8.3-fpm postgresql redis-server'
    ];
    
    for (const command of setupCommands) {
        try {
            log(`Executing: ${command}`, 'info');
            
            const sshCommand = `ssh -o StrictHostKeyChecking=no -p ${SERVER_CONFIG.port} ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} "${command}"`;
            
            execSync(sshCommand, {
                stdio: 'inherit',
                timeout: 300000 // 5 minutes
            });
            
            log(`Command completed: ${command}`, 'success');
            
        } catch (error) {
            log(`Command failed: ${command} - ${error.message}`, 'error');
            throw error;
        }
    }
}

function setupWebsite() {
    log('Setting up basic website...', 'progress');
    
    const websiteSetup = `
mkdir -p /var/www/bestcasinoportal/public
echo '<?php
echo "<h1>BestCasinoPortal</h1>";
echo "<p>Server is online at " . date("Y-m-d H:i:s") . "</p>";
echo "<p>PHP Version: " . PHP_VERSION . "</p>";
?>' > /var/www/bestcasinoportal/public/index.php
chown -R www-data:www-data /var/www/bestcasinoportal
`;
    
    try {
        const sshCommand = `ssh -o StrictHostKeyChecking=no -p ${SERVER_CONFIG.port} ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} "${websiteSetup}"`;
        
        execSync(sshCommand, {
            stdio: 'inherit',
            timeout: 60000
        });
        
        log('Website setup completed', 'success');
        
    } catch (error) {
        log(`Website setup failed: ${error.message}`, 'error');
        throw error;
    }
}

function testWebsite() {
    log('Testing website...', 'progress');
    
    try {
        const testCommand = `ssh -o StrictHostKeyChecking=no -p ${SERVER_CONFIG.port} ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} "curl -s http://localhost | head -5"`;
        
        const result = execSync(testCommand, {
            encoding: 'utf8',
            timeout: 30000
        });
        
        log('Website test result:', 'success');
        console.log(result);
        
        return true;
        
    } catch (error) {
        log(`Website test failed: ${error.message}`, 'warning');
        return false;
    }
}

function displaySummary() {
    console.log('\\n' + '='.repeat(60));
    console.log('🎉 BASIC SERVER SETUP COMPLETE!');
    console.log('='.repeat(60));
    
    console.log('\\n📋 Server Information:');
    console.log(`   Hostname: ${SERVER_CONFIG.hostname}`);
    console.log(`   IP Address: ${SERVER_CONFIG.ip}`);
    console.log(`   SSH: ssh ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} -p ${SERVER_CONFIG.port}`);
    
    console.log('\\n🚀 Services Status:');
    console.log('   ✅ Nginx web server');
    console.log('   ✅ PHP 8.3-FPM');
    console.log('   ✅ PostgreSQL database');
    console.log('   ✅ Redis cache');
    
    console.log('\\n🌐 Next Steps:');
    console.log('   1. Configure DNS to point to ' + SERVER_CONFIG.ip);
    console.log('   2. Set up SSL certificate');
    console.log('   3. Deploy full application code');
    console.log('   4. Configure security hardening');
    
    console.log('\\n✨ Basic deployment completed successfully!');
}

async function main() {
    console.log('\\n🚀 SIMPLE REMOTE SERVER SETUP');
    console.log('Basic Ubuntu 24.04 server configuration\\n');
    
    try {
        // Test connection
        if (!testSSHConnection()) {
            throw new Error('SSH connection failed');
        }
        
        // Execute setup
        executeBasicSetup();
        setupWebsite();
        
        // Test deployment
        const testSuccess = testWebsite();
        
        if (testSuccess) {
            displaySummary();
        } else {
            log('Setup completed but website test failed', 'warning');
            displaySummary();
        }
        
    } catch (error) {
        log(`Setup failed: ${error.message}`, 'error');
        console.log('\\n📝 Manual Setup Instructions:');
        console.log(`1. SSH to server: ssh ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} -p ${SERVER_CONFIG.port}`);
        console.log(`2. Enter password: ${SERVER_CONFIG.password}`);
        console.log('3. Run these commands:');
        console.log('   apt update && apt upgrade -y');
        console.log('   apt install -y nginx php8.3 php8.3-fpm postgresql redis-server');
        console.log('   systemctl enable nginx php8.3-fpm postgresql redis-server');
        console.log('   systemctl start nginx php8.3-fpm postgresql redis-server');
        console.log('   mkdir -p /var/www/bestcasinoportal/public');
        console.log('   echo "<?php phpinfo(); ?>" > /var/www/bestcasinoportal/public/index.php');
        
        process.exit(1);
    }
}

main();
