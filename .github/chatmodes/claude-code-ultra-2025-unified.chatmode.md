
---
description: "Premier unified enterprise chat mode combining planning capabilities, multi-agent orchestration, casino.ca architecture patterns, and mandatory Playwright testing for casino portal development"
tools: ['codebase', 'fetch', 'findTestFiles', 'githubRepo', 'search', 'usages', 'playwright', 'security', 'performance', 'dataforseo', 'context7', 'mcp']
architecture: casino.ca
stack: ['PHP 8.1+', 'Vue.js 3+', 'PostgreSQL', 'Redis', 'Nginx', 'Playwright', 'Tailwind CSS']
agents: ['senior-php-architect', 'vue-component-specialist', 'playwright-testing-specialist', 'security-auditor', 'performance-optimizer']
testing: mandatory
deployment: blocked-without-tests
mcp: enabled
hooks: enabled
enterprise: true
unified: true
modes: ['planning', 'enterprise', 'casino-portal', 'testing']
---

## 📋 Unified Package Manifest

```json
{
  "name": "@casino-portal/claude-code-ultra-2025-unified",
  "displayName": "🎰 Claude Code Ultra 2025 Unified Enterprise",
  "description": "Unified enterprise Claude Code 2025 with all modes: planning, enterprise, casino-portal, testing integrated",
  "version": "3.1.0",
  "publisher": "BestCasinoPortal",
  "unified": true,
  "chatMode": true,
  "enterprise": true,
  "engines": {
    "vscode": "^1.96.0",
    "claude-code": "^3.1.0",
    "claude-sonnet": "^4.0.0",
    "node": ">=20.0.0"
  },
  "categories": [
    "AI", 
    "Enterprise", 
    "Development", 
    "Casino Portal", 
    "Planning",
    "Testing", 
    "Security", 
    "Performance",
    "Multi-Agent",
    "MCP"
  ],
  "keywords": [
    "claude-code", 
    "sonnet-4", 
    "enterprise", 
    "casino.ca", 
    "mcp", 
    "sub-agents", 
    "cli-integration",
    "planning-mode",
    "playwright-testing",
    "unified-mode"
  ],
  "activationEvents": [
    "onCommand:claude-code-ultra-2025.activate",
    "onCommand:claude-code-ultra-2025.mode.planning",
    "onCommand:claude-code-ultra-2025.mode.enterprise", 
    "onCommand:claude-code-ultra-2025.mode.casino-portal",
    "onCommand:claude-code-ultra-2025.mode.testing",
    "onCommand:claude-code-ultra-2025.mode.unified",
    "onStartupFinished",
    "onFileSystem:CLAUDE.md",
    "onFileSystem:.mcp.json"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "chatParticipants": [
      {
        "id": "claude-ultra-2025-unified",
        "name": "claude-unified",
        "description": "Unified Enterprise Claude Code 2025 with all specialized modes integrated",
        "isSticky": true,
        "supportsStandaloneMode": true,
        "unified": true,
        "modes": ["planning", "enterprise", "casino-portal", "testing", "unified"],
        "commands": [
          {
            "name": "cli",
            "description": "Execute Claude CLI commands directly in VS Code"
          },
          {
            "name": "mcp",
            "description": "Manage MCP servers and protocol tools"
          },
          {
            "name": "agent",
            "description": "Orchestrate specialized sub-agents for development tasks"
          },
          {
            "name": "casino",
            "description": "Apply casino.ca proven architecture patterns"
          },
          {
            "name": "test",
            "description": "Run mandatory Playwright testing (deployment blocking)"
          },
          {
            "name": "plan",
            "description": "Generate comprehensive implementation plans"
          },
          {
            "name": "mode",
            "description": "Switch between specialized development modes"
          },
          {
            "name": "deploy",
            "description": "Enterprise deployment workflows with validation"
          },
          {
            "name": "security",
            "description": "Security scanning and compliance validation"
          },
          {
            "name": "performance",
            "description": "Core Web Vitals optimization and monitoring"
          },
          {
            "name": "hooks",
            "description": "Event-driven automation and lifecycle management"
          },
          {
            "name": "seo",
            "description": "DataForSEO integration for competitive analysis"
          }
        ]
      }
    ],
    "commands": [
      {
        "command": "claude-code-ultra-2025.activate",
        "title": "🚀 Activate Claude Code Ultra 2025 Unified",
        "category": "Claude Ultra 2025",
        "icon": "$(rocket)"
      },
      {
        "command": "claude-code-ultra-2025.mode.planning", 
        "title": "📋 Planning Mode",
        "category": "Claude Ultra 2025",
        "icon": "$(project)"
      },
      {
        "command": "claude-code-ultra-2025.mode.enterprise",
        "title": "🏢 Enterprise Mode", 
        "category": "Claude Ultra 2025",
        "icon": "$(organization)"
      },
      {
        "command": "claude-code-ultra-2025.mode.casino-portal",
        "title": "🎰 Casino Portal Mode",
        "category": "Claude Ultra 2025", 
        "icon": "$(symbol-structure)"
      },
      {
        "command": "claude-code-ultra-2025.mode.testing",
        "title": "🧪 Testing Mode (Mandatory)",
        "category": "Claude Ultra 2025",
        "icon": "$(beaker)"
      },
      {
        "command": "claude-code-ultra-2025.mode.unified",
        "title": "⚡ Unified Mode (All Features)",
        "category": "Claude Ultra 2025",
        "icon": "$(extensions)"
      },
      {
        "command": "claude-code-ultra-2025.cli.bridge",
        "title": "🖥️ CLI-IDE Bridge",
        "category": "Claude Ultra 2025",
        "icon": "$(terminal)"
      },
      {
        "command": "claude-code-ultra-2025.mcp.manager",
        "title": "🔧 MCP Server Manager",
        "category": "Claude Ultra 2025",
        "icon": "$(server-process)"
      },
      {
        "command": "claude-code-ultra-2025.agents.orchestrate",
        "title": "🤖 Multi-Agent Orchestration",
        "category": "Claude Ultra 2025",
        "icon": "$(organization)"
      },
      {
        "command": "claude-code-ultra-2025.casino.architect",
        "title": "🎰 Casino.ca Architecture Builder",
        "category": "Claude Ultra 2025",
        "icon": "$(symbol-structure)"
      },
      {
        "command": "claude-code-ultra-2025.playwright.enforce",
        "title": "🧪 Enforce Playwright Testing",
        "category": "Claude Ultra 2025",
        "icon": "$(beaker)"
      },
      {
        "command": "claude-code-ultra-2025.security.scan",
        "title": "🛡️ Enterprise Security Scan",
        "category": "Claude Ultra 2025",
        "icon": "$(shield)"
      },
      {
        "command": "claude-code-ultra-2025.performance.optimize",
        "title": "⚡ Performance Optimization",
        "category": "Claude Ultra 2025", 
        "icon": "$(dashboard)"
      },
      {
        "command": "claude-code-ultra-2025.seo.analyze",
        "title": "📈 SEO Analysis (DataForSEO)",
        "category": "Claude Ultra 2025",
        "icon": "$(graph)"
      }
    ],
    "keybindings": [
      {
        "command": "claude-code-ultra-2025.activate",
        "key": "ctrl+shift+claude",
        "mac": "cmd+shift+claude"
      },
      {
        "command": "claude-code-ultra-2025.mode.unified",
        "key": "ctrl+shift+u",
        "mac": "cmd+shift+u"
      },
      {
        "command": "claude-code-ultra-2025.mode.testing",
        "key": "ctrl+shift+p",
        "mac": "cmd+shift+p"
      },
      {
        "command": "claude-code-ultra-2025.cli.bridge",
        "key": "ctrl+shift+t",
        "mac": "cmd+shift+t"
      }
    ],
    "configuration": {
      "title": "Claude Code Ultra 2025 Unified",
      "properties": {
        "claude-code-ultra-2025.enterprise.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable enterprise features and multi-agent orchestration"
        },
        "claude-code-ultra-2025.unified.defaultMode": {
          "type": "string",
          "enum": ["planning", "enterprise", "casino-portal", "testing", "unified"],
          "default": "unified",
          "description": "Default mode when chat participant is activated"
        },
        "claude-code-ultra-2025.testing.mandatory": {
          "type": "boolean", 
          "default": true,
          "description": "Enforce mandatory Playwright testing (blocks deployment)"
        },
        "claude-code-ultra-2025.casino.architecture": {
          "type": "string",
          "default": "casino.ca",
          "description": "Reference architecture for casino portal development"
        },
        "claude-code-ultra-2025.performance.targets": {
          "type": "object",
          "default": {
            "api_response": "200ms",
            "lcp": "2.5s", 
            "fid": "100ms",
            "cls": "0.1"
          },
          "description": "Performance targets for Core Web Vitals compliance"
        },
        "claude-code-ultra-2025.mcp.servers": {
          "type": "array",
          "default": ["playwright", "dataforseo", "context7", "security", "performance"],
          "description": "Enabled MCP servers for enhanced capabilities"
        }
      }
    }
  }
}
```

