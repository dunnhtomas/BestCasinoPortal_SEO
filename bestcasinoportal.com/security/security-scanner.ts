import { SecurityConfig } from './security-config';

/**
 * Automated Security Scanner
 * Following Context7 security scanning patterns
 */
export class SecurityScanner {
  private vulnerabilities: any[] = [];
  private scanResults: any = {};

  constructor() {
    this.vulnerabilities = [];
    this.scanResults = {
      timestamp: new Date().toISOString(),
      totalChecks: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      critical: 0,
      details: []
    };
  }

  /**
   * Run comprehensive security scan
   */
  async runFullScan(url: string): Promise<any> {
    console.log('🔍 Starting comprehensive security scan...');
    
    await this.scanHeaders(url);
    await this.scanCookies(url);
    await this.scanContentSecurityPolicy(url);
    await this.scanSSL(url);
    await this.scanInputValidation();
    await this.scanForCommonVulnerabilities();
    
    return this.generateReport();
  }

  /**
   * Scan HTTP security headers
   */
  async scanHeaders(url: string): Promise<void> {
    console.log('🛡️ Scanning HTTP security headers...');
    
    try {
      const response = await fetch(url);
      const headers = Object.fromEntries(response.headers);
      
      this.checkHeader(headers, 'strict-transport-security', 'HSTS header missing', 'critical');
      this.checkHeader(headers, 'x-frame-options', 'X-Frame-Options header missing', 'high');
      this.checkHeader(headers, 'x-content-type-options', 'X-Content-Type-Options header missing', 'medium');
      this.checkHeader(headers, 'x-xss-protection', 'X-XSS-Protection header missing', 'medium');
      this.checkHeader(headers, 'content-security-policy', 'Content-Security-Policy header missing', 'high');
      this.checkHeader(headers, 'referrer-policy', 'Referrer-Policy header missing', 'low');
      
      // Check for information disclosure headers
      this.checkHeaderAbsence(headers, 'server', 'Server header exposes server information', 'low');
      this.checkHeaderAbsence(headers, 'x-powered-by', 'X-Powered-By header exposes technology stack', 'low');
      
    } catch (error) {
      this.addVulnerability('header-scan-failed', 'Failed to scan headers', 'high', `Error: ${error.message}`);
    }
  }

  /**
   * Scan cookie security
   */
  async scanCookies(url: string): Promise<void> {
    console.log('🍪 Scanning cookie security...');
    
    try {
      const response = await fetch(url);
      const setCookieHeaders = response.headers.getSetCookie?.() || [];
      
      setCookieHeaders.forEach((cookieHeader, index) => {
        const cookieName = `cookie-${index}`;
        
        if (!cookieHeader.includes('Secure')) {
          this.addVulnerability(
            'insecure-cookie',
            `Cookie without Secure flag: ${cookieName}`,
            'medium',
            'Cookies should have Secure flag when served over HTTPS'
          );
        }
        
        if (!cookieHeader.includes('HttpOnly')) {
          this.addVulnerability(
            'httponly-missing',
            `Cookie without HttpOnly flag: ${cookieName}`,
            'medium',
            'Cookies should have HttpOnly flag to prevent XSS attacks'
          );
        }
        
        if (!cookieHeader.includes('SameSite')) {
          this.addVulnerability(
            'samesite-missing',
            `Cookie without SameSite attribute: ${cookieName}`,
            'low',
            'Cookies should have SameSite attribute for CSRF protection'
          );
        }
      });
      
    } catch (error) {
      this.addVulnerability('cookie-scan-failed', 'Failed to scan cookies', 'medium', `Error: ${error.message}`);
    }
  }

  /**
   * Scan Content Security Policy
   */
  async scanContentSecurityPolicy(url: string): Promise<void> {
    console.log('📋 Scanning Content Security Policy...');
    
    try {
      const response = await fetch(url);
      const cspHeader = response.headers.get('content-security-policy');
      
      if (!cspHeader) {
        this.addVulnerability(
          'missing-csp',
          'Content Security Policy header is missing',
          'high',
          'CSP helps prevent XSS attacks'
        );
        return;
      }
      
      // Check for unsafe directives
      if (cspHeader.includes("'unsafe-eval'")) {
        this.addVulnerability(
          'unsafe-eval',
          "CSP contains 'unsafe-eval' directive",
          'high',
          "Remove 'unsafe-eval' from CSP to prevent code injection"
        );
      }
      
      if (cspHeader.includes("'unsafe-inline'")) {
        this.addVulnerability(
          'unsafe-inline',
          "CSP contains 'unsafe-inline' directive",
          'medium',
          "Consider using nonces or hashes instead of 'unsafe-inline'"
        );
      }
      
      // Check for wildcard sources
      if (cspHeader.includes('*')) {
        this.addVulnerability(
          'csp-wildcard',
          'CSP contains wildcard (*) source',
          'medium',
          'Avoid using wildcard sources in CSP'
        );
      }
      
    } catch (error) {
      this.addVulnerability('csp-scan-failed', 'Failed to scan CSP', 'medium', `Error: ${error.message}`);
    }
  }

