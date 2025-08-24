---
allowed-tools: Task(subagent_type:project_state_manager_agent), Read(*), Glob(*)
description: Display current project status and activity
---

Use the Task tool with project_state_manager_agent to provide a comprehensive project status report including:

- Current phase and progress from workflow-state.json
- Recent activity from checkpoints and decisions log
- Active sprint status and progress
- Document summary and recent changes
- Suggested next actions based on current state

Display results in a clear, actionable format with specific next steps.