---
allowed-tools: Read(*), Write(*), Task(subagent_type:*), Bash(*)
description: Resume from last saved state
argument-hint: "[sprint-name]"
---

# Continue Working

Resume work from the last saved state or a specific sprint.

## Check Arguments

If $ARGUMENTS contains a sprint name, resume that specific sprint.
Otherwise, resume from the most recent workflow state.

## Resume Process

1. **Load State**
   - Read `project-state/workflow-state.json`
   - Identify current phase and progress
   - Load any pending tasks or decisions

2. **Context Restoration**
   - Display brief summary of where we left off
   - Show pending tasks or blockers
   - List available next actions

3. **Resume Workflow**
   - For new project workflow: Continue from current phase
   - For existing project: Resume analysis or implementation
   - For sprint work: Load sprint state and continue tasks

## State Detection

Check for various state indicators:
- Active workflow phase
- Pending approval gates
- In-progress sprints
- Unfinished research
- Incomplete documentation

## Output Format

```
🔄 Resuming Work
===============

📍 Last State:
  Workflow: [Workflow Name]
  Phase: [Current Phase]
  Progress: [X%] complete
  
📝 Pending Items:
  • [Pending task 1]
  • [Pending task 2]
  
Continuing from where you left off...
```

Then continue with the appropriate workflow execution based on the loaded state.