---

## 🎯 Unified Mode Capabilities

### **Core Operating Modes**

#### 🚀 **Unified Mode** (Default)
All capabilities integrated for seamless development experience:
- **Planning Integration**: Auto-generate implementation plans
- **Enterprise Standards**: Multi-agent coordination and enterprise security
- **Casino Architecture**: casino.ca proven patterns and performance optimization
- **Mandatory Testing**: Playwright test enforcement with deployment blocking

#### 📋 **Planning Mode**
Generate comprehensive implementation plans for features and refactoring:
```markdown
# Implementation Plan: [Feature Name]

## Overview
[Brief description with casino.ca architecture compliance]

## Requirements
- [ ] Functional requirements with casino.ca patterns
- [ ] Performance requirement (sub-200ms API, Core Web Vitals)
- [ ] Security requirement (HTTPS, headers, input validation)
- [ ] Mobile responsiveness with casino.ca standards
- [ ] Mandatory Playwright test coverage

## Implementation Steps
### Phase 1: Foundation
### Phase 2: Development  
### Phase 3: Testing & Validation
### Phase 4: Deployment

## Testing Strategy
- Unit tests for components
- Integration tests for APIs
- E2E Playwright tests (mandatory)
- Performance validation
- Security compliance testing
```

#### 🏢 **Enterprise Mode**
Multi-agent orchestration with specialized sub-agents:
- **Senior PHP Architect**: Casino.ca backend patterns, API design, PHP 8.1+
- **Vue Component Specialist**: Frontend development, Vue.js 3+, TypeScript
- **Playwright Testing Specialist**: Mandatory testing enforcement, cross-browser validation
- **Security Auditor**: Enterprise security, SOC2/GDPR/PCI-DSS compliance
- **Performance Optimizer**: Core Web Vitals, sub-200ms optimization

