# Sub-Agent System Migration Guide (v4.0.0)

## Overview

AgileAiAgents v4.0.0 introduces the revolutionary Sub-Agent System powered by Claude Code's sub-agent capabilities. This guide helps you migrate from v3.x to v4.0.0 and take advantage of 60-78% performance improvements.

## What's New

### Performance Improvements
- **Research**: 75% faster (4-6 hours → 1-2 hours)
- **Sprint Execution**: 60% faster (5 days → 2 days)
- **Project Analysis**: 75% faster (2-4 hours → 30-60 minutes)
- **API Integration**: 78% faster (3-4 hours → 45 minutes)

### New Components
- Sub-Agent Orchestrator
- Token Budget Manager
- Document Registry Manager
- Specialized orchestrators for each workflow

## Migration Steps

### 1. Update AgileAiAgents

```bash
# Download latest release
wget https://github.com/DiscDev/agile-ai-agents/releases/download/v4.0.0/agile-ai-agents-v4.0.0.zip

# Extract to your workspace
unzip agile-ai-agents-v4.0.0.zip -d ~/workspace/
cd ~/workspace/agile-ai-agents
```

### 2. Update CLAUDE.md Configuration

Add the sub-agent configuration to your CLAUDE.md:

```yaml
sub_agents:
  enabled: true                   # Enable sub-agent functionality
  default_mode: "parallel"        # Use parallel execution by default
  
  orchestration:
    max_concurrent: 5             # Maximum sub-agents running simultaneously
    timeout_seconds: 300          # 5 minute timeout per sub-agent
    retry_attempts: 1             # Retry once on failure
```

### 3. Enable Specific Workflows

Choose which workflows to enhance with sub-agents:

```yaml
sub_agents:
  research_phase:
    enabled: true
    time_reduction: "75%"
    
  sprint_execution:
    enabled: true
    max_parallel_coders: 3
    
  project_analysis:
    enabled: true
    analysis_levels:
      standard: ["architecture", "code-quality", "security", "performance", "dependencies", "testing", "technical-debt"]
    
  integration_setup:
    enabled: true
    categories: ["authentication", "payment", "messaging", "storage", "analytics", "ai", "monitoring"]
```

### 4. Update Your Workflows

#### Research Workflow
Before (v3.x):
```
/start-new-project-workflow
[Wait 4-6 hours for sequential research]
```

After (v4.0.0):
```
/start-new-project-workflow --parallel
[Research completes in 1-2 hours with parallel sub-agents]
```

#### Sprint Execution
Before (v3.x):
```
Sprint planning: 5 stories, 20 points
Expected duration: 5 days (sequential)
```

After (v4.0.0):
```
Sprint planning: 5 stories, 20 points
Parallel execution: 2 days (3 coder sub-agents)
Code coordination: Automatic conflict prevention
```

## Configuration Options

### Token Budget Management

Configure token allocation for different task types:

```yaml
sub_agents:
  token_management:
    base_budget: 10000           # Base allocation per sub-agent
    multipliers:
      research_thorough: 2.0     # Double for thorough research
      code_complex: 1.5          # 50% more for complex coding
      analysis_deep: 1.8         # 80% more for deep analysis
```

### Document Registry

Choose registry management approach:

```yaml
sub_agents:
  document_registry:
    type: "hybrid"               # Recommended: central + session-based
    consolidation_interval: 300  # Consolidate every 5 minutes
    archive_after_hours: 24      # Archive old sessions
```

### Error Handling

Configure error handling behavior:

```yaml
sub_agents:
  error_handling:
    retry_on_timeout: true       # Retry failed sub-agents
    save_partial_progress: true  # Keep partial results
    fallback_to_main: true       # Use main agent if all fail
```

## Monitoring Sub-Agent Performance

### Dashboard Integration

The project dashboard now shows sub-agent activity:
- Active sub-agents count
- Progress by workflow
- Token usage per sub-agent
- Time savings metrics

### Log Files

Sub-agent logs are stored in:
```
agile-ai-agents/logs/sub-agents/
├── sessions/
│   └── session-2025-01-29-T10-15-30/
│       ├── orchestrator.log
│       ├── research_sub_1.log
│       ├── research_sub_2.log
│       └── research_sub_3.log
└── registries/
    └── consolidated-registry.json
```

## Best Practices

### 1. Start with Default Settings
The default configuration is optimized for most use cases. Only customize if needed.

### 2. Monitor Token Usage
Sub-agents use tokens more efficiently, but monitor usage during initial runs:
```javascript
// Check token usage
const usage = tokenManager.getSessionUsage();
console.log(`Total tokens used: ${usage.total}`);
console.log(`Average per sub-agent: ${usage.average}`);
```

### 3. Handle Partial Results
Even if some sub-agents fail, you get partial results:
```javascript
// Example: 2 of 3 research groups complete
const results = await orchestrator.executeResearch();
if (results.partial) {
  console.log(`Completed ${results.successful.length} of ${results.total} research groups`);
}
```

### 4. Optimize for Your Workflow
- **Small projects**: Use fewer concurrent sub-agents
- **Large projects**: Increase max_concurrent to 7-10
- **Limited tokens**: Reduce base_budget and use "quick" analysis

## Troubleshooting

### Issue: Sub-agents not launching
**Solution**: Ensure Claude Code has sub-agent support enabled

### Issue: Token budget exceeded
**Solution**: Reduce base_budget or use fewer concurrent sub-agents

### Issue: Slower than expected
**Solution**: Check for file conflicts in sprint execution, reduce parallel stories

### Issue: Registry growing too large
**Solution**: Reduce archive_after_hours to 12 or enable aggressive cleanup

## Rollback Instructions

If you need to disable sub-agents:

```yaml
sub_agents:
  enabled: false  # Disables all sub-agent functionality
```

Or disable specific workflows:
```yaml
sub_agents:
  research_phase:
    enabled: false  # Only disable research sub-agents
```

## Performance Comparison

### Research Phase (Medium Level)
| Metric | v3.x | v4.0.0 | Improvement |
|--------|------|--------|-------------|
| Time | 4-6 hours | 1-2 hours | 75% faster |
| Documents | Sequential | Parallel | Better consistency |
| Token Usage | 40,000 | 24,000 | 40% reduction |

### Sprint Execution
| Metric | v3.x | v4.0.0 | Improvement |
|--------|------|--------|-------------|
| 20 points | 5 days | 2 days | 60% faster |
| Conflicts | Manual | Prevented | Zero conflicts |
| Testing | After all | Continuous | Better quality |

## Getting Help

- **Documentation**: See `aaa-documents/sub-agent-system-guide.md`
- **Examples**: Check `tests/test-all-sub-agents.js`
- **Issues**: Report at https://github.com/DiscDev/agile-ai-agents/issues

## Summary

The v4.0.0 Sub-Agent System dramatically improves AgileAiAgents performance while maintaining quality. With proper configuration, you'll see:

- 60-78% time reduction across all workflows
- Better token efficiency
- Improved output consistency
- Realistic team simulation

Start with default settings and customize as needed for your specific use case.