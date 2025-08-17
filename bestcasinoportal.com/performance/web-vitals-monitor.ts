import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { PerformanceConfig } from './performance-config';

/**
 * Web Vitals Monitor
 * Following Context7 performance monitoring best practices
 */
export class WebVitalsMonitor {
  private metrics: Map<string, any> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private config = PerformanceConfig.monitoring;

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize comprehensive performance monitoring
   */
  private initializeMonitoring(): void {
    console.log('🔍 Initializing Web Vitals monitoring...');
    
    // Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Custom Performance Metrics
    this.monitorCustomMetrics();
    
    // Resource Performance
    this.monitorResourcePerformance();
    
    // Navigation Performance
    this.monitorNavigationPerformance();
    
    // Long Tasks
    this.monitorLongTasks();
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorCoreWebVitals(): void {
    console.log('📊 Setting up Core Web Vitals monitoring...');
    
    // Largest Contentful Paint
    getLCP((metric) => {
      this.recordMetric('LCP', metric);
      this.reportMetric('lcp', metric.value);
    }, {
      reportAllChanges: this.config.webVitals.reportAllChanges
    });

    // First Input Delay
    getFID((metric) => {
      this.recordMetric('FID', metric);
      this.reportMetric('fid', metric.value);
    });

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.recordMetric('CLS', metric);
      this.reportMetric('cls', metric.value);
    }, {
      reportAllChanges: this.config.webVitals.reportAllChanges
    });

    // First Contentful Paint
    getFCP((metric) => {
      this.recordMetric('FCP', metric);
      this.reportMetric('fcp', metric.value);
    });