#### 🎰 **Casino Portal Mode**
Specialized for casino.ca architecture patterns:
- **Technology Stack**: PHP 8.1+, Vue.js 3+, PostgreSQL, Redis, Nginx
- **Performance Standards**: Sub-200ms API, Core Web Vitals compliance
- **Security Requirements**: HTTPS-only, security headers, input validation
- **Mobile-First Design**: Responsive with Tailwind CSS optimization
- **PWA Features**: Service workers, offline capabilities

#### 🧪 **Testing Mode** (Mandatory)
Zero-tolerance testing policy with deployment blocking:
- **Mandatory Tests**: All features must have Playwright tests
- **Deployment Blocking**: Failed tests prevent deployment
- **Cross-Browser**: Chrome, Firefox, Safari, Edge validation
- **Performance Testing**: Core Web Vitals monitoring
- **Security Testing**: Vulnerability and compliance validation

---

## 🔧 Unified Command Structure

### `/mode` - Mode Management
```bash
/mode unified                    # Switch to unified mode (all features)
/mode planning                   # Switch to planning mode
/mode enterprise                 # Switch to enterprise mode  
/mode casino-portal             # Switch to casino portal mode
/mode testing                   # Switch to testing mode
/mode status                    # Show current mode and capabilities
```

### `/plan` - Planning Commands
```bash
/plan feature LoginSystem       # Generate feature implementation plan
/plan refactor DatabaseLayer    # Generate refactoring plan
/plan architecture CasinoPortal # Generate architecture plan
/plan security ComplianceAudit  # Generate security compliance plan
/plan performance Optimization  # Generate performance optimization plan
```

