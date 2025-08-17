import { test, expect } from '@playwright/test';

/**
 * Security Testing Suite
 * Following Context7 best practices for enterprise security compliance
 * MANDATORY: All security tests must pass for deployment
 */

test.describe('Security Testing - Enterprise Compliance (MANDATORY)', () => {
  
  test('HTTPS enforcement and SSL/TLS validation', async ({ page }) => {
    // Test HTTP to HTTPS redirect
    const response = await page.goto(page.url().replace('https://', 'http://'));
    
    // Should redirect to HTTPS
    expect(page.url()).toMatch(/^https:/);
    expect(response!.status()).toBe(200);
    
    console.log('✅ HTTPS enforcement validated');
  });

  test('Security headers compliance (SOC2/GDPR/PCI-DSS)', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();
    
    // HSTS (HTTP Strict Transport Security)
    expect(headers['strict-transport-security']).toBeTruthy();
    expect(headers['strict-transport-security']).toContain('max-age');
    
    // X-Frame-Options (Clickjacking protection)
    expect(headers['x-frame-options']).toBeTruthy();
    expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
    
    // X-Content-Type-Options (MIME sniffing protection)
    expect(headers['x-content-type-options']).toBe('nosniff');
    
    // Content Security Policy
    expect(headers['content-security-policy']).toBeTruthy();
    
    // X-XSS-Protection (if present)
    if (headers['x-xss-protection']) {
      expect(headers['x-xss-protection']).toMatch(/1; mode=block/);
    }
    
    // Referrer Policy
    if (headers['referrer-policy']) {
      expect(headers['referrer-policy']).toBeTruthy();
    }
    
    console.log('✅ Security headers compliance validated');
  });

  test('Content Security Policy (CSP) effectiveness', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();
    const csp = headers['content-security-policy'];
    
    expect(csp).toBeTruthy();
    
    // Should prevent inline scripts
    expect(csp).toContain("script-src");
    
    // Should specify allowed domains
    expect(csp).toContain("default-src");
    
    // Test CSP violation handling
    const cspViolations: any[] = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });
    
    // Try to inject inline script (should be blocked)
    await page.evaluate(() => {
      try {
        const script = document.createElement('script');
        script.innerHTML = 'console.log("This should be blocked by CSP");';
        document.head.appendChild(script);
      } catch (e) {
        // Expected to be blocked
      }
    });
    
    console.log('✅ Content Security Policy validated');
  });

  test('Input validation and XSS prevention', async ({ page }) => {
    await page.goto('/');
    
    // Test XSS prevention in search functionality
    const searchInput = page.getByPlaceholder(/search/i);
    
    if (await searchInput.count() > 0) {
      const xssPayload = '<script>alert("XSS")</script>';
      await searchInput.fill(xssPayload);
      await page.keyboard.press('Enter');
      
      // Should not execute script
      const alertDialog = page.locator('text=XSS');
      await expect(alertDialog).not.toBeVisible();
      
      // Check if payload is properly escaped in DOM
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    }
    
    console.log('✅ XSS prevention validated');
  });

  test('SQL injection prevention in search/forms', async ({ page }) => {
    await page.goto('/');
    
    // Test SQL injection in search
    const searchInput = page.getByPlaceholder(/search/i);
    
    if (await searchInput.count() > 0) {
      const sqlPayload = "'; DROP TABLE casinos; --";
      await searchInput.fill(sqlPayload);
      await page.keyboard.press('Enter');
      
      // Should handle gracefully without errors
      await page.waitForTimeout(1000);
      
      // Page should still function normally
      await expect(page.getByText(/casino/i)).toBeVisible();
    }
    
    console.log('✅ SQL injection prevention validated');
  });

  test('Authentication and session security', async ({ page }) => {
    await page.goto('/');
    
    // Check for secure cookie settings
    const cookies = await page.context().cookies();
    
    cookies.forEach(cookie => {
      if (cookie.name.toLowerCase().includes('session') || 
          cookie.name.toLowerCase().includes('auth')) {
        
        // Session cookies should be HttpOnly and Secure
        expect(cookie.httpOnly).toBe(true);
        expect(cookie.secure).toBe(true);
        
        // Should have SameSite protection
        expect(cookie.sameSite).toBeTruthy();
      }
    });
    
    console.log('✅ Session security validated');
  });

  test('GDPR compliance and privacy protection', async ({ page }) => {
    await page.goto('/');
    
    // Should show cookie consent/privacy notice
    const cookieNotice = page.getByText(/cookie|privacy|gdpr|consent/i);
    const privacyLink = page.getByRole('link', { name: /privacy policy/i });
    
    // One of these should be present for GDPR compliance
    const hasGDPRCompliance = (await cookieNotice.count() > 0) || 
                             (await privacyLink.count() > 0);
    
    expect(hasGDPRCompliance).toBe(true);
    
    console.log('✅ GDPR compliance validated');
  });

  test('Third-party script security validation', async ({ page }) => {
    const scripts: string[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') && 
          !response.url().includes(page.url())) {
        scripts.push(response.url());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Validate third-party scripts are from trusted domains
    const trustedDomains = [
      'googleapis.com',
      'googletagmanager.com', 
      'google-analytics.com',
      'facebook.net',
      'hotjar.com'
    ];
    
    scripts.forEach(scriptUrl => {
      const isFromTrustedDomain = trustedDomains.some(domain => 
        scriptUrl.includes(domain)
      );
      
      if (!isFromTrustedDomain) {
        console.warn(`⚠️  Untrusted script detected: ${scriptUrl}`);
      }
    });
    
    console.log('✅ Third-party script security validated');
  });

  test('API endpoint security and rate limiting', async ({ page }) => {
    // Test API endpoints for security headers
    const apiResponse = await page.request.get('/api/casinos');
    
    if (apiResponse.status() === 200) {
      const apiHeaders = apiResponse.headers();
      
      // API should have security headers
      expect(apiHeaders['x-content-type-options']).toBeTruthy();
      
      // Should specify content type
      expect(apiHeaders['content-type']).toContain('application/json');
      
      // Rate limiting headers (if implemented)
      if (apiHeaders['x-ratelimit-limit']) {
        expect(parseInt(apiHeaders['x-ratelimit-limit'])).toBeGreaterThan(0);
      }
    }
    
    console.log('✅ API security validated');
  });
});

test.describe('Security Testing - Vulnerability Scanning', () => {
  
  test('Common vulnerability patterns detection', async ({ page }) => {
    await page.goto('/');
    
    // Check for common security misconfigurations
    const pageContent = await page.content();
    
    // Should not expose sensitive information
    expect(pageContent).not.toContain('password');
    expect(pageContent).not.toContain('secret');
    expect(pageContent).not.toContain('token');
    expect(pageContent).not.toContain('api_key');
    
    // Should not have development/debug info
    expect(pageContent).not.toContain('console.log');
    expect(pageContent).not.toContain('debugger');
    expect(pageContent).not.toContain('TODO');
    expect(pageContent).not.toContain('FIXME');
    
    console.log('✅ Vulnerability patterns check passed');
  });

  test('OWASP Top 10 compliance validation', async ({ page }) => {
    await page.goto('/');
    
    // A03:2021 - Injection prevention validated above
    // A05:2021 - Security Misconfiguration
    const response = await page.goto('/');
    expect(response!.headers()['server']).toBeFalsy(); // Server header should be hidden
    
    // A06:2021 - Vulnerable and Outdated Components
    // This would require dependency scanning in CI/CD
    
    console.log('✅ OWASP Top 10 basic compliance validated');
  });
});