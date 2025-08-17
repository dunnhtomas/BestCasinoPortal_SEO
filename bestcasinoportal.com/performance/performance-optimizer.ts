import { PerformanceConfig } from './performance-config';

/**
 * Performance Optimizer
 * Following Context7 performance optimization best practices
 */
export class PerformanceOptimizer {
  private config = PerformanceConfig;
  private optimizations: Map<string, boolean> = new Map();

  constructor() {
    this.initializeOptimizations();
  }

  /**
   * Initialize all performance optimizations
   */
  async initializeOptimizations(): Promise<void> {
    console.log('⚡ Initializing performance optimizations...');
    
    await Promise.all([
      this.optimizeImages(),
      this.optimizeFonts(),
      this.optimizeCSS(),
      this.optimizeJavaScript(),
      this.implementLazyLoading(),
      this.setupServiceWorker(),
      this.optimizeResourceLoading(),
      this.setupIntersectionObserver()
    ]);
    
    console.log('✅ All performance optimizations initialized');
  }

  /**
   * Optimize images with modern formats and responsive loading
   */
  async optimizeImages(): Promise<void> {
    console.log('🖼️ Optimizing images...');
    
    const images = document.querySelectorAll('img[data-src], img[data-srcset]');
    
    images.forEach((img: HTMLImageElement) => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
      
      // Set up responsive image loading
      this.setupResponsiveImage(img);
    });
    
    this.optimizations.set('images', true);
  }

  /**
   * Setup responsive image loading
   */
  private setupResponsiveImage(img: HTMLImageElement): void {
    const dataSrc = img.getAttribute('data-src');
    const dataSrcset = img.getAttribute('data-srcset');
    
    if (dataSrc && !dataSrcset) {
      // Generate responsive srcset if not provided
      const format = this.getOptimalImageFormat();
      const basePath = dataSrc.replace(/.[^.]+$/, '');
      const srcset = this.generateResponsiveSrcset(basePath, format);
      
      img.setAttribute('data-srcset', srcset);
      img.setAttribute('sizes', this.generateImageSizes());
    }
  }

  /**
   * Optimize font loading and rendering
   */
  async optimizeFonts(): Promise<void> {
    console.log('🔤 Optimizing fonts...');
    
    // Preload critical fonts
    const criticalFonts = [
      { href: '/fonts/roboto-regular.woff2', family: 'Roboto' },
      { href: '/fonts/roboto-bold.woff2', family: 'Roboto' }
    ];
    
    criticalFonts.forEach(font => {
      this.preloadFont(font.href, font.family);
    });
    
    // Add font-display: swap to all font-face declarations
    this.addFontDisplaySwap();
    
    this.optimizations.set('fonts', true);
  }

  /**
   * Optimize CSS delivery and rendering
   */
  async optimizeCSS(): Promise<void> {
    console.log('🎨 Optimizing CSS...');
    
    // Identify critical CSS
    await this.inlineCriticalCSS();
    
    // Defer non-critical CSS
    this.deferNonCriticalCSS();
    
    // Remove unused CSS (placeholder for build-time optimization)
    this.markUnusedCSS();
    
    this.optimizations.set('css', true);
  }

  /**
   * Optimize JavaScript loading and execution
   */
  async optimizeJavaScript(): Promise<void> {
    console.log('⚡ Optimizing JavaScript...');
    
    // Defer non-critical JavaScript
    this.deferNonCriticalJS();
    
    // Implement code splitting hints
    this.addCodeSplittingHints();
    
    // Preload critical JavaScript modules
    this.preloadCriticalJS();
    
    this.optimizations.set('javascript', true);
  }

  /**
   * Implement comprehensive lazy loading
   */
  async implementLazyLoading(): Promise<void> {
    console.log('🔄 Implementing lazy loading...');
    
    // Lazy load images
    this.setupImageLazyLoading();
    
    // Lazy load iframes
    this.setupIframeLazyLoading();
    
    // Lazy load components
    this.setupComponentLazyLoading();
    
    this.optimizations.set('lazyLoading', true);
  }

  /**
   * Setup service worker for caching
   */
  async setupServiceWorker(): Promise<void> {
    console.log('🔧 Setting up service worker...');
    
    if ('serviceWorker' in navigator && this.config.progressive.serviceWorker.enabled) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service worker registered successfully');
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service worker update found');
        });
        
        this.optimizations.set('serviceWorker', true);
      } catch (error) {
        console.warn('❌ Service worker registration failed:', error);
      }
    }
  }

  /**
   * Optimize resource loading with hints and priorities
   */
  async optimizeResourceLoading(): Promise<void> {
    console.log('📦 Optimizing resource loading...');
    
    // Add preconnect hints
    this.config.resourceHints.preconnect.forEach(href => {
      this.addPreconnect(href);
    });
    
    // Add prefetch hints
    this.config.resourceHints.prefetch.forEach(href => {
      this.addPrefetch(href);
    });
    
    // Add preload hints
    this.config.resourceHints.preload.forEach(resource => {
      this.addPreload(resource.href, resource.as, resource);
    });
    
    this.optimizations.set('resourceLoading', true);
  }

  /**
   * Setup intersection observer for performance tracking
   */
  async setupIntersectionObserver(): Promise<void> {
    console.log('👁️ Setting up intersection observer...');
    
    if ('IntersectionObserver' in window) {
      // Observer for above-the-fold content
      const aboveTheFoldObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-viewport');
            this.markElementAsVisible(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      // Observe critical elements
      document.querySelectorAll('[data-critical]').forEach(el => {
        aboveTheFoldObserver.observe(el);
      });
      
      this.optimizations.set('intersectionObserver', true);
    }
  }

  /**
   * Image optimization utilities
   */
  private getOptimalImageFormat(): string {
    // Check browser support for modern formats
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    // Check AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif';
    }
    
    // Check WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp';
    }
    
    return 'jpg';
  }

  private generateResponsiveSrcset(basePath: string, format: string): string {
    return this.config.images.sizes
      .map(size => `${basePath}-${size}w.${format} ${size}w`)
      .join(', ');
  }

  private generateImageSizes(): string {
    return [
      '(max-width: 320px) 320px',
      '(max-width: 640px) 640px',
      '(max-width: 768px) 768px',
      '(max-width: 1024px) 1024px',
      '(max-width: 1280px) 1280px',
      '1920px'
    ].join(', ');
  }

  /**
   * Font optimization utilities
   */
  private preloadFont(href: string, family: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  private addFontDisplaySwap(): void {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Roboto';
        font-display: swap;
        src: url('/fonts/roboto-regular.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Roboto';
        font-display: swap;
        font-weight: bold;
        src: url('/fonts/roboto-bold.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * CSS optimization utilities
   */
  private async inlineCriticalCSS(): Promise<void> {
    if (this.config.progressive.criticalCSS.enabled) {
      // This would typically be done at build time
      // Here we simulate by moving critical styles inline
      const criticalStyles = document.querySelector('style[data-critical]');
      if (criticalStyles) {
        criticalStyles.setAttribute('data-inlined', 'true');
      }
    }
  }

  private deferNonCriticalCSS(): void {
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    nonCriticalCSS.forEach((link: HTMLLinkElement) => {
      const newLink = link.cloneNode(true) as HTMLLinkElement;
      newLink.setAttribute('media', 'print');
      newLink.setAttribute('data-deferred', 'true');
      newLink.onload = () => {
        newLink.setAttribute('media', 'all');
      };
      
      document.head.appendChild(newLink);
      link.remove();
    });
  }

  private markUnusedCSS(): void {
    // Placeholder for build-time unused CSS removal
    console.log('📝 Marked unused CSS for removal (build-time optimization)');
  }

  /**
   * JavaScript optimization utilities
   */
  private deferNonCriticalJS(): void {
    const nonCriticalScripts = document.querySelectorAll('script:not([data-critical]):not([async]):not([defer])');
    
    nonCriticalScripts.forEach((script: HTMLScriptElement) => {
      script.setAttribute('defer', 'true');
    });
  }

  private addCodeSplittingHints(): void {
    // Add module preload hints for code splitting
    const moduleHints = [
      '/js/components/casino-card.js',
      '/js/components/star-rating.js',
      '/js/utils/analytics.js'
    ];
    
    moduleHints.forEach(href => {
      this.addPreload(href, 'script', { type: 'module' });
    });
  }

  private preloadCriticalJS(): void {
    const criticalScripts = [
      '/js/performance-monitor.js',
      '/js/critical.js'
    ];
    
    criticalScripts.forEach(href => {
      this.addPreload(href, 'script');
    });
  }

  /**
   * Lazy loading utilities
   */
  private setupImageLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: this.config.images.lazyLoading.rootMargin,
        threshold: this.config.images.lazyLoading.threshold
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  private setupIframeLazyLoading(): void {
    const iframes = document.querySelectorAll('iframe[data-src]');
    
    const iframeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target as HTMLIFrameElement;
          iframe.src = iframe.getAttribute('data-src') || '';
          iframe.removeAttribute('data-src');
          iframeObserver.unobserve(iframe);
        }
      });
    });
    
    iframes.forEach(iframe => iframeObserver.observe(iframe));
  }

  private setupComponentLazyLoading(): void {
    // Placeholder for component lazy loading
    // This would integrate with your component framework
    document.querySelectorAll('[data-component-lazy]').forEach(el => {
      const componentName = el.getAttribute('data-component-lazy');
      if (componentName) {
        // Dynamically import component when needed
        import(`/js/components/${componentName}.js`)
          .then(module => {
            console.log(`✅ Lazy loaded component: ${componentName}`);
          })
          .catch(err => {
            console.warn(`❌ Failed to lazy load component: ${componentName}`, err);
          });
      }
    });
  }

  /**
   * Resource hint utilities
   */
  private addPreconnect(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (href.includes('fonts')) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }

  private addPrefetch(href: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  private addPreload(href: string, as: string, options: any = {}): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (options.type) {
      link.type = options.type;
    }
    
    if (options.crossorigin || as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }

  /**
   * Utility methods
   */
  private loadImage(img: HTMLImageElement): void {
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
    img.classList.add('loaded');
  }

  private markElementAsVisible(element: Element): void {
    // Mark element as visible for analytics
    const elementName = element.tagName.toLowerCase();
    const elementId = element.id || 'unknown';
    
    // Report element visibility
    if (typeof gtag !== 'undefined') {
      gtag('event', 'element_visible', {
        element_name: elementName,
        element_id: elementId,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get optimization status
   */
  getOptimizationStatus(): Record<string, boolean> {
    return Object.fromEntries(this.optimizations);
  }

  /**
   * Generate performance report
   */
  generateOptimizationReport(): any {
    return {
      optimizations: this.getOptimizationStatus(),
      config: this.config,
      timestamp: Date.now(),
      recommendations: this.generateOptimizationRecommendations()
    };
  }

  private generateOptimizationRecommendations(): string[] {
    const recommendations = [];
    
    if (!this.optimizations.get('images')) {
      recommendations.push('Implement image optimization and lazy loading');
    }
    
    if (!this.optimizations.get('serviceWorker')) {
      recommendations.push('Setup service worker for offline functionality');
    }
    
    if (!this.optimizations.get('fonts')) {
      recommendations.push('Optimize font loading with preload and font-display');
    }
    
    recommendations.push('Monitor Core Web Vitals regularly');
    recommendations.push('Implement resource hints for critical resources');
    recommendations.push('Use code splitting for better bundle sizes');
    
    return recommendations;
  }
}

// Auto-initialize optimizer
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
  });
}
