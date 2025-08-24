# Community Contribution Commands Template

## Overview
This template defines how community contribution commands work and integrate with the AgileAiAgents workflow.

## Command Behaviors

### `/sprint-retrospective`
**Agent**: Scrum Master Agent
**Purpose**: Conduct sprint retrospective and trigger contribution prompt
**Workflow**:
1. Execute standard retrospective process
2. Generate retrospective document
3. Check contribution configuration:
   - If `integrated_commands.sprint_retrospective: true`
   - And `command_triggers.enabled: true`
   - And sprint duration >= `min_sprint_duration`
4. Schedule contribution prompt:
   - Wait `prompt_delay_minutes` (default: 10)
   - Check `auto_prompt_after_command` setting:
     - `true`: Automatically show contribution prompt
     - `false`: Show message "Run /contribute-now when ready"
     - `"confirm"`: Ask "Would you like to contribute learnings? (yes/no)"

**Example Flow**:
```
You: /sprint-retrospective
AI: Starting sprint retrospective for sprint-2025-01-20-authentication...
[Retrospective process]
AI: Retrospective complete. Key learnings documented.

[If auto_prompt_after_command: true, after 10 minutes]
AI: 🎯 Sprint Contribution Opportunity
    Your sprint had valuable learnings that could help others.
    Would you like to contribute anonymized insights? (yes/no)
```

### `/milestone [description]`
**Agent**: Project Manager Agent
**Purpose**: Record milestone achievement and trigger contribution
**Parameters**: 
- `description` (required) - Description of the milestone achieved

**Workflow**:
1. Record milestone in project state
2. Update milestone tracking document
3. If contribution triggers enabled:
   - Schedule contribution prompt after delay
   - Include milestone context in contribution

**Example**:
```
You: /milestone "Completed MVP with 10 beta users onboarded"
AI: ✅ Milestone recorded: Completed MVP with 10 beta users onboarded
    [If auto-prompt enabled, after delay]
    🎯 Milestone Contribution: Your MVP journey could help others...
```

### `/deployment-success`
**Agent**: DevOps Agent
**Purpose**: Mark successful deployment and trigger contribution
**Workflow**:
1. Record deployment success in project state
2. Update deployment log
3. Capture deployment metrics
4. If contribution triggers enabled:
   - Focus on deployment challenges/solutions
   - Include performance improvements

**Example**:
```
You: /deployment-success
AI: ✅ Deployment marked as successful
    Deployment metrics captured
    [After delay]
    🎯 Deployment Insights: Share what worked in your deployment...
```

### `/project-complete`
**Agent**: Project Manager Agent
**Purpose**: Mark project completion and trigger final comprehensive contribution
**Workflow**:
1. Update project state to complete
2. Generate project summary
3. Trigger comprehensive contribution:
   - Full project learnings
   - Key decisions and outcomes
   - What would you do differently

**Example**:
```
You: /project-complete
AI: 🎉 Project marked as complete!
    Generating comprehensive project summary...
    [After delay]
    🎯 Project Contribution: Your complete project journey...
```

### `/skip-contribution [reason]`
**Agent**: Learning Analysis Agent
**Purpose**: Skip current contribution prompt
**Parameters**:
- `reason` (optional) - Why skipping this contribution

**Workflow**:
1. Cancel pending contribution prompt
2. Record skip with reason
3. Apply skip duration from configuration
4. If `remember_skips: true`, analyze patterns

**Skip Duration Options**:
- `"session"` - Skip for current session only
- `"sprint"` - Skip until next sprint
- `"day"` - Skip for 24 hours
- `"permanent"` - Disable contributions

**Example**:
```
You: /skip-contribution "Client NDA restrictions"
AI: ✓ Contribution skipped. Reason recorded.
    Contributions paused for this session.
```

### `/contribution-status`
**Agent**: Learning Analysis Agent  
**Purpose**: View contribution readiness and history
**Display**:
- Pending contribution prompts
- Contribution history with IDs
- Current project learnings summary
- Readiness indicators
- Skip history if any

**Example Output**:
```
📊 Contribution Status
====================

📋 Pending Contributions:
  - Sprint retrospective (ready in 5 minutes)
  - Milestone achievement (scheduled)

📜 Contribution History:
  - 2025-01-15: Sprint learnings (ID: CLN-2025-0115-A3F2)
  - 2025-01-08: Deployment insights (ID: CLN-2025-0108-B7K9)

🎯 Current Learnings Ready:
  - Authentication implementation patterns
  - Performance optimization techniques
  - Team collaboration improvements

⏭️ Skipped: 1 (Client NDA)

Ready to contribute? Use /contribute-now
```

### `/contribute-now`
**Agent**: Learning Analysis Agent
**Purpose**: Start contribution process immediately without delay
**Workflow**:
1. Cancel any pending delayed prompts
2. Capture current project learnings
3. Run anonymization process
4. Show review screen
5. Submit if approved

**Example**:
```
You: /contribute-now
AI: 🎯 Starting contribution process...
    
    📊 Capturing learnings from:
    - Recent sprint: authentication
    - Decisions made: 12
    - Patterns identified: 5
    
    🔒 Anonymizing data...
    ✓ Removed personal identifiers
    ✓ Converted paths to relative
    ✓ Scanned for secrets
    
    📝 Review your contribution:
    [Shows anonymized content]
    
    Submit this contribution? (yes/no/edit)
```

## Configuration Integration

### Auto-Prompt Behavior
Based on `auto_prompt_after_command` setting:

**true (default)**:
```
[After trigger command and delay]
AI: 🎯 Learning Contribution Opportunity
    [Context-specific message]
    Would you like to contribute? (yes/no)
```

**false**:
```
[After trigger command]
AI: ✓ [Action completed]
    💡 Learnings captured. Run /contribute-now when ready to share.
```

**"confirm"**:
```
[After trigger command]
AI: ✓ [Action completed]
    Would you like to schedule a learning contribution? (yes/no)
    You: yes
    AI: Contribution prompt scheduled for 10 minutes from now.
```

## Contribution Content by Trigger

### Sprint Retrospective Contributions
- Sprint velocity and estimation accuracy
- Technical challenges and solutions
- Team collaboration patterns
- Tool effectiveness
- Process improvements

### Milestone Contributions
- Key decisions that led to success
- Unexpected challenges
- Resource requirements vs estimates
- Stakeholder management insights
- Technical pivots

### Deployment Contributions
- Deployment process improvements
- Performance optimizations
- Security considerations
- Rollback procedures
- Monitoring setup

### Project Complete Contributions
- Full project lifecycle learnings
- Architecture decisions impact
- Team growth and skills
- Budget vs actual analysis
- Future recommendations

## Error Handling

### Sprint Too Short
```
You: /sprint-retrospective
AI: Sprint retrospective complete.
    ⚠️ Sprint duration (1 day) below minimum (2 days) for contribution.
    Learnings captured but contribution not triggered.
```

### Contributions Disabled
```
You: /milestone "Launched v2.0"
AI: ✅ Milestone recorded: Launched v2.0
    ℹ️ Community contributions are currently disabled.
    Enable in CLAUDE.md to share learnings.
```

### No Learnings Available
```
You: /contribute-now
AI: ℹ️ No significant learnings captured yet.
    Contributions are most valuable after:
    - Completing sprints
    - Reaching milestones
    - Successful deployments
```

## Best Practices

1. **Timing**: Let the delay work - reflection improves contribution quality
2. **Context**: Include specific examples and numbers when possible
3. **Honesty**: Share both successes and failures
4. **Privacy**: Always review before submitting
5. **Patterns**: Focus on reusable patterns others can apply

## Integration with Project State

All contribution triggers update project state:
```json
{
  "contribution_state": {
    "last_prompt": "2025-01-20T10:00:00Z",
    "pending_prompt": {
      "trigger": "sprint_retrospective",
      "scheduled_for": "2025-01-20T10:10:00Z"
    },
    "skip_until": null,
    "contribution_history": [
      {
        "id": "CLN-2025-0120-X8M2",
        "trigger": "milestone",
        "submitted_at": "2025-01-20T09:00:00Z"
      }
    ]
  }
}
```