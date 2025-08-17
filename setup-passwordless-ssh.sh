#!/bin/bash
# Ubuntu 24.04 LTS Server Setup with Passwordless SSH
# BestCasinoPortal.com Production Environment

set -e  # Exit on any error

SERVER_IP="193.233.161.161"
SERVER_USER="root"
SERVER_PASSWORD="6YTqBfsLRPAEYqy3ql"
HOSTNAME="bestcasinoportal.com"

echo "🚀 Starting Ubuntu 24.04 LTS Server Setup..."
echo "========================================================"

# Step 1: Generate SSH key pair if not exists
echo "🔑 Setting up SSH key pair..."
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -C "bestcasinoportal-admin@${HOSTNAME}"
    echo "✅ SSH key pair generated"
else
    echo "✅ SSH key pair already exists"
fi

# Step 2: Install sshpass for password-based initial connection
echo "📦 Installing SSH utilities..."
if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -qq
    sudo apt-get install -y sshpass openssh-client
elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y sshpass openssh-clients
elif command -v brew >/dev/null 2>&1; then
    brew install sshpass
else
    echo "⚠️  Please install sshpass manually for your system"
fi

# Step 3: Copy SSH public key to server
echo "🔐 Setting up passwordless SSH access..."
sshpass -p "${SERVER_PASSWORD}" ssh-copy-id -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}

if [ $? -eq 0 ]; then
    echo "✅ SSH public key copied successfully"
else
    echo "❌ Failed to copy SSH key. Trying alternative method..."
    
    # Alternative method using scp
    sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no ~/.ssh/id_rsa.pub ${SERVER_USER}@${SERVER_IP}:/tmp/
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "
        mkdir -p ~/.ssh
        cat /tmp/id_rsa.pub >> ~/.ssh/authorized_keys
        chmod 700 ~/.ssh
        chmod 600 ~/.ssh/authorized_keys
        rm /tmp/id_rsa.pub
    "
    echo "✅ SSH key setup completed via alternative method"
fi

# Step 4: Test passwordless connection
echo "🧪 Testing passwordless SSH connection..."
ssh -o BatchMode=yes -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} "echo 'Passwordless SSH working!'"

if [ $? -eq 0 ]; then
    echo "✅ Passwordless SSH connection successful!"
else
    echo "❌ Passwordless SSH test failed. Using password fallback."
    exit 1
fi

echo "🎉 SSH setup completed successfully!"
echo "========================================================"
