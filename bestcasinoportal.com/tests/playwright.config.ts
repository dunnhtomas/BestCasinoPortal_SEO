import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Following Context7 best practices for mandatory testing and deployment blocking
 * Casino.ca compliant with cross-browser validation and performance requirements
 */
export default defineConfig({
  // Test directory structure
  testDir: './tests',
  
  // Global Setup and Teardown
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  
  // Deployment Blocking Configuration - MANDATORY
  forbidOnly: !!process.env.CI, // Prevent .only in CI/CD
  failOnFlakyTests: true, // Fail on flaky tests - mandatory for production
  
  // Timeout and Retry Configuration following Context7 patterns
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5000 // 5 seconds for assertions
  },
  
  // Retry strategy for flaky test detection
  retries: process.env.CI ? 2 : 0,
  
  // Worker configuration for parallel execution
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration with enterprise compliance
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: !process.env.CI 
    }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['github'], // GitHub Actions integration
    ['list'] // Console output
  ],
  
  // Output directory for artifacts
  outputDir: 'test-results/',
  
  // Global test configuration following Context7 patterns
  use: {
    // Base URL for casino portal
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://bestcasinoportal.com',
    
    // Performance and Core Web Vitals requirements
    actionTimeout: 0,
    
    // Screenshots and videos for debugging
    screenshot: process.env.CI ? 'only-on-failure' : 'off',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    trace: process.env.CI ? 'on-first-retry' : 'off',
    
    // Security headers enforcement
    ignoreHTTPSErrors: false,
    
    // Accessibility compliance
    colorScheme: 'light',
    
    // Performance optimization
    bypassCSP: false,
    
    // Mobile-first responsive testing
    viewport: { width: 1280, height: 720 },
  },

  // Cross-browser projects following Context7 mandatory testing
  projects: [
    // Desktop Browsers - MANDATORY for deployment
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },

    // Mobile Testing - Casino.ca responsive requirements
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Firefox',
      use: { ...devices['Galaxy S9+'] },
    },

    // Tablet Testing
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },

    // Performance Testing Project
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      testMatch: '**/*performance*.spec.ts'
    },

    // Security Testing Project
    {
      name: 'security',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      testMatch: '**/*security*.spec.ts'
    },

    // API Testing Project
    {
      name: 'api',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      testMatch: '**/*api*.spec.ts'
    }
  ],

  // Development server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});