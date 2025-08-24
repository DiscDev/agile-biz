# Sub-Agent System Guide (v4.0.0)

## Overview

The Sub-Agent System enables parallel execution of tasks in AgileAiAgents, dramatically reducing project completion time while maintaining quality. This guide explains how the system works and how to use it effectively.

## Key Benefits

- **60-75% Time Reduction**: Parallel execution for research, development, and analysis
- **Token Efficiency**: 30-40% reduction through isolated contexts
- **Realistic Team Simulation**: Multiple "developers" working simultaneously
- **Quality Maintained**: Validation gates ensure consistency

## Architecture

### Core Components

1. **Sub-Agent Orchestrator** (`machine-data/sub-agent-orchestrator.js`)
   - Manages parallel sub-agent execution
   - Handles session management and coordination
   - Monitors progress and handles errors

2. **Token Budget Manager** (`machine-data/token-budget-manager.js`)
   - Calculates optimal token allocation
   - Tracks usage and enforces limits
   - Provides usage analytics

3. **Document Registry Manager** (`machine-data/document-registry-manager.js`)
   - Hybrid registry approach (central + session-based)
   - Automatic consolidation every 5 minutes
   - Maintains document tracking across sub-agents

## Use Cases

### 1. Research Phase (75% Time Reduction)

**Traditional Approach**: 4-6 hours sequential
**Sub-Agent Approach**: 1-2 hours parallel

```yaml
research_groups:
  market_intelligence:
    - competitive-analysis
    - market-analysis
    - industry-trends
    - customer-research
    
  business_analysis:
    - viability-analysis
    - business-model-analysis
    - pricing-strategy
    - risk-assessment
    
  technical_feasibility:
    - technology-landscape
    - technical-feasibility
    - vendor-supplier-analysis
```

### 2. Sprint Execution (60% Time Reduction)

**Traditional Approach**: Sequential story implementation
**Sub-Agent Approach**: Parallel story development

```yaml
sprint_coordination:
  coder_sub_1:
    stories: [AUTH-001, AUTH-003]
    owned_files: [/api/auth/*, /models/user.js]
    
  coder_sub_2:
    stories: [PROFILE-002]
    owned_files: [/api/profile/*, /components/Profile/*]
    
  coder_sub_3:
    stories: [API-004]
    owned_files: [/api/common/*, /middleware/*]
```

### 3. Project Analysis (70% Time Reduction)

**Traditional Approach**: 2-4 hours sequential
**Sub-Agent Approach**: 30-60 minutes parallel

```yaml
analysis_categories:
  architecture: [code-structure, dependencies, patterns]
  quality: [code-quality, test-coverage, documentation]
  security: [vulnerabilities, auth-patterns, data-handling]
  performance: [bottlenecks, optimization, scalability]
```

## Token Management

### Budget Calculation

```javascript
Base Allocation: 10,000 tokens

Multipliers:
- Research Level: minimal (0.5x), medium (1.0x), thorough (2.0x)
- Complexity: simple (0.8x), standard (1.0x), complex (1.5x)
- Document Count: 1 + (count - 1) * 0.3
- Priority: low (0.7x), medium (1.0x), high (1.3x), critical (1.5x)
```

### Example Allocations

- **Minimal Research**: 15,000 tokens total (5,000 per group)
- **Medium Research**: 30,000 tokens total (10,000 per group)
- **Thorough Research**: 100,000 tokens total (20,000 per group)
- **Sprint Story**: 8,000-15,000 tokens based on complexity

## Code Coordination

### File Ownership Model

To prevent conflicts, the system uses file-level ownership:

1. **Ownership Assignment**: Each sub-agent owns specific files/modules
2. **Read-Only Access**: Can read but not modify other files
3. **Shared Files**: Handled sequentially after parallel phase
4. **Status Tracking**: Real-time updates in `code-coordination.md`

### Coordination Document

```markdown
## File Ownership Map

| File/Module | Owner | Stories | Status | Updated |
|-------------|-------|---------|--------|---------|
| /api/auth/* | coder_sub_1 | AUTH-001 | 🟡 In Progress | 14:30 |
| /api/profile/* | coder_sub_2 | PROFILE-002 | 🟢 Complete | 15:45 |
| /utils/validation.js | orchestrator | SHARED | ⏸️ Waiting | - |
```

## Error Handling

### Failure Modes

1. **Timeout**: Retry once with reduced scope
2. **Token Exhaustion**: Save partial progress, queue continuation
3. **Invalid Output**: Attempt correction, fallback to main agent
4. **Connection Lost**: Wait and retry

### Graceful Degradation

- Sub-agent failures don't block overall progress
- Partial results are preserved and used
- Main agent can take over failed tasks
- User is notified of any degradation

## Registry Management

### Hybrid Approach

```
orchestration/
├── master-document-registry.md        # Consolidated view
├── sub-agent-registries/             # Session-based registries
│   ├── session-2025-01-29-143000/
│   │   ├── research_market_sub.json
│   │   ├── research_business_sub.json
│   │   └── session-summary.json
│   └── _active -> current session
└── registry-consolidation-log.md     # Audit trail
```

### Consolidation Process

1. Sub-agents write to their own registries
2. Every 5 minutes, registries are consolidated
3. Master registry updated with all documents
4. Sessions archived after 24 hours

## Best Practices

### When to Use Sub-Agents

✅ **Good Candidates**:
- Research across multiple domains
- Independent story implementation
- Multi-aspect analysis
- Parallel document generation

❌ **Not Suitable**:
- Highly interdependent tasks
- Sequential workflows
- Tasks requiring shared state
- Simple, quick operations

### Configuration Tips

1. **Token Budgets**: Start conservative, increase based on usage
2. **Concurrency**: Limit to 3-5 sub-agents to avoid overload
3. **Timeouts**: 5 minutes default, adjust for complex tasks
4. **Error Handling**: Enable all safety features initially

## Monitoring and Metrics

### Session Status

```javascript
const status = await orchestrator.getSessionStatus();
// Returns active sub-agents, duration, progress
```

### Usage Report

```javascript
const report = tokenManager.generateUsageReport();
// Shows allocation, usage, efficiency per sub-agent
```

### Registry Statistics

```javascript
const stats = await registryManager.getStatistics();
// Document counts, active sessions, consolidation status
```

## Migration Guide

### Enabling Sub-Agents

1. Update CLAUDE.md with sub-agent configuration
2. Set `sub_agents.enabled: true`
3. Configure token limits and concurrency
4. Test with small tasks first

### Gradual Rollout

1. **Phase 1**: Enable for research only
2. **Phase 2**: Add sprint execution
3. **Phase 3**: Include project analysis
4. **Phase 4**: Full parallel execution

## Troubleshooting

### Common Issues

1. **Token Budget Exceeded**
   - Reduce allocation multipliers
   - Limit document scope
   - Check for infinite loops

2. **Conflicts in Code**
   - Review ownership assignments
   - Ensure no overlapping files
   - Check coordination document

3. **Slow Consolidation**
   - Reduce consolidation frequency
   - Archive old sessions
   - Check registry size

### Debug Mode

Enable debug logging in CLAUDE.md:
```yaml
sub_agents:
  orchestration:
    debug: true
    log_level: "verbose"
```

## Future Enhancements

- Real-time sub-agent communication
- Dynamic token reallocation
- Advanced conflict resolution
- Cross-project sub-agent pooling
- Machine learning for optimal allocation

---

The Sub-Agent System represents a major advancement in AgileAiAgents, enabling true parallel execution while maintaining the quality and consistency users expect. Start with small experiments and gradually expand usage as you become comfortable with the system.