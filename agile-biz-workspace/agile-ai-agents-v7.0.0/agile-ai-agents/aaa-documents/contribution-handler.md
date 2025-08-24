# Contribution Handler Documentation

## Overview
This document defines how the Learning Analysis Agent and other agents handle community contribution triggers and workflows.

## Trigger Event Processing

### Sprint Retrospective Trigger
When `/sprint-retrospective` completes:
1. **Scrum Master Agent** completes retrospective
2. Signals **Learning Analysis Agent** with event:
   ```json
   {
     "event": "sprint_complete",
     "sprint_id": "sprint-2025-01-20-authentication",
     "duration_days": 3,
     "retrospective_insights": ["insight1", "insight2"]
   }
   ```
3. **Learning Analysis Agent** checks:
   - `contribution.enabled` = true
   - `command_triggers.enabled` = true
   - `integrated_commands.sprint_retrospective` = true
   - Sprint duration >= `min_sprint_duration`
4. If all conditions met, schedule prompt

### Milestone Trigger
When `/milestone` executed:
1. **Project Manager Agent** records milestone
2. Signals **Learning Analysis Agent**:
   ```json
   {
     "event": "milestone_reached",
     "description": "Completed MVP with 10 beta users",
     "timestamp": "2025-01-20T10:00:00Z"
   }
   ```
3. Same validation process as sprint
4. Milestone added to contribution context

### Deployment Success Trigger
When `/deployment-success` executed:
1. **DevOps Agent** records deployment
2. Captures metrics and challenges
3. Signals **Learning Analysis Agent**
4. Contribution focuses on deployment insights

### Project Complete Trigger
When `/project-complete` executed:
1. **Project Manager Agent** marks completion
2. Comprehensive project summary generated
3. **Learning Analysis Agent** prepares full contribution
4. Extended reflection time (2x normal delay)

## Prompt Scheduling

### Delay Timer Management
```javascript
// Pseudo-code for delay handling
on_trigger_event(event) {
  if (!should_trigger_contribution(event)) return;
  
  const delay = config.prompt_delay_minutes * 60 * 1000;
  
  // Cancel any existing prompt
  if (pending_prompt_timer) {
    clearTimeout(pending_prompt_timer);
  }
  
  // Schedule new prompt
  pending_prompt_timer = setTimeout(() => {
    show_contribution_prompt(event);
  }, delay);
  
  // Update state
  update_contribution_state({
    pending_prompt: {
      trigger: event.type,
      scheduled_for: new Date(Date.now() + delay)
    }
  });
}
```

### Auto-Prompt Behavior
Based on `auto_prompt_after_command` setting:

**true (automatic)**:
```javascript
show_contribution_prompt(event) {
  display_prompt({
    title: "🎯 Learning Contribution Opportunity",
    message: get_context_message(event),
    options: ["yes", "no", "remind later"]
  });
}
```

**false (manual)**:
```javascript
show_contribution_prompt(event) {
  display_notification({
    message: "💡 Learnings captured. Run /contribute-now when ready."
  });
}
```

**"confirm" (ask first)**:
```javascript
show_contribution_prompt(event) {
  const response = ask_user({
    message: "Would you like to schedule a learning contribution?",
    options: ["yes", "no"]
  });
  
  if (response === "yes") {
    schedule_actual_prompt();
  }
}
```

## Skip Handling

### Skip Command Processing
When `/skip-contribution [reason]` executed:
1. Cancel pending prompt timer
2. Record skip reason
3. Apply skip duration:
   ```javascript
   const skip_durations = {
     "session": "current_session",
     "sprint": "next_sprint_start",
     "day": Date.now() + 24*60*60*1000,
     "permanent": "never"
   };
   ```
4. Update state with skip_until
5. If `remember_skips: true`, analyze patterns

### Skip Pattern Analysis
Track common skip reasons:
- NDA/confidentiality
- Sensitive client data
- Incomplete sprint
- Technical blockers
- Time constraints

## Contribution Content Capture

### Data Collection by Trigger Type

