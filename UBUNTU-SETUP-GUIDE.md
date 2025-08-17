
# 🐧 UBUNTU 24.04 LTS SERVER SETUP GUIDE
# BestCasinoPortal.com Production Environment

## ⚡ QUICK START (Terminal Commands)

### Step 1: Setup Passwordless SSH
chmod +x setup-passwordless-ssh.sh
./setup-passwordless-ssh.sh

### Step 2: Harden Ubuntu 24.04 LTS Server  
chmod +x harden-ubuntu-server.sh
./harden-ubuntu-server.sh

### Step 3: Deploy Casino Portal
chmod +x deploy-casino-portal.sh
./deploy-casino-portal.sh

## 🔍 VERIFICATION COMMANDS

### Test SSH Connection
ssh root@193.233.161.161

### Check Security Status
ssh root@193.233.161.161 "
    ufw status
    systemctl status fail2ban
    systemctl status nginx
    systemctl status php8.3-fpm
    systemctl status postgresql
    systemctl status redis-server
"

### Check Website
curl -I http://bestcasinoportal.com

## 🌐 CLOUDFLARE DNS SETUP

1. Login to Cloudflare Dashboard
2. Add bestcasinoportal.com domain
3. Update nameservers at domain registrar
4. Create A record: @ -> 193.233.161.161
5. Create A record: www -> 193.233.161.161
6. Enable Cloudflare SSL (Full)
7. Configure firewall rules

## 🔒 SSL CERTIFICATE SETUP (After DNS propagation)

### Option 1: Cloudflare SSL (Recommended)
- Automatic with Cloudflare proxy enabled
- No server configuration needed

### Option 2: Let's Encrypt (Manual)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bestcasinoportal.com -d www.bestcasinoportal.com

## 📊 MONITORING SETUP

### Install monitoring tools
sudo apt install htop iotop nethogs

### Check logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/fail2ban.log

## 🎯 POST-DEPLOYMENT CHECKLIST

✅ Passwordless SSH working
✅ Server hardened with security tools
✅ Firewall configured (UFW)
✅ Fail2ban protecting SSH
✅ Nginx optimized for performance
✅ PHP 8.3 with OPcache enabled
✅ PostgreSQL database ready
✅ Redis caching configured
✅ Website accessible via HTTP
✅ DNS pointing to server
✅ SSL certificate installed
✅ Cloudflare CDN enabled
✅ Security headers configured
✅ Rate limiting active

## 🚨 TROUBLESHOOTING

### SSH Issues
# If SSH connection fails:
ping 193.233.161.161
telnet 193.233.161.161 22

### Website Issues  
# Check Nginx status:
sudo systemctl status nginx
sudo nginx -t

### Database Issues
# Check PostgreSQL:
sudo systemctl status postgresql
sudo -u postgres psql -l

## 🔧 PERFORMANCE OPTIMIZATION

### PHP-FPM Tuning
sudo nano /etc/php/8.3/fpm/pool.d/www.conf

### Nginx Worker Optimization
sudo nano /etc/nginx/nginx.conf

### PostgreSQL Performance
sudo nano /etc/postgresql/16/main/postgresql.conf

## 🎰 CASINO-SPECIFIC FEATURES

✅ Sub-200ms API response optimization
✅ Security headers for PCI compliance
✅ Rate limiting for login protection
✅ Database encryption ready
✅ Redis session management
✅ Automatic security updates
✅ AppArmor mandatory access control
✅ Fail2ban brute force protection

## 📞 SUPPORT

For issues or questions:
- Check logs in /var/log/
- Review configuration files
- Test individual components
- Verify network connectivity
- Confirm DNS propagation

===============================================
✅ Ubuntu 24.04 LTS Setup Complete!
🚀 BestCasinoPortal.com Ready for Production!
===============================================