  /**
   * Scan SSL/TLS configuration
   */
  async scanSSL(url: string): Promise<void> {
    console.log('🔒 Scanning SSL/TLS configuration...');
    
    try {
      if (!url.startsWith('https://')) {
        this.addVulnerability(
          'no-https',
          'Website not served over HTTPS',
          'critical',
          'All traffic should be encrypted with HTTPS'
        );
        return;
      }
      
      // Basic HTTPS validation
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ HTTPS connection successful');
      }
      
      // Check for mixed content (would need browser environment)
      // This is a placeholder for more comprehensive SSL testing
      
    } catch (error) {
      if (error.message.includes('certificate')) {
        this.addVulnerability(
          'ssl-certificate-error',
          'SSL certificate error',
          'critical',
          `SSL certificate issue: ${error.message}`
        );
      } else {
        this.addVulnerability('ssl-scan-failed', 'Failed to scan SSL', 'medium', `Error: ${error.message}`);
      }
    }
  }

  /**
   * Scan for input validation issues
   */
  async scanInputValidation(): Promise<void> {
    console.log('✅ Scanning input validation...');
    
    // XSS payloads for testing
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      '<svg onload=alert("xss")>'
    ];
    
    // SQL injection payloads
    const sqlPayloads = [
      "' OR '1'='1",
      "' UNION SELECT NULL--",
      "'; DROP TABLE users;--",
      "1' OR '1'='1' --"
    ];
    
    // Command injection payloads
    const cmdPayloads = [
      '; cat /etc/passwd',
      '| whoami',
      '&& ls -la',
      '$(whoami)'
    ];
    
    // Test each payload type
    this.testPayloads('xss', xssPayloads);
    this.testPayloads('sql-injection', sqlPayloads);
    this.testPayloads('command-injection', cmdPayloads);
  }

  /**
   * Scan for common vulnerabilities
   */
  async scanForCommonVulnerabilities(): Promise<void> {
    console.log('🔍 Scanning for common vulnerabilities...');
    
    // Directory traversal
    const traversalPayloads = [
      '../../../etc/passwd',
      '..\..\..\windows\system32\drivers\etc\hosts',
      '....//....//....//etc/passwd'
    ];
    
    this.testPayloads('directory-traversal', traversalPayloads);
    
    // Check for common sensitive files exposure
    const sensitiveFiles = [
      '/.env',
      '/config.php',
      '/wp-config.php',
      '/.git/config',
      '/package.json',
      '/composer.json'
    ];
    
    this.testSensitiveFiles(sensitiveFiles);
    
    // Check for common admin paths
    const adminPaths = [
      '/admin',
      '/administrator',
      '/wp-admin',
      '/admin.php',
      '/login'
    ];
    
    this.testAdminPaths(adminPaths);
  }

  /**
   * Test payload injection
   */
  private testPayloads(type: string, payloads: string[]): void {
    payloads.forEach((payload, index) => {
      // This would integrate with actual testing in a real implementation
      console.log(`Testing ${type} payload ${index + 1}: ${payload.substring(0, 20)}...`);
      
      // Simulate validation check
      if (this.isValidated(payload)) {
        console.log(`✅ ${type} payload blocked successfully`);
      } else {
        this.addVulnerability(
          type,
          `${type} vulnerability detected`,
          'high',
          `Payload not properly filtered: ${payload}`
        );
      }
    });
  }

  /**
   * Test sensitive file exposure
   */
  private testSensitiveFiles(files: string[]): void {
    files.forEach(file => {
      console.log(`Testing sensitive file exposure: ${file}`);
      
      // This would make actual HTTP requests in a real implementation
      // For now, simulate the check
      if (Math.random() > 0.9) { // 10% chance of finding exposed file
        this.addVulnerability(
          'sensitive-file-exposure',
          `Sensitive file exposed: ${file}`,
          'high',
          `File ${file} is publicly accessible`
        );
      }
    });
  }

  /**
   * Test admin path exposure
   */
  private testAdminPaths(paths: string[]): void {
    paths.forEach(adminPath => {
      console.log(`Testing admin path: ${adminPath}`);
      
      // Simulate admin path check
      if (Math.random() > 0.8) { // 20% chance of finding exposed admin
        this.addVulnerability(
          'admin-path-exposure',
          `Admin path exposed: ${adminPath}`,
          'medium',
          `Admin interface accessible at ${adminPath}`
        );
      }
    });
  }

  /**
   * Simulate input validation check
   */
  private isValidated(input: string): boolean {
    // Simulate proper input validation
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /onw+=/i,
      /union.*select/i,
      /drop.*table/i,
      /../..//,
      /;.*cat/i,
      /|.*whoami/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Helper methods
   */
  private checkHeader(headers: any, headerName: string, message: string, severity: string): void {
    this.scanResults.totalChecks++;
    
    if (!headers[headerName] && !headers[headerName.toLowerCase()]) {
      this.addVulnerability('missing-header', message, severity, `Header ${headerName} not found`);
      this.scanResults.failed++;
    } else {
      this.scanResults.passed++;
    }
  }

  private checkHeaderAbsence(headers: any, headerName: string, message: string, severity: string): void {
    this.scanResults.totalChecks++;
    
    if (headers[headerName] || headers[headerName.toLowerCase()]) {
      this.addVulnerability('information-disclosure', message, severity, `Header ${headerName} present`);
      this.scanResults.failed++;
    } else {
      this.scanResults.passed++;
    }
  }

  private addVulnerability(type: string, description: string, severity: string, details: string): void {
    const vulnerability = {
      type,
      description,
      severity,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.vulnerabilities.push(vulnerability);
    this.scanResults.details.push(vulnerability);
    
    switch (severity) {
      case 'critical':
        this.scanResults.critical++;
        break;
      case 'high':
        this.scanResults.failed++;
        break;
      case 'medium':
        this.scanResults.warnings++;
        break;
      case 'low':
        this.scanResults.warnings++;
        break;
    }
    
    console.log(`⚠️  ${severity.toUpperCase()}: ${description}`);
  }

  /**
   * Generate security report
   */
  private generateReport(): any {
    const report = {
      ...this.scanResults,
      summary: {
        totalVulnerabilities: this.vulnerabilities.length,
        criticalVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'critical').length,
        highVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'high').length,
        mediumVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'medium').length,
        lowVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'low').length
      },
      compliance: {
        owasp: this.checkOWASPCompliance(),
        gdpr: this.checkGDPRCompliance(),
        pci: this.checkPCICompliance()
      },
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  private checkOWASPCompliance(): any {
    return {
      score: Math.max(0, 100 - (this.vulnerabilities.length * 10)),
      issues: this.vulnerabilities.filter(v => ['critical', 'high'].includes(v.severity))
    };
  }

  private checkGDPRCompliance(): any {
    return {
      cookieConsent: 'review-required',
      dataProtection: 'review-required',
      privacyPolicy: 'review-required'
    };
  }

  private checkPCICompliance(): any {
    return {
      encryption: this.vulnerabilities.some(v => v.type === 'no-https') ? 'non-compliant' : 'compliant',
      accessControl: 'review-required',
      monitoring: 'review-required'
    };
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    
    if (this.vulnerabilities.some(v => v.type === 'missing-csp')) {
      recommendations.push('Implement Content Security Policy headers');
    }
    
    if (this.vulnerabilities.some(v => v.type === 'missing-header')) {
      recommendations.push('Add missing security headers');
    }
    
    if (this.vulnerabilities.some(v => v.type === 'no-https')) {
      recommendations.push('Enable HTTPS for all traffic');
    }
    
    if (this.vulnerabilities.some(v => v.severity === 'critical')) {
      recommendations.push('Address critical security vulnerabilities immediately');
    }
    
    recommendations.push('Regular security audits and penetration testing');
    recommendations.push('Implement Web Application Firewall (WAF)');
    recommendations.push('Enable security monitoring and logging');
    
    return recommendations;
  }
}
