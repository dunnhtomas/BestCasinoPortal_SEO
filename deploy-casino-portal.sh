#!/bin/bash
# Complete BestCasinoPortal.com Deployment on Ubuntu 24.04 LTS

set -e

SERVER_IP="193.233.161.161"
SERVER_USER="root"
HOSTNAME="bestcasinoportal.com"
CLOUDFLARE_TOKEN="KhoBPsapJwVnmeg8iqoi0BGqOqgty3V9g4TocDXS"

echo "🚀 Deploying BestCasinoPortal.com..."
echo "========================================================"

# Upload project files
echo "📁 Uploading project files..."
rsync -avz --exclude='node_modules' --exclude='.git' ./bestcasinoportal-src/ ${SERVER_USER}@${SERVER_IP}:/var/www/bestcasinoportal/

# Configure Nginx virtual host
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'

# Create Nginx configuration
cat > /etc/nginx/sites-available/bestcasinoportal.com << 'EOF'
server {
    listen 80;
    server_name bestcasinoportal.com www.bestcasinoportal.com;
    root /var/www/bestcasinoportal/public;
    index index.php index.html;

    # Security headers
    include /etc/nginx/conf.d/security.conf;
    
    # Rate limiting
    limit_req zone=general burst=20 nodelay;

    # PHP handling
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Rate limit for API endpoints
        location ~ ^/api/ {
            limit_req zone=api burst=5 nodelay;
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    # Static file optimization
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|git|htaccess)$ {
        deny all;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/bestcasinoportal.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Set proper permissions
chown -R www-data:www-data /var/www/bestcasinoportal
chmod -R 755 /var/www/bestcasinoportal
chmod -R 644 /var/www/bestcasinoportal/storage

echo "✅ BestCasinoPortal.com deployed successfully!"

ENDSSH

echo "🎉 Deployment completed!"
echo "========================================================"
echo "🌐 Website: http://bestcasinoportal.com"
echo "🔒 SSL: Setup required (use Cloudflare or Let's Encrypt)"
echo "📊 Next: Configure DNS and SSL certificate"
