# Claude Code Integration Guide

## Overview

AgileAiAgents is built on top of [Claude Code](https://claude.ai/code), Anthropic's powerful AI coding assistant. This integration provides the foundation for all agent operations while adding specialized project management and coordination capabilities.

### Architecture Overview

```
┌─────────────────────────────────────────┐
│           User Interface                 │
│  (Terminal with Claude Code REPL)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────┴────────────────────────┐
│         AgileAiAgents Layer             │
│  • 38 Specialized Agents                │
│  • Sprint Management                    │
│  • Project State System                 │
│  • Document Organization                │
└────────────────┬────────────────────────┘
                 │
┌────────────────┴────────────────────────┐
│         Claude Code Core                │
│  • File Operations                      │
│  • Command Execution                    │
│  • Memory System (CLAUDE.md)            │
│  • MCP Server Connections               │
│  • Hooks System                         │
└─────────────────────────────────────────┘
```

## How AgileAiAgents Extends Claude Code

### 1. **Specialized Agent System**
While Claude Code provides general AI assistance, AgileAiAgents adds:
- 38 domain-specific expert agents
- Coordinated multi-agent workflows
- Structured handoff patterns
- Agent-specific knowledge bases

### 2. **Project Management Layer**
AgileAiAgents adds comprehensive project management:
- Sprint-based development cycles
- Project state persistence
- Structured document organization
- Workflow automation

### 3. **Enhanced Memory Management**
Building on Claude Code's CLAUDE.md system:
- Automatic MD → JSON conversion (80-90% token savings)
- Smart context loading priorities
- Document categorization system
- Optimized agent memory usage

### 4. **Command Extensions**
AgileAiAgents adds its own command set:
- `/aaa-help` - AgileAiAgents commands (vs Claude Code's `/help`)
- `/start-new-project-workflow` - Structured project initialization
- `/checkpoint` - Project state management
- And 40+ more specialized commands

## Key Integration Points

### Memory System Integration
- **Claude Code**: Loads CLAUDE.md files automatically
- **AgileAiAgents**: Extends with project-specific configurations
- **Optimization**: Auto-converts documents to JSON for efficiency

### Command Namespace
- **Claude Code Commands**: Start with `/` (e.g., `/help`, `/cost`)
- **AgileAiAgents Commands**: Also start with `/` but use distinct names
- **Conflict Resolution**: `/aaa-help` instead of `/help`

### File Operations
- **Claude Code**: Provides file read/write capabilities
- **AgileAiAgents**: Adds structured folder organization
- **Security**: FileOperationManager validates all operations

### Tool Usage
- **Claude Code Tools**: Bash, Edit, Read, Write, etc.
- **AgileAiAgents**: Orchestrates tool usage across agents
- **Enhancement**: Adds validation and audit trails

## For Users

### Getting Started
1. Install Claude Code first
2. Set up AgileAiAgents following README.md
3. Use both command sets together
4. Leverage combined capabilities

### Command Interaction Examples
```bash
# Check Claude Code session cost
/cost

# Start AgileAiAgents workflow
/start-new-project-workflow

# Use Claude Code's memory feature
/memory

# Get AgileAiAgents help
/aaa-help
```

### Best Practices
1. **Context Management**: Use `/compact` between major phases
2. **Cost Awareness**: Monitor with `/cost` regularly
3. **Memory Usage**: Let AgileAiAgents handle document optimization
4. **MCP Servers**: Configure for enhanced capabilities

## For AgileAiAgents System

### Agent Guidelines
All agents should:
1. **Respect Claude Code Limits**: Understand token limits and rate limits
2. **Use Available Tools**: Leverage Claude Code's tool suite
3. **Handle Errors Gracefully**: Distinguish Claude Code vs AgileAiAgents errors
4. **Optimize Token Usage**: Prefer JSON loading over markdown

### Integration Patterns
```javascript
// Good: Use Claude Code tools through AgileAiAgents
const FileOperationManager = require('./file-operation-manager');
await fileManager.writeDocument(content, folder, filename);

// Avoid: Direct Claude Code tool usage without validation
// This bypasses AgileAiAgents security and organization
```

### Error Handling
- **Claude Code Errors**: Network, API, tool failures
- **AgileAiAgents Errors**: Validation, organization, workflow errors
- **User Communication**: Always clarify error source

## Common Integration Scenarios

### 1. Starting a Project
```bash
# Claude Code provides the REPL
claude

# AgileAiAgents provides structured workflow
/start-new-project-workflow
```

### 2. Managing Context
```bash
# Claude Code command to clear context
/clear

# Better: Claude Code command to compact (preserves key info)
/compact

# AgileAiAgents checkpoint before clearing
/checkpoint "Completed authentication feature"
```

### 3. Using MCP Servers
```bash
# Configure MCP server (Claude Code feature)
claude mcp add perplexity

# AgileAiAgents agents automatically use it
# Research Agent will leverage Perplexity for web searches
```

## Troubleshooting

### Issue: Commands Not Working
- Check if it's a Claude Code command: See `/help`
- Check if it's an AgileAiAgents command: See `/aaa-help`
- Verify command syntax and parameters

### Issue: High Token Usage
- Use `/cost` to check current usage
- Run `/compact` to reduce context
- Check if agents are loading JSON (efficient) vs MD (expensive)

### Issue: Memory Not Loading
- Verify CLAUDE.md exists in project root
- Check file permissions
- Ensure no syntax errors in CLAUDE.md

## Related Guides

- **Commands Reference**: `claude-code-commands-reference.md`
- **Memory Optimization**: `claude-code-memory-optimization.md`
- **Cost Management**: `claude-code-cost-optimization.md`
- **MCP Servers**: `mcp-servers-guide.md`
- **Hooks**: `claude-code-hooks-guide.md`

## Summary

AgileAiAgents and Claude Code work together to provide:
- **Claude Code**: Core AI capabilities and tool access
- **AgileAiAgents**: Specialized agents and project management
- **Combined**: Complete AI-powered development environment

Understanding this integration helps you leverage both systems effectively for maximum productivity.