### `/casino` - Casino Architecture Commands
```bash
/casino implement vue-component CasinoCard responsive
/casino optimize performance core-web-vitals  
/casino security scan enterprise-grade
/casino deploy production --with-validation
/casino api create users --php8.1 --rest
/casino database optimize --postgresql --redis
/casino pwa implement --service-workers
```

### `/test` - Testing Commands (Mandatory)
```bash
/test playwright homepage-flow                    # Test homepage user flow
/test security vulnerability-scan                 # Security testing
/test performance core-web-vitals                # Performance testing  
/test cross-browser chrome,firefox,safari,edge   # Cross-browser testing
/test verify deployment production-ready         # Pre-deployment validation
/test block deployment                           # Block deployment on test failures
```

### `/agent` - Multi-Agent Commands
```bash
/agent coordinate full-stack-development         # Coordinate all agents
/agent php-architect api-design UserService     # PHP architecture
/agent vue-specialist component CasinoCard      # Vue.js development
/agent playwright-specialist test-suite         # Testing specialist
/agent security-auditor compliance-scan         # Security audit
/agent performance-optimizer core-web-vitals    # Performance optimization
```

### `/mcp` - MCP Server Management
```bash
/mcp list servers                     # List available MCP servers
/mcp enable playwright               # Enable Playwright MCP server
/mcp enable dataforseo              # Enable DataForSEO MCP server
/mcp enable context7                # Enable Context7 MCP server
/mcp status                         # Show MCP server status
/mcp configure casino-portal        # Configure casino portal MCP setup
```

### `/seo` - DataForSEO Integration
```bash
/seo analyze competitor casino.ca           # Analyze casino.ca SEO strategy
/seo keywords research casino               # Research casino keywords
/seo content plan --competitor casino.ca   # Generate content plan
/seo performance audit                     # SEO performance audit
```

### `/security` - Enterprise Security
```bash
/security scan vulnerability              # Vulnerability scanning
/security headers validate               # Security headers validation
/security compliance soc2,gdpr,pci      # Compliance validation
/security audit enterprise-grade        # Full security audit
```

### `/performance` - Optimization Commands
```bash
/performance analyze core-web-vitals     # Core Web Vitals analysis
/performance optimize api-response       # API response optimization
/performance monitor real-user-metrics  # RUM monitoring
/performance target sub-200ms           # Set performance targets
```

### `/hooks` - Event-Driven Automation
```bash
/hooks list                             # List available hooks
/hooks enable deployment-validation     # Enable deployment validation
/hooks enable security-scanning         # Enable security scanning
/hooks configure session-init           # Configure session initialization
/hooks status                          # Show hooks status
```

---

## 🏗️ Casino.ca Architecture Integration

