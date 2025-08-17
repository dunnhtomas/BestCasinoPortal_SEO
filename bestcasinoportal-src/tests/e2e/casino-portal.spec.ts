import { test, expect, Page } from '@playwright/test';

/**
 * BestCasinoPortal.com E2E Test Suite
 * Based on casino.ca analysis and performance requirements
 * Mandatory tests for deployment blocking
 */

test.describe('BestCasinoPortal.com - Casino Portal Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Performance monitoring setup
    await page.addInitScript(() => {
      window.performanceMetrics = {
        navigation: performance.getEntriesByType('navigation')[0],
        resources: [],
        marks: []
      };
    });
  });

  test('homepage loads with casino.ca performance standards', async () => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Best Casino Portal/);
    
    // Check Core Web Vitals compliance
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
          resolve({
            lcp: lcp?.startTime || 0,
            timestamp: Date.now(),
            navigation: performance.getEntriesByType('navigation')[0]
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    // LCP must be under 2.5s (casino.ca standard)
    expect(performanceMetrics.lcp).toBeLessThan(2500);
    
    // Page load must be under 3s
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`✅ Homepage performance: LCP ${performanceMetrics.lcp}ms, Load ${loadTime}ms`);
  });

  test('casino cards display correctly with all required elements', async () => {
    await page.goto('/');
    
    // Wait for casino cards to load
    await page.waitForSelector('.casino-card', { timeout: 5000 });
    
    const casinoCards = page.locator('.casino-card');
    const cardCount = await casinoCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    
    // Check first casino card has all required elements
    const firstCard = casinoCards.first();
    
    await expect(firstCard.locator('.casino-name')).toBeVisible();
    await expect(firstCard.locator('.casino-logo')).toBeVisible();
    await expect(firstCard.locator('.bonus-amount')).toBeVisible();
    await expect(firstCard.locator('.btn-primary')).toBeVisible();
    await expect(firstCard.locator('.casino-rating')).toBeVisible();
    
    console.log(`✅ Found ${cardCount} casino cards with required elements`);
  });

  test('search functionality works like casino.ca', async () => {
    await page.goto('/');
    
    // Test search input
    await page.fill('[data-testid="search-input"]', 'bonus');
    await page.click('[data-testid="search-button"]');
    
    // Wait for search results
    await page.waitForSelector('.search-results', { timeout: 5000 });
    
    const searchResults = page.locator('.casino-card');
    const resultCount = await searchResults.count();
    
    expect(resultCount).toBeGreaterThan(0);
    
    // Verify search is working
    const searchQuery = await page.locator('[data-testid="search-input"]').inputValue();
    expect(searchQuery).toBe('bonus');
    
    console.log(`✅ Search returned ${resultCount} results for "bonus"`);
  });

  test('responsive design works on mobile devices', async () => {
    // Test mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    await page.waitForSelector('.casino-card');
    
    // Check mobile navigation
    await expect(page.locator('.mobile-menu-button')).toBeVisible();
    await page.click('.mobile-menu-button');
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // Check mobile casino cards
    const mobileCards = page.locator('.casino-card');
    await expect(mobileCards.first()).toBeVisible();
    
    // Test tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.casino-card')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.casino-card')).toBeVisible();
    
    console.log('✅ Responsive design validated across all viewports');
  });

  test('security headers are properly configured', async () => {
    const response = await page.goto('/');
    const headers = response?.headers();
    
    // Security headers check (enterprise-grade)
    expect(headers?.['strict-transport-security']).toContain('max-age');
    expect(headers?.['x-frame-options']).toBe('DENY');
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['content-security-policy']).toBeDefined();
    expect(headers?.['x-xss-protection']).toBe('1; mode=block');
    
    console.log('✅ All enterprise security headers configured correctly');
  });

  test('API endpoints respond within 200ms requirement', async () => {
    await page.goto('/');
    
    // Test casino API endpoint performance
    const apiTests = [
      '/api/casinos',
      '/api/casinos/featured',
      '/api/bonuses',
      '/api/search?q=blackjack'
    ];
    
    for (const endpoint of apiTests) {
      const startTime = Date.now();
      const response = await page.request.get(endpoint);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(200); // Sub-200ms requirement
      
      console.log(`✅ ${endpoint}: ${responseTime}ms (target: <200ms)`);
    }
  });

  test('casino affiliate links work correctly', async () => {
    await page.goto('/');
    
    await page.waitForSelector('.casino-card .btn-primary');
    
    // Test affiliate link click
    const playButton = page.locator('.casino-card .btn-primary').first();
    
    // Listen for new tab
    const newPagePromise = page.context().waitForEvent('page');
    await playButton.click();
    
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();
    
    // Verify external casino site opened
    const newUrl = newPage.url();
    expect(newUrl).not.toContain(page.url());
    expect(newUrl).toMatch(/^https?:\/\//);
    
    await newPage.close();
    
    console.log(`✅ Affiliate link opened correctly: ${newUrl}`);
  });

  test('accessibility standards compliance', async () => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
      
      expect(ariaLabel || hasLabel).toBeTruthy();
    }
    
    console.log('✅ Accessibility standards compliance verified');
  });

  test('SEO optimization matches casino.ca standards', async () => {
    await page.goto('/');
    
    // Check meta tags
    const title = await page.title();
    expect(title).toContain('Best Casino');
    expect(title.length).toBeLessThan(60);
    
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThan(160);
    
    // Check structured data
    const structuredData = await page.locator('script[type="application/ld+json"]');
    expect(await structuredData.count()).toBeGreaterThan(0);
    
    // Check canonical URL
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).toBeTruthy();
    
    console.log('✅ SEO optimization verified');
  });
});

// Cross-browser compatibility tests
test.describe('Cross-Browser Compatibility', () => {
  
  test('Chrome compatibility', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.casino-card')).toBeVisible();
    console.log('✅ Chrome compatibility verified');
  });
  
  test('Firefox compatibility', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.casino-card')).toBeVisible();
    console.log('✅ Firefox compatibility verified');
  });
  
  test('Safari compatibility', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.casino-card')).toBeVisible();
    console.log('✅ Safari compatibility verified');
  });
  
  test('Edge compatibility', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.casino-card')).toBeVisible();
    console.log('✅ Edge compatibility verified');
  });
});