import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup for Playwright Tests
 * Following Context7 best practices for mandatory validation
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Global Test Setup - Mandatory Validations');
  
  // Launch browser for pre-test validations
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://bestcasinoportal.com';
    console.log(`📍 Validating base URL: ${baseURL}`);
    
    // Mandatory server health check
    const response = await page.goto(baseURL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (!response || response.status() !== 200) {
      throw new Error(`❌ DEPLOYMENT BLOCKED: Server health check failed with status ${response?.status()}`);
    }
    
    console.log('✅ Server health check passed');
    
    // Mandatory security headers validation
    const headers = response.headers();
    const requiredHeaders = [
      'strict-transport-security',
      'x-frame-options', 
      'x-content-type-options',
      'content-security-policy'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => !headers[header]);
    if (missingHeaders.length > 0) {
      throw new Error(`❌ DEPLOYMENT BLOCKED: Missing security headers: ${missingHeaders.join(', ')}`);
    }
    
    console.log('✅ Security headers validation passed');
    
    // Mandatory HTTPS validation
    if (!baseURL.startsWith('https://') && !baseURL.includes('localhost')) {
      throw new Error('❌ DEPLOYMENT BLOCKED: HTTPS not enforced in production');
    }
    
    console.log('✅ HTTPS enforcement validated');
    
    // Core Web Vitals baseline measurement
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // Measure LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            const lcp = lastEntry.startTime;
            
            if (lcp > 2500) { // 2.5s threshold
              console.warn(`⚠️  LCP baseline: ${lcp}ms (exceeds 2.5s threshold)`);
            } else {
              console.log(`✅ LCP baseline: ${lcp}ms (within threshold)`);
            }
            
            lcpObserver.disconnect();
            resolve(lcp);
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } else {
          resolve(0);
        }
      });
    });
    
    console.log('✅ Core Web Vitals baseline established');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    await browser.close();
    process.exit(1); // Block deployment on setup failure
  }
  
  await browser.close();
  console.log('🎉 Global setup completed successfully - Tests ready to run');
}

export default globalSetup;