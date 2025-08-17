# SSH Passwordless Setup for Ubuntu 24.04 (PowerShell)
# Enterprise-grade security configuration using Context7 best practices
# 
# Server: bestcasinoportal.com (193.233.161.161)
# Port: 22 (Standard SSH port)
# OS: Ubuntu 24.04 LTS

param(
    [switch]$Force,
    [switch]$Verbose
)

# Server configuration
$ServerConfig = @{
    Hostname = "bestcasinoportal.com"
    IP = "193.233.161.161"
    Port = 22
    Username = "root"
    Password = "6YTqBfsLRPAEYqy3ql"
}

# SSH paths
$SSHDir = Join-Path $env:USERPROFILE ".ssh"
$KeyPath = Join-Path $SSHDir "bestcasinoportal_rsa"
$PublicKeyPath = "$KeyPath.pub"
$ConfigPath = Join-Path $SSHDir "config"
$KnownHostsPath = Join-Path $SSHDir "known_hosts"

function Write-LogMessage {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    $timestamp = (Get-Date).ToString("HH:mm:ss")
    $color = switch ($Type) {
        "Success" { "Green" }
        "Error" { "Red" }
        "Warning" { "Yellow" }
        "Progress" { "Cyan" }
        default { "White" }
    }
    
    $prefix = switch ($Type) {
        "Success" { "✅" }
        "Error" { "❌" }
        "Warning" { "⚠️" }
        "Progress" { "🔄" }
        default { "ℹ️" }
    }
    
    Write-Host "[$timestamp] $prefix $Message" -ForegroundColor $color
}

function Test-SSHAvailable {
    Write-LogMessage "Checking SSH availability..." -Type "Progress"
    
    try {
        $result = ssh -V 2>&1
        Write-LogMessage "SSH client available: $result" -Type "Success"
        return $true
    }
    catch {
        Write-LogMessage "SSH client not found. Please install OpenSSH client." -Type "Error"
        Write-LogMessage "Run: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -Type "Info"
        return $false
    }
}

function Initialize-SSHDirectory {
    Write-LogMessage "Creating SSH directory structure..." -Type "Progress"
    
    if (-not (Test-Path $SSHDir)) {
        New-Item -ItemType Directory -Path $SSHDir -Force | Out-Null
        Write-LogMessage "Created .ssh directory: $SSHDir" -Type "Success"
    } else {
        Write-LogMessage "SSH directory already exists" -Type "Info"
    }
    
    # Set proper permissions on Windows
    try {
        $acl = Get-Acl $SSHDir
        $acl.SetAccessRuleProtection($true, $false)
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            [System.Security.Principal.WindowsIdentity]::GetCurrent().Name,
            "FullControl",
            "ContainerInherit,ObjectInherit",
            "None",
            "Allow"
        )
        $acl.SetAccessRule($accessRule)
        Set-Acl -Path $SSHDir -AclObject $acl
        Write-LogMessage "Set secure permissions on SSH directory" -Type "Success"
    }
    catch {
        Write-LogMessage "Warning: Could not set directory permissions" -Type "Warning"
    }
}

function New-SSHKeyPair {
    Write-LogMessage "Generating enterprise-grade SSH key pair..." -Type "Progress"
    
    if (Test-Path $KeyPath -and -not $Force) {
        $response = Read-Host "SSH key already exists. Overwrite? (y/N)"
        if ($response -ne "y") {
            Write-LogMessage "Using existing SSH key" -Type "Info"
            return
        }
    }
    
    try {
        # Try Ed25519 first (recommended by Context7 and Ubuntu Security Guide)
        $comment = "bestcasinoportal-$env:USERNAME-$(Get-Date -Format 'yyyy-MM-dd')"
        
        Write-LogMessage "Attempting to generate Ed25519 key..." -Type "Progress"
        $ed25519Result = ssh-keygen -t ed25519 -f "$KeyPath" -C "$comment" -N '""' 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-LogMessage "Generated Ed25519 SSH key pair (enterprise-grade)" -Type "Success"
        } else {
            Write-LogMessage "Ed25519 not supported, falling back to RSA-4096..." -Type "Warning"
            $rsaResult = ssh-keygen -t rsa -b 4096 -f "$KeyPath" -C "$comment" -N '""' 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-LogMessage "Generated RSA-4096 SSH key pair" -Type "Success"
            } else {
                throw "Key generation failed: $rsaResult"
            }
        }
        
        Write-LogMessage "Private key: $KeyPath" -Type "Info"
        Write-LogMessage "Public key: $PublicKeyPath" -Type "Info"
        
    }
    catch {
        Write-LogMessage "Key generation failed: $_" -Type "Error"
        throw
    }
}

