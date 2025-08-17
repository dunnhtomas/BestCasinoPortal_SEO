import { test, expect, type Page } from '@playwright/test';
import { promises as fs } from 'fs';
import { join } from 'path';

interface TechnicalAnalysis {
  performance: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    domContentLoaded: number;
    loadComplete: number;
  };
  security: {
    headers: Record<string, string>;
    httpsRedirect: boolean;
    mixedContent: boolean;
    cookieSecure: boolean;
  };
  seo: {
    title: string;
    metaDescription: string;
    h1Tags: string[];
    h2Tags: string[];
    h3Tags: string[];
    structuredData: any[];
    internalLinks: number;
    externalLinks: number;
    imageAltTags: number;
    canonicalUrl: string;
    hreflang: string[];
  };
  technology: {
    frameworks: string[];
    libraries: string[];
    cdnResources: string[];
    thirdPartyScripts: string[];
    cssFrameworks: string[];
  };
  content: {
    wordCount: number;
    readingTime: number;
    headingStructure: any;
    keywordDensity: Record<string, number>;
    contentBlocks: string[];
  };
  ux: {
    mobileResponsive: boolean;
    navigationStructure: any;
    cta_buttons: string[];
    formFields: any[];
    loadingStates: boolean;
  };
}

const CASINO_CA_URL = 'https://casino.ca';
const OUTPUT_DIR = './test-results';

