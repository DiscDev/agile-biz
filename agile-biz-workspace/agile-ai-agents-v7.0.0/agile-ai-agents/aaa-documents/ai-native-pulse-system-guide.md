# AI-Native Sprint Pulse System Guide

## Overview
The AI-Native Sprint Pulse System replaces traditional time-based daily standups with event-driven updates that reflect the continuous, high-speed nature of AI agent operations. This guide documents the system design, implementation, and best practices.

## Key Principles

### 1. Event-Driven, Not Time-Based
- No "morning", "afternoon", or "evening" pulses
- Updates triggered by significant events and milestones
- Reflects AI agents' continuous operation model

### 2. Meaningful Updates Only
- Avoid noise from trivial status changes
- Batch minor events to prevent spam
- Focus on actionable information

### 3. Complete Audit Trail
- Every significant sprint event captured
- Searchable by event type
- Permanent record for learning and analysis

## System Architecture

### Pulse Triggers

#### Always Generate Pulse
```yaml
always_pulse:
  - sprint_started         # Sprint kickoff
  - sprint_phase_change    # planning → active → testing → review
  - story_completed        # Any story point completion
  - blocker_detected       # New impediment found
  - blocker_resolved       # Impediment cleared
  - milestone_reached      # 10%, 20%, 30%... progress
  - critical_failure       # System errors, test failures
  - scope_change          # Stories added/removed
```

#### Batch for Efficiency
```yaml
batch_events:
  window: 60_seconds
  events:
    - subtask_completed    # Small work items
    - status_update        # Progress reports
    - routine_handoff      # Normal agent coordination
```

### Rate Limiting
```yaml
rate_limits:
  min_gap_seconds: 10           # Prevent pulse spam
  batch_window_seconds: 60      # Collect minor events
  priority_override: true       # Critical events bypass limits
```

## File Naming Convention

### Format
```
pulse-YYYY-MM-DD-HHMMSS-[event-type].md
```

### Examples
```
pulse-2025-01-18-142530-sprint-start.md
pulse-2025-01-18-143215-story-done.md
pulse-2025-01-18-144102-blocker-new.md
pulse-2025-01-18-145000-milestone-10pct.md
pulse-2025-01-18-145830-batch-update.md
```

### Event Type Catalog
- `sprint-start` - Sprint initiated
- `sprint-complete` - Sprint finished
- `story-done` - Story completed
- `blocker-new` - Impediment detected
- `blocker-resolved` - Impediment cleared
- `milestone-[N]pct` - Progress milestone (10, 20, 30...)
- `batch-update` - Collection of minor events
- `phase-transition` - Sprint phase change
- `critical-event` - Major issue or failure
- `scope-change` - Sprint scope modified

## Pulse Content Template

```markdown
# Sprint Pulse Update #[sequence]

**Trigger**: [event_that_triggered_pulse]
**Event Type**: [event-type]
**Timestamp**: [ISO-8601 timestamp]
**Sprint Progress**: [X]% ([completed] of [total] story points)

## Current State
- **Active WIP**: 
  - [Story/Task] ([points]) - [percentage]% complete
- **Completed Since Last Pulse**: 
  - ✅ [Completed items]
- **Velocity**: [current velocity] points/hour

## Key Events
- [Detailed description of triggering event]
- [Other significant happenings]

## [Event-Specific Section]
[Varies by event type - see examples below]

## Blockers/Risks
- **Active Blockers**: [count and details]
- **Risks**: [identified risks]

## Next Actions
- [Planned immediate actions]
- [Upcoming milestones or triggers]
```

## Event-Specific Sections

### For Blocker Events
```markdown
## Blocker Details
**Blocker ID**: BLK-[number]
**Affected Story**: [story name and points]
**Impact**: [quantified impact]
**Description**: [detailed explanation]
**Assigned to**: [responsible agent]
```

### For Story Completion
```markdown
## Story Details
**Completed Story**: [name]
- **Points**: [story points]
- **Duration**: [time taken]
- **Agent**: [completing agent]
- **Outcome**: [what was delivered]
```

### For Milestone Events
```markdown
## Milestone Summary
**Progress**: [X] of [Y] story points ([Z]%)
**Time Elapsed**: [duration]
**Projected Completion**: [estimate]
**Status**: [On track/At risk/Behind]
```

## Implementation by Agents

### Scrum Master Agent Responsibilities
1. Monitor all sprint events continuously
2. Evaluate events against trigger criteria
3. Generate pulse updates with appropriate content
4. Manage rate limiting and batching logic
5. Ensure pulse files follow naming convention

### Integration Points
```javascript
// Example pulse generation logic
const sprintPulseManager = {
  evaluateEvent(event) {
    if (this.isAlwaysPulseTrigger(event)) {
      return this.generatePulse(event);
    }
    
    if (this.isBatchableEvent(event)) {
      return this.addToBatch(event);
    }
  },
  
  generatePulse(event) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const filename = `pulse-${timestamp}-${event.type}.md`;
    const content = this.buildPulseContent(event);
    return { filename, content };
  }
};
```

## Migration from Daily Standups

### What Changes
- Remove `daily-updates/` folders
- Rename `sprint-pulse-updates/` to `pulse-updates/`
- Archive any daily standup templates
- Update agent workflows to use event triggers

### What Stays the Same
- Sprint structure and organization
- Velocity tracking and metrics
- Blocker management
- Sprint ceremonies (planning, review, retrospective)

## Best Practices

### DO
- ✅ Generate pulses for significant events
- ✅ Include quantifiable metrics in each pulse
- ✅ Use consistent event types for searchability
- ✅ Batch minor updates to reduce noise
- ✅ Provide actionable next steps

### DON'T
- ❌ Create time-based pulses (morning/evening)
- ❌ Generate pulses for every small change
- ❌ Skip pulses for critical events
- ❌ Use inconsistent naming conventions
- ❌ Include unnecessary detail in batch updates

## Benefits

### For AI Agents
- Natural fit with continuous operation
- No artificial time constraints
- Event-driven aligns with trigger-based processing

### For Stakeholders
- Real-time visibility into sprint progress
- Significant events highlighted immediately
- Complete audit trail of sprint activities
- Easy to search for specific event types

### For Analysis
- Rich data for velocity and pattern analysis
- Blocker resolution time tracking
- Milestone achievement patterns
- Sprint health indicators

## Future Enhancements

### Potential Additions
1. **Pulse Analytics**: Analyze patterns in pulse generation
2. **Auto-Summaries**: Daily digest of pulses for humans
3. **Pulse Alerts**: Notifications for critical events
4. **Visualization**: Timeline view of sprint pulses
5. **ML Insights**: Predict blockers based on pulse patterns

## Conclusion

The AI-Native Sprint Pulse System represents a fundamental shift from time-based to event-based sprint tracking. By aligning with how AI agents actually operate, it provides more meaningful, timely, and actionable updates throughout the sprint lifecycle.

---

**Version**: 1.0.0
**Last Updated**: 2025-01-18
**Maintained by**: Scrum Master Agent