**Sprint Contributions**:
```json
{
  "sprint_metrics": {
    "velocity": 24,
    "planned_vs_actual": 0.8,
    "bug_rate": 0.15,
    "test_coverage_change": "+5%"
  },
  "technical_patterns": ["pattern1", "pattern2"],
  "team_insights": ["insight1", "insight2"],
  "tool_effectiveness": {"tool": "rating"}
}
```

**Milestone Contributions**:
```json
{
  "milestone": "MVP Launch",
  "key_decisions": ["decision1", "decision2"],
  "success_factors": ["factor1", "factor2"],
  "challenges_overcome": ["challenge1", "challenge2"],
  "resources_actual_vs_planned": {}
}
```

**Deployment Contributions**:
```json
{
  "deployment_type": "production",
  "downtime": 0,
  "rollback_required": false,
  "performance_improvements": {},
  "automation_added": ["script1", "script2"],
  "monitoring_setup": ["metric1", "metric2"]
}
```

## Anonymization Process

### Automatic Sanitization
1. **Remove Identifiers**:
   - Names → [PERSON]
   - Emails → [EMAIL]
   - Domains → [DOMAIN]
   - IPs → [IP]

2. **Path Conversion**:
   - `/Users/john/project/` → `./`
   - Absolute → Relative

3. **Secret Scanning**:
   - API key patterns
   - Password patterns
   - Token patterns
   - High entropy strings

4. **Context Preservation**:
   - Keep technical details
   - Maintain problem/solution pairs
   - Preserve metrics and percentages

## Status Display

### `/contribution-status` Implementation
```javascript
show_contribution_status() {
  const status = {
    pending: get_pending_contributions(),
    history: get_contribution_history(),
    current_learnings: get_accumulated_learnings(),
    skip_status: get_skip_info(),
    readiness: calculate_readiness_score()
  };
  
  display_formatted_status(status);
}
```

### Readiness Indicators
- **Green**: Rich learnings ready (>80% score)
- **Yellow**: Some learnings available (40-80%)
- **Red**: Insufficient learnings (<40%)

## Integration Points

### Project State Manager
- Updates contribution_state on all events
- Tracks contribution history
- Maintains skip preferences
- Stores pending prompt info

### Learning Analysis Agent
- Primary handler for all contribution commands
- Manages contribution workflow
- Performs anonymization
- Submits to community system

### Other Agents
- **Scrum Master**: Signals sprint completion
- **Project Manager**: Signals milestones/completion
- **DevOps**: Signals deployment success
- All agents can add insights to contribution pool

## Error Scenarios

### Configuration Conflicts
```
if (config.contribution.enabled === false) {
  log("Contributions disabled - skipping all triggers");
  return;
}

if (config.command_triggers.enabled === false) {
  log("Command triggers disabled - only auto-prompts active");
  // Fall back to time-based or manual triggers
}
```

### Sprint Too Short
```
if (sprint_duration < config.min_sprint_duration) {
  notify("Sprint too short for contribution");
  capture_learnings_without_prompt();
}
```

### No Learnings Available
```
if (accumulated_learnings.length === 0) {
  notify("No significant learnings to contribute yet");
  suggest_actions_to_generate_learnings();
}
```

## Best Practices

1. **Respect User Time**: Honor delay settings and skip preferences
2. **Context Awareness**: Tailor prompts to trigger type
3. **Privacy First**: Always anonymize before showing
4. **Value Focus**: Only prompt when valuable learnings exist
5. **Clear Communication**: Explain what will be shared
6. **Graceful Degradation**: Handle disabled features smoothly

## Testing Contribution Flow

### Manual Test Sequence
```bash
# 1. Complete a sprint
/sprint-retrospective

# 2. Check pending contribution
/contribution-status

# 3. Skip if needed
/skip-contribution "testing flow"

# 4. Record milestone
/milestone "Test milestone for contribution"

# 5. Force immediate contribution
/contribute-now

# 6. Complete project
/project-complete
```

### Configuration Testing
Test different settings:
- `auto_prompt_after_command`: true/false/"confirm"
- Different skip durations
- Various delay times
- Disabled contributions