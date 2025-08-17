# 🛠️ Claude Code Tools Directory

This directory contains custom tools and utilities for the Claude Code Ultra 2025 Enterprise System.

## Tool Categories

### **Development Tools**
- Vue.js component generators
- PHP API scaffolding tools
- Database migration utilities
- Performance profiling tools

### **Testing Tools**
- Playwright test generators
- Security vulnerability scanners
- Performance benchmark tools
- Load testing utilities

### **Deployment Tools**
- Server provisioning scripts
- Database deployment tools
- Configuration management utilities
- Rollback and recovery tools

### **Monitoring Tools**
- Performance monitoring agents
- Security audit tools
- Log analysis utilities
- Health check monitors

## Usage

Tools in this directory can be accessed via the Claude Code CLI:

```bash
@claude-ultra /cli tool run performance-analyzer
@claude-ultra /cli tool generate vue-component
@claude-ultra /cli tool deploy production-ready
```

## Tool Structure

Each tool should follow the standard structure:

```yaml
name: tool-name
version: 1.0.0
description: Brief description of the tool
category: development|testing|deployment|monitoring
requirements:
  - node: ">=20.0.0"
  - php: ">=8.1"
commands:
  - name: run
    description: Execute the tool
    options:
      - name: target
        required: true
        description: Target to process
```

Tools are automatically registered with the MCP protocol and available through the chat interface.