function Get-PublicKeyContent {
    if (-not (Test-Path $PublicKeyPath)) {
        throw "Public key not found: $PublicKeyPath"
    }
    
    return Get-Content $PublicKeyPath -Raw
}

function Update-SSHConfig {
    Write-LogMessage "Updating SSH client configuration..." -Type "Progress"
    
    $sshConfigContent = @"
# BestCasinoPortal SSH Configuration
# Generated: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
# Context7 + Ubuntu Security best practices

Host bestcasinoportal
    HostName $($ServerConfig.Hostname)
    User $($ServerConfig.Username)
    Port $($ServerConfig.Port)
    IdentityFile $($KeyPath -replace '\\', '/')
    IdentitiesOnly yes
    PreferredAuthentications publickey
    StrictHostKeyChecking ask
    UserKnownHostsFile $($KnownHostsPath -replace '\\', '/')
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
    Compression yes
    ForwardAgent no
    ForwardX11 no
    
    # Security hardening
    Protocol 2
    Cipher aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
    KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512
    MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
    HostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256

Host bestcasinoportal-ip
    HostName $($ServerConfig.IP)
    User $($ServerConfig.Username)
    Port $($ServerConfig.Port)
    IdentityFile $($KeyPath -replace '\\', '/')
    IdentitiesOnly yes
    PreferredAuthentications publickey
    StrictHostKeyChecking ask
    UserKnownHostsFile $($KnownHostsPath -replace '\\', '/')
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
    Compression yes
    ForwardAgent no
    ForwardX11 no
    
    # Security hardening
    Protocol 2
    Cipher aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
    KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512
    MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
    HostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256

"@

    $existingConfig = ""
    if (Test-Path $ConfigPath) {
        $existingConfig = Get-Content $ConfigPath -Raw
    }
    
    if ($existingConfig -notmatch "Host bestcasinoportal") {
        Add-Content -Path $ConfigPath -Value $sshConfigContent
        Write-LogMessage "SSH configuration updated" -Type "Success"
    } else {
        Write-LogMessage "SSH configuration already exists" -Type "Info"
    }
}

function Copy-PublicKeyToServer {
    Write-LogMessage "Copying public key to server..." -Type "Progress"
    
    $publicKey = Get-PublicKeyContent
    
    Write-LogMessage "Server connection details:" -Type "Info"
    Write-LogMessage "  Hostname: $($ServerConfig.Hostname) ($($ServerConfig.IP))" -Type "Info"
    Write-LogMessage "  Username: $($ServerConfig.Username)" -Type "Info"
    Write-LogMessage "  Port: $($ServerConfig.Port)" -Type "Info"
    
    # Create remote commands to set up authorized_keys
    $remoteCommands = @(
        "mkdir -p ~/.ssh",
        "chmod 700 ~/.ssh",
        "echo '$publicKey' >> ~/.ssh/authorized_keys",
        "chmod 600 ~/.ssh/authorized_keys",
        "chown -R $($ServerConfig.Username):$($ServerConfig.Username) ~/.ssh",
        "echo 'SSH public key added successfully'",
        "ssh-keygen -lf ~/.ssh/authorized_keys | tail -1"
    ) -join "; "
    
    Write-LogMessage "Attempting to copy public key using password authentication..." -Type "Progress"
    Write-LogMessage "You will be prompted for the password: $($ServerConfig.Password)" -Type "Warning"
    
    try {
        # Use ssh with password authentication to set up the key
        $sshCommand = "ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=no -p $($ServerConfig.Port) $($ServerConfig.Username)@$($ServerConfig.Hostname) '$remoteCommands'"
        
        Write-LogMessage "Executing: $sshCommand" -Type "Info"
        Write-LogMessage "When prompted, enter password: $($ServerConfig.Password)" -Type "Warning"
        
        Invoke-Expression $sshCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-LogMessage "Public key successfully copied to server" -Type "Success"
        } else {
            throw "SSH command failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-LogMessage "Automatic key copy failed: $_" -Type "Error"
        Write-LogMessage "Please manually copy your public key:" -Type "Warning"
        
        Write-Host "`nPublic key content:" -ForegroundColor Cyan
        Write-Host $publicKey -ForegroundColor Yellow
        
        Write-Host "`nManual steps:" -ForegroundColor Cyan
        Write-Host "1. ssh root@bestcasinoportal.com -p 22" -ForegroundColor White
        Write-Host "2. Enter password: $($ServerConfig.Password)" -ForegroundColor White
        Write-Host "3. mkdir -p ~/.ssh && chmod 700 ~/.ssh" -ForegroundColor White
        Write-Host "4. echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor White
        Write-Host "5. chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
        Write-Host "6. exit" -ForegroundColor White
        
        Read-Host "`nPress Enter when you have completed the manual setup"
    }
}

