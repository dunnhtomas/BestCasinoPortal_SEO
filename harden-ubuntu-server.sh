#!/bin/bash
# Ubuntu 24.04 LTS Security Hardening for BestCasinoPortal.com
# Based on Context7 Ubuntu Security Documentation

set -e

SERVER_IP="193.233.161.161"
SERVER_USER="root"
HOSTNAME="bestcasinoportal.com"

echo "🛡️ Starting Ubuntu 24.04 LTS Security Hardening..."
echo "========================================================"

# Connect and execute hardening commands
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install security tools
echo "🔧 Installing security tools..."
apt install -y ufw fail2ban apparmor-utils unattended-upgrades apt-listchanges

# Install web stack optimized for casino portal
echo "🌐 Installing optimized web stack..."
apt install -y nginx php8.3-fpm php8.3-pgsql php8.3-redis php8.3-opcache postgresql-16 redis-server

# Configure firewall
echo "🔥 Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP  
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Harden SSH configuration
echo "🔐 Hardening SSH configuration..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveInterval 0/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveCountMax 3/ClientAliveCountMax 2/' /etc/ssh/sshd_config

# Add security banner
echo "===============================================" > /etc/issue.net
echo "WARNING: Authorized access only!"              >> /etc/issue.net
echo "BestCasinoPortal.com Production Server"        >> /etc/issue.net
echo "All activities are monitored and logged."      >> /etc/issue.net
echo "===============================================" >> /etc/issue.net

echo "Banner /etc/issue.net" >> /etc/ssh/sshd_config

# Configure kernel security parameters
echo "🔒 Configuring kernel security parameters..."
cat > /etc/sysctl.d/99-security.conf << 'EOF'
# Kernel security hardening for casino portal
kernel.yama.ptrace_scope = 1
kernel.kptr_restrict = 2  
kernel.dmesg_restrict = 1
kernel.unprivileged_bpf_disabled = 1
kernel.kexec_load_disabled = 1

# Network security
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_rfc1337 = 1

# IPv6 security (disable if not needed)
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1

# Virtual memory
vm.mmap_min_addr = 65536
EOF

# Apply sysctl changes
sysctl -p /etc/sysctl.d/99-security.conf

# Configure automatic security updates
echo "🔄 Configuring automatic security updates..."
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades
echo 'Unattended-Upgrade::Remove-Unused-Dependencies "true";' >> /etc/apt/apt.conf.d/50unattended-upgrades

systemctl enable unattended-upgrades

# Configure fail2ban for SSH protection
echo "🚫 Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[ssh]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Optimize Nginx for casino portal
echo "🌐 Optimizing Nginx configuration..."
cat > /etc/nginx/conf.d/security.conf << 'EOF'
# Security headers for casino portal
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# HSTS (uncomment after SSL setup)
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/s;

# Hide Nginx version
server_tokens off;
EOF

# Optimize PHP for performance and security
echo "🐘 Optimizing PHP configuration..."
PHP_INI="/etc/php/8.3/fpm/php.ini"
cp $PHP_INI ${PHP_INI}.bak

sed -i 's/expose_php = On/expose_php = Off/' $PHP_INI
sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' $PHP_INI
sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 10M/' $PHP_INI
sed -i 's/post_max_size = 8M/post_max_size = 10M/' $PHP_INI
sed -i 's/max_execution_time = 30/max_execution_time = 60/' $PHP_INI
sed -i 's/memory_limit = 128M/memory_limit = 256M/' $PHP_INI

# Enable OPcache
cat >> $PHP_INI << 'EOF'

; OPcache optimization for casino portal
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
EOF

# Configure PostgreSQL basic security
echo "🗄️ Configuring PostgreSQL security..."
systemctl enable postgresql
systemctl start postgresql

# Create database user for casino portal
sudo -u postgres psql << 'EOSQL'
CREATE USER casino_admin WITH PASSWORD 'CasinoSecure2024!';
CREATE DATABASE bestcasinoportal OWNER casino_admin;
GRANT ALL PRIVILEGES ON DATABASE bestcasinoportal TO casino_admin;
\q
EOSQL

# Configure Redis security
echo "🔴 Configuring Redis security..."
sed -i 's/# requirepass foobared/requirepass CasinoRedis2024!/' /etc/redis/redis.conf
sed -i 's/bind 127.0.0.1 ::1/bind 127.0.0.1/' /etc/redis/redis.conf

systemctl enable redis-server
systemctl restart redis-server

# Restart all services
echo "🔄 Restarting services..."
systemctl restart ssh
systemctl restart nginx
systemctl restart php8.3-fpm
systemctl restart postgresql

# Display security status
echo "✅ Security hardening completed!"
echo "========================================================"
echo "🔐 SSH: Hardened (key-based auth only)"
echo "🔥 Firewall: UFW enabled (22,80,443 open)"  
echo "🚫 Fail2ban: Active (SSH protection)"
echo "🛡️ Kernel: Security parameters applied"
echo "🔄 Updates: Automatic security updates enabled"
echo "🌐 Nginx: Security headers configured"
echo "🐘 PHP: Optimized with OPcache"
echo "🗄️ PostgreSQL: Database ready"
echo "🔴 Redis: Secured with password"
echo "========================================================"

ENDSSH

echo "🎉 Ubuntu 24.04 LTS hardening completed successfully!"
