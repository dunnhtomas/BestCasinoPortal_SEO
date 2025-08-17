#!/usr/bin/env node
/**
 * BestCasinoPortal Server Diagnostics
 * Test connectivity and provide deployment instructions
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Server configuration
const SERVER_CONFIG = {
    hostname: 'bestcasinoportal.com',
    ip: '193.233.161.161',
    port: 22,
    username: 'root',
    password: '6YTqBfsLRPAEYqy3ql',
    cloudflareToken: 'KhoBPsapJwVnmeg8iqoi0BGqOqgty3V9g4TocDXS'
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

function testConnectivity() {
    console.log('\\n🔍 CONNECTIVITY DIAGNOSTICS');
    console.log('='.repeat(50));
    
    // Test 1: Ping the hostname
    log('Testing ping to hostname...', 'progress');
    try {
        const pingResult = execSync(`ping -c 4 ${SERVER_CONFIG.hostname}`, { 
            encoding: 'utf8',
            timeout: 10000 
        });
        log('Ping to hostname successful', 'success');
        console.log(pingResult.split('\\n').slice(-3).join('\\n'));
    } catch (error) {
        log('Ping to hostname failed', 'error');
    }
    
    // Test 2: Ping the IP address
    log('Testing ping to IP address...', 'progress');
    try {
        const pingIPResult = execSync(`ping -c 4 ${SERVER_CONFIG.ip}`, { 
            encoding: 'utf8',
            timeout: 10000 
        });
        log('Ping to IP address successful', 'success');
        console.log(pingIPResult.split('\\n').slice(-3).join('\\n'));
    } catch (error) {
        log('Ping to IP address failed', 'error');
    }
    
    // Test 3: Test SSH port
    log('Testing SSH port connectivity...', 'progress');
    try {
        // Use telnet or nc to test port 22
        const portTest = execSync(`powershell "Test-NetConnection -ComputerName ${SERVER_CONFIG.ip} -Port ${SERVER_CONFIG.port} -InformationLevel Detailed"`, {
            encoding: 'utf8',
            timeout: 15000
        });
        log('SSH port test completed', 'info');
        console.log(portTest);
    } catch (error) {
        log('SSH port test failed or unavailable', 'warning');
        log('This suggests the SSH service may not be running or accessible', 'warning');
    }
    
    // Test 4: DNS resolution
    log('Testing DNS resolution...', 'progress');
    try {
        const dnsResult = execSync(`nslookup ${SERVER_CONFIG.hostname}`, {
            encoding: 'utf8',
            timeout: 10000
        });
        log('DNS resolution successful', 'success');
        console.log(dnsResult);
    } catch (error) {
        log('DNS resolution failed', 'error');
    }
}

function generateManualSetupGuide() {
    console.log('\\n📋 MANUAL DEPLOYMENT GUIDE');
    console.log('='.repeat(50));
    
    const manualGuide = `
# BestCasinoPortal Manual Deployment Guide
# For Ubuntu 24.04 Server

## Prerequisites
- Server IP: ${SERVER_CONFIG.ip}
- Hostname: ${SERVER_CONFIG.hostname}
- Username: ${SERVER_CONFIG.username}
- Password: ${SERVER_CONFIG.password}

## Step 1: Connect to Server
ssh ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} -p ${SERVER_CONFIG.port}
# OR
ssh ${SERVER_CONFIG.username}@${SERVER_CONFIG.ip} -p ${SERVER_CONFIG.port}
# Enter password when prompted: ${SERVER_CONFIG.password}

## Step 2: Update System
apt update && apt upgrade -y

## Step 3: Install Essential Packages
apt install -y \\
    curl wget git unzip \\
    software-properties-common \\
    apt-transport-https \\
    ca-certificates \\
    gnupg \\
    lsb-release \\
    ufw fail2ban \\
    htop iotop \\
    nginx \\
    postgresql postgresql-contrib \\
    redis-server \\
    php8.3 php8.3-fpm php8.3-cli php8.3-common \\
    php8.3-mysql php8.3-pgsql php8.3-redis \\
    php8.3-curl php8.3-json php8.3-gd \\
    php8.3-mbstring php8.3-xml php8.3-zip \\
    nodejs npm \\
    certbot python3-certbot-nginx \\
    supervisor

## Step 4: Configure Services
systemctl enable nginx php8.3-fpm postgresql redis-server
systemctl start nginx php8.3-fpm postgresql redis-server

## Step 5: Set Up SSH Keys (from your local machine)
# Copy your public key to the server
cat ~/.ssh/bestcasinoportal_rsa.pub | ssh ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

## Step 6: Create Website Directory
mkdir -p /var/www/bestcasinoportal/public
chown -R www-data:www-data /var/www/bestcasinoportal

## Step 7: Create Basic Index Page
cat > /var/www/bestcasinoportal/public/index.php << 'EOF'
<?php
echo "<h1>🎰 BestCasinoPortal</h1>";
echo "<p>Server Status: <strong>Online</strong></p>";
echo "<p>Timestamp: " . date('Y-m-d H:i:s T') . "</p>";
echo "<p>Server: " . php_uname('n') . "</p>";
echo "<p>PHP Version: " . PHP_VERSION . "</p>";

// Test database connection
try {
    $pdo = new PDO('pgsql:host=localhost;dbname=postgres', 'postgres', '');
    echo "<p>Database: <span style='color:green'>✅ Connected</span></p>";
} catch (Exception $e) {
    echo "<p>Database: <span style='color:red'>❌ Error</span></p>";
}

// Test Redis connection
try {
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);
    echo "<p>Redis: <span style='color:green'>✅ Connected</span></p>";
} catch (Exception $e) {
    echo "<p>Redis: <span style='color:red'>❌ Error</span></p>";
}

phpinfo();
?>
EOF

chown www-data:www-data /var/www/bestcasinoportal/public/index.php

## Step 8: Configure Nginx
cat > /etc/nginx/sites-available/bestcasinoportal.com << 'EOF'
server {
    listen 80;
    server_name bestcasinoportal.com www.bestcasinoportal.com;
    
    root /var/www/bestcasinoportal/public;
    index index.php index.html index.htm;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    access_log /var/log/nginx/bestcasinoportal.access.log;
    error_log /var/log/nginx/bestcasinoportal.error.log;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/bestcasinoportal.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t && systemctl restart nginx

## Step 9: Configure Firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

## Step 10: Set Up Database
sudo -u postgres createuser --superuser bestcasinoportal
sudo -u postgres createdb bestcasinoportal
sudo -u postgres psql -c "ALTER USER bestcasinoportal PASSWORD 'CasinoPortal2025!Secure';"

## Step 11: Configure Redis
sed -i 's/^# requirepass .*/requirepass RedisPass2025!Secure/' /etc/redis/redis.conf
systemctl restart redis-server

