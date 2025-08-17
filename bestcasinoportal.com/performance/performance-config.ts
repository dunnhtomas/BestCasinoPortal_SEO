/**
 * Performance Configuration for Casino Portal
 * Following Context7 Core Web Vitals optimization best practices
 */

export const PerformanceConfig = {
  // Core Web Vitals Targets
  targets: {
    lcp: {
      good: 2500,    // Largest Contentful Paint < 2.5s
      needsImprovement: 4000,
      poor: 4001
    },
    fid: {
      good: 100,     // First Input Delay < 100ms
      needsImprovement: 300,
      poor: 301
    },
    cls: {
      good: 0.1,     // Cumulative Layout Shift < 0.1
      needsImprovement: 0.25,
      poor: 0.26
    },
    ttfb: {
      good: 800,     // Time to First Byte < 800ms
      needsImprovement: 1800,
      poor: 1801
    },
    apiResponse: {
      good: 200,     // API Response < 200ms
      needsImprovement: 500,
      poor: 501
    }
  },

  // Performance Budget
  budget: {
    javascript: {
      max: 350,      // Max 350KB JavaScript
      warning: 300
    },
    css: {
      max: 100,      // Max 100KB CSS
      warning: 80
    },
    images: {
      max: 1500,     // Max 1.5MB images total
      warning: 1200
    },
    fonts: {
      max: 100,      // Max 100KB fonts
      warning: 80
    },
    total: {
      max: 2000,     // Max 2MB total
      warning: 1600
    }
  },

  // Image Optimization
  images: {
    formats: ['avif', 'webp', 'jpg'],
    qualities: {
      avif: 85,
      webp: 90,
      jpg: 85
    },
    sizes: [320, 640, 768, 1024, 1280, 1920],
    lazyLoading: {
      enabled: true,
      rootMargin: '50px',
      threshold: 0.1
    },
    responsive: {
      enabled: true,
      breakpoints: [320, 640, 768, 1024, 1280, 1920]
    }
  },

  // Caching Strategy
  cache: {
    static: {
      maxAge: 31536000, // 1 year for static assets
      immutable: true
    },
    dynamic: {
      maxAge: 300,      // 5 minutes for dynamic content
      staleWhileRevalidate: 3600
    },
    api: {
      maxAge: 60,       // 1 minute for API responses
      staleWhileRevalidate: 300
    },
    html: {
      maxAge: 0,        // No cache for HTML
      mustRevalidate: true
    }
  },

  // Code Splitting
  codeSplitting: {
    chunks: {
      vendor: ['vue', 'vue-router'],
      common: ['lodash', 'axios'],
      casino: ['casino-components'],
      admin: ['admin-components']
    },
    dynamicImports: {
      enabled: true,
      preload: ['CasinoCard', 'StarRating'],
      prefetch: ['CasinoDetails', 'UserProfile']
    }
  },

  // Critical Resource Hints
  resourceHints: {
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.bestcasinoportal.com'
    ],
    prefetch: [
      '/api/casinos/popular',
      '/api/user/preferences'
    ],
    preload: [
      { href: '/fonts/casino-icons.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      { href: '/css/critical.css', as: 'style' }
    ]
  },

  // Monitoring Configuration
  monitoring: {
    rum: {
      enabled: true,
      sampleRate: 0.1, // 10% sampling for production
      endpoint: '/api/performance/metrics'
    },
    webVitals: {
      enabled: true,
      reportAllChanges: false,
      endpoint: '/api/performance/web-vitals'
    },
    customMetrics: {
      enabled: true,
      trackRouteChanges: true,
      trackApiCalls: true,
      trackUserInteractions: true
    }
  },

  // Progressive Enhancement
  progressive: {
    serviceWorker: {
      enabled: true,
      cacheFirst: ['images', 'fonts', 'css'],
      networkFirst: ['api', 'html'],
      staleWhileRevalidate: ['js']
    },
    criticalCSS: {
      enabled: true,
      inline: true,
      aboveTheFold: true
    },
    loadingStates: {
      skeleton: true,
      progressive: true,
      placeholder: true
    }
  }
};

// Performance Utilities
export const PerformanceUtils = {
  /**
   * Check if device supports modern image formats
   */
  supportsImageFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
  },

  /**
   * Get optimal image format for current browser
   */
  getOptimalImageFormat(): string {
    if (this.supportsImageFormat('avif')) return 'avif';
    if (this.supportsImageFormat('webp')) return 'webp';
    return 'jpg';
  },

  /**
   * Generate responsive image srcset
   */
  generateSrcset(basePath: string, sizes: number[], format: string = 'webp'): string {
    return sizes
      .map(size => `${basePath}-${size}w.${format} ${size}w`)
      .join(', ');
  },

  /**
   * Calculate performance score based on Core Web Vitals
   */
  calculatePerformanceScore(metrics: any): number {
    const { lcp, fid, cls } = metrics;
    const config = PerformanceConfig.targets;
    
    const lcpScore = lcp <= config.lcp.good ? 100 : 
                    lcp <= config.lcp.needsImprovement ? 75 : 25;
    
    const fidScore = fid <= config.fid.good ? 100 : 
                    fid <= config.fid.needsImprovement ? 75 : 25;
    
    const clsScore = cls <= config.cls.good ? 100 : 
                    cls <= config.cls.needsImprovement ? 75 : 25;
    
    return Math.round((lcpScore + fidScore + clsScore) / 3);
  },

  /**
   * Optimize image loading with intersection observer
   */
  optimizeImageLoading(): void {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          const dataSrcset = img.getAttribute('data-srcset');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
          }
          
          if (dataSrcset) {
            img.srcset = dataSrcset;
            img.removeAttribute('data-srcset');
          }
          
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: PerformanceConfig.images.lazyLoading.rootMargin,
      threshold: PerformanceConfig.images.lazyLoading.threshold
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};
