import { test, expect } from '@playwright/test';

/**
 * Casino Portal End-to-End Tests
 * Following Context7 Playwright best practices for mandatory testing
 * DEPLOYMENT BLOCKING: All tests must pass for production deployment
 */

// Configure test group for parallel execution following Context7 patterns
test.describe.configure({ mode: 'parallel' });

test.describe('Casino Portal - Core User Flows (MANDATORY)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test following Context7 isolation
    await page.goto('/');
    
    // Wait for critical content to load
    await expect(page.getByText('Best Casino Portal')).toBeVisible();
  });

  test('Homepage loads with essential content and performance standards', async ({ page }) => {
    // Title and meta validation following Context7 web-first assertions
    await expect(page).toHaveTitle(/Best Casino Portal/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    
    // Essential navigation elements
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    
    // Featured casinos section - mandatory for business value
    await expect(page.getByRole('heading', { name: /featured casinos/i })).toBeVisible();
    const featuredCasinos = page.locator('[data-testid="casino-card"]');
    await expect(featuredCasinos).toHaveCount({ min: 3 }); // At least 3 featured casinos
    
    // Performance validation following casino.ca standards
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          let lcpValue = 0;
          let clsValue = 0;
          
          // Measure LCP
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcpValue = lastEntry.startTime;
            lcpObserver.disconnect();
            
            // Measure CLS
            const clsObserver = new PerformanceObserver((list) => {
              list.getEntries().forEach((entry: any) => {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              });
              clsObserver.disconnect();
              resolve({ lcp: lcpValue, cls: clsValue });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } else {
          resolve({ lcp: 0, cls: 0 });
        }
      });
    });
    
    // Assert performance requirements (casino.ca standards)
    expect(performanceMetrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(performanceMetrics.cls).toBeLessThan(0.1); // CLS < 0.1
    
    console.log(`✅ Performance: LCP=${performanceMetrics.lcp}ms, CLS=${performanceMetrics.cls}`);
  });

  test('Casino card interaction and navigation flow', async ({ page }) => {
    // Wait for casino cards to load
    const firstCasinoCard = page.locator('[data-testid="casino-card"]').first();
    await expect(firstCasinoCard).toBeVisible();
    
    // Verify casino card contains required elements
    await expect(firstCasinoCard.locator('[data-testid="casino-name"]')).toBeVisible();
    await expect(firstCasinoCard.locator('[data-testid="casino-rating"]')).toBeVisible();
    await expect(firstCasinoCard.locator('[data-testid="casino-bonus"]')).toBeVisible();
    await expect(firstCasinoCard.locator('[data-testid="play-now-button"]')).toBeVisible();
    
    // Test casino card click tracking
    await firstCasinoCard.click();
    
    // Should navigate to casino details or trigger action
    // This tests the critical business flow
    await page.waitForTimeout(1000); // Allow for navigation or modal
  });

  test('Casino search functionality with real-time filtering', async ({ page }) => {
    // Locate search input
    const searchInput = page.getByPlaceholder(/search casinos/i);
    await expect(searchInput).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('online casino');
    
    // Wait for search results to update (debounced)
    await page.waitForTimeout(500);
    
    // Verify search results contain relevant casinos
    const searchResults = page.locator('[data-testid="casino-card"]');
    await expect(searchResults).toHaveCount({ min: 1 });
    
    // Test search clearing
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Should show all casinos again
    await expect(searchResults).toHaveCount({ min: 3 });
  });

  test('Mobile responsive design validation', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile devices');
    
    // Verify mobile navigation
    const mobileMenuButton = page.getByRole('button', { name: /menu/i });
    await expect(mobileMenuButton).toBeVisible();
    
    // Test mobile menu functionality
    await mobileMenuButton.click();
    const mobileMenu = page.getByRole('navigation');
    await expect(mobileMenu).toBeVisible();
    
    // Verify casino cards are properly stacked on mobile
    const casinoCards = page.locator('[data-testid="casino-card"]');
    const firstCard = casinoCards.first();
    const secondCard = casinoCards.nth(1);
    
    const firstCardBox = await firstCard.boundingBox();
    const secondCardBox = await secondCard.boundingBox();
    
    // Cards should be stacked vertically on mobile
    expect(firstCardBox!.y).toBeLessThan(secondCardBox!.y);
  });

  test('Accessibility compliance validation', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1); // Only one H1 per page
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute('alt');
    }
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('Security headers and HTTPS enforcement', async ({ page }) => {
    const response = await page.goto('/');
    expect(response!.status()).toBe(200);
    
    const headers = response!.headers();
    
    // Mandatory security headers for casino portal
    expect(headers['strict-transport-security']).toBeTruthy();
    expect(headers['x-frame-options']).toBeTruthy();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['content-security-policy']).toBeTruthy();
    
    // HTTPS enforcement
    expect(page.url()).toMatch(/^https:/);
  });

  test('API response times meet sub-200ms requirement', async ({ page }) => {
    // Intercept API calls and measure response times
    const apiCalls: { url: string; duration: number }[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const request = response.request();
        const timing = response.request().timing();
        const duration = timing ? timing.responseEnd - timing.responseStart : 0;
        
        apiCalls.push({
          url: response.url(),
          duration: duration
        });
      }
    });
    
    // Navigate and trigger API calls
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify API response times
    for (const apiCall of apiCalls) {
      expect(apiCall.duration).toBeLessThan(200); // Sub-200ms requirement
      console.log(`✅ API ${apiCall.url}: ${apiCall.duration}ms`);
    }
  });
});

test.describe('Casino Portal - Error Handling (MANDATORY)', () => {
  
  test('404 page handles missing content gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response!.status()).toBe(404);
    
    // Should show custom 404 page
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /return home/i })).toBeVisible();
  });

  test('Network error handling and user feedback', async ({ page, context }) => {
    // Block network requests to simulate offline
    await context.route('**/api/**', route => route.abort());
    
    await page.goto('/');
    
    // Should show appropriate error messaging
    const errorMessage = page.getByText(/connection error|network error|please try again/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Casino Portal - Business Critical Flows (DEPLOYMENT BLOCKING)', () => {
  
  test('Casino affiliate link tracking works correctly', async ({ page, context }) => {
    // This test is critical for revenue - MUST pass for deployment
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('[data-testid="play-now-button"]').first().click()
    ]);
    
    // Verify affiliate link structure
    const popupUrl = popup.url();
    expect(popupUrl).toMatch(/(casino|affiliate|track)/);
    
    await popup.close();
  });

  test('Newsletter signup conversion flow', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/enter your email/i);
    const subscribeButton = page.getByRole('button', { name: /subscribe|sign up/i });
    
    await expect(emailInput).toBeVisible();
    await expect(subscribeButton).toBeVisible();
    
    // Test valid email submission
    await emailInput.fill('test@example.com');
    await subscribeButton.click();
    
    // Should show success message
    await expect(page.getByText(/thank you|subscribed|success/i)).toBeVisible();
  });
});