### **Proven Technology Stack**
- **Backend**: PHP 8.1+ with modern features (enums, readonly properties, constructor promotion)
- **Frontend**: Vue.js 3+ with Composition API and TypeScript
- **Database**: PostgreSQL for relational data, Redis for caching
- **Infrastructure**: Nginx with SSL/TLS A+ grade, CDN optimization
- **Testing**: Playwright for E2E testing, PHPUnit for backend

### **Performance Standards** 
- API response time < 200ms
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms  
- CLS (Cumulative Layout Shift) < 0.1
- Image optimization with AVIF/WebP formats

### **Security Requirements**
- HTTPS-only configuration with HSTS
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- Input validation and sanitization
- SQL injection prevention with prepared statements
- XSS protection with output encoding

### **Code Quality Standards**
- TypeScript for frontend components
- PHP 8.1+ features and strong typing
- Comprehensive error handling and logging
- Code documentation and API documentation
- Automated testing with high coverage

---

## 🧪 Mandatory Testing Framework

### **Zero-Tolerance Testing Policy**
- ❌ **NO DEPLOYMENT WITHOUT TESTS**: All features must have comprehensive Playwright tests
- ❌ **NO EXCEPTIONS**: Failed tests automatically block deployment
- ✅ **CROSS-BROWSER MANDATORY**: Chrome, Firefox, Safari, Edge validation required
- ✅ **PERFORMANCE TESTING**: Core Web Vitals monitoring integrated
- ✅ **SECURITY TESTING**: Vulnerability scanning included

### **Test Structure Example**
```typescript
// tests/casino-portal-unified.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Casino Portal - Unified Testing Suite', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test('homepage loads with casino.ca performance standards', async () => {
    // Performance validation
    await expect(page).toHaveTitle(/Best Casino Portal/);
    
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
          resolve({
            lcp: lcp?.startTime || 0,
            timestamp: Date.now()
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(performanceMetrics.lcp).toBeLessThan(2500); // 2.5s LCP requirement
  });

  test('security headers are properly configured', async () => {
    const response = await page.goto('/');
    const headers = response?.headers();
    
    expect(headers?.['strict-transport-security']).toContain('max-age');
    expect(headers?.['x-frame-options']).toBe('DENY');
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['content-security-policy']).toBeDefined();
  });

  test('responsive design follows casino.ca standards', async () => {
    // Mobile viewport test
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.casino-card')).toBeVisible();
    
    // Desktop viewport test  
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.casino-grid')).toBeVisible();
    
    // Tablet viewport test
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.casino-list')).toBeVisible();
  });

  test('API endpoints respond within 200ms requirement', async () => {
    const startTime = Date.now();
    const response = await page.request.get('/api/casinos');
    const endTime = Date.now();
    
    expect(response.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(200); // Sub-200ms requirement
  });
});
```

### **Deployment Blocking Configuration**
```json
{
  "playwright": {
    "testDir": "./tests",
    "timeout": 30000,
    "expect": {
      "timeout": 5000
    },
    "forbidOnly": true,
    "retries": 2,
    "use": {
      "baseURL": "https://bestcasinoportal.com",
      "trace": "on-first-retry",
      "screenshot": "only-on-failure"
    },
    "projects": [
      {
        "name": "chromium",
        "use": { "...devices['Desktop Chrome']" }
      },
      {
        "name": "firefox", 
        "use": { "...devices['Desktop Firefox']" }
      },
      {
        "name": "webkit",
        "use": { "...devices['Desktop Safari']" }
      },
      {
        "name": "mobile-chrome",
        "use": { "...devices['Pixel 5']" }
      }
    ],
    "deploymentBlocking": {
      "enabled": true,
      "requiredProjects": ["chromium", "firefox", "webkit", "mobile-chrome"],
      "performanceThresholds": {
        "lcp": 2500,
        "fid": 100,
        "cls": 0.1,
        "apiResponse": 200
      },
      "securityChecks": {
        "headers": true,
        "https": true,
        "vulnerability": true
      }
    }
  }
}
```

---

## 🤖 Multi-Agent Orchestration

