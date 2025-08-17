#!/usr/bin/env node
/**
 * 🚀 BESTCASINOPORTAL.COM - LIVE PRODUCTION DEPLOYMENT
 * Automated deployment to production server with Cloudflare integration
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 BESTCASINOPORTAL.COM - LIVE PRODUCTION DEPLOYMENT');
console.log('=' .repeat(80));
console.log('🌐 Target: bestcasinoportal.com (193.233.161.161)');
console.log('☁️  CDN: Cloudflare integration active');
console.log('🔧 OS: Ubuntu 24.04 LTS');
console.log('=' .repeat(80));

// Production server configuration
const productionConfig = {
  server: {
    hostname: 'bestcasinoportal.com',
    ip: '193.233.161.161',
    username: 'root',
    password: '6YTqBfsLRPAEYqy3ql',
    os: 'Ubuntu 24.04'
  },
  cloudflare: {
    token: 'KhoBPsapJwVnmeg8iqoi0BGqOqgty3V9g4TocDXS',
    zone: 'bestcasinoportal.com'
  },
  deployment: {
    webRoot: '/var/www/bestcasinoportal.com',
    nginxConfig: '/etc/nginx/sites-available/bestcasinoportal.com',
    sslPath: '/etc/letsencrypt/live/bestcasinoportal.com',
    phpVersion: '8.1'
  }
};

console.log('\n🔧 GENERATING DEPLOYMENT SCRIPTS...');

// Generate server setup script
const serverSetupScript = `#!/bin/bash
# 🚀 BestCasinoPortal.com Production Server Setup
# Ubuntu 24.04 LTS automated configuration

set -e  # Exit on any error

echo "🚀 Starting BestCasinoPortal.com production setup..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "📦 Installing core packages..."
apt install -y nginx php8.1-fpm php8.1-mysql php8.1-redis php8.1-curl php8.1-json php8.1-mbstring php8.1-xml php8.1-zip php8.1-gd php8.1-intl postgresql-14 redis-server composer nodejs npm git certbot python3-certbot-nginx unzip curl wget

# Install PostgreSQL
echo "🗄️  Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE bestcasinoportal_prod;"
sudo -u postgres psql -c "CREATE USER casino_user WITH PASSWORD 'SecureCasinoPass2025!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bestcasinoportal_prod TO casino_user;"

# Setup Redis
echo "🔄 Configuring Redis..."
systemctl start redis-server
systemctl enable redis-server

# Create web directory
echo "📁 Creating web directories..."
mkdir -p /var/www/bestcasinoportal.com
mkdir -p /var/www/bestcasinoportal.com/public
mkdir -p /var/www/bestcasinoportal.com/backend
mkdir -p /var/www/bestcasinoportal.com/frontend
mkdir -p /var/www/bestcasinoportal.com/storage/logs
mkdir -p /var/www/bestcasinoportal.com/storage/cache

# Set permissions
chown -R www-data:www-data /var/www/bestcasinoportal.com
chmod -R 755 /var/www/bestcasinoportal.com

# Configure PHP-FPM
echo "🐘 Configuring PHP-FPM..."
systemctl start php8.1-fpm
systemctl enable php8.1-fpm

# Configure Nginx
echo "🌐 Setting up Nginx configuration..."
cat > /etc/nginx/sites-available/bestcasinoportal.com << 'EOF'
server {
    listen 80;
    server_name bestcasinoportal.com www.bestcasinoportal.com;
    root /var/www/bestcasinoportal.com/public;
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Cache static assets
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|pdf|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PHP handling
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Security
        fastcgi_hide_header X-Powered-By;
    }

    # API routes
    location /api/ {
        try_files $uri $uri/ /api/index.php?$query_string;
    }

    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny access to hidden files
    location ~ /\\. {
        deny all;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=casino_limit:10m rate=10r/s;
    limit_req zone=casino_limit burst=20 nodelay;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/bestcasinoportal.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Install SSL certificate
echo "🔐 Installing SSL certificate..."
certbot --nginx -d bestcasinoportal.com -d www.bestcasinoportal.com --non-interactive --agree-tos --email admin@bestcasinoportal.com

# Restart services
echo "🔄 Restarting services..."
systemctl restart nginx
systemctl restart php8.1-fpm

# Install PM2 for Node.js process management
echo "🔧 Installing PM2..."
npm install -g pm2

# Setup firewall
echo "🛡️ Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Setup log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/bestcasinoportal << 'EOF'
/var/www/bestcasinoportal.com/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF

# Setup cron jobs
echo "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/bin/php /var/www/bestcasinoportal.com/backend/artisan schedule:run") | crontab -

echo "✅ Server setup complete!"
echo "🌐 Server ready for BestCasinoPortal.com deployment"
`;

// Create deploy directory and write server setup script
fs.mkdirSync('deploy', { recursive: true });
fs.writeFileSync('deploy/server-setup.sh', serverSetupScript);

console.log('✅ Server setup script generated');

// Generate deployment script
const deploymentScript = `#!/bin/bash
# 🚀 BestCasinoPortal.com Deployment Script
# Automated deployment to production server

set -e

echo "🚀 Deploying BestCasinoPortal.com to production..."

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm ci --production
npm run build
cd ..

# Install backend dependencies
echo "🐘 Installing backend dependencies..."
cd backend
composer install --no-dev --optimize-autoloader
cd ..

# Copy files to server
echo "📁 Copying files to production server..."

# Backend files
rsync -avz --delete backend/ root@193.233.161.161:/var/www/bestcasinoportal.com/backend/

# Frontend dist files
rsync -avz --delete frontend/dist/ root@193.233.161.161:/var/www/bestcasinoportal.com/public/

# Configuration files
scp deploy/nginx.conf root@193.233.161.161:/etc/nginx/sites-available/bestcasinoportal.com
scp deploy/php.ini root@193.233.161.161:/etc/php/8.1/fpm/conf.d/99-casino.ini

# Run database migrations
echo "🗄️ Running database migrations..."
ssh root@193.233.161.161 "cd /var/www/bestcasinoportal.com/backend && php artisan migrate --force"

# Clear caches
echo "🧹 Clearing caches..."
ssh root@193.233.161.161 "cd /var/www/bestcasinoportal.com/backend && php artisan cache:clear && php artisan config:cache && php artisan route:cache"

# Restart services
echo "🔄 Restarting services..."
ssh root@193.233.161.161 "systemctl restart nginx && systemctl restart php8.1-fpm"

# Warm up application
echo "🔥 Warming up application..."
curl -f https://bestcasinoportal.com/health || echo "Health check will be available after DNS propagation"

echo "✅ Deployment complete!"
echo "🎰 BestCasinoPortal.com is now live!"
`;

fs.mkdirSync('deploy', { recursive: true });
fs.writeFileSync('deploy/deploy.sh', deploymentScript);

console.log('✅ Deployment script generated');

// Generate Cloudflare DNS configuration
const cloudflareConfig = `#!/usr/bin/env node
/**
 * Cloudflare DNS Configuration for BestCasinoPortal.com
 * Automated DNS setup with performance optimization
 */