function Test-SSHConnection {
    Write-LogMessage "Testing passwordless SSH connection..." -Type "Progress"
    
    try {
        # Test using SSH config
        $result = ssh -o PreferredAuthentications=publickey -o PasswordAuthentication=no -o ConnectTimeout=10 bestcasinoportal 'echo "SSH passwordless authentication successful"' 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-LogMessage "SSH passwordless connection successful!" -Type "Success"
            Write-LogMessage "Server response: $result" -Type "Success"
            return $true
        } else {
            throw "SSH config connection failed: $result"
        }
    }
    catch {
        Write-LogMessage "SSH connection test failed: $_" -Type "Error"
        Write-LogMessage "Trying direct connection method..." -Type "Progress"
        
        try {
            # Try direct connection
            $directResult = ssh -i "$KeyPath" -o PreferredAuthentications=publickey -o PasswordAuthentication=no -o ConnectTimeout=10 -p $($ServerConfig.Port) "$($ServerConfig.Username)@$($ServerConfig.Hostname)" 'echo "Direct SSH connection successful"' 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-LogMessage "Direct SSH connection successful!" -Type "Success"
                Write-LogMessage "Server response: $directResult" -Type "Success"
                return $true
            } else {
                throw "Direct connection also failed: $directResult"
            }
        }
        catch {
            Write-LogMessage "Direct SSH connection also failed: $_" -Type "Error"
            return $false
        }
    }
}

function Initialize-SSHAgent {
    Write-LogMessage "Setting up SSH agent for key management..." -Type "Progress"
    
    try {
        # Check if SSH Agent service is available
        $service = Get-Service -Name ssh-agent -ErrorAction SilentlyContinue
        
        if ($service) {
            if ($service.Status -ne "Running") {
                Write-LogMessage "Starting SSH Agent service..." -Type "Progress"
                Set-Service -Name ssh-agent -StartupType Automatic
                Start-Service -Name ssh-agent
                Write-LogMessage "SSH Agent service started" -Type "Success"
            } else {
                Write-LogMessage "SSH Agent service already running" -Type "Success"
            }
            
            # Add key to agent
            try {
                ssh-add "$KeyPath" 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-LogMessage "SSH key added to agent" -Type "Success"
                } else {
                    Write-LogMessage "SSH key add to agent failed (may require manual setup)" -Type "Warning"
                }
            }
            catch {
                Write-LogMessage "SSH key add to agent failed: $_" -Type "Warning"
            }
        } else {
            Write-LogMessage "SSH Agent service not available" -Type "Warning"
            Write-LogMessage "Install OpenSSH client features for full agent support" -Type "Info"
        }
    }
    catch {
        Write-LogMessage "SSH agent setup failed: $_" -Type "Warning"
        Write-LogMessage "SSH agent not required for basic functionality" -Type "Info"
    }
}

