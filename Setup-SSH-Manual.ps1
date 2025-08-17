# PowerShell SSH Setup with Password Authentication
# BestCasinoPortal.com Ubuntu 24.04 LTS Server

param(
    [string]$ServerIP = "193.233.161.161",
    [string]$ServerUser = "root",
    [string]$Hostname = "bestcasinoportal.com"
)

Write-Host "Setting up SSH connection to Ubuntu 24.04 LTS server..." -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Yellow

# Step 1: Test basic connectivity first
Write-Host "Testing server connectivity..." -ForegroundColor Cyan
$ping = Test-Connection -ComputerName $ServerIP -Count 2 -Quiet
if ($ping) {
    Write-Host "  SUCCESS: Server is reachable" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Server is not reachable" -ForegroundColor Red
    exit 1
}

# Step 2: Check if SSH key exists
Write-Host ""
Write-Host "Checking SSH key pair..." -ForegroundColor Cyan
$sshDir = "$env:USERPROFILE\.ssh"
$privateKey = "$sshDir\id_rsa"
$publicKey = "$sshDir\id_rsa.pub"

if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

if (!(Test-Path $privateKey)) {
    Write-Host "  Generating new SSH key pair..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $privateKey -N '""' -C "bestcasinoportal-admin@$Hostname"
    Write-Host "  SUCCESS: SSH key pair generated" -ForegroundColor Green
} else {
    Write-Host "  SUCCESS: SSH key pair already exists" -ForegroundColor Green
}

# Step 3: Manual SSH connection instructions
Write-Host ""
Write-Host "MANUAL SSH SETUP REQUIRED" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "The server SSH host key has changed. Please follow these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Connect to the server manually with password:" -ForegroundColor Cyan
Write-Host "   ssh -o StrictHostKeyChecking=no $ServerUser@$ServerIP" -ForegroundColor White
Write-Host "   Password: 6YTqBfsLRPAEYqy3ql" -ForegroundColor White
Write-Host ""
Write-Host "2. Once connected, run these commands to set up SSH key:" -ForegroundColor Cyan
Write-Host "   mkdir -p ~/.ssh" -ForegroundColor White
Write-Host "   chmod 700 ~/.ssh" -ForegroundColor White
Write-Host ""
Write-Host "3. Then paste this public key into ~/.ssh/authorized_keys:" -ForegroundColor Cyan

if (Test-Path $publicKey) {
    $publicKeyContent = Get-Content $publicKey -Raw
    Write-Host "   echo '$publicKeyContent' >> ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
} else {
    Write-Host "   ERROR: Public key not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Test passwordless connection:" -ForegroundColor Cyan
Write-Host "   ssh $ServerUser@$ServerIP" -ForegroundColor White

Write-Host ""
Write-Host "NEXT STEPS AFTER SSH SETUP:" -ForegroundColor Yellow
Write-Host "1. Run server hardening: powershell -File Ubuntu-Harden.ps1" -ForegroundColor White
Write-Host "2. Deploy casino portal: powershell -File Ubuntu-Deploy.ps1" -ForegroundColor White

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Yellow
