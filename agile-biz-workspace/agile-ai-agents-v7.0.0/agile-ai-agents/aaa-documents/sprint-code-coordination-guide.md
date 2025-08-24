# Sprint Code Coordination Guide

## Overview

The Sprint Code Coordination system enables multiple coder sub-agents to work on different user stories simultaneously during sprint execution, achieving 60% time reduction while preventing merge conflicts through intelligent file ownership assignment.

## How It Works

### 1. Dependency Analysis

When a sprint begins, the system analyzes all stories to identify:
- Which files each story will modify
- Shared dependencies between stories
- Potential conflict points
- Critical files requiring sequential handling

### 2. Ownership Assignment

The system assigns file ownership to prevent conflicts:
- Each coder sub-agent receives exclusive ownership of specific files/modules
- Shared utility files are marked for sequential handling
- Critical configuration files (package.json, etc.) handled by orchestrator
- Read-only access granted for common dependencies

### 3. Parallel Execution

Up to 3 coder sub-agents work simultaneously:
- Each sub-agent implements their assigned stories
- File-level ownership prevents merge conflicts
- Real-time progress tracking in `code-coordination.md`
- Token budget allocated based on complexity

### 4. Integration Phase

After parallel work completes:
- All implementations collected
- Shared files updated sequentially
- Integration tests run
- Final validation performed

## Code Coordination Document

Each sprint maintains a `code-coordination.md` file tracking:

```markdown
## File Ownership Map

| File/Module | Owner | Stories | Status | Updated |
|-------------|-------|---------|--------|---------|
| /api/auth/* | coder_sub_1 | AUTH-001, AUTH-003 | 🟡 In Progress | 14:30 |
| /api/profile/* | coder_sub_2 | PROFILE-002 | 🟢 Complete | 15:45 |
| /utils/validation.js | orchestrator | SHARED | ⏸️ Waiting | - |
```

### Status Legend
- 🔵 Assigned - Work not yet started
- 🟡 In Progress - Active development
- 🟢 Complete - Development finished
- 🔴 Blocked - Requires attention
- ⏸️ Waiting - Pending dependencies

## Implementation Example

### Sprint Backlog
```javascript
const sprintBacklog = [
  {
    id: 'AUTH-001',
    title: 'Implement user registration API',
    storyPoints: 5,
    files: ['/api/auth/register.js', '/models/user.js']
  },
  {
    id: 'AUTH-002',
    title: 'Add OAuth integration',
    storyPoints: 8,
    files: ['/api/oauth/*', '/config/oauth.js']
  },
  {
    id: 'AUTH-003',
    title: 'Create password reset flow',
    storyPoints: 3,
    files: ['/api/auth/reset.js', '/models/user.js']
  }
];
```

### Ownership Assignment Result
```javascript
const ownership = {
  assignments: [
    {
      id: 1,
      stories: ['AUTH-001', 'AUTH-003'],
      ownedFiles: ['/api/auth/*', '/models/user.js'],
      subAgent: 'coder_sub_1'
    },
    {
      id: 2,
      stories: ['AUTH-002'],
      ownedFiles: ['/api/oauth/*', '/config/oauth.js'],
      subAgent: 'coder_sub_2'
    }
  ],
  sharedFiles: ['/models/user.js'],
  conflictResolution: [{
    file: '/models/user.js',
    resolution: 'sequential',
    order: ['AUTH-001', 'AUTH-003']
  }]
};
```

## Benefits

### Time Savings
- **Sequential**: 20 story points = 5 days
- **Parallel**: 20 story points = 2 days
- **Reduction**: 60% faster completion

### Quality Maintained
- No merge conflicts through ownership
- Integration testing after parallel phase
- All tests must pass before completion
- Code review incorporated

### Realistic Simulation
- Multiple "developers" working simultaneously
- File conflicts prevented proactively
- Integration challenges handled systematically
- Team velocity accurately represented

## Best Practices

### Story Planning
1. **Minimize Dependencies**: Plan stories to work on different modules
2. **Clear Boundaries**: Define file ownership clearly
3. **Shared Resources**: Identify shared files early
4. **Critical Paths**: Mark files requiring sequential handling

### During Execution
1. **Monitor Progress**: Check code-coordination.md regularly
2. **Handle Blockers**: Address impediments quickly
3. **Communication**: Sub-agents update status in real-time
4. **Integration Ready**: Ensure clean interfaces between modules

### Integration Phase
1. **Collect All Work**: Gather implementations from all sub-agents
2. **Handle Shared Files**: Update sequentially with care
3. **Run Tests**: Comprehensive integration testing
4. **Validate Completeness**: Ensure all stories implemented

## Configuration

Enable sprint code coordination in CLAUDE.md:

```yaml
sub_agents:
  sprint_execution:
    enabled: true
    parallel_stories: true
    max_parallel_coders: 3
    coordination_doc: "code-coordination.md"
    file_ownership: "exclusive"
    integration_phase: true
    time_reduction: "60%"
```

## Troubleshooting

### Common Issues

**Issue**: Stories have too many overlapping files
**Solution**: Refactor stories to work on separate modules or handle sequentially

**Issue**: Critical file needs updates from multiple stories
**Solution**: Mark as shared file for sequential handling in integration phase

**Issue**: Sub-agent blocked on dependency
**Solution**: Reassign work or provide read-only access to completed modules

**Issue**: Integration tests failing
**Solution**: Review interfaces between modules, ensure compatibility

## Architecture Details

### SprintCodeCoordinator Class
- Manages parallel sprint execution
- Analyzes dependencies and assigns ownership
- Orchestrates sub-agent deployment
- Handles integration phase

### Key Methods
- `analyzeStoryDependencies()` - Identifies conflicts
- `assignFileOwnership()` - Prevents conflicts
- `coordinateSprintExecution()` - Manages parallel work
- `integrateCode()` - Handles integration phase

### Token Management
- Dynamic allocation based on story complexity
- Budget tracking per sub-agent
- Efficient context isolation
- Overall 40% token savings

## Future Enhancements

1. **Automatic Conflict Resolution**: AI-powered merge conflict handling
2. **Dynamic Reallocation**: Reassign work based on progress
3. **Predictive Analysis**: Forecast completion times
4. **Enhanced Visualization**: Real-time progress dashboard

## Related Documentation

- [Sub-Agent System Guide](sub-agent-system-guide.md)
- [Sprint Document Organization](sprint-document-organization-guide.md)
- [Token Budget Management](../machine-data/token-budget-manager.js)
- [Scrum Master Agent](../ai-agents/scrum_master_agent.md)