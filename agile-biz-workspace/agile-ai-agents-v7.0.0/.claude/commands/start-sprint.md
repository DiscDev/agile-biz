---
allowed-tools: Read(*), Write(*), Task(subagent_type:scrum_master_agent), Task(subagent_type:project_manager_agent)
description: Begin a new agile sprint
argument-hint: "[sprint-name]"
---

# Start New Sprint

Initialize a new agile sprint with planning and setup.

## Sprint Setup Process

1. **Sprint Planning**
   - If $ARGUMENTS provided, use as sprint name
   - Otherwise, generate sprint name based on date/goals
   - Create sprint folder: `project-documents/orchestration/sprints/sprint-[name]/`

2. **Backlog Review**
   - Load items from `project-documents/orchestration/product-backlog/backlog-items/`
   - Display prioritized items
   - Guide selection of sprint items

3. **Sprint Goal Definition**
   ```
   Sprint Planning Session
   ======================
   
   Sprint Name: [Name]
   Duration: [1-2 weeks recommended]
   
   Available Backlog Items:
   1. [HIGH] User authentication (8 points)
   2. [HIGH] Database setup (5 points)
   3. [MEDIUM] API endpoints (13 points)
   
   Select items for this sprint (comma-separated numbers):
   ```

4. **Capacity Planning**
   - Calculate total story points
   - Assess feasibility
   - Adjust if needed

5. **Sprint Documentation**
   Create in sprint folder:
   - `sprint-goal.md`: Sprint objectives
   - `selected-backlog-items.md`: Chosen items
   - `capacity-planning.md`: Resource allocation
   - `state.md`: Sprint state tracking

## Sprint Structure

```
sprints/sprint-[name]/
├── planning/
│   ├── sprint-goal.md
│   ├── selected-backlog-items.md
│   └── capacity-planning.md
├── pulse-updates/
│   └── README.md
├── testing/
│   ├── test-plan.md
│   └── test-results.md
├── retrospectives/
│   └── sprint-retrospective.md
└── state.md
```

## Output Format

```
🚀 Sprint Started
================

📋 Sprint: [Name]
🎯 Goal: [Sprint goal]
📊 Capacity: [X story points]

Selected Items:
  ✓ [Item 1] - [X points]
  ✓ [Item 2] - [Y points]
  
Sprint folder created: sprints/sprint-[name]/

Use /sprint-status to track progress
Use /task-complete to mark items done
```

Coordinate with scrum_master_agent and project_manager_agent for proper sprint setup.