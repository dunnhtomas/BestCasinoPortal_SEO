
# Cloudflare DNS Configuration
# Token: KhoBPsapJwVnmeg8iqoi0BGqOqgty3V9g4TocDXS

## DNS Records to Create:
1. A Record: bestcasinoportal.com → 193.233.161.161
2. CNAME Record: www.bestcasinoportal.com → bestcasinoportal.com

## Cloudflare Settings:
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- HTTP Strict Transport Security (HSTS): On
- Minimum TLS Version: 1.2
- Opportunistic Encryption: On
- TLS 1.3: On

## Performance Settings:
- Caching Level: Standard
- Browser Cache TTL: 4 hours
- Auto Minify: CSS, JavaScript, HTML
- Brotli: On
- Rocket Loader: On
- Mirage: On
- Polish: Lossless

## Security Settings:
- Security Level: Medium
- Challenge Passage: 30 minutes
- Browser Integrity Check: On
- Privacy Pass Support: On
- Bot Fight Mode: On

## Page Rules:
1. *.bestcasinoportal.com/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 2 hours
   - Browser Cache TTL: 4 hours