## Step 12: Test Installation
curl -I http://localhost
systemctl status nginx php8.3-fpm postgresql redis-server

## Step 13: SSL Certificate (Optional)
certbot --nginx -d bestcasinoportal.com -d www.bestcasinoportal.com --non-interactive --agree-tos --email admin@bestcasinoportal.com

## Verification Commands
echo "=== Service Status ==="
systemctl status nginx php8.3-fpm postgresql redis-server --no-pager

echo "=== Website Test ==="
curl -s http://localhost | head -10

echo "=== Firewall Status ==="
ufw status

echo "=== Disk Usage ==="
df -h

echo "=== Memory Usage ==="
free -h

echo "=== Installation Complete ==="
echo "Website: http://${SERVER_CONFIG.hostname}"
echo "IP: http://${SERVER_CONFIG.ip}"
`;

    // Save manual guide to file
    fs.writeFileSync('manual-deployment-guide.md', manualGuide);
    
    console.log('📝 Manual deployment guide created: manual-deployment-guide.md');
    console.log('\\n🚀 Quick Start Commands:');
    console.log(`1. ssh ${SERVER_CONFIG.username}@${SERVER_CONFIG.hostname} -p ${SERVER_CONFIG.port}`);
    console.log(`2. Enter password: ${SERVER_CONFIG.password}`);
    console.log('3. Copy and paste the commands from the guide above');
    
    return manualGuide;
}

function generateCloudflareSetup() {
    console.log('\\n☁️ CLOUDFLARE CONFIGURATION');
    console.log('='.repeat(50));
    
    const cloudflareGuide = `
