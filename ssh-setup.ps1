# SSH Key Setup for BestCasinoPortal.com Deployment
Write-Host "🔐 SSH KEY SETUP FOR BESTCASINOPORTAL.COM" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check SSH directory
$sshDir = "$env:USERPROFILE\.ssh"
if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force
    Write-Host "✅ Created SSH directory" -ForegroundColor Green
}

# Generate SSH key
$keyPath = "$sshDir\id_rsa"
if (!(Test-Path $keyPath)) {
    Write-Host "🔧 Generating SSH key..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $keyPath -N '""'
    Write-Host "✅ SSH key generated" -ForegroundColor Green
} else {
    Write-Host "✅ SSH key already exists" -ForegroundColor Green
}

# Show public key
$publicKeyPath = "$keyPath.pub"
if (Test-Path $publicKeyPath) {
    $publicKey = Get-Content $publicKeyPath
    Write-Host "`n📋 PUBLIC KEY (copied to clipboard):" -ForegroundColor Yellow
    Write-Host $publicKey -ForegroundColor White
    $publicKey | Set-Clipboard
}

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. Connect to server: ssh root@193.233.161.161" -ForegroundColor Cyan
Write-Host "2. Password: 6YTqBfsLRPAEYqy3ql" -ForegroundColor Yellow
Write-Host "3. Run these commands on server:" -ForegroundColor Cyan
Write-Host "   mkdir -p ~/.ssh" -ForegroundColor White
Write-Host "   echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host "   chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host "   exit" -ForegroundColor White
Write-Host "4. Test: ssh root@193.233.161.161 (should not ask password)" -ForegroundColor Cyan
Write-Host "5. Deploy: bash deploy-automated.sh" -ForegroundColor Green

Write-Host "`n⚡ READY FOR DEPLOYMENT!" -ForegroundColor Green