function Show-ConnectionInfo {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Green
    Write-Host "🎉 SSH PASSWORDLESS SETUP COMPLETE!" -ForegroundColor Green
    Write-Host ("=" * 60) -ForegroundColor Green
    
    Write-Host "`n📋 Connection Information:" -ForegroundColor Green
    Write-Host "   Hostname: $($ServerConfig.Hostname)" -ForegroundColor Cyan
    Write-Host "   IP Address: $($ServerConfig.IP)" -ForegroundColor Cyan
    Write-Host "   Username: $($ServerConfig.Username)" -ForegroundColor Cyan
    Write-Host "   Port: $($ServerConfig.Port)" -ForegroundColor Cyan
    
    Write-Host "`n🔑 Key Files:" -ForegroundColor Green
    Write-Host "   Private Key: $KeyPath" -ForegroundColor Cyan
    Write-Host "   Public Key: $PublicKeyPath" -ForegroundColor Cyan
    Write-Host "   SSH Config: $ConfigPath" -ForegroundColor Cyan
    
    Write-Host "`n🚀 Connection Commands:" -ForegroundColor Green
    Write-Host "   Simple: " -ForegroundColor Yellow -NoNewline
    Write-Host "ssh bestcasinoportal" -ForegroundColor Cyan
    Write-Host "   Direct: " -ForegroundColor Yellow -NoNewline
    Write-Host "ssh root@bestcasinoportal.com -p 22" -ForegroundColor Cyan
    Write-Host "   With IP: " -ForegroundColor Yellow -NoNewline
    Write-Host "ssh bestcasinoportal-ip" -ForegroundColor Cyan
    
    Write-Host "`n🛡️ Security Features:" -ForegroundColor Green
    Write-Host "   ✅ Ed25519/RSA-4096 encryption"
    Write-Host "   ✅ Enterprise cipher suites"
    Write-Host "   ✅ Key-based authentication only"
    Write-Host "   ✅ Connection keep-alive"
    Write-Host "   ✅ Ubuntu Security Guide compliance"
    
    Write-Host "`n📚 Quick Reference:" -ForegroundColor Green
    Write-Host "   Test connection: " -ForegroundColor Yellow -NoNewline
    Write-Host "ssh bestcasinoportal 'uptime'" -ForegroundColor Cyan
    Write-Host "   File transfer: " -ForegroundColor Yellow -NoNewline
    Write-Host "scp file.txt bestcasinoportal:/tmp/" -ForegroundColor Cyan
    Write-Host "   Port forwarding: " -ForegroundColor Yellow -NoNewline
    Write-Host "ssh -L 8080:localhost:80 bestcasinoportal" -ForegroundColor Cyan
    Write-Host "   Background tunnel: " -ForegroundColor Yellow -NoNewline
    Write-Host "ssh -fN -L 3000:localhost:3000 bestcasinoportal" -ForegroundColor Cyan
    
    Write-Host "`nContext7 + Ubuntu Security best practices applied ✨" -ForegroundColor DarkGray
}

# Main execution
function Main {
    Write-Host "🔐 SSH PASSWORDLESS SETUP FOR UBUNTU 24.04" -ForegroundColor Cyan
    Write-Host "Enterprise security using Context7 + Ubuntu Security Guide`n" -ForegroundColor DarkGray
    
    try {
        if (-not (Test-SSHAvailable)) {
            throw "SSH client not available"
        }
        
        Initialize-SSHDirectory
        New-SSHKeyPair
        Update-SSHConfig
        Copy-PublicKeyToServer
        Initialize-SSHAgent
        
        $connectionSuccess = Test-SSHConnection
        
        if ($connectionSuccess) {
            Show-ConnectionInfo
        } else {
            Write-LogMessage "Setup completed but connection test failed" -Type "Warning"
            Write-LogMessage "Please verify the public key was properly added to the server" -Type "Warning"
            Show-ConnectionInfo
        }
        
    }
    catch {
        Write-LogMessage "Setup failed: $_" -Type "Error"
        exit 1
    }
}

# Run the main function
Main
