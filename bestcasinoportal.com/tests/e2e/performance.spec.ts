import { test, expect } from '@playwright/test';

/**
 * Performance Testing Suite
 * Following Context7 best practices for Core Web Vitals validation
 * MANDATORY: All performance tests must pass for deployment
 */

test.describe('Performance Testing - Core Web Vitals (MANDATORY)', () => {
  
  test('Largest Contentful Paint (LCP) meets casino.ca standards', async ({ page }) => {
    await page.goto('/');
    
    const lcpMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            observer.disconnect();
            resolve(lastEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } else {
          resolve(0);
        }
      });
    });
    
    // LCP must be under 2.5 seconds for casino.ca compliance
    expect(lcpMetric).toBeLessThan(2500);
    console.log(`✅ LCP: ${lcpMetric}ms (target: <2500ms)`);
  });

  test('First Input Delay (FID) meets interactivity standards', async ({ page }) => {
    await page.goto('/');
    
    // Simulate user interaction to measure FID
    const fidMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              const fid = entry.processingStart - entry.startTime;
              observer.disconnect();
              resolve(fid);
            });
          });
          observer.observe({ entryTypes: ['first-input'] });
          
          // Trigger interaction after a delay
          setTimeout(() => {
            document.body.click();
          }, 1000);
        } else {
          resolve(0);
        }
      });
    });
    
    // FID must be under 100ms for casino.ca compliance
    expect(fidMetric).toBeLessThan(100);
    console.log(`✅ FID: ${fidMetric}ms (target: <100ms)`);
  });

  test('Cumulative Layout Shift (CLS) maintains visual stability', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    
    const clsMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
          
          // Observe for 5 seconds
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 5000);
        } else {
          resolve(0);
        }
      });
    });
    
    // CLS must be under 0.1 for casino.ca compliance
    expect(clsMetric).toBeLessThan(0.1);
    console.log(`✅ CLS: ${clsMetric} (target: <0.1)`);
  });

  test('Time to Interactive (TTI) enables user engagement', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
    
    // Test interactivity by performing actions
    await page.getByRole('button').first().click();
    await page.getByRole('link').first().click();
    
    const ttiTime = Date.now() - startTime;
    
    // TTI should be under 3.5 seconds for good user experience
    expect(ttiTime).toBeLessThan(3500);
    console.log(`✅ TTI: ${ttiTime}ms (target: <3500ms)`);
  });

  test('Resource loading optimization and bundle size', async ({ page }) => {
    const resources: { name: string; size: number; type: string }[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes(page.url())) {
        const headers = response.headers();
        const contentLength = headers['content-length'];
        const contentType = headers['content-type'] || '';
        
        resources.push({
          name: response.url(),
          size: contentLength ? parseInt(contentLength) : 0,
          type: contentType
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Analyze JavaScript bundle sizes
    const jsResources = resources.filter(r => r.type.includes('javascript'));
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    
    // JavaScript bundles should be optimized
    expect(totalJSSize).toBeLessThan(500000); // 500KB limit
    console.log(`✅ Total JS bundle size: ${(totalJSSize / 1024).toFixed(2)}KB`);
    
    // CSS bundle optimization
    const cssResources = resources.filter(r => r.type.includes('css'));
    const totalCSSSize = cssResources.reduce((sum, r) => sum + r.size, 0);
    
    expect(totalCSSSize).toBeLessThan(100000); // 100KB limit
    console.log(`✅ Total CSS bundle size: ${(totalCSSSize / 1024).toFixed(2)}KB`);
  });
});

test.describe('Performance Testing - Mobile Optimization', () => {
  
  test('Mobile page load performance meets standards', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific performance test');
    
    const startTime = Date.now();
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="casino-card"]');
    const loadTime = Date.now() - startTime;
    
    // Mobile load time should be under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    console.log(`✅ Mobile load time: ${loadTime}ms`);
  });

  test('Image optimization and lazy loading effectiveness', async ({ page }) => {
    await page.goto('/');
    
    // Check for lazy loading implementation
    const images = page.locator('img');
    const imageCount = await images.count();
    
    let lazyLoadedImages = 0;
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      
      if (loading === 'lazy') {
        lazyLoadedImages++;
      }
    }
    
    // At least 50% of images should be lazy loaded
    const lazyLoadPercentage = (lazyLoadedImages / imageCount) * 100;
    expect(lazyLoadPercentage).toBeGreaterThan(50);
    
    console.log(`✅ Lazy loading: ${lazyLoadPercentage}% of images`);
  });
});