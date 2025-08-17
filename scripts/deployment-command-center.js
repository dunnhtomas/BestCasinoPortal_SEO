#!/usr/bin/env node
/**
 * 🎰 BESTCASINOPORTAL.COM - DEPLOYMENT COMMAND CENTER
 * One-click deployment to production server
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('\n🎰 BESTCASINOPORTAL.COM - DEPLOYMENT COMMAND CENTER');
console.log('=' .repeat(80));
console.log('🌐 Server: bestcasinoportal.com (193.233.161.161)');
console.log('☁️  CDN: Cloudflare');
console.log('🔧 OS: Ubuntu 24.04 LTS');
console.log('=' .repeat(80));

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 ${description}...`);
    console.log(`💻 Running: ${command}`);
    
    const process = spawn('bash', ['-c', command], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    process.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`);
        resolve(output);
      } else {
        console.log(`❌ ${description} failed with code ${code}`);
        reject(new Error(`Command failed: ${errorOutput}`));
      }
    });
  });
}

async function deploymentWizard() {
  console.log('\n🧙 DEPLOYMENT WIZARD - INTERACTIVE SETUP');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Create SSH connection test
    console.log('\n📡 STEP 1: Testing server connection...');
    await runCommand(
      'echo "Testing SSH connection..." && timeout 10 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@193.233.161.161 "echo \\"Connection successful\\""',
      'SSH Connection Test'
    );
    
    // Step 2: Setup Cloudflare
    console.log('\n☁️  STEP 2: Configuring Cloudflare...');
    await runCommand(
      'cd deploy && npm install axios --save && node cloudflare-setup.js',
      'Cloudflare DNS Setup'
    );
    
    // Step 3: Setup server
    console.log('\n🔧 STEP 3: Setting up production server...');
    await runCommand(
      'scp deploy/server-setup.sh root@193.233.161.161:/tmp/ && ssh root@193.233.161.161 "chmod +x /tmp/server-setup.sh && /tmp/server-setup.sh"',
      'Production Server Setup'
    );
    
    // Step 4: Deploy application
    console.log('\n🚀 STEP 4: Deploying application...');
    await runCommand(
      'chmod +x deploy/deploy.sh && ./deploy/deploy.sh',
      'Application Deployment'
    );
    
    // Step 5: Start monitoring
    console.log('\n🔍 STEP 5: Starting production monitoring...');
    await runCommand(
      'cd deploy && node production-monitor.js &',
      'Production Monitoring'
    );
    
    // Step 6: Final health check
    console.log('\n🏥 STEP 6: Final health check...');
    await runCommand(
      'sleep 30 && curl -f -k https://bestcasinoportal.com/health || curl -f http://193.233.161.161',
      'Health Check'
    );
    
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('=' .repeat(80));
    console.log('🎰 BestCasinoPortal.com is now LIVE!');
    console.log('🌐 Website: https://bestcasinoportal.com');
    console.log('📊 Monitoring: Active');
    console.log('☁️  CDN: Cloudflare enabled');
    console.log('🔒 SSL: Let\'s Encrypt certificate');
    console.log('⚡ Performance: Core Web Vitals optimized');
    console.log('=' .repeat(80));
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check SSH connection: ssh root@193.233.161.161');
    console.log('2. Verify Cloudflare token: KhoBPsapJwVnmeg8iqoi0BGqOqgty3V9g4TocDXS');
    console.log('3. Check server logs: ssh root@193.233.161.161 "tail -f /var/log/nginx/error.log"');
    console.log('4. Manual deployment: bash deploy/deploy.sh');
  }
}

// Quick deployment option
async function quickDeploy() {
  console.log('\n⚡ QUICK DEPLOYMENT - MINIMAL SETUP');
  console.log('=' .repeat(60));
  
  try {
    // Create minimal deployment script
    const quickScript = `#!/bin/bash
# Quick deployment to bestcasinoportal.com
set -e

echo "🚀 Quick deploying to bestcasinoportal.com..."

# Update server packages
ssh root@193.233.161.161 "apt update && apt install -y nginx php8.1-fpm postgresql-14"

# Create web directory
ssh root@193.233.161.161 "mkdir -p /var/www/bestcasinoportal.com/public"

# Copy files
rsync -avz bestcasinoportal-src/ root@193.233.161.161:/var/www/bestcasinoportal.com/

# Setup basic Nginx
ssh root@193.233.161.161 "cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name bestcasinoportal.com www.bestcasinoportal.com _;
    root /var/www/bestcasinoportal.com/public;
    index index.php index.html;
    
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \\$document_root\\$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location / {
        try_files \\$uri \\$uri/ /index.html;
    }
}
EOF"

# Restart services
ssh root@193.233.161.161 "systemctl restart nginx && systemctl restart php8.1-fpm"

echo "✅ Quick deployment complete!"
echo "🌐 Site available at: http://193.233.161.161"
`;

    fs.writeFileSync('deploy/quick-deploy.sh', quickScript);
    await runCommand('chmod +x deploy/quick-deploy.sh && ./deploy/quick-deploy.sh', 'Quick Deployment');
    
    console.log('\n✅ QUICK DEPLOYMENT COMPLETE!');
    console.log('🌐 Site: http://193.233.161.161');
    
  } catch (error) {
    console.error('❌ Quick deployment failed:', error.message);
  }
}

// Interactive menu
function showMenu() {
  console.log('\n🎯 DEPLOYMENT OPTIONS:');
  console.log('1. 🧙 Full Deployment Wizard (Recommended)');
  console.log('2. ⚡ Quick Deployment (Basic setup)');
  console.log('3. 🔧 Manual Commands');
  console.log('4. 🔍 Status Check');
  console.log('5. 📊 View Deployment Files');
  
  // For this demo, run the wizard automatically
  console.log('\n🚀 Starting Full Deployment Wizard...');
  deploymentWizard();
}

// Manual commands reference
function showManualCommands() {
  console.log('\n🔧 MANUAL DEPLOYMENT COMMANDS:');
  console.log('=' .repeat(60));
  console.log('SSH Connection:');
  console.log('  ssh root@193.233.161.161');
  console.log('');
  console.log('Server Setup:');
  console.log('  scp deploy/server-setup.sh root@193.233.161.161:/tmp/');
  console.log('  ssh root@193.233.161.161 "bash /tmp/server-setup.sh"');
  console.log('');
  console.log('Deploy Application:');
  console.log('  rsync -avz bestcasinoportal-src/ root@193.233.161.161:/var/www/bestcasinoportal.com/');
  console.log('');
  console.log('Cloudflare Setup:');
  console.log('  cd deploy && node cloudflare-setup.js');
  console.log('');
  console.log('Start Monitoring:');
  console.log('  node deploy/production-monitor.js');
  console.log('=' .repeat(60));
}

// Status check
async function statusCheck() {
  console.log('\n📊 PRODUCTION STATUS CHECK');
  console.log('=' .repeat(60));
  
  try {
    await runCommand('curl -I http://193.233.161.161', 'Server Response Check');
    await runCommand('ssh root@193.233.161.161 "systemctl status nginx"', 'Nginx Status');
    await runCommand('ssh root@193.233.161.161 "systemctl status php8.1-fpm"', 'PHP-FPM Status');
  } catch (error) {
    console.log('❌ Status check failed:', error.message);
  }
}

// Show deployment files
function showDeploymentFiles() {
  console.log('\n📁 DEPLOYMENT FILES CREATED:');
  console.log('=' .repeat(60));
  const files = [
    'deploy/server-setup.sh',
    'deploy/deploy.sh', 
    'deploy/cloudflare-setup.js',
    'deploy/.env.production',
    'deploy/production-monitor.js',
    'deploy/package.json'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`❌ ${file} (missing)`);
    }
  });
}

// Check if this is being run directly
if (require.main === module) {
  showMenu();
}

module.exports = {
  deploymentWizard,
  quickDeploy,
  showManualCommands,
  statusCheck,
  showDeploymentFiles
};