### **Specialized Sub-Agents**

#### **Senior PHP Architect Agent**
```yaml
name: senior-php-architect
specialization: PHP 8.1+ backend development and casino.ca patterns
capabilities:
  - API design following RESTful principles
  - Database architecture with PostgreSQL optimization
  - Security implementation (input validation, SQL injection prevention)
  - Performance optimization (sub-200ms response times)
  - Modern PHP features (enums, readonly properties, constructor promotion)
commands:
  - design-api
  - optimize-database
  - implement-security
  - performance-audit
```

#### **Vue Component Specialist Agent**
```yaml
name: vue-component-specialist  
specialization: Vue.js 3+ frontend development with TypeScript
capabilities:
  - Component architecture with Composition API
  - Responsive design with Tailwind CSS
  - Performance optimization (lazy loading, code splitting)
  - PWA implementation (service workers, offline capabilities)
  - TypeScript integration and type safety
commands:
  - create-component
  - optimize-bundle
  - implement-pwa
  - responsive-design
```

#### **Playwright Testing Specialist Agent**
```yaml
name: playwright-testing-specialist
specialization: Comprehensive E2E testing and deployment blocking
capabilities:
  - Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Performance testing (Core Web Vitals monitoring)
  - Security testing (headers, vulnerability scanning)
  - Mobile testing (responsive design validation)
  - Deployment blocking on test failures
commands:
  - create-test-suite
  - run-cross-browser
  - validate-performance
  - block-deployment
```

#### **Security Auditor Agent**
```yaml
name: security-auditor
specialization: Enterprise security and compliance validation
capabilities:
  - Vulnerability scanning and penetration testing
  - Compliance validation (SOC2, GDPR, PCI-DSS)
  - Security headers configuration
  - HTTPS enforcement and SSL/TLS optimization
  - Security code review and best practices
commands:
  - security-scan
  - compliance-audit
  - configure-headers
  - vulnerability-assessment
```

#### **Performance Optimizer Agent**
```yaml
name: performance-optimizer
specialization: Core Web Vitals and performance optimization
capabilities:
  - Core Web Vitals monitoring and optimization
  - API response time optimization (sub-200ms)
  - Image optimization (AVIF, WebP, lazy loading)
  - Caching strategy (Redis, CDN configuration)
  - Real User Monitoring (RUM) implementation
commands:
  - optimize-core-web-vitals
  - optimize-api-response
  - implement-caching
  - monitor-performance
```

---

## 🚀 Enterprise Deployment Pipeline

### **Deployment Workflow**
```yaml
name: Claude Code Ultra 2025 Unified Deployment
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unified-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Claude Code Ultra 2025
        uses: ./.github/actions/claude-code-setup
        
      - name: Planning Phase
        run: claude-code mode planning --validate-architecture
        
      - name: Enterprise Security Scan
        run: claude-code security scan --enterprise-grade
        
      - name: Casino Architecture Validation
        run: claude-code casino validate --architecture casino.ca
        
      - name: Mandatory Playwright Testing
        run: claude-code test playwright --deployment-blocking
        
      - name: Performance Validation
        run: claude-code performance validate --core-web-vitals
        
      - name: Multi-Agent Coordination
        run: claude-code agent coordinate --deployment-ready
        
      - name: Deployment Authorization
        if: success()
        run: claude-code deploy authorize --unified-validation-passed
```

### **Pre-Deployment Checklist**
- ✅ **Planning**: Implementation plan generated and validated
- ✅ **Architecture**: Casino.ca patterns properly implemented
- ✅ **Testing**: All Playwright tests passing (cross-browser)
- ✅ **Security**: Enterprise security scan passed
- ✅ **Performance**: Core Web Vitals targets met
- ✅ **Multi-Agent**: All specialized agents validated
- ✅ **Compliance**: SOC2/GDPR/PCI-DSS requirements met

---

## 🎯 Usage Examples

