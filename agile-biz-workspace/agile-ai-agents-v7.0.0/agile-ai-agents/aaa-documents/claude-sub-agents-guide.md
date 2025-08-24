# Claude Code Native Sub-Agents Guide

## Overview

Starting with v4.1.0, AgileAiAgents provides native integration with Claude Code's sub-agent system. This guide explains how the integration works and how to use it effectively.

## What Are Claude Sub-Agents?

Claude sub-agents are specialized agents that can be invoked directly within Claude Code for focused tasks. They provide:
- Parallel execution capabilities
- Isolated contexts for better token efficiency
- Native integration with Claude Code
- No token limits for agent definitions

## Three-Tier Document System

AgileAiAgents uses a sophisticated three-tier system to balance different needs:

### 1. Source Documents (`ai-agents/*.md`)
- **Purpose**: Single source of truth for all agent definitions
- **Content**: Full, verbose agent specifications
- **Maintenance**: Human-edited and version controlled
- **Size**: 10,000-40,000 tokens per agent

### 2. Token-Optimized JSON (`machine-data/ai-agents-json/*.json`)
- **Purpose**: Efficient API operations and agent loading
- **Content**: Condensed summaries with references to full content
- **Maintenance**: Auto-generated from MD files
- **Size**: 200-500 tokens per agent (95% reduction)

### 3. Claude Native Agents (`.claude/agents/*.md`)
- **Purpose**: Direct integration with Claude Code's sub-agent system
- **Content**: Full MD content with YAML frontmatter
- **Maintenance**: Auto-generated from MD files
- **Size**: Full content (no token limits in Claude sub-agents)

## How Sub-Agents Work

### Automatic Generation
When you modify any agent in `ai-agents/*.md`:
1. File system hooks detect the change
2. JSON converter creates token-optimized version
3. Claude agent converter creates native sub-agent
4. All three formats stay synchronized

### YAML Frontmatter
Each Claude sub-agent includes:
```yaml
---
name: agent_name
description: Brief description of agent capabilities
tools: List, Of, Tools, The, Agent, Uses
---
```

### Tool Mappings
Tools are automatically assigned based on agent type:
- **Development agents**: Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS
- **Research agents**: WebSearch, WebFetch, Read, Write, Grep
- **Documentation agents**: Read, Write, Edit, Grep, Glob
- **Management agents**: Read, Write, Edit, TodoWrite

## Using Claude Sub-Agents

### Direct Invocation
In Claude Code, you can invoke agents directly:
```
Use the coder_agent to implement the authentication feature
```

### Parallel Execution
Multiple sub-agents can work simultaneously:
```
Use research_agent for market analysis while finance_agent creates projections
```

### Benefits Over Manual Invocation
1. **Performance**: Native integration is faster
2. **Context**: Each sub-agent has isolated context
3. **Reliability**: No need to manually load agent definitions
4. **Synchronization**: Always uses latest agent version

## Best Practices

### 1. Let the System Handle Updates
- Always edit source files in `ai-agents/*.md`
- Never manually edit `.claude/agents/` or JSON files
- Trust the hook system for synchronization

### 2. Use Appropriate Agents
- Research phase: Use research-focused sub-agents
- Implementation: Use development sub-agents
- Documentation: Use documentation sub-agents

### 3. Leverage Parallel Capabilities
- Identify independent tasks
- Assign to different sub-agents
- Monitor progress via dashboard

## Migration Guide

### For Existing Users
1. Pull latest v4.1.0 release
2. Run `npm run convert-agents-to-claude` to generate initial Claude agents
3. Hooks will maintain synchronization going forward

### For New Users
- Claude agents are pre-generated in releases
- Start using immediately - no setup required

## Performance Benefits

### Token Efficiency
- Main context: Uses JSON (200-500 tokens)
- Sub-agent context: Full definition available
- Result: 30-40% overall token reduction

### Time Savings
- Research: 75% faster (parallel domains)
- Sprints: 60% faster (parallel stories)
- Analysis: 70% faster (parallel categories)

## Troubleshooting

### Claude Agents Not Updating
1. Check hook system is enabled
2. Verify `.claude/agents/` directory exists
3. Run `npm run convert-agents-to-claude` manually
4. Check logs in `hooks/logs/`

### Performance Issues
1. Monitor hook execution time
2. Adjust hook profile if needed
3. Check dashboard for bottlenecks

### Synchronization Problems
1. Verify MD file was saved
2. Check JSON generation succeeded
3. Look for errors in conversion logs
4. Manually trigger conversion if needed

## Technical Details

### Hook Integration
The MD→JSON sync hook (`hooks/handlers/md-json/md-to-json-sync.js`) automatically triggers Claude agent conversion when AI agent files change.

### Converter Script
Location: `machine-data/scripts/md-to-claude-agent-converter.js`
- Parses MD files
- Extracts agent metadata
- Adds YAML frontmatter
- Preserves full content

### Learning System Integration
When the learning system updates agents:
1. MD files are updated
2. Hooks detect changes
3. All formats regenerate
4. Changes propagate to Claude agents

## Future Enhancements

- Custom tool mappings per project
- Agent composition capabilities
- Performance analytics
- Enhanced parallel coordination

## Related Documentation

- `README.md` - Claude Code Native Integration section
- `CLAUDE.md` - Universal Agent Guidelines
- `machine-data/scripts/md-to-claude-agent-converter.js` - Converter implementation
- `hooks/handlers/md-json/md-to-json-sync.js` - Hook integration