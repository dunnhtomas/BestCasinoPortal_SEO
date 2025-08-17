#!/usr/bin/env node
/**
 * 🔍 BestCasinoPortal.com Production Monitoring
 * Real-time monitoring and alerting system
 */

const axios = require('axios');
const fs = require('fs');

class ProductionMonitor {
  constructor() {
    this.baseUrl = 'https://bestcasinoportal.com';
    this.metrics = {
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      lastCheck: null
    };
  }

  async checkHealth() {
    console.log('🏥 Checking production health...');
    
    try {
      const start = Date.now();
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 10000
      });
      const responseTime = Date.now() - start;
      
      this.metrics.responseTime = responseTime;
      this.metrics.uptime = response.status === 200 ? 100 : 0;
      this.metrics.lastCheck = new Date().toISOString();
      
      console.log(`✅ Health check passed - ${responseTime}ms`);
      
      if (responseTime > 2000) {
        console.log('⚠️ WARNING: Slow response time detected');
        this.sendAlert('Slow Response', `Response time: ${responseTime}ms`);
      }
      
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      this.metrics.uptime = 0;
      this.sendAlert('Site Down', error.message);
    }
  }

  async checkCoreWebVitals() {
    console.log('⚡ Checking Core Web Vitals...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/performance/vitals`);
      const vitals = response.data;
      
      console.log(`LCP: ${vitals.lcp}ms (target: <2500ms)`);
      console.log(`FID: ${vitals.fid}ms (target: <100ms)`);
      console.log(`CLS: ${vitals.cls} (target: <0.1)`);
      
      if (vitals.lcp > 2500 || vitals.fid > 100 || vitals.cls > 0.1) {
        this.sendAlert('Performance Issue', 'Core Web Vitals targets not met');
      }
      
    } catch (error) {
      console.log('⚠️ Could not check Core Web Vitals:', error.message);
    }
  }

  async checkSecurity() {
    console.log('🛡️ Checking security headers...');
    
    try {
      const response = await axios.head(this.baseUrl);
      const headers = response.headers;
      
      const requiredHeaders = [
        'strict-transport-security',
        'x-frame-options',
        'x-content-type-options',
        'content-security-policy'
      ];
      
      let missingHeaders = [];
      requiredHeaders.forEach(header => {
        if (!headers[header]) {
          missingHeaders.push(header);
        }
      });
      
      if (missingHeaders.length > 0) {
        console.log(`⚠️ Missing security headers: ${missingHeaders.join(', ')}`);
        this.sendAlert('Security Issue', `Missing headers: ${missingHeaders.join(', ')}`);
      } else {
        console.log('✅ All security headers present');
      }
      
    } catch (error) {
      console.log('❌ Security check failed:', error.message);
    }
  }

  async checkAffiliateTracking() {
    console.log('💰 Checking affiliate tracking...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/affiliates/status`);
      const status = response.data;
      
      if (status.tracking_active && status.conversion_rate > 0) {
        console.log(`✅ Affiliate tracking active - ${status.conversion_rate}% conversion`);
      } else {
        console.log('⚠️ Affiliate tracking issues detected');
        this.sendAlert('Revenue Issue', 'Affiliate tracking problems');
      }
      
    } catch (error) {
      console.log('⚠️ Could not check affiliate status:', error.message);
    }
  }

  sendAlert(type, message) {
    const alert = {
      timestamp: new Date().toISOString(),
      type: type,
      message: message,
      site: 'bestcasinoportal.com'
    };
    
    console.log(`🚨 ALERT: ${type} - ${message}`);
    
    // In production, this would send to Slack, email, etc.
    fs.appendFileSync('monitoring-alerts.log', JSON.stringify(alert) + '\n');
  }

  async runFullCheck() {
    console.log('\n🔍 PRODUCTION MONITORING - FULL SYSTEM CHECK');
    console.log('=' .repeat(60));
    
    await this.checkHealth();
    await this.checkCoreWebVitals();
    await this.checkSecurity();
    await this.checkAffiliateTracking();
    
    console.log('\n📊 MONITORING SUMMARY:');
    console.log(`Uptime: ${this.metrics.uptime}%`);
    console.log(`Response Time: ${this.metrics.responseTime}ms`);
    console.log(`Last Check: ${this.metrics.lastCheck}`);
    console.log('=' .repeat(60));
  }
}

// Run monitoring
const monitor = new ProductionMonitor();
monitor.runFullCheck();

// Schedule regular checks (every 5 minutes)
setInterval(() => {
  monitor.runFullCheck();
}, 5 * 60 * 1000);
