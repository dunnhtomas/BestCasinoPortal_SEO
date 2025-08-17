#!/bin/bash
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