### **Unified Development Workflow**
```bash
# Start unified development session
/mode unified

# Generate implementation plan
/plan feature "Casino Card Component with Responsive Design"

# Coordinate multi-agent development
/agent coordinate full-stack-development

# Implement with casino.ca patterns
/casino implement vue-component CasinoCard --responsive --performance-optimized

# Run mandatory testing
/test playwright casino-card-flow --cross-browser --performance

# Security validation
/security scan vulnerability --enterprise-grade

# Performance optimization
/performance optimize core-web-vitals --target sub-200ms

# Deploy with full validation
/deploy production --unified-validation --mandatory-tests
```

### **Specialized Mode Usage**
```bash
# Planning mode for new feature
/mode planning
/plan feature "Advanced Search System with Filters"

# Enterprise mode for complex development
/mode enterprise  
/agent php-architect design-api SearchService
/agent vue-specialist create-component AdvancedSearch
/agent security-auditor compliance-scan

# Casino portal mode for architecture work
/mode casino-portal
/casino optimize database --postgresql --performance
/casino implement pwa --service-workers --offline

# Testing mode for quality assurance
/mode testing
/test playwright search-functionality --deployment-blocking
/test security headers --compliance-validation
/test performance api-response --sub-200ms
```

---

## 🔒 Enterprise Security & Compliance

### **Security Standards**
- **HTTPS-Only**: Enforced at Nginx and application level
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Input Validation**: Server-side validation with PHP filters
- **Output Encoding**: XSS prevention with proper encoding
- **SQL Injection Prevention**: Prepared statements and parameterized queries
- **Authentication**: Secure session management and CSRF protection

### **Compliance Framework**
- **SOC2**: System and Organization Controls compliance
- **GDPR**: General Data Protection Regulation compliance  
- **PCI-DSS**: Payment Card Industry Data Security Standard
- **ISO 27001**: Information security management
- **OWASP**: Top 10 security vulnerabilities mitigation

### **Audit Trail**
All actions are logged for enterprise audit requirements:
- Development mode changes
- Security scan results
- Performance optimization metrics
- Testing execution results
- Deployment authorization decisions

---

## 📊 Performance Monitoring

### **Core Web Vitals Targets**
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1
- **API Response Time**: < 200 milliseconds
- **Time to Interactive (TTI)**: < 3.5 seconds

### **Real User Monitoring (RUM)**
```javascript
// Integrated performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    if (entry.entryType === 'largest-contentful-paint') {
      // Send LCP metric to monitoring service
      analytics.track('core_web_vitals', {
        metric: 'lcp',
        value: entry.startTime,
        target: 2500,
        passed: entry.startTime < 2500
      });
    }
  });
});

performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });
```

---

## 🎰 Casino.ca Reference Implementation

### **Component Examples**

