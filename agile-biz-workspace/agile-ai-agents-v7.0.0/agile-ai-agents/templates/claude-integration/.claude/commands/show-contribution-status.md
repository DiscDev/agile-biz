---
allowed-tools: [Task]
argument-hint: Contribution type or status filter to display
---

# Show Contribution Status

Display the current status of community contributions, learning integration, and knowledge processing pipeline.

## Usage

```
/show-contribution-status [filter]
```

**Examples:**
- `/show-contribution-status all` - Show all contribution statuses
- `/show-contribution-status pending` - Show pending contributions
- `/show-contribution-status integrated` - Show successfully integrated learnings
- `/show-contribution-status failed` - Show contributions with integration issues

## What This Does

1. **Contribution Pipeline**: Shows all contributions in various processing stages
2. **Integration Status**: Displays which contributions have been successfully integrated
3. **Learning Progress**: Tracks progress of knowledge extraction and integration
4. **Quality Metrics**: Shows success rates and quality indicators
5. **Community Impact**: Displays contribution impact on system improvements

## Status Categories

### Processing Stages
- **Submitted**: New contributions awaiting review
- **Under Review**: Contributions being analyzed for learning potential
- **Learning Extraction**: Patterns being extracted from contributions
- **Integration**: Learnings being integrated into agent knowledge
- **Testing**: Integrated patterns being validated
- **Complete**: Successfully integrated and active
- **Archived**: Contributions processed but no longer active

### Contribution Types
- **Bug Fixes**: Problem resolution contributions
- **Feature Implementations**: New functionality contributions
- **Best Practices**: Process and methodology improvements
- **Performance Optimizations**: Speed and efficiency improvements
- **Security Enhancements**: Security and privacy improvements
- **Documentation**: Knowledge and instruction improvements

## Status Information

### Contribution Overview
```markdown
## Contribution Status Dashboard

**Last Updated**: [Timestamp]
**Total Contributions Tracked**: [Number]
**Processing Success Rate**: [Percentage]
**Average Processing Time**: [Duration]

### Pipeline Status
| Stage | Count | Processing Time | Success Rate |
|-------|-------|----------------|--------------|
| Submitted | [#] | - | - |
| Under Review | [#] | [Avg Time] | - |
| Learning Extraction | [#] | [Avg Time] | [%] |
| Integration | [#] | [Avg Time] | [%] |
| Testing | [#] | [Avg Time] | [%] |
| Complete | [#] | [Total Time] | [%] |
| Failed/Archived | [#] | [Total Time] | [%] |
```

### Individual Contribution Status
```markdown
## Contribution Details

### [Contribution ID]: [Brief Description]
- **Type**: [Bug Fix/Feature/Best Practice/etc.]
- **Status**: [Current Stage]
- **Submitted**: [Date]
- **Progress**: [Percentage Complete]
- **Expected Completion**: [Estimated Date]
- **Learning Value**: [High/Medium/Low]
- **Integration Complexity**: [High/Medium/Low]

**Processing History**:
- [Date]: Submitted by [Contributor]
- [Date]: Review started - [Notes]
- [Date]: Learning extraction began - [Patterns identified]
- [Date]: Integration started - [Target agents]
- [Current]: [Current status and next steps]

**Extracted Learnings**:
- Pattern 1: [Description]
- Pattern 2: [Description]
- Best Practice: [Description]

**Integration Points**:
- Agent [Name]: [How integrated]
- Workflow [Name]: [How enhanced]
- Documentation: [What updated]
```

### Success Metrics
```markdown
## Processing Effectiveness

### Quality Indicators
- **High-Value Contributions**: [Number] ([Percentage] of total)
- **Successfully Integrated**: [Number] ([Percentage] success rate)
- **Active Learnings**: [Number] currently in use
- **Community Satisfaction**: [Rating] (based on feedback)

### Processing Performance
- **Average Review Time**: [Duration]
- **Average Integration Time**: [Duration]
- **Time to Production**: [Duration] (submission to active use)
- **Processing Bottlenecks**: [Main delay factors]

### Impact Measurements
- **System Improvements**: [Number] measurable improvements
- **Bug Prevention**: [Number] bugs prevented by learnings
- **Development Speed**: [Percentage] improvement in velocity
- **Code Quality**: [Percentage] improvement in quality metrics
```

### Issues and Blockers
```markdown
## Current Issues

### Failed Integrations
| Contribution | Failure Reason | Remediation Plan | ETA |
|-------------|----------------|------------------|-----|
| [ID] - [Title] | [Reason] | [Plan] | [Date] |

### Processing Delays
| Contribution | Expected Date | Actual Status | Delay Reason |
|-------------|---------------|---------------|--------------|
| [ID] - [Title] | [Date] | [Status] | [Reason] |

### Quality Concerns
| Contribution | Issue | Impact | Action Needed |
|-------------|-------|--------|---------------|
| [ID] - [Title] | [Issue] | [Impact] | [Action] |
```

## Integration Status Details

### Agent Knowledge Updates
```markdown
## Agent Integration Status

### Recently Updated Agents
- **[Agent Name]**: [Number] new patterns integrated
  - Pattern: [Name] - [Impact]
  - Enhancement: [Description]
  - Status: [Active/Testing/Pending]

- **[Agent Name]**: [Number] workflow improvements
  - Improvement: [Description]
  - Benefit: [Measurable outcome]
  - Status: [Active/Testing/Pending]
```

### System-Wide Improvements
```markdown
## System Enhancements from Contributions

### Documentation Updates
- [Number] pages updated with contribution learnings
- [Number] new best practice guidelines added
- [Number] examples and patterns documented

### Workflow Enhancements
- [Number] workflows improved with contribution insights
- [Number] new automation patterns implemented
- [Number] process optimizations applied

### Tool and Integration Improvements
- [Number] tool integrations enhanced
- [Number] new community-suggested tools evaluated
- [Number] integration patterns refined
```

## Community Feedback Integration

### Contribution Quality Feedback
```markdown
## Community Response

### Highly Rated Contributions
1. **[Contribution Title]** - [Rating]/5
   - Community feedback: "[Quote]"
   - Impact: [Specific improvements]
   - Adoption: [Usage statistics]

### Improvement Suggestions
1. **Processing Speed**: [Community suggestion]
   - Current status: [Implementation progress]
   - Expected improvement: [Outcome]

2. **Integration Quality**: [Community suggestion]
   - Current status: [Implementation progress]
   - Expected improvement: [Outcome]
```

## Health and Performance Indicators

```markdown
## System Health

### Processing Pipeline Health
- **Throughput**: [Contributions per week/month]
- **Backlog Size**: [Number] contributions waiting
- **Processing Capacity**: [Current vs optimal]
- **Resource Utilization**: [Percentage] of available processing power

### Quality Trends
- **Integration Success Rate**: [Trend over time]
- **Community Satisfaction**: [Trend over time]
- **Learning Value Score**: [Average and trend]
- **System Impact Score**: [Average and trend]
```

## Follow-up Actions

Based on contribution status:
- `/learn-from-contributions-workflow [category]` - Process specific contribution types
- `/review-learnings [timeframe]` - Review integrated learnings effectiveness
- `/update-state` - Save contribution status updates
- `/contribute-now` - Submit new contributions or feedback