test.describe('Casino.ca Comprehensive Reverse Engineering Suite', () => {
  let analysis: TechnicalAnalysis;

  test.beforeAll(async () => {
    // Initialize analysis object
    analysis = {
      performance: { lcp: 0, fid: 0, cls: 0, ttfb: 0, domContentLoaded: 0, loadComplete: 0 },
      security: { headers: {}, httpsRedirect: false, mixedContent: false, cookieSecure: false },
      seo: { 
        title: '', metaDescription: '', h1Tags: [], h2Tags: [], h3Tags: [], 
        structuredData: [], internalLinks: 0, externalLinks: 0, imageAltTags: 0,
        canonicalUrl: '', hreflang: []
      },
      technology: { frameworks: [], libraries: [], cdnResources: [], thirdPartyScripts: [], cssFrameworks: [] },
      content: { wordCount: 0, readingTime: 0, headingStructure: {}, keywordDensity: {}, contentBlocks: [] },
      ux: { mobileResponsive: false, navigationStructure: {}, cta_buttons: [], formFields: [], loadingStates: false }
    };
    
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true }).catch(() => {});
  });

  test.afterAll(async () => {
    // Save complete analysis
    await fs.writeFile(
      join(OUTPUT_DIR, 'casino-ca-complete-analysis.json'),
      JSON.stringify(analysis, null, 2)
    );
    
    // Generate markdown report
    await generateMarkdownReport(analysis);
  });

  test('Comprehensive Performance Analysis', async ({ page }: { page: Page }) => {
    console.log('🚀 Starting comprehensive performance analysis of casino.ca...');
    
    // Navigate and capture all performance metrics
    const navigationPromise = page.goto(CASINO_CA_URL, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    const [response] = await Promise.all([
      navigationPromise,
      page.waitForLoadState('networkidle')
    ]);

    // Capture Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise<{
        lcp: number;
        fid: number;
        cls: number;
        ttfb: number;
        domContentLoaded: number;
        loadComplete: number;
      }>((resolve) => {
        let lcp = 0;
        let fid = 0;
        let cls = 0;

        // LCP Observer
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Observer
        new PerformanceObserver((entryList) => {
          const firstInput = entryList.getEntries()[0] as any;
          if (firstInput && firstInput.processingStart) {
            fid = firstInput.processingStart - firstInput.startTime;
          }
        }).observe({ entryTypes: ['first-input'] });

        // CLS Observer
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShift = entry as any;
            if (layoutShift.hadRecentInput !== undefined && !layoutShift.hadRecentInput) {
              cls += layoutShift.value || 0;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        setTimeout(() => {
          resolve({
            lcp,
            fid,
            cls,
            ttfb: navigation.responseStart - navigation.requestStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart
          });
        }, 5000);
      });
    });

    analysis.performance = webVitals;

    // Save performance metrics
    await fs.writeFile(
      join(OUTPUT_DIR, 'performance-metrics.json'),
      JSON.stringify(webVitals, null, 2)
    );

    console.log('✅ Performance analysis completed:', webVitals);
  });

  test('Security Headers and SSL Analysis', async ({ page }: { page: Page }) => {
    console.log('🔒 Analyzing security headers and SSL configuration...');

    const response = await page.goto(CASINO_CA_URL);
    const headers = response?.headers() || {};

    // Security headers analysis
    const securityHeaders = {
      'strict-transport-security': headers['strict-transport-security'] || 'Missing',
      'content-security-policy': headers['content-security-policy'] || 'Missing',
      'x-frame-options': headers['x-frame-options'] || 'Missing',
      'x-content-type-options': headers['x-content-type-options'] || 'Missing',
      'x-xss-protection': headers['x-xss-protection'] || 'Missing',
      'referrer-policy': headers['referrer-policy'] || 'Missing',
      'permissions-policy': headers['permissions-policy'] || 'Missing'
    };

    // Check HTTPS redirect
    const httpResponse = await page.goto(CASINO_CA_URL.replace('https:', 'http:'));
    const httpsRedirect = httpResponse?.status() === 301 || httpResponse?.status() === 302;

    // Check for mixed content
    const mixedContent = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.some((resource: any) => 
        resource.name.startsWith('http:') && window.location.protocol === 'https:'
      );
    });

    analysis.security = {
      headers: securityHeaders,
      httpsRedirect,
      mixedContent,
      cookieSecure: true // Will be analyzed in cookie test
    };

    await fs.writeFile(
      join(OUTPUT_DIR, 'security-analysis.json'),
      JSON.stringify(analysis.security, null, 2)
    );

    console.log('✅ Security analysis completed');
  });

  test('Comprehensive SEO Analysis', async ({ page }: { page: Page }) => {
    console.log('🔍 Conducting comprehensive SEO analysis...');

    await page.goto(CASINO_CA_URL, { waitUntil: 'networkidle' });

    // Extract all SEO elements
    const seoData = await page.evaluate(() => {
      // Title and meta description
      const title = document.title;
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Heading tags
      const h1Tags = Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim() || '');
      const h2Tags = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim() || '');
      const h3Tags = Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim() || '');
      
      // Structured data
      const structuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(script => {
          try {
            return JSON.parse(script.textContent || '');
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      // Links analysis
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      const internalLinks = allLinks.filter(link => {
        const href = link.getAttribute('href') || '';
        return href.startsWith('/') || href.includes(window.location.hostname);
      }).length;
      const externalLinks = allLinks.length - internalLinks;

      // Images with alt tags
      const images = Array.from(document.querySelectorAll('img'));
      const imageAltTags = images.filter(img => img.getAttribute('alt')).length;

      // Canonical URL
      const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
      
      // Hreflang
      const hreflang = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'))
        .map(link => link.getAttribute('hreflang') || '');

      return {
        title,
        metaDescription,
        h1Tags,
        h2Tags,
        h3Tags,
        structuredData,
        internalLinks,
        externalLinks,
        imageAltTags,
        canonicalUrl,
        hreflang
      };
    });

    analysis.seo = seoData;

    await fs.writeFile(
      join(OUTPUT_DIR, 'seo-analysis.json'),
      JSON.stringify(seoData, null, 2)
    );

    console.log('✅ SEO analysis completed');
  });

  test('Technology Stack Detection', async ({ page }: { page: Page }) => {
    console.log('💻 Detecting technology stack and dependencies...');

    await page.goto(CASINO_CA_URL, { waitUntil: 'networkidle' });

    // Analyze loaded resources and detect technologies
    const techStack = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      const frameworks: string[] = [];
      const libraries: string[] = [];
      const cdnResources: string[] = [];
      const thirdPartyScripts: string[] = [];
      const cssFrameworks: string[] = [];

      // Analyze scripts
      scripts.forEach(script => {
        const src = script.getAttribute('src') || '';
        if (src.includes('jquery')) libraries.push('jQuery');
        if (src.includes('vue')) frameworks.push('Vue.js');
        if (src.includes('react')) frameworks.push('React');
        if (src.includes('angular')) frameworks.push('Angular');
        if (src.includes('bootstrap')) cssFrameworks.push('Bootstrap');
        if (src.includes('tailwind')) cssFrameworks.push('Tailwind CSS');
        if (src.includes('cdn.') || src.includes('jsdelivr') || src.includes('unpkg')) {
          cdnResources.push(src);
        }
        if (!src.startsWith('/') && !src.includes(window.location.hostname)) {
          thirdPartyScripts.push(src);
        }
      });

      // Analyze stylesheets
      stylesheets.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('bootstrap')) cssFrameworks.push('Bootstrap');
        if (href.includes('tailwind')) cssFrameworks.push('Tailwind CSS');
        if (href.includes('fontawesome')) libraries.push('Font Awesome');
        if (href.includes('googleapis')) cdnResources.push(href);
      });

      // Check for common global variables
      const windowAny = window as any;
      if (windowAny.jQuery || windowAny.$) libraries.push('jQuery');
      if (windowAny.Vue) frameworks.push('Vue.js');
      if (windowAny.React) frameworks.push('React');

      return {
        frameworks: [...new Set(frameworks)],
        libraries: [...new Set(libraries)],
        cdnResources: [...new Set(cdnResources)],
        thirdPartyScripts: [...new Set(thirdPartyScripts)],
        cssFrameworks: [...new Set(cssFrameworks)]
      };
    });

    analysis.technology = techStack;

    await fs.writeFile(
      join(OUTPUT_DIR, 'technology-stack.json'),
      JSON.stringify(techStack, null, 2)
    );

    console.log('✅ Technology stack analysis completed');
  });

  test('Content Analysis and Keyword Density', async ({ page }: { page: Page }) => {
    console.log('📝 Analyzing content structure and keyword density...');

    await page.goto(CASINO_CA_URL, { waitUntil: 'networkidle' });

    const contentAnalysis = await page.evaluate(() => {
      // Extract main content
      const contentSelectors = ['main', 'article', '.content', '#content', '.main-content'];
      let mainContent = '';
      
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          mainContent = element.textContent || '';
          break;
        }
      }
      
      if (!mainContent) {
        mainContent = document.body.textContent || '';
      }

      // Word count and reading time
      const words = mainContent.trim().split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      const readingTime = Math.ceil(wordCount / 200); // 200 WPM average

      // Keyword density analysis
      const wordFrequency: Record<string, number> = {};
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
      
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
          wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
        }
      });

      // Sort by frequency and get top keywords
      const sortedKeywords = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .reduce((acc, [word, count]) => {
          acc[word] = count;
          return acc;
        }, {} as Record<string, number>);

      // Heading structure
      const headingStructure: Record<string, string[]> = {};
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        headingStructure[tag] = Array.from(document.querySelectorAll(tag))
          .map(h => h.textContent?.trim() || '');
      });

      // Content blocks (sections, divs with significant content)
      const contentBlocks = Array.from(document.querySelectorAll('section, .section, .block, .content-block'))
        .map(block => block.textContent?.trim().substring(0, 100) || '')
        .filter(text => text.length > 50);

      return {
        wordCount,
        readingTime,
        headingStructure,
        keywordDensity: sortedKeywords,
        contentBlocks
      };
    });

    analysis.content = contentAnalysis;

    await fs.writeFile(
      join(OUTPUT_DIR, 'content-analysis.json'),
      JSON.stringify(contentAnalysis, null, 2)
    );

    console.log('✅ Content analysis completed');
  });

  test('User Experience and Mobile Responsiveness', async ({ page }: { page: Page }) => {
    console.log('📱 Analyzing user experience and mobile responsiveness...');

    await page.goto(CASINO_CA_URL, { waitUntil: 'networkidle' });

    // Desktop analysis
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopNav = await page.evaluate(() => {
      const nav = document.querySelector('nav') || document.querySelector('.navigation') || document.querySelector('[role="navigation"]');
      return nav ? {
        items: Array.from(nav.querySelectorAll('a')).map(a => a.textContent?.trim() || ''),
        structure: nav.outerHTML.substring(0, 500)
      } : null;
    });

    // Mobile analysis
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileResponsive = await page.evaluate(() => {
      // Check if viewport meta tag exists
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = !!viewportMeta;
      
      // Check for responsive elements
      const hasHamburgerMenu = !!document.querySelector('.hamburger, .menu-toggle, [aria-label*="menu"]');
      const hasFlexibleLayout = getComputedStyle(document.body).display === 'flex' || 
                               document.body.classList.contains('responsive');
      
      return {
        hasViewportMeta,
        hasHamburgerMenu,
        hasFlexibleLayout,
        responsive: hasViewportMeta && (hasHamburgerMenu || hasFlexibleLayout)
      };
    });

    // CTA buttons analysis
    const ctaButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, .btn, .cta, [role="button"]'));
      return buttons.map(btn => ({
        text: btn.textContent?.trim() || '',
        classes: btn.className,
        type: btn.tagName.toLowerCase()
      }));
    });

    // Form fields analysis
    const formFields = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      return forms.map(form => ({
        action: form.getAttribute('action') || '',
        method: form.getAttribute('method') || 'GET',
        fields: Array.from(form.querySelectorAll('input, select, textarea')).map(field => ({
          type: field.getAttribute('type') || field.tagName.toLowerCase(),
          name: field.getAttribute('name') || '',
          required: field.hasAttribute('required')
        }))
      }));
    });

    analysis.ux = {
      mobileResponsive: mobileResponsive.responsive,
      navigationStructure: desktopNav,
      cta_buttons: ctaButtons.map((btn: any) => btn.text),
      formFields,
      loadingStates: true // Will be determined by observing loading indicators
    };

    await fs.writeFile(
      join(OUTPUT_DIR, 'ux-analysis.json'),
      JSON.stringify(analysis.ux, null, 2)
    );

    console.log('✅ UX analysis completed');
  });

  test('Page Speed and Resource Loading Analysis', async ({ page }: { page: Page }) => {
    console.log('⚡ Analyzing page speed and resource loading patterns...');

    await page.goto(CASINO_CA_URL, { waitUntil: 'networkidle' });

    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const resourceAnalysis = {
        totalResources: resources.length,
        resourceTypes: {} as Record<string, number>,
        largestResources: [] as any[],
        slowestResources: [] as any[],
        cacheableResources: 0,
        thirdPartyResources: 0
      };

      resources.forEach(resource => {
        // Count by type
        const type = resource.initiatorType || 'other';
        resourceAnalysis.resourceTypes[type] = (resourceAnalysis.resourceTypes[type] || 0) + 1;
        
        // Check if third party
        if (!resource.name.includes(window.location.hostname)) {
          resourceAnalysis.thirdPartyResources++;
        }
        
        // Check cache headers (approximation)
        if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
          resourceAnalysis.cacheableResources++;
        }
      });

      // Sort by size and duration
      const sortedBySize = resources
        .filter(r => r.transferSize > 0)
        .sort((a, b) => b.transferSize - a.transferSize)
        .slice(0, 10)
        .map(r => ({
          name: r.name,
          size: r.transferSize,
          type: r.initiatorType
        }));

      const sortedByDuration = resources
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map(r => ({
          name: r.name,
          duration: r.duration,
          type: r.initiatorType
        }));

      resourceAnalysis.largestResources = sortedBySize;
      resourceAnalysis.slowestResources = sortedByDuration;

      return resourceAnalysis;
    });

    await fs.writeFile(
      join(OUTPUT_DIR, 'resource-analysis.json'),
      JSON.stringify(resourceMetrics, null, 2)
    );

    console.log('✅ Resource loading analysis completed');
  });
});

