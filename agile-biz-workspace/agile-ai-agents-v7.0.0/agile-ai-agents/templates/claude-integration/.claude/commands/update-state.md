---
allowed-tools: Read(*), Write(*), Task(subagent_type:project_state_manager_agent)
description: Manually update project state
---

# Update Project State

Manually update the project state to reflect current progress or corrections.

## Update Process

1. **Load Current State**
   - Read `project-state/workflow-state.json`
   - Display current values for review

2. **Interactive Update**
   Present options to update:
   ```
   Current Project State
   ====================
   
   1. Phase: [current] → Update?
   2. Progress: [X%] → Update?
   3. Sprint: [name] → Update?
   4. Status: [status] → Update?
   5. Blockers: [list] → Add/Remove?
   
   What would you like to update? (1-5)
   ```

3. **Apply Updates**
   - Validate new values
   - Create backup before updating
   - Write updated state to workflow-state.json
   - Log the manual update

4. **Verification**
   - Confirm changes were applied
   - Show before/after comparison
   - Create checkpoint of manual update

## State Fields

Updateable fields include:
- `current_phase`: Workflow phase
- `progress_percentage`: 0-100
- `active_sprint`: Sprint identifier
- `status`: active/paused/blocked/complete
- `blockers`: Array of blocker descriptions
- `last_activity`: Auto-updated timestamp
- `next_action`: Suggested next step

## Output Format

```
🔄 State Updated
===============

📝 Changes Applied:
  Phase: [old] → [new]
  Progress: [old]% → [new]%
  
✅ State saved successfully
📍 Backup created: checkpoint-[timestamp]

Use /aaa-status to view updated state
```

Use Task tool with project_state_manager_agent for complex state management.