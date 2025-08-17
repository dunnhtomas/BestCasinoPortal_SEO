/**
 * Performance Optimization Configuration
 * Core Web Vitals optimization based on casino.ca analysis
 */

export const PerformanceConfig = {
  // Core Web Vitals Targets
  coreWebVitals: {
    lcp: 2500,      // Largest Contentful Paint < 2.5s
    fid: 100,       // First Input Delay < 100ms
    cls: 0.1,       // Cumulative Layout Shift < 0.1
    fcp: 1800,      // First Contentful Paint < 1.8s
    ttfb: 600       // Time to First Byte < 600ms
  },

  // API Performance Targets
  api: {
    responseTime: 200,    // < 200ms response time
    timeout: 5000,        // 5s timeout
    retries: 3            // 3 retry attempts
  },

  // Image Optimization
  images: {
    formats: ['avif', 'webp', 'jpg'],
    quality: 85,
    lazy: true,
    placeholder: 'blur',
    sizes: {
      mobile: 375,
      tablet: 768,
      desktop: 1200,
      large: 1920
    }
  },

  // Caching Strategy
  cache: {
    static: {
      maxAge: 31536000,   // 1 year for static assets
      staleWhileRevalidate: 86400
    },
    api: {
      maxAge: 300,        // 5 minutes for API responses
      staleWhileRevalidate: 60
    },
    pages: {
      maxAge: 3600,       // 1 hour for pages
      staleWhileRevalidate: 300
    }
  },

  // Code Splitting Configuration
  codeSplitting: {
    chunks: 'all',
    minSize: 20000,
    maxSize: 244000,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10
      },
      casino: {
        test: /[\\/]src[\\/]components[\\/]casino[\\/]/,
        name: 'casino-components',
        chunks: 'all',
        priority: 5
      }
    }
  },

  // Bundle Analysis
  bundleAnalysis: {
    analyzeBundle: process.env.ANALYZE === 'true',
    bundleAnalyzerOptions: {
      openAnalyzer: false,
      generateStatsFile: true
    }
  },

  // Service Worker Configuration
  serviceWorker: {
    precacheManifest: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.bestcasinoportal\.com\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 300 // 5 minutes
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 2592000 // 30 days
          }
        }
      }
    ]
  },

  // Performance Monitoring
  monitoring: {
    enabled: true,
    reportWebVitals: true,
    sendToAnalytics: true,
    thresholds: {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    }
  }
};

// Real User Monitoring (RUM) Implementation
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  constructor() {
    this.initWebVitalsReporting();
    this.initApiPerformanceTracking();
  }

  private initWebVitalsReporting(): void {
    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.reportMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID - First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.reportMetric('fid', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.reportMetric('cls', clsValue);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private initApiPerformanceTracking(): void {
    // Override fetch to track API performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (args[0]?.toString().includes('api.bestcasinoportal.com')) {
          this.reportMetric('api_response_time', duration);
          
          // Alert if API is too slow
          if (duration > PerformanceConfig.api.responseTime) {
            console.warn(`Slow API response: ${duration.toFixed(2)}ms (target: <${PerformanceConfig.api.responseTime}ms)`);
          }
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.reportMetric('api_error_time', duration);
        throw error;
      }
    };
  }

  private reportMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    
    // Send to analytics
    if (PerformanceConfig.monitoring.sendToAnalytics) {
      this.sendToAnalytics(name, value);
    }
    
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}: ${value.toFixed(2)}`);
    }
  }

  private sendToAnalytics(name: string, value: number): void {
    // Implementation would send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_map: { metric_1: name }
      });
    }
  }

  public getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  window.performanceMonitor = new PerformanceMonitor();
}