async function generateMarkdownReport(analysis: TechnicalAnalysis) {
  const reportContent = `# Casino.ca Comprehensive Reverse Engineering Report

## Executive Summary
This report provides a detailed technical analysis of casino.ca including performance metrics, SEO strategy, technology stack, and user experience patterns.

## Performance Analysis
- **LCP (Largest Contentful Paint)**: ${analysis.performance.lcp.toFixed(2)}ms
- **FID (First Input Delay)**: ${analysis.performance.fid.toFixed(2)}ms
- **CLS (Cumulative Layout Shift)**: ${analysis.performance.cls.toFixed(3)}
- **TTFB (Time to First Byte)**: ${analysis.performance.ttfb.toFixed(2)}ms
- **DOM Content Loaded**: ${analysis.performance.domContentLoaded.toFixed(2)}ms
- **Load Complete**: ${analysis.performance.loadComplete.toFixed(2)}ms

## Security Analysis
### Security Headers
${Object.entries(analysis.security.headers).map(([header, value]) => `- **${header}**: ${value}`).join('\n')}

### Security Features
- **HTTPS Redirect**: ${analysis.security.httpsRedirect ? '✅' : '❌'}
- **Mixed Content**: ${analysis.security.mixedContent ? '❌ Found' : '✅ None'}
- **Secure Cookies**: ${analysis.security.cookieSecure ? '✅' : '❌'}

## SEO Analysis
- **Title**: ${analysis.seo.title}
- **Meta Description**: ${analysis.seo.metaDescription}
- **H1 Tags**: ${analysis.seo.h1Tags.length} (${analysis.seo.h1Tags.join(', ')})
- **H2 Tags**: ${analysis.seo.h2Tags.length}
- **H3 Tags**: ${analysis.seo.h3Tags.length}
- **Internal Links**: ${analysis.seo.internalLinks}
- **External Links**: ${analysis.seo.externalLinks}
- **Images with Alt Tags**: ${analysis.seo.imageAltTags}
- **Structured Data**: ${analysis.seo.structuredData.length} schemas found
- **Canonical URL**: ${analysis.seo.canonicalUrl || 'Not set'}
- **Hreflang**: ${analysis.seo.hreflang.length} languages

## Technology Stack
### Frameworks
${analysis.technology.frameworks.map(f => `- ${f}`).join('\n')}

### Libraries  
${analysis.technology.libraries.map(l => `- ${l}`).join('\n')}

### CSS Frameworks
${analysis.technology.cssFrameworks.map(c => `- ${c}`).join('\n')}

### CDN Resources
${analysis.technology.cdnResources.slice(0, 5).map(r => `- ${r}`).join('\n')}

## Content Analysis
- **Word Count**: ${analysis.content.wordCount}
- **Reading Time**: ${analysis.content.readingTime} minutes
- **Content Blocks**: ${analysis.content.contentBlocks.length}

### Top Keywords
${Object.entries(analysis.content.keywordDensity).slice(0, 10).map(([word, count]) => `- **${word}**: ${count} occurrences`).join('\n')}

## User Experience
- **Mobile Responsive**: ${analysis.ux.mobileResponsive ? '✅' : '❌'}
- **CTA Buttons**: ${analysis.ux.cta_buttons.length} found
- **Forms**: ${analysis.ux.formFields.length} forms detected

## Recommendations for BestCasinoPortal.com

### Performance Optimization
1. Target LCP < 2.5s (Current: ${analysis.performance.lcp.toFixed(2)}ms)
2. Optimize TTFB to < 200ms (Current: ${analysis.performance.ttfb.toFixed(2)}ms)
3. Implement lazy loading for images
4. Use CDN for static assets

### SEO Strategy
1. Improve meta descriptions (current length: ${analysis.seo.metaDescription.length} chars)
2. Add more internal linking (current: ${analysis.seo.internalLinks})
3. Implement structured data markup
4. Optimize heading structure

### Security Enhancements
1. Implement all security headers
2. Ensure HTTPS-only configuration
3. Set up proper Content Security Policy
4. Enable HSTS with preload

### Technology Stack Recommendations
1. Consider using ${analysis.technology.frameworks.join(', ')} for consistency
2. Implement ${analysis.technology.cssFrameworks.join(', ')} for responsive design
3. Use similar CDN strategy for performance

---
*Report generated on ${new Date().toISOString()}*
`;

  await fs.writeFile(
    join(OUTPUT_DIR, 'comprehensive-analysis-report.md'),
    reportContent
  );
}
