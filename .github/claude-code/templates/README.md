# 📋 Claude Code Templates Directory

This directory contains code and configuration templates for the Claude Code Ultra 2025 Enterprise System.

## Template Categories

### **Vue.js Templates**

- Component templates with TypeScript
- Composition API patterns
- Responsive design templates
- Casino.ca UI components

### **PHP Templates**

- API endpoint templates
- Database model templates
- Security middleware templates
- Performance optimization patterns

### **Configuration Templates**

- Nginx configuration templates
- Database migration templates
- Security header templates
- Performance optimization configs

### **Testing Templates**

- Playwright test templates
- Security test templates
- Performance test templates
- Integration test templates

## Usage

Templates can be applied via the Claude Code CLI:

```bash
@claude-ultra /cli template apply vue-component
@claude-ultra /cli template apply php-api-endpoint
@claude-ultra /cli template apply playwright-test
```

## Template Structure

Each template follows a standardized structure:

```yaml
name: template-name
version: 1.0.0
description: Brief description of the template
category: vue|php|config|testing
variables:
  - name: componentName
    type: string
    required: true
  - name: apiEndpoint
    type: string
    default: "/api/v1"
files:
  - src: component.vue.template
    dest: "src/components/{{componentName}}.vue"
  - src: test.spec.ts.template
    dest: "tests/{{componentName}}.spec.ts"
```

Templates are automatically available through the chat interface and MCP protocol.