    // Time to First Byte
    getTTFB((metric) => {
      this.recordMetric('TTFB', metric);
      this.reportMetric('ttfb', metric.value);
    });
  }

  /**
   * Monitor custom performance metrics
   */
  private monitorCustomMetrics(): void {
    console.log('📈 Setting up custom metrics monitoring...');
    
    // API Response Times
    this.monitorApiPerformance();
    
    // Component Rendering Times
    this.monitorComponentPerformance();
    
    // User Interaction Times
    this.monitorUserInteractions();
    
    // Page Load Phases
    this.monitorPageLoadPhases();
  }

  /**
   * Monitor API performance
   */
  private monitorApiPerformance(): void {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Report API performance
        if (url.includes('/api/')) {
          this.reportCustomMetric('api_response_time', {
            url,
            duration,
            status: response.status,
            timestamp: Date.now()
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.reportCustomMetric('api_error', {
          url,
          duration,
          error: error.message,
          timestamp: Date.now()
        });
        
        throw error;
      }
    }.bind(this);
  }

  /**
   * Monitor component rendering performance
   */
  private monitorComponentPerformance(): void {
    // Monitor component mount times
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const componentObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('component-')) {
            this.reportCustomMetric('component_render_time', {
              component: entry.name.replace('component-', ''),
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
        });
      });
      
      componentObserver.observe({ entryTypes: ['measure'] });
      this.observers.set('component', componentObserver);
    }
  }

  /**
   * Monitor user interactions
   */
  private monitorUserInteractions(): void {
    const interactionTypes = ['click', 'scroll', 'input', 'submit'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          if (duration > 50) { // Only report slow interactions
            this.reportCustomMetric('user_interaction', {
              type,
              target: event.target?.tagName || 'unknown',
              duration,
              timestamp: Date.now()
            });
          }
        });
      }, { passive: true });
    });
  }

  /**
   * Monitor page load phases
   */
  private monitorPageLoadPhases(): void {
    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', () => {
      const domContentLoaded = performance.now();
      this.reportCustomMetric('dom_content_loaded', {
        duration: domContentLoaded,
        timestamp: Date.now()
      });
    });

    // Load complete
    window.addEventListener('load', () => {
      const loadComplete = performance.now();
      this.reportCustomMetric('load_complete', {
        duration: loadComplete,
        timestamp: Date.now()
      });
      
      // Generate performance summary
      setTimeout(() => {
        this.generatePerformanceSummary();
      }, 1000);
    });
  }

  /**
   * Monitor resource performance
   */
  private monitorResourcePerformance(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          
          // Calculate resource timing metrics
          const timing = {
            name: resource.name,
            type: this.getResourceType(resource.name),
            duration: resource.duration,
            transferSize: resource.transferSize,
            encodedBodySize: resource.encodedBodySize,
            decodedBodySize: resource.decodedBodySize,
            domainLookup: resource.domainLookupEnd - resource.domainLookupStart,
            connect: resource.connectEnd - resource.connectStart,
            request: resource.responseStart - resource.requestStart,
            response: resource.responseEnd - resource.responseStart,
            timestamp: Date.now()
          };
          
          this.reportCustomMetric('resource_timing', timing);
          
          // Check for performance budget violations
          this.checkPerformanceBudget(timing);
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  /**
   * Monitor long tasks that block main thread
   */
  private monitorLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.reportCustomMetric('long_task', {
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution || [],
            timestamp: Date.now()
          });
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('Long Task API not supported');
      }
    }
  }

  /**
   * Record metric internally
   */
  private recordMetric(name: string, metric: any): void {
    this.metrics.set(name, {
      ...metric,
      timestamp: Date.now(),
      url: window.location.href
    });
    
    console.log(`📊 ${name}: ${metric.value}${metric.unit || 'ms'}`);
  }

  /**
   * Report metric to analytics endpoint
   */
  private reportMetric(name: string, value: number): void {
    if (!this.config.webVitals.enabled) return;
    
    const targets = PerformanceConfig.targets[name];
    const rating = this.getRating(value, targets);
    
    const data = {
      metric: name,
      value,
      rating,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };
    
    this.sendToAnalytics(this.config.webVitals.endpoint, data);
  }

  /**
   * Report custom metric
   */
  private reportCustomMetric(name: string, data: any): void {
    if (!this.config.customMetrics.enabled) return;
    
    const payload = {
      metric: name,
      data,
      url: window.location.href,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    };
    
    this.sendToAnalytics(this.config.rum.endpoint, payload);
  }

  /**
   * Check performance budget violations
   */
  private checkPerformanceBudget(timing: any): void {
    const budget = PerformanceConfig.budget;
    const type = timing.type;
    
    if (budget[type] && timing.transferSize > budget[type].max * 1024) {
      this.reportCustomMetric('budget_violation', {
        type,
        size: timing.transferSize,
        maxSize: budget[type].max * 1024,
        resource: timing.name,
        severity: 'error'
      });
    } else if (budget[type] && timing.transferSize > budget[type].warning * 1024) {
      this.reportCustomMetric('budget_warning', {
        type,
        size: timing.transferSize,
        warningSize: budget[type].warning * 1024,
        resource: timing.name,
        severity: 'warning'
      });
    }
  }

  /**
   * Generate performance summary
   */
  private generatePerformanceSummary(): void {
    const summary = {
      coreWebVitals: {
        lcp: this.metrics.get('LCP'),
        fid: this.metrics.get('FID'),
        cls: this.metrics.get('CLS'),
        fcp: this.metrics.get('FCP'),
        ttfb: this.metrics.get('TTFB')
      },
      score: this.calculateOverallScore(),
      recommendations: this.generateRecommendations(),
      timestamp: Date.now(),
      url: window.location.href
    };
    
    console.log('📈 Performance Summary:', summary);
    this.sendToAnalytics('/api/performance/summary', summary);
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(): number {
    const lcp = this.metrics.get('LCP')?.value || 0;
    const fid = this.metrics.get('FID')?.value || 0;
    const cls = this.metrics.get('CLS')?.value || 0;
    
    return PerformanceConfig.targets.calculatePerformanceScore?.({ lcp, fid, cls }) || 0;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations = [];
    const lcp = this.metrics.get('LCP')?.value;
    const fid = this.metrics.get('FID')?.value;
    const cls = this.metrics.get('CLS')?.value;
    
    if (lcp && lcp > PerformanceConfig.targets.lcp.good) {
      recommendations.push('Optimize Largest Contentful Paint by optimizing images and server response times');
    }
    
    if (fid && fid > PerformanceConfig.targets.fid.good) {
      recommendations.push('Reduce First Input Delay by optimizing JavaScript execution');
    }
    
    if (cls && cls > PerformanceConfig.targets.cls.good) {
      recommendations.push('Minimize Cumulative Layout Shift by setting image dimensions and avoiding dynamic content');
    }
    
    return recommendations;
  }

  /**
   * Utility methods
   */
  private getRating(value: number, targets: any): string {
    if (!targets) return 'unknown';
    if (value <= targets.good) return 'good';
    if (value <= targets.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'css';
    if (url.match(/.(jpg|jpeg|png|gif|webp|avif|svg)$/)) return 'images';
    if (url.match(/.(woff|woff2|ttf|otf)$/)) return 'fonts';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performanceSessionId');
    if (!sessionId) {
      sessionId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performanceSessionId', sessionId);
    }
    return sessionId;
  }

  private sendToAnalytics(endpoint: string, data: any): void {
    if (Math.random() > this.config.rum.sampleRate) return; // Sampling
    
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(data));
    } else {
      // Fallback to fetch with keepalive
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(err => console.warn('Failed to send analytics:', err));
    }
  }

  /**
   * Cleanup observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Initialize monitoring when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new WebVitalsMonitor();
    });
  } else {
    new WebVitalsMonitor();
  }
}
