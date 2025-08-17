# PowerShell SSH Setup for Ubuntu 24.04 LTS Server
# BestCasinoPortal.com Production Environment

param(
    [string]$ServerIP = "193.233.161.161",
    [string]$ServerUser = "root",
    [string]$ServerPassword = "6YTqBfsLRPAEYqy3ql",
    [string]$Hostname = "bestcasinoportal.com"
)

Write-Host "🚀 Setting up SSH connection to Ubuntu 24.04 LTS server..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Yellow

# Server details
Write-Host "📋 Server Configuration:" -ForegroundColor Cyan
Write-Host "  Hostname: $Hostname" -ForegroundColor White
Write-Host "  IP: $ServerIP" -ForegroundColor White  
Write-Host "  User: $ServerUser" -ForegroundColor White
Write-Host "  OS: Ubuntu 24.04 LTS" -ForegroundColor White

# Step 1: Generate SSH key if not exists
Write-Host "`n🔑 Setting up SSH key pair..." -ForegroundColor Cyan
$sshDir = "$env:USERPROFILE\.ssh"
$privateKey = "$sshDir\id_rsa"
$publicKey = "$sshDir\id_rsa.pub"

if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

if (!(Test-Path $privateKey)) {
    Write-Host "  Generating new SSH key pair..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $privateKey -N '""' -C "bestcasinoportal-admin@$Hostname"
    Write-Host "  ✅ SSH key pair generated" -ForegroundColor Green
} else {
    Write-Host "  ✅ SSH key pair already exists" -ForegroundColor Green
}

# Step 2: Test initial connection
Write-Host "`n🧪 Testing initial SSH connection..." -ForegroundColor Cyan
$testConnection = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $ServerUser@$ServerIP "echo 'Connection successful'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ SSH connection successful!" -ForegroundColor Green
    
    # Step 3: Copy SSH key to server
    Write-Host "`n🔐 Setting up passwordless authentication..." -ForegroundColor Cyan
    
    # Read the public key
    $publicKeyContent = Get-Content $publicKey -Raw
    
    # Create the authorized_keys setup command
    $setupCommand = @"
mkdir -p ~/.ssh
echo '$publicKeyContent' >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
echo 'SSH key setup completed'
"@
    
    # Execute the setup on the server
    $result = ssh $ServerUser@$ServerIP $setupCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ SSH public key installed successfully" -ForegroundColor Green
        
        # Step 4: Test passwordless connection
        Write-Host "`n🔓 Testing passwordless SSH..." -ForegroundColor Cyan
        $passwordlessTest = ssh -o BatchMode=yes -o ConnectTimeout=10 $ServerUser@$ServerIP "echo 'Passwordless SSH working!'"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Passwordless SSH connection successful!" -ForegroundColor Green
            Write-Host "`n🎉 SSH setup completed successfully!" -ForegroundColor Green
            
            # Display connection info
            Write-Host "`n📞 Connection Details:" -ForegroundColor Cyan
            Write-Host "  Command: ssh $ServerUser@$ServerIP" -ForegroundColor White
            Write-Host "  Key file: $privateKey" -ForegroundColor White
            
        } else {
            Write-Host "  ⚠️  Passwordless SSH test failed, but key was installed" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ Failed to install SSH key" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Initial SSH connection failed" -ForegroundColor Red
    Write-Host "  Please check:" -ForegroundColor Yellow
    Write-Host "    - Server is running and accessible" -ForegroundColor White
    Write-Host "    - SSH service is running on port 22" -ForegroundColor White
    Write-Host "    - Firewall allows SSH connections" -ForegroundColor White
    Write-Host "    - IP address is correct: $ServerIP" -ForegroundColor White
}

Write-Host "`n========================================================" -ForegroundColor Yellow