#### **Casino Card Component (Vue.js 3 + TypeScript)**
```vue
<template>
  <div class="casino-card" :class="cardClasses">
    <div class="casino-header">
      <img 
        :src="casino.logo" 
        :alt="casino.name"
        class="casino-logo"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="casino-info">
        <h3 class="casino-name">{{ casino.name }}</h3>
        <div class="casino-rating">
          <StarRating :rating="casino.rating" />
        </div>
      </div>
    </div>
    
    <div class="casino-features">
      <div class="bonus-info">
        <span class="bonus-amount">{{ casino.bonus.amount }}</span>
        <span class="bonus-type">{{ casino.bonus.type }}</span>
      </div>
      <div class="game-count">
        {{ casino.games.count }}+ Games
      </div>
    </div>
    
    <div class="casino-actions">
      <button 
        class="btn-primary"
        @click="visitCasino"
        :disabled="loading"
      >
        <span v-if="!loading">Play Now</span>
        <LoadingSpinner v-else />
      </button>
      <button 
        class="btn-secondary"
        @click="readReview"
      >
        Read Review
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { StarRating, LoadingSpinner } from '@/components';
import type { Casino } from '@/types/casino';

interface Props {
  casino: Casino;
  featured?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
  compact: false
});

const loading = ref(false);

const cardClasses = computed(() => ({
  'casino-card--featured': props.featured,
  'casino-card--compact': props.compact,
  'casino-card--loading': loading.value
}));

const visitCasino = async () => {
  loading.value = true;
  try {
    // Track click event
    await analytics.track('casino_click', {
      casino_id: props.casino.id,
      casino_name: props.casino.name,
      position: 'card'
    });
    
    // Open casino in new tab
    window.open(props.casino.url, '_blank', 'noopener,noreferrer');
  } finally {
    loading.value = false;
  }
};

const readReview = () => {
  // Navigate to review page
  router.push(`/casino/${props.casino.slug}/review`);
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/casino-placeholder.svg';
};
</script>

<style scoped>
.casino-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300;
  @apply border border-gray-200 overflow-hidden;
}

.casino-card--featured {
  @apply ring-2 ring-yellow-400 shadow-xl;
}

.casino-card--compact {
  @apply p-4;
}

.casino-header {
  @apply flex items-center p-6 pb-4;
}

.casino-logo {
  @apply w-16 h-16 object-contain rounded-lg mr-4;
}

.casino-info {
  @apply flex-1;
}

.casino-name {
  @apply text-xl font-bold text-gray-900 mb-1;
}

.casino-features {
  @apply px-6 pb-4;
}

.bonus-info {
  @apply flex items-center mb-2;
}

.bonus-amount {
  @apply text-2xl font-bold text-green-600 mr-2;
}

.bonus-type {
  @apply text-sm text-gray-600;
}

.casino-actions {
  @apply flex gap-3 p-6 pt-0;
}

.btn-primary {
  @apply flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg;
  @apply transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg;
  @apply transition-colors duration-200;
}

@media (max-width: 768px) {
  .casino-card {
    @apply mx-4;
  }
  
  .casino-actions {
    @apply flex-col;
  }
}
</style>
```

#### **API Endpoint (PHP 8.1+)**
```php
<?php

declare(strict_types=1);

namespace App\Controllers\Api;

use App\Services\CasinoService;
use App\DTOs\CasinoFilterDto;
use App\Responses\ApiResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class CasinoController
{
    public function __construct(
        private CasinoService $casinoService,
        private ApiResponse $apiResponse
    ) {}

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $filters = CasinoFilterDto::fromRequest($request);
            $casinos = $this->casinoService->getCasinos($filters);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            return $this->apiResponse->success([
                'casinos' => $casinos,
                'meta' => [
                    'total' => $casinos->count(),
                    'response_time_ms' => round($responseTime, 2),
                    'filters_applied' => $filters->toArray()
                ]
            ]);
            
        } catch (ValidationException $e) {
            return $this->apiResponse->error('Validation failed', 422, [
                'errors' => $e->getErrors()
            ]);
        } catch (Exception $e) {
            logger()->error('Casino API error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    public function show(ServerRequestInterface $request, array $args): ResponseInterface
    {
        $casinoId = (int) $args['id'];
        
        try {
            $casino = $this->casinoService->getCasino($casinoId);
            
            if (!$casino) {
                return $this->apiResponse->error('Casino not found', 404);
            }
            
            return $this->apiResponse->success([
                'casino' => $casino,
                'related' => $this->casinoService->getRelatedCasinos($casino, 3)
            ]);
            
        } catch (Exception $e) {
            logger()->error('Casino details API error', [
                'casino_id' => $casinoId,
                'message' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }
}
```

---

This unified chat mode manifest combines all the specialized capabilities while maintaining the enterprise-grade structure and casino.ca architecture patterns. It provides a comprehensive development environment with mandatory testing, multi-agent orchestration, and performance optimization all integrated into one powerful system.
