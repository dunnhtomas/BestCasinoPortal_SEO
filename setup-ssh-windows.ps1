# 🔐 Windows PowerShell SSH Key Setup for BestCasinoPortal.com
# Automated SSH key generation and server deployment setup

Write-Host "`n🔐 SSH KEY SETUP FOR WINDOWS (PowerShell)" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host "🌐 Target Server: bestcasinoportal.com (193.233.161.161)" -ForegroundColor Green
Write-Host "👤 User: root" -ForegroundColor Yellow
Write-Host "🔑 Setting up passwordless SSH access" -ForegroundColor Magenta
Write-Host "=" * 80 -ForegroundColor Gray

# Step 1: Check if SSH directory exists
Write-Host "`n🔧 STEP 1: SSH DIRECTORY SETUP" -ForegroundColor Cyan
$sshDir = "$env:USERPROFILE\.ssh"
if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force
    Write-Host "✅ Created SSH directory: $sshDir" -ForegroundColor Green
} else {
    Write-Host "✅ SSH directory exists: $sshDir" -ForegroundColor Green
}

# Step 2: Generate SSH key pair
Write-Host "`n🔑 STEP 2: SSH KEY GENERATION" -ForegroundColor Cyan
$keyPath = "$sshDir\id_rsa"
if (!(Test-Path $keyPath)) {
    Write-Host "🔧 Generating new SSH key pair..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $keyPath -N '""'
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH key pair generated successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to generate SSH key pair" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ SSH key pair already exists at: $keyPath" -ForegroundColor Green
}

# Step 3: Display public key
Write-Host "`n📋 STEP 3: PUBLIC KEY DISPLAY" -ForegroundColor Cyan
$publicKeyPath = "$keyPath.pub"
if (Test-Path $publicKeyPath) {
    $publicKey = Get-Content $publicKeyPath
    Write-Host "🔑 Your public key:" -ForegroundColor Yellow
    Write-Host $publicKey -ForegroundColor White
    Write-Host "`n📋 Public key has been copied to clipboard!" -ForegroundColor Green
    $publicKey | Set-Clipboard
} else {
    Write-Host "❌ Public key file not found" -ForegroundColor Red
    exit 1
}

# Step 4: SSH Copy ID (manual process for Windows)
Write-Host "`n📤 STEP 4: COPY PUBLIC KEY TO SERVER" -ForegroundColor Cyan
Write-Host "⚠️  Manual step required (Windows doesn't have ssh-copy-id by default)" -ForegroundColor Yellow
Write-Host "`nOption 1 - Use SCP to copy key:" -ForegroundColor Cyan
Write-Host "scp `"$publicKeyPath`" root@193.233.161.161:~/.ssh/authorized_keys" -ForegroundColor White

Write-Host "`nOption 2 - Manual SSH session:" -ForegroundColor Cyan
Write-Host "ssh root@193.233.161.161" -ForegroundColor White
Write-Host "mkdir -p ~/.ssh" -ForegroundColor Gray
Write-Host "echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor Gray
Write-Host "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Gray
Write-Host "exit" -ForegroundColor Gray

Write-Host "`n🎯 READY TO CONNECT TO SERVER" -ForegroundColor Magenta
Write-Host "Password: 6YTqBfsLRPAEYqy3ql" -ForegroundColor Yellow

# Interactive prompt
Write-Host "`n🚀 Choose your deployment method:" -ForegroundColor Cyan
Write-Host "1️⃣  Execute manual SSH setup (recommended)" -ForegroundColor Green  
Write-Host "2️⃣  Copy key automatically via SCP" -ForegroundColor Yellow
Write-Host "3️⃣  Show deployment commands only" -ForegroundColor Blue

$choice = Read-Host "`nEnter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n🔐 Opening SSH connection for manual setup..." -ForegroundColor Green
        Write-Host "Password: 6YTqBfsLRPAEYqy3ql" -ForegroundColor Yellow
        Write-Host "Run these commands on the server:" -ForegroundColor Cyan
        Write-Host "mkdir -p ~/.ssh" -ForegroundColor White
        Write-Host "chmod 700 ~/.ssh" -ForegroundColor White
        Write-Host "echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor White  
        Write-Host "chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
        Write-Host "exit" -ForegroundColor White
        
        # Open SSH connection
        ssh root@193.233.161.161
    }
    
    "2" {
        Write-Host "`n📤 Copying public key via SCP..." -ForegroundColor Green
        Write-Host "Password: 6YTqBfsLRPAEYqy3ql" -ForegroundColor Yellow
        
        # Use SCP to copy the key
        ssh root@193.233.161.161 "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
        scp $publicKeyPath root@193.233.161.161:~/.ssh/authorized_keys
        ssh root@193.233.161.161 "chmod 600 ~/.ssh/authorized_keys"
    }
    
    "3" {
        Write-Host "`n📋 DEPLOYMENT COMMANDS:" -ForegroundColor Cyan
        Write-Host "After SSH key setup is complete, run:" -ForegroundColor Yellow
        Write-Host "bash deploy-automated.sh" -ForegroundColor White
    }
    
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

# Step 5: Test passwordless connection
Write-Host "`n🧪 STEP 5: TEST PASSWORDLESS CONNECTION" -ForegroundColor Cyan
Write-Host "Testing SSH connection (should not ask for password)..." -ForegroundColor Yellow

$testResult = ssh -o ConnectTimeout=10 -o BatchMode=yes root@193.233.161.161 "echo 'SSH connection successful'"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Passwordless SSH connection successful!" -ForegroundColor Green
    Write-Host $testResult -ForegroundColor White
    
    # Automatically start deployment
    Write-Host "`n🚀 Starting automated deployment..." -ForegroundColor Magenta
    if (Test-Path "deploy-automated.sh") {
        bash deploy-automated.sh
    } else {
        Write-Host "❌ Deployment script not found" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  SSH key setup may need manual completion" -ForegroundColor Yellow
    Write-Host "💡 Try connecting manually: ssh root@193.233.161.161" -ForegroundColor Cyan
    Write-Host "🔑 Use password: 6YTqBfsLRPAEYqy3ql" -ForegroundColor Yellow
}

Write-Host "`n🎉 SSH SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host "🌐 Next: Run deployment script once SSH is working" -ForegroundColor Cyan
Write-Host "🚀 Command: bash deploy-automated.sh" -ForegroundColor White
Write-Host "=" * 80 -ForegroundColor Gray
