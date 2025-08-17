
# BestCasinoPortal Manual Deployment Guide
# For Ubuntu 24.04 Server

## Prerequisites
- Server IP: 193.233.161.161
- Hostname: bestcasinoportal.com
- Username: root
- Password: 6YTqBfsLRPAEYqy3ql

## Step 1: Connect to Server
ssh root@bestcasinoportal.com -p 22
# OR
ssh root@193.233.161.161 -p 22
# Enter password when prompted: 6YTqBfsLRPAEYqy3ql

## Step 2: Update System
apt update && apt upgrade -y

## Step 3: Install Essential Packages
apt install -y \
    curl wget git unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw fail2ban \
    htop iotop \
    nginx \
    postgresql postgresql-contrib \
    redis-server \
    php8.3 php8.3-fpm php8.3-cli php8.3-common \
    php8.3-mysql php8.3-pgsql php8.3-redis \
    php8.3-curl php8.3-json php8.3-gd \
    php8.3-mbstring php8.3-xml php8.3-zip \
    nodejs npm \
    certbot python3-certbot-nginx \
    supervisor

## Step 4: Configure Services
systemctl enable nginx php8.3-fpm postgresql redis-server
systemctl start nginx php8.3-fpm postgresql redis-server

## Step 5: Set Up SSH Keys (from your local machine)
# Copy your public key to the server
cat ~/.ssh/bestcasinoportal_rsa.pub | ssh root@bestcasinoportal.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

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
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\. {
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
echo "Website: http://bestcasinoportal.com"
echo "IP: http://193.233.161.161"
