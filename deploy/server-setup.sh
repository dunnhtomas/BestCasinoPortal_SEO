#!/bin/bash
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
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PHP handling
    location ~ \.php$ {
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
    location ~ /\. {
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