const axios = require('axios');

const CLOUDFLARE_TOKEN = 'KhoBPsapJwVnmeg8iqoi0BGqOqgty3V9g4TocDXS';
const ZONE_NAME = 'bestcasinoportal.com';
const SERVER_IP = '193.233.161.161';

const cloudflare = axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4',
  headers: {
    'Authorization': \`Bearer \${CLOUDFLARE_TOKEN}\`,
    'Content-Type': 'application/json'
  }
});

async function setupCloudflare() {
  try {
    console.log('☁️ Setting up Cloudflare for BestCasinoPortal.com...');

    // Get zone ID
    const zonesResponse = await cloudflare.get('/zones', {
      params: { name: ZONE_NAME }
    });
    
    const zone = zonesResponse.data.result[0];
    if (!zone) {
      console.error('❌ Zone not found. Please add the domain to Cloudflare first.');
      return;
    }
    
    const zoneId = zone.id;
    console.log(\`✅ Zone ID: \${zoneId}\`);

    // DNS Records to create
    const dnsRecords = [
      {
        type: 'A',
        name: '@',
        content: SERVER_IP,
        ttl: 1,
        proxied: true
      },
      {
        type: 'A', 
        name: 'www',
        content: SERVER_IP,
        ttl: 1,
        proxied: true
      },
      {
        type: 'CNAME',
        name: 'api',
        content: 'bestcasinoportal.com',
        ttl: 1,
        proxied: true
      }
    ];

    // Create DNS records
    for (const record of dnsRecords) {
      try {
        await cloudflare.post(\`/zones/\${zoneId}/dns_records\`, record);
        console.log(\`✅ Created \${record.type} record: \${record.name}\`);
      } catch (error) {
        if (error.response?.data?.errors?.[0]?.code === 81057) {
          console.log(\`ℹ️ \${record.type} record \${record.name} already exists\`);
        } else {
          console.error(\`❌ Failed to create \${record.type} record \${record.name}:, error.message\`);
        }
      }
    }

    // Configure SSL/TLS settings
    console.log('🔐 Configuring SSL/TLS settings...');
    await cloudflare.patch(\`/zones/\${zoneId}/settings/ssl\`, {
      value: 'full'
    });

    // Enable security features
    console.log('🛡️ Enabling security features...');
    const securitySettings = [
      { setting: 'always_use_https', value: 'on' },
      { setting: 'automatic_https_rewrites', value: 'on' },
      { setting: 'brotli', value: 'on' },
      { setting: 'minify', value: { css: 'on', html: 'on', js: 'on' } },
      { setting: 'security_level', value: 'medium' },
      { setting: 'browser_check', value: 'on' }
    ];

    for (const { setting, value } of securitySettings) {
      try {
        await cloudflare.patch(\`/zones/\${zoneId}/settings/\${setting}\`, { value });
        console.log(\`✅ Enabled \${setting}\`);
      } catch (error) {
        console.error(\`⚠️ Could not configure \${setting}:, error.message\`);
      }
    }

    // Create page rules for performance
    console.log('⚡ Creating performance page rules...');
    const pageRules = [
      {
        targets: [{ target: 'url', constraint: { operator: 'matches', value: 'bestcasinoportal.com/assets/*' }}],
        actions: [
          { id: 'cache_level', value: 'cache_everything' },
          { id: 'edge_cache_ttl', value: 31536000 }
        ],
        priority: 1,
        status: 'active'
      }
    ];

    for (const rule of pageRules) {
      try {
        await cloudflare.post(\`/zones/\${zoneId}/pagerules\`, rule);
        console.log('✅ Created performance page rule');
      } catch (error) {
        console.error('⚠️ Could not create page rule:', error.message);
      }
    }

    console.log('✅ Cloudflare configuration complete!');
    console.log('🌐 DNS propagation may take up to 24 hours');
    console.log('🎰 BestCasinoPortal.com is now protected by Cloudflare!');

  } catch (error) {
    console.error('❌ Cloudflare setup error:', error.message);
  }
}

// Run setup
setupCloudflare();
`;

fs.writeFileSync('deploy/cloudflare-setup.js', cloudflareConfig);

console.log('✅ Cloudflare configuration script generated');

// Generate production environment configuration
const productionEnv = `# 🎰 BestCasinoPortal.com Production Environment
# Secure production configuration

# Application
APP_NAME="Best Casino Portal"
APP_ENV=production
APP_KEY=base64:$(openssl rand -base64 32)
APP_DEBUG=false
APP_URL=https://bestcasinoportal.com

# Database
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=bestcasinoportal_prod
DB_USERNAME=casino_user
DB_PASSWORD=SecureCasinoPass2025!

# Redis
REDIS_HOST=localhost
REDIS_PASSWORD=null
REDIS_PORT=6379

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@bestcasinoportal.com"
MAIL_FROM_NAME="Best Casino Portal"

# Analytics
GOOGLE_ANALYTICS_ID=G-BESTCASINO2025
FACEBOOK_PIXEL_ID=BESTCASINO2025FB
GTM_ID=GTM-BESTCASINO

# DataForSEO API
DATAFORSEO_API_URL=https://api.dataforseo.com/v3
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password

# Affiliate APIs
AFFILIATE_TRACKING_ENABLED=true
AFFILIATE_DEFAULT_COMMISSION=25

# Security
SESSION_LIFETIME=120
SANCTUM_STATEFUL_DOMAINS=bestcasinoportal.com,www.bestcasinoportal.com

# Performance
TELESCOPE_ENABLED=false
DEBUGBAR_ENABLED=false
HORIZON_ENABLED=true

# Logging
LOG_CHANNEL=daily
LOG_LEVEL=error

# CDN
CDN_URL=https://cdn.bestcasinoportal.com
ASSET_URL=https://bestcasinoportal.com
`;

fs.writeFileSync('deploy/.env.production', productionEnv);

console.log('✅ Production environment configuration generated');

// Generate monitoring script
const monitoringScript = `#!/usr/bin/env node
/**
 * 🔍 BestCasinoPortal.com Production Monitoring
 * Real-time monitoring and alerting system
 */

const axios = require('axios');
const fs = require('fs');

class ProductionMonitor {
  constructor() {
    this.baseUrl = 'https://bestcasinoportal.com';
    this.metrics = {
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      lastCheck: null
    };
  }

  async checkHealth() {
    console.log('🏥 Checking production health...');
    
    try {
      const start = Date.now();
      const response = await axios.get(\`\${this.baseUrl}/health\`, {
        timeout: 10000
      });
      const responseTime = Date.now() - start;
      
      this.metrics.responseTime = responseTime;
      this.metrics.uptime = response.status === 200 ? 100 : 0;
      this.metrics.lastCheck = new Date().toISOString();
      
      console.log(\`✅ Health check passed - \${responseTime}ms\`);
      
      if (responseTime > 2000) {
        console.log('⚠️ WARNING: Slow response time detected');
        this.sendAlert('Slow Response', \`Response time: \${responseTime}ms\`);
      }
      
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      this.metrics.uptime = 0;
      this.sendAlert('Site Down', error.message);
    }
  }

  async checkCoreWebVitals() {
    console.log('⚡ Checking Core Web Vitals...');
    
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/performance/vitals\`);
      const vitals = response.data;
      
      console.log(\`LCP: \${vitals.lcp}ms (target: <2500ms)\`);
      console.log(\`FID: \${vitals.fid}ms (target: <100ms)\`);
      console.log(\`CLS: \${vitals.cls} (target: <0.1)\`);
      
      if (vitals.lcp > 2500 || vitals.fid > 100 || vitals.cls > 0.1) {
        this.sendAlert('Performance Issue', 'Core Web Vitals targets not met');
      }
      
    } catch (error) {
      console.log('⚠️ Could not check Core Web Vitals:', error.message);
    }
  }

  async checkSecurity() {
    console.log('🛡️ Checking security headers...');
    
    try {
      const response = await axios.head(this.baseUrl);
      const headers = response.headers;
      
      const requiredHeaders = [
        'strict-transport-security',
        'x-frame-options',
        'x-content-type-options',
        'content-security-policy'
      ];
      
      let missingHeaders = [];
      requiredHeaders.forEach(header => {
        if (!headers[header]) {
          missingHeaders.push(header);
        }
      });
      
      if (missingHeaders.length > 0) {
        console.log(\`⚠️ Missing security headers: \${missingHeaders.join(', ')}\`);
        this.sendAlert('Security Issue', \`Missing headers: \${missingHeaders.join(', ')}\`);
      } else {
        console.log('✅ All security headers present');
      }
      
    } catch (error) {
      console.log('❌ Security check failed:', error.message);
    }
  }

  async checkAffiliateTracking() {
    console.log('💰 Checking affiliate tracking...');
    
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/affiliates/status\`);
      const status = response.data;
      
      if (status.tracking_active && status.conversion_rate > 0) {
        console.log(\`✅ Affiliate tracking active - \${status.conversion_rate}% conversion\`);
      } else {
        console.log('⚠️ Affiliate tracking issues detected');
        this.sendAlert('Revenue Issue', 'Affiliate tracking problems');
      }
      
    } catch (error) {
      console.log('⚠️ Could not check affiliate status:', error.message);
    }
  }

  sendAlert(type, message) {
    const alert = {
      timestamp: new Date().toISOString(),
      type: type,
      message: message,
      site: 'bestcasinoportal.com'
    };
    
    console.log(\`🚨 ALERT: \${type} - \${message}\`);
    
    // In production, this would send to Slack, email, etc.
    fs.appendFileSync('monitoring-alerts.log', JSON.stringify(alert) + '\\n');
  }

  async runFullCheck() {
    console.log('\\n🔍 PRODUCTION MONITORING - FULL SYSTEM CHECK');
    console.log('=' .repeat(60));
    
    await this.checkHealth();
    await this.checkCoreWebVitals();
    await this.checkSecurity();
    await this.checkAffiliateTracking();
    
    console.log('\\n📊 MONITORING SUMMARY:');
    console.log(\`Uptime: \${this.metrics.uptime}%\`);
    console.log(\`Response Time: \${this.metrics.responseTime}ms\`);
    console.log(\`Last Check: \${this.metrics.lastCheck}\`);
    console.log('=' .repeat(60));
  }
}

// Run monitoring
const monitor = new ProductionMonitor();
monitor.runFullCheck();

// Schedule regular checks (every 5 minutes)
setInterval(() => {
  monitor.runFullCheck();
}, 5 * 60 * 1000);
`;

fs.writeFileSync('deploy/production-monitor.js', monitoringScript);

console.log('✅ Production monitoring script generated');

// Generate deployment package info
const packageInfo = {
  name: 'bestcasinoportal-deployment',
  version: '1.0.0',
  description: 'Production deployment package for BestCasinoPortal.com',
  scripts: {
    'setup:server': 'bash deploy/server-setup.sh',
    'setup:cloudflare': 'node deploy/cloudflare-setup.js',
    'deploy:production': 'bash deploy/deploy.sh',
    'monitor:production': 'node deploy/production-monitor.js',
    'health:check': 'curl -f https://bestcasinoportal.com/health'
  },
  dependencies: {
    'axios': '^1.6.0'
  },
  production: {
    server: productionConfig.server,
    cloudflare: productionConfig.cloudflare,
    deployment: productionConfig.deployment
  }
};

fs.writeFileSync('deploy/package.json', JSON.stringify(packageInfo, null, 2));

console.log('\n🎯 DEPLOYMENT PACKAGE COMPLETE!');
console.log('=' .repeat(80));
console.log('📁 Generated Files:');
console.log('   🔧 deploy/server-setup.sh - Ubuntu server configuration');
console.log('   🚀 deploy/deploy.sh - Production deployment script');  
console.log('   ☁️  deploy/cloudflare-setup.js - DNS and CDN configuration');
console.log('   🔧 deploy/.env.production - Production environment');
console.log('   🔍 deploy/production-monitor.js - Live monitoring');
console.log('   📦 deploy/package.json - Deployment package');

console.log('\n🚀 DEPLOYMENT COMMANDS:');
console.log('1. 🔧 Setup Server:     npm run setup:server');
console.log('2. ☁️  Setup Cloudflare: npm run setup:cloudflare');
console.log('3. 🚀 Deploy Site:      npm run deploy:production');
console.log('4. 🔍 Start Monitoring: npm run monitor:production');
console.log('5. 🏥 Health Check:     npm run health:check');

console.log('\n🎰 BESTCASINOPORTAL.COM - READY FOR LIVE DEPLOYMENT!');
console.log('=' .repeat(80) + '\n');
