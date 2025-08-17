# Server Connection Diagnostics for BestCasinoPortal.com
Write-Host "SERVER CONNECTION DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

$server = "193.233.161.161"
$domain = "bestcasinoportal.com"

Write-Host "Testing connectivity to server..." -ForegroundColor Yellow

# Test 1: Ping test
Write-Host "`n1. PING TEST:" -ForegroundColor Cyan
try {
    $ping = Test-Connection -ComputerName $server -Count 3 -ErrorAction Stop
    Write-Host "✅ Server is reachable" -ForegroundColor Green
    Write-Host "   Average latency: $([math]::Round(($ping | Measure-Object ResponseTime -Average).Average, 2))ms" -ForegroundColor White
} catch {
    Write-Host "❌ Server unreachable via ping" -ForegroundColor Red
}

# Test 2: Port scanning
Write-Host "`n2. PORT SCANNING:" -ForegroundColor Cyan
$ports = @(22, 80, 443, 2222, 2200)
foreach ($port in $ports) {
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.ConnectAsync($server, $port).Wait(3000)
        if ($connection.Connected) {
            Write-Host "✅ Port $port is open" -ForegroundColor Green
            $connection.Close()
        } else {
            Write-Host "❌ Port $port is closed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Port $port is closed/filtered" -ForegroundColor Red
    }
}

# Test 3: DNS resolution
Write-Host "`n3. DNS RESOLUTION:" -ForegroundColor Cyan
try {
    $dns = Resolve-DnsName -Name $domain -ErrorAction Stop
    Write-Host "✅ Domain resolves to: $($dns[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "❌ Domain does not resolve" -ForegroundColor Red
}

# Test 4: HTTP connectivity
Write-Host "`n4. HTTP CONNECTIVITY:" -ForegroundColor Cyan
try {
    $web = Invoke-WebRequest -Uri "http://$server" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTP connection successful" -ForegroundColor Green
    Write-Host "   Status: $($web.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ HTTP connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Alternative SSH ports
Write-Host "`n5. SSH CONNECTION ATTEMPTS:" -ForegroundColor Cyan
$sshPorts = @(22, 2222, 2200, 22000)
foreach ($sshPort in $sshPorts) {
    Write-Host "Testing SSH on port $sshPort..." -ForegroundColor Yellow
    try {
        $sshTest = ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p $sshPort root@$server "echo 'SSH connection successful'" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSH working on port $sshPort" -ForegroundColor Green
            Write-Host "   Response: $sshTest" -ForegroundColor White
            break
        } else {
            Write-Host "❌ SSH failed on port $sshPort" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ SSH connection error on port $sshPort" -ForegroundColor Red
    }
}

Write-Host "`n📋 DIAGNOSIS SUMMARY:" -ForegroundColor Magenta
Write-Host "Server IP: $server" -ForegroundColor White
Write-Host "Domain: $domain" -ForegroundColor White
Write-Host "Expected SSH Port: 22" -ForegroundColor White

Write-Host "`n🔧 TROUBLESHOOTING STEPS:" -ForegroundColor Yellow
Write-Host "1. Check if server is properly provisioned" -ForegroundColor Cyan
Write-Host "2. Verify SSH service is running" -ForegroundColor Cyan
Write-Host "3. Check firewall settings (allow port 22)" -ForegroundColor Cyan
Write-Host "4. Confirm server is fully booted" -ForegroundColor Cyan
Write-Host "5. Try alternative connection methods" -ForegroundColor Cyan

Write-Host "`n🎯 NEXT ACTIONS:" -ForegroundColor Green
Write-Host "• If ping works but SSH doesn't: Server needs SSH setup" -ForegroundColor White
Write-Host "• If nothing works: Server may not be provisioned yet" -ForegroundColor White
Write-Host "• If HTTP works: We can deploy via web-based methods" -ForegroundColor White

Write-Host "`n💡 ALTERNATIVE DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host "1. cPanel/Web interface deployment" -ForegroundColor Yellow
Write-Host "2. FTP/SFTP file upload" -ForegroundColor Yellow
Write-Host "3. Web-based terminal access" -ForegroundColor Yellow
Write-Host "4. SSH via alternative ports" -ForegroundColor Yellow