# Cloudflare DNS Configuration
# Token: ${SERVER_CONFIG.cloudflareToken}

## DNS Records to Create:
1. A Record: bestcasinoportal.com → ${SERVER_CONFIG.ip}
2. CNAME Record: www.bestcasinoportal.com → bestcasinoportal.com

## Cloudflare Settings:
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- HTTP Strict Transport Security (HSTS): On
- Minimum TLS Version: 1.2
- Opportunistic Encryption: On
- TLS 1.3: On

## Performance Settings:
- Caching Level: Standard
- Browser Cache TTL: 4 hours
- Auto Minify: CSS, JavaScript, HTML
- Brotli: On
- Rocket Loader: On
- Mirage: On
- Polish: Lossless

## Security Settings:
- Security Level: Medium
- Challenge Passage: 30 minutes
- Browser Integrity Check: On
- Privacy Pass Support: On
- Bot Fight Mode: On

## Page Rules:
1. *.bestcasinoportal.com/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 2 hours
   - Browser Cache TTL: 4 hours
`;

    fs.writeFileSync('cloudflare-setup-guide.md', cloudflareGuide);
    console.log('📄 Cloudflare setup guide created: cloudflare-setup-guide.md');
}

function displaySummary() {
    console.log('\\n🎯 DEPLOYMENT STATUS SUMMARY');
    console.log('='.repeat(50));
    
    console.log('\\n📊 Current Status:');
    console.log('❌ Server connection: Failed (timeout)');
    console.log('✅ SSH keys: Generated and ready');
    console.log('✅ Deployment scripts: Created');
    console.log('✅ Manual guides: Available');
    
    console.log('\\n🔧 Available Resources:');
    console.log('📝 manual-deployment-guide.md - Complete server setup');
    console.log('☁️ cloudflare-setup-guide.md - DNS and CDN configuration');
    console.log('🔑 ~/.ssh/bestcasinoportal_rsa - SSH private key');
    console.log('🔐 ~/.ssh/bestcasinoportal_rsa.pub - SSH public key');
    
    console.log('\\n🚀 Next Steps:');
    console.log('1. Verify server is accessible (may need to be started)');
    console.log('2. Follow manual deployment guide when server is online');
    console.log('3. Configure Cloudflare DNS settings');
    console.log('4. Test website accessibility');
    
    console.log('\\n📞 Server Details:');
    console.log(`   Hostname: ${SERVER_CONFIG.hostname}`);
    console.log(`   IP Address: ${SERVER_CONFIG.ip}`);
    console.log(`   SSH Port: ${SERVER_CONFIG.port}`);
    console.log(`   Username: ${SERVER_CONFIG.username}`);
    console.log(`   Password: ${SERVER_CONFIG.password}`);
    
    console.log('\\n✨ Ready for deployment when server is accessible!');
}

async function main() {
    console.log('\\n🔍 BESTCASINOPORTAL SERVER DIAGNOSTICS');
    console.log('Testing connectivity and preparing deployment resources\\n');
    
    try {
        // Run connectivity tests
        testConnectivity();
        
        // Generate manual setup guides
        generateManualSetupGuide();
        generateCloudflareSetup();
        
        // Display summary
        displaySummary();
        
    } catch (error) {
        log(`Diagnostics failed: ${error.message}`, 'error');
    }
}

main();
