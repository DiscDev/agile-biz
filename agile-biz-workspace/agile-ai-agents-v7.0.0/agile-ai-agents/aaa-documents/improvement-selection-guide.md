# Improvement Selection Guide

## Overview

The Improvement Selection System gives stakeholders complete control over which improvements to implement after the existing project analysis phase. This ensures resources are focused on the most valuable improvements aligned with business goals.

## How It Works

### 1. Analysis Phase
The system first analyzes your existing codebase to identify:
- Security vulnerabilities
- Performance bottlenecks
- Technical debt
- Testing gaps
- Modernization opportunities
- Feature enhancements

### 2. Smart Grouping
Related improvements are automatically grouped together for better organization:
- **Dependency-based**: Items that depend on each other
- **Component-based**: Items affecting the same components
- **Theme-based**: Logically related improvements

### 3. Interactive Selection
You're presented with an interactive interface to:
- Review all identified improvements
- Select which ones to implement
- Defer items for future consideration
- Set implementation priorities

### 4. Sprint Generation
Selected improvements are automatically:
- Organized into manageable sprints
- Prioritized based on your preferences
- Scheduled with realistic timelines
- Documented with clear implementation plans

## Command Options

### Basic Commands
```bash
# Run existing project workflow with improvement selection
/existing-project-workflow

# Re-prioritize improvements mid-workflow
/existing-project-workflow --reprioritize

# View deferred improvements
/existing-project-workflow --show-deferred
```

## Selection Interface

### Categories
Improvements are organized by category:
- 🔴 **Critical Security**: Immediate vulnerabilities
- ⚡ **Performance**: Speed and efficiency improvements
- 🏗️ **Technical Debt**: Code quality improvements
- ✨ **Features**: New functionality
- 🚀 **Modernization**: Technology updates
- 🧪 **Testing**: Coverage improvements
- 📚 **Documentation**: Documentation updates

### Selection Options
During selection, you can:
- Select individual improvements
- Select entire groups
- Use quick commands:
  - `all` - Select all improvements
  - `critical` - Select critical security items only
  - `quick` - Select low-effort items only
  - `none` - Defer all improvements

### Priority Setting
After selection, set priorities:
- Number items in order of importance
- System respects dependencies automatically
- Can be changed later with `--reprioritize`

## Risk Management

### Critical Item Deferral
When deferring critical security items:
1. System warns about risks
2. Requires explicit acknowledgment
3. Documents reason for deferral
4. Sets automatic review date

### Deferred Items Tracking
All deferred items are:
- Saved with reasons
- Given review dates
- Monitored for overdue reviews
- Can be moved to backlog anytime

## Dashboard Integration

### ImprovementBacklog Component
Real-time tracking of:
- Selected improvements
- Sprint progress
- Completion status
- Time estimates

### DeferredItems Component
Monitor deferred items:
- Review dates
- Risk indicators
- Quick actions to add to backlog

## Best Practices

### Selection Strategy
1. **Address Critical First**: Security vulnerabilities should rarely be deferred
2. **Group Related Items**: Select entire groups for cohesive improvements
3. **Balance Effort**: Mix quick wins with larger improvements
4. **Consider Dependencies**: System handles these automatically

### Sprint Planning
- Default capacity: 80 hours per sprint
- 2-week sprint cycles
- Automatic dependency ordering
- Built-in risk mitigation

### Continuous Improvement
- Review deferred items regularly
- Re-prioritize as needed
- Track completion metrics
- Learn from each sprint

## Example Workflow

```bash
# 1. Start existing project analysis
/existing-project-workflow

# 2. System analyzes code (30min-2hrs)
# 3. Stakeholder interview
# 4. Deep analysis based on selected level

# 5. IMPROVEMENT SELECTION PHASE
#    - View categorized improvements
#    - Select items to implement
#    - Set priorities
#    - System generates sprints

# 6. Implementation begins
#    - Sprint-by-sprint execution
#    - Progress tracking
#    - Continuous monitoring

# 7. Mid-workflow adjustments (if needed)
/existing-project-workflow --reprioritize

# 8. Review deferred items
/existing-project-workflow --show-deferred
```

## State Management

The system maintains state for:
- Selected improvements
- Deferred items with reasons
- Sprint assignments
- Progress tracking
- Priority changes

All state is persisted in:
- `project-state/improvements/selected-improvements.json`
- `project-state/improvements/deferred-improvements.json`
- `project-state/improvements/improvement-backlog.json`

## Troubleshooting

### No Improvements Found
If analysis finds no improvements:
- Check analysis depth settings
- Ensure code is accessible
- Review analysis logs

### Selection Not Saving
Ensure write permissions for:
- `project-state/` directory
- State JSON files

### Dashboard Not Updating
- Check API endpoints are running
- Verify state files are valid JSON
- Restart dashboard server if needed

## FAQ

**Q: Can I change priorities after starting?**
A: Yes, use `/existing-project-workflow --reprioritize`

**Q: What happens to deferred items?**
A: They're saved with review dates and can be added to backlog anytime

**Q: How are dependencies handled?**
A: Automatically ordered within sprints to respect dependencies

**Q: Can I partially select a group?**
A: Yes, you can select individual items from groups

**Q: How many improvements per sprint?**
A: Based on 80-hour capacity, typically 3-10 items depending on complexity

---

For more information, see the main documentation or run `/aaa-help`