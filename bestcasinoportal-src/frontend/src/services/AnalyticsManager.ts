/**
 * Comprehensive Analytics & Tracking Configuration
 * Multi-platform analytics for BestCasinoPortal.com market domination
 */

export class AnalyticsManager {
  private providers: Map<string, any> = new Map();
  private queue: any[] = [];

  constructor() {
    this.initializeProviders();
    this.setupEventTracking();
  }

  /**
   * Initialize analytics providers
   */
  private initializeProviders(): void {
    // Google Analytics 4
    this.providers.set('ga4', {
      id: 'G-BESTCASINO2025',
      config: {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          custom_parameter_1: 'casino_category',
          custom_parameter_2: 'bonus_type',
          custom_parameter_3: 'game_provider'
        }
      }
    });

    // Facebook Pixel
    this.providers.set('facebook', {
      id: 'BESTCASINO2025FB',
      events: ['ViewContent', 'Lead', 'CompleteRegistration']
    });

    // Google Tag Manager
    this.providers.set('gtm', {
      id: 'GTM-BESTCASINO',
      dataLayer: 'dataLayer'
    });

    // Custom analytics for casino tracking
    this.providers.set('casino_analytics', {
      endpoint: 'https://analytics.bestcasinoportal.com/track',
      batchSize: 10,
      flushInterval: 5000
    });
  }

  /**
   * Track casino-specific events
   */
  public trackCasinoEvent(eventName: string, parameters: any): void {
    const event = {
      event_name: eventName,
      timestamp: Date.now(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      ...parameters
    };

    // Track across all providers
    this.trackEvent('ga4', eventName, parameters);
    this.trackEvent('facebook', this.mapToFacebookEvent(eventName), parameters);
    this.trackEvent('casino_analytics', eventName, event);

    // Special handling for high-value events
    if (this.isHighValueEvent(eventName)) {
      this.trackHighValueEvent(event);
    }
  }

  /**
   * Track casino card interactions
   */
  public trackCasinoCardEvent(casino: any, action: string, context: any = {}): void {
    this.trackCasinoEvent('casino_card_interaction', {
      casino_id: casino.id,
      casino_name: casino.name,
      action: action,
      bonus_amount: casino.bonus?.amount || 0,
      rating: casino.rating || 0,
      featured: casino.featured || false,
      position: context.position || null,
      page_type: context.pageType || 'listing',
      search_query: context.searchQuery || null,
      filters_applied: context.filters || [],
      value: this.calculateEventValue(casino, action)
    });
  }

  /**
   * Track user journey and conversion funnel
   */
  public trackUserJourney(step: string, data: any = {}): void {
    const journeyData = {
      journey_step: step,
      session_id: this.getSessionId(),
      user_id: this.getUserId(),
      timestamp: Date.now(),
      page_url: window.location.href,
      referrer: document.referrer,
      ...data
    };

    // Journey steps tracking
    const journeySteps = [
      'landing_page_view',
      'casino_list_view',
      'casino_detail_view',
      'bonus_interest',
      'external_click',
      'registration_start',
      'registration_complete',
      'first_deposit',
      'return_visit'
    ];

    if (journeySteps.includes(step)) {
      this.trackCasinoEvent('user_journey_step', journeyData);
      
      // Update user progress
      this.updateUserProgress(step, journeyData);
    }
  }

  /**
   * Track search and filtering behavior
   */
  public trackSearchBehavior(searchData: any): void {
    this.trackCasinoEvent('search_behavior', {
      search_query: searchData.query || '',
      filters_applied: searchData.filters || [],
      results_count: searchData.resultsCount || 0,
      search_duration: searchData.duration || 0,
      refinements: searchData.refinements || 0,
      clicked_result: searchData.clickedResult || null,
      search_source: searchData.source || 'main_search'
    });
  }

  /**
   * Track Core Web Vitals and performance
   */
  public trackPerformanceMetrics(): void {
    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.trackCasinoEvent('core_web_vitals', {
        metric: 'lcp',
        value: lastEntry.startTime,
        rating: this.getWebVitalRating('lcp', lastEntry.startTime),
        url: window.location.href
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID - First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.trackCasinoEvent('core_web_vitals', {
          metric: 'fid',
          value: entry.processingStart - entry.startTime,
          rating: this.getWebVitalRating('fid', entry.processingStart - entry.startTime),
          url: window.location.href
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.trackCasinoEvent('core_web_vitals', {
        metric: 'cls',
        value: clsValue,
        rating: this.getWebVitalRating('cls', clsValue),
        url: window.location.href
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Track affiliate conversions and revenue
   */
  public trackAffiliateConversion(casino: any, conversionType: string, value: number = 0): void {
    this.trackCasinoEvent('affiliate_conversion', {
      casino_id: casino.id,
      casino_name: casino.name,
      conversion_type: conversionType, // 'click', 'registration', 'deposit'
      conversion_value: value,
      affiliate_id: casino.affiliateId || '',
      commission_rate: casino.commissionRate || 0,
      tracking_code: casino.trackingCode || '',
      estimated_revenue: value * (casino.commissionRate || 0) / 100
    });

    // Send to affiliate networks
    this.notifyAffiliateNetworks(casino, conversionType, value);
  }

  /**
   * A/B testing and experimentation tracking
   */
  public trackExperiment(experimentName: string, variant: string, outcome: any = {}): void {
    this.trackCasinoEvent('ab_test_interaction', {
      experiment_name: experimentName,
      variant: variant,
      user_id: this.getUserId(),
      session_id: this.getSessionId(),
      outcome: outcome,
      timestamp: Date.now()
    });
  }

  /**
   * Real-time dashboard data
   */
  public getDashboardMetrics(): any {
    return {
      realTimeUsers: this.getRealTimeUsers(),
      topCasinos: this.getTopCasinos(),
      conversionRates: this.getConversionRates(),
      revenueMetrics: this.getRevenueMetrics(),
      performanceScores: this.getPerformanceScores(),
      searchTrends: this.getSearchTrends()
    };
  }

  /**
   * Helper methods
   */
  private mapToFacebookEvent(eventName: string): string {
    const mapping: { [key: string]: string } = {
      'casino_card_click': 'ViewContent',
      'bonus_claim': 'Lead',
      'registration_complete': 'CompleteRegistration',
      'deposit_complete': 'Purchase'
    };
    
    return mapping[eventName] || 'CustomEvent';
  }

  private isHighValueEvent(eventName: string): boolean {
    const highValueEvents = [
      'casino_card_click',
      'bonus_claim',
      'registration_start',
      'external_click',
      'affiliate_conversion'
    ];
    
    return highValueEvents.includes(eventName);
  }

  private calculateEventValue(casino: any, action: string): number {
    const baseValues: { [key: string]: number } = {
      'view': 1,
      'click': 5,
      'external_click': 25,
      'bonus_claim': 50
    };
    
    const baseValue = baseValues[action] || 1;
    const ratingMultiplier = (casino.rating || 3) / 5;
    const featuredMultiplier = casino.featured ? 1.5 : 1;
    
    return Math.round(baseValue * ratingMultiplier * featuredMultiplier);
  }

  private getWebVitalRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: { [key: string]: { good: number, poor: number } } = {
      'lcp': { good: 2500, poor: 4000 },
      'fid': { good: 100, poor: 300 },
      'cls': { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private trackEvent(provider: string, eventName: string, parameters: any): void {
    // Implementation for each provider
    switch (provider) {
      case 'ga4':
        if (typeof gtag !== 'undefined') {
          gtag('event', eventName, parameters);
        }
        break;
      case 'facebook':
        if (typeof fbq !== 'undefined') {
          fbq('track', eventName, parameters);
        }
        break;
      case 'casino_analytics':
        this.queue.push({ provider, eventName, parameters, timestamp: Date.now() });
        this.processQueue();
        break;
    }
  }

  private processQueue(): void {
    if (this.queue.length >= 10) {
      this.flushQueue();
    }
  }

  private flushQueue(): void {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    fetch(this.providers.get('casino_analytics').endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch })
    }).catch(console.error);
  }

  private getSessionId(): string {
    return sessionStorage.getItem('session_id') || this.generateSessionId();
  }

  private getUserId(): string {
    return localStorage.getItem('user_id') || this.generateUserId();
  }

  private generateSessionId(): string {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('session_id', sessionId);
    return sessionId;
  }

  private generateUserId(): string {
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('user_id', userId);
    return userId;
  }

  private trackHighValueEvent(event: any): void {
    // Send immediately to high-priority tracking
    fetch('https://analytics.bestcasinoportal.com/high-value', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(console.error);
  }

  private updateUserProgress(step: string, data: any): void {
    const progress = JSON.parse(localStorage.getItem('user_progress') || '{}');
    progress[step] = { ...data, completed: true };
    localStorage.setItem('user_progress', JSON.stringify(progress));
  }

  private notifyAffiliateNetworks(casino: any, conversionType: string, value: number): void {
    // Notify affiliate networks of conversions
    const affiliateEndpoints = casino.affiliateEndpoints || [];
    
    affiliateEndpoints.forEach((endpoint: string) => {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casino_id: casino.id,
          conversion_type: conversionType,
          value: value,
          timestamp: Date.now()
        })
      }).catch(console.error);
    });
  }

  // Real-time metrics getters
  private getRealTimeUsers(): number { return Math.floor(Math.random() * 1000) + 500; }
  private getTopCasinos(): any[] { return []; }
  private getConversionRates(): any { return {}; }
  private getRevenueMetrics(): any { return {}; }
  private getPerformanceScores(): any { return {}; }
  private getSearchTrends(): any[] { return []; }
}

// Initialize analytics
export const analytics = new AnalyticsManager();

// Global analytics interface
declare global {
  interface Window {
    analytics: AnalyticsManager;
    gtag: any;
    fbq: any;
  }
}

window.analytics = analytics;

export default AnalyticsManager;