---
allowed-tools: Read(*), Write(*), Task(subagent_type:scrum_master_agent), Task(subagent_type:project_manager_agent)
description: Show current sprint progress and status
---

# Sprint Status Dashboard

Display comprehensive current sprint progress, blockers, and metrics.

## Status Analysis Process

1. **Sprint Detection**
   - Find active sprint in `project-documents/orchestration/sprints/`
   - Read sprint state from `state.md`
   - Load sprint planning documents

2. **Progress Calculation**
   - Calculate completed story points vs. total
   - Track individual backlog item progress
   - Assess sprint velocity and burndown
   - Identify blockers and risks

3. **Team Performance Metrics**
   - Days remaining in sprint
   - Average completion rate
   - Story point velocity
   - Quality metrics (test coverage, bugs)

4. **Status Categories**
   ```
   🟢 On Track    - Sprint progressing well, no major issues
   🟡 At Risk     - Some delays but recoverable
   🟠 Behind      - Significant delays, scope adjustment needed  
   🔴 Critical    - Major issues, sprint goal at risk
   ```

## Sprint Progress Display

```
📊 Sprint Status Dashboard
==========================

🚀 Sprint: [Sprint Name]
📅 Duration: Day [X] of [Y] ([Z] days remaining)
🎯 Sprint Goal: [Goal description]

Progress Overview:
├── Story Points: [X]/[Y] completed ([Z]% done)
├── Backlog Items: [A]/[B] finished
├── Sprint Health: [🟢🟡🟠🔴] [Status]
└── Velocity: [X] points/day (target: [Y])

Backlog Items Status:
  ✅ [Item 1] - 8 points - COMPLETED
  🏗️ [Item 2] - 5 points - IN PROGRESS (80%)
  ⏸️ [Item 3] - 3 points - BLOCKED
  📋 [Item 4] - 2 points - TODO

Active Blockers:
  🚨 [Blocker 1] - Affects Item 3
  ⚠️ [Blocker 2] - Risk to Item 4

Sprint Burndown:
  Day 1: [X] points remaining
  Day 2: [Y] points remaining  
  Day 3: [Z] points remaining (today)
  Target: [W] points remaining
```

## Detailed Analysis

The scrum_master_agent will provide:
- **Burndown Chart**: Visual progress representation
- **Velocity Tracking**: Sprint-over-sprint comparison
- **Risk Assessment**: Potential issues and mitigation
- **Recommendations**: Actions to get sprint back on track

The project_manager_agent will analyze:
- **Resource Utilization**: Team capacity and allocation
- **Dependency Management**: Cross-team blockers
- **Scope Management**: Potential scope adjustments
- **Stakeholder Impact**: Communication requirements

## Output Format

```
📈 Sprint Health: [Status Icon + Description]
⏱️ Time Remaining: [X] days
🎯 Goal Achievement: [X]% likely
💡 Next Actions: [Key recommendations]

Use /task-complete to mark items finished
Use /sprint-review when sprint is complete
Use /update-state to log progress updates
```

Coordinate with scrum_master_agent for velocity analysis and project_manager_agent for resource planning.