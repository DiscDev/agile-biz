# Contribution Status Template

## Overview
This template defines the output format for the `/contribution-status` command.

## Status Display Format

### Full Status (Rich Learnings Available)
```
📊 Contribution Status
=====================

📋 PENDING CONTRIBUTIONS
  • Sprint retrospective - Ready in 5 minutes
    Sprint: sprint-2025-01-20-authentication
    Duration: 3 days, 12 tasks completed
    
  • Milestone achievement - Scheduled
    Milestone: "Launched MVP with 10 beta users"
    Recorded: 2 hours ago

📜 CONTRIBUTION HISTORY
  ID                     Type          Date         Impact
  ────────────────────────────────────────────────────────
  CLN-2025-0115-A3F2    Sprint        Jan 15       ⭐⭐⭐⭐⭐
  CLN-2025-0108-B7K9    Deployment    Jan 8        ⭐⭐⭐⭐
  CLN-2025-0102-C5P1    Milestone     Jan 2        ⭐⭐⭐

  Total Contributions: 3
  Last Contribution: 5 days ago
  Community Impact Score: 85/100

🎯 CURRENT LEARNINGS (Readiness: 🟢 HIGH)
  
  ✓ Technical Patterns (4)
    - JWT refresh token implementation
    - Optimistic UI update strategy  
    - Webhook retry mechanism
    - Database connection pooling
    
  ✓ Team Insights (3)
    - Pair programming on complex features
    - Daily standups at 10am optimal
    - Code review turnaround < 2 hours
    
  ✓ Performance Improvements (2)
    - 40% API response time reduction
    - 60% build time optimization
    
  ✓ Tool Effectiveness
    - Playwright > Cypress for E2E
    - GitHub Copilot 30% productivity gain

⏭️ SKIP HISTORY
  • Jan 10: Client NDA restrictions (1 time)

💡 NEXT STEPS
  Ready to contribute high-value learnings!
  → Run /contribute-now to start immediately
  → Or wait for scheduled prompt in 5 minutes
```

### Minimal Status (Few Learnings)
```
📊 Contribution Status
=====================

📋 PENDING CONTRIBUTIONS
  None scheduled

📜 CONTRIBUTION HISTORY
  No contributions yet

🎯 CURRENT LEARNINGS (Readiness: 🟡 MEDIUM)
  
  ✓ Technical Patterns (1)
    - Basic CRUD implementation
    
  ✓ Team Insights (1)
    - Remote collaboration working well

💡 NEXT STEPS
  Continue working to accumulate more learnings.
  Contributions are most valuable after:
  • Completing full sprints
  • Reaching project milestones
  • Overcoming technical challenges
```

### No Learnings Status
```
📊 Contribution Status
=====================

📋 PENDING CONTRIBUTIONS
  None scheduled

📜 CONTRIBUTION HISTORY
  No contributions yet

🎯 CURRENT LEARNINGS (Readiness: 🔴 LOW)
  
  No significant learnings captured yet.

💡 NEXT STEPS
  Focus on your project work. Learnings will accumulate as you:
  • Complete development tasks
  • Make architectural decisions
  • Solve technical problems
  • Collaborate with AI agents
  
  The system will prompt you when valuable insights are ready.
```

### Contributions Disabled Status
```
📊 Contribution Status
=====================

⚠️ CONTRIBUTIONS DISABLED
  Community contributions are currently disabled in settings.
  
  To enable:
  1. Update CLAUDE.md
  2. Set community_learnings.contribution.enabled: true
  
  Your learnings are still being captured locally.
```

## Readiness Calculation

### Readiness Score Components
```javascript
readiness_score = {
  technical_patterns: count * 10,      // Max 50
  team_insights: count * 8,           // Max 24
  performance_metrics: count * 8,     // Max 16
  decisions_made: count * 2,          // Max 10
  sprint_completed: hasCompleted * 20, // Max 20
  time_since_last: days * -2          // Penalty
}
```

### Readiness Indicators
- 🟢 **HIGH** (80-100): Rich, valuable learnings ready
- 🟡 **MEDIUM** (40-79): Some learnings, could be richer
- 🔴 **LOW** (0-39): Insufficient learnings for contribution

## Dynamic Elements

### Pending Contributions
Show each pending contribution with:
- Trigger type (sprint/milestone/deployment/project)
- Time until prompt ("Ready in X minutes" or "Scheduled")
- Brief context about the trigger

### Contribution History
- Contribution ID (format: CLN-YYYY-MMDD-XXXX)
- Type of contribution
- Date submitted
- Impact rating (1-5 stars based on community value)

### Current Learnings
Group by category:
- Technical Patterns
- Team Insights  
- Performance Improvements
- Tool Effectiveness
- Architecture Decisions
- Process Improvements

### Skip History
Only show if skips exist:
- Date of skip
- Reason provided
- Frequency (if multiple)

## Special Cases

### Active Sprint
If sprint is active, add:
```
🏃 ACTIVE SPRINT
  Sprint: sprint-2025-01-20-feature
  Progress: 60% (6/10 tasks)
  Days Remaining: 2
  
  Complete sprint for contribution opportunity
```

### Recent Milestone
If milestone recorded < 24 hours ago:
```
🎉 RECENT MILESTONE
  "Launched MVP with 10 beta users"
  Recorded: 2 hours ago
  Contribution prompt scheduled
```

### Blocked Contribution
If contribution was attempted but failed:
```
⚠️ LAST CONTRIBUTION ATTEMPT
  Failed: Network error
  Date: Jan 20, 10:30 AM
  Action: Run /contribute-now to retry
```

## Command Integration

Always end with clear next steps based on status:

**High Readiness**:
- Emphasize immediate contribution value
- Show both immediate and scheduled options

**Medium Readiness**:
- Encourage continued work
- List what would increase value

**Low Readiness**:
- Focus on accumulation guidance
- List specific actions that generate learnings

**Disabled**:
- Clear enable instructions
- Reassure local capture continues