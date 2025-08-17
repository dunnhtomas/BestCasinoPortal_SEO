# SSH Key Setup for BestCasinoPortal.com
Write-Host "SSH KEY SETUP FOR BESTCASINOPORTAL.COM" -ForegroundColor Cyan

# Variables
$sshDir = "$env:USERPROFILE\.ssh"
$keyPath = "$sshDir\id_rsa"
$publicKeyPath = "$keyPath.pub"

# Create SSH directory
if (!(Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "Created SSH directory" -ForegroundColor Green
}

# Generate SSH key
if (!(Test-Path $keyPath)) {
    Write-Host "Generating SSH key..." -ForegroundColor Yellow
    & ssh-keygen -t rsa -b 4096 -f $keyPath -N '""'
    Write-Host "SSH key generated" -ForegroundColor Green
} else {
    Write-Host "SSH key already exists" -ForegroundColor Green
}

# Display public key
if (Test-Path $publicKeyPath) {
    $publicKey = Get-Content $publicKeyPath -Raw
    Write-Host ""
    Write-Host "PUBLIC KEY:" -ForegroundColor Yellow
    Write-Host $publicKey -ForegroundColor White
    $publicKey | Set-Clipboard
    Write-Host "Public key copied to clipboard!" -ForegroundColor Green
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. ssh root@193.233.161.161" -ForegroundColor Cyan
Write-Host "2. Password: 6YTqBfsLRPAEYqy3ql" -ForegroundColor Yellow
Write-Host "3. mkdir -p ~/.ssh" -ForegroundColor White
Write-Host "4. Paste public key to authorized_keys" -ForegroundColor White
Write-Host "5. chmod 700 ~/.ssh" -ForegroundColor White
Write-Host "6. chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host "7. exit" -ForegroundColor White
Write-Host "8. Test: ssh root@193.233.161.161" -ForegroundColor Cyan
Write-Host "9. Deploy: bash deploy-automated.sh" -ForegroundColor Green
Write-Host ""
Write-Host "READY FOR DEPLOYMENT!" -ForegroundColor Green
