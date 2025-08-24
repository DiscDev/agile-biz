# State Commands Template

## Overview
This template defines the behavior and processing for all state management commands.

## Command Implementations

### `/checkpoint [message] [--full]`

**Purpose**: Create a manual checkpoint of current project state

**Processing Steps**:
1. Parse parameters:
   - Extract optional message
   - Check for --full flag
2. Determine save type:
   - If --full OR save_mode is "checkpoint": Create full checkpoint
   - Otherwise: Update current-state.json only
3. Generate checkpoint data:
   - If message provided: Use as description
   - If no message: Auto-generate summary from recent activity
4. Save checkpoint:
   - Location: `project-state/checkpoints/checkpoint-YYYY-MM-DD-HH-MM-SS.json`
   - Include: Current state, decisions, tasks, files modified
5. Display confirmation:
   - Silent: No output
   - Minimal: "✓ Checkpoint created"
   - Verbose: "✓ Checkpoint created: [message/summary]"

**Examples**:
```
/checkpoint
→ Auto-generates summary and creates checkpoint

/checkpoint "Completed authentication feature"
→ Creates checkpoint with custom message

/checkpoint --full
→ Forces full checkpoint even if save_mode is "update"

/checkpoint "Major refactor complete" --full
→ Full checkpoint with custom message
```

### `/status`

**Purpose**: Display comprehensive project status (replaces "Where are we?")

**Display Format**:
```
📊 Project Status
================
Workflow: [Active workflow type]
Phase: [Current phase]
Started: [Timestamp]
Last Save: [Timestamp]

📋 Current Sprint
Sprint: [sprint-name]
Progress: [X]% complete
Active Tasks: [count]

✅ Recent Completions
- [Task 1]
- [Task 2]

🚧 In Progress
- [Current task]
- [Blocked items]

📝 Recent Decisions
- [Decision 1 with rationale]
- [Decision 2 with rationale]

📁 Recent Files
- [File 1] - [Action]
- [File 2] - [Action]

🎯 Next Steps
- [Next action 1]
- [Next action 2]
```

### `/continue [sprint-name]`

**Purpose**: Resume previous work session

**Processing Steps**:
1. If sprint-name provided:
   - Load specific sprint state
   - Show sprint context
2. If no parameter:
   - Load last active state
   - Show general context
3. Display resumption summary:
   - Current task
   - Last activity
   - Any blockers
   - Suggested next action
4. Set working context:
   - Restore workflow state
   - Load recent decisions
   - Prepare for continuation

**Output Example**:
```
📂 Resuming work...
Last Active: Sprint 2025-01-20-authentication
Last Task: Implementing OAuth integration
Status: In Progress
Blocker: Need Google OAuth credentials

Suggested next step: Continue with OAuth implementation once credentials are received
```

### `/update-state [details]`

**Purpose**: Manually update project state with specific information

**Processing Steps**:
1. Parse details string
2. Update relevant state sections:
   - Tasks status
   - Blockers
   - Decisions
   - Progress notes
3. Save to current-state.json
4. Display confirmation based on style

**Example**:
```
/update-state "Completed tasks 1-5, blocked on API key, switching to frontend work"
→ Updates state and shows confirmation
```

### `/save-decision [decision] [rationale]`

**Purpose**: Save important project decision with optional rationale

**Processing Steps**:
1. Create decision object:
   ```json
   {
     "decision": "[decision text]",
     "rationale": "[rationale text]" || "Not specified",
     "timestamp": "[ISO timestamp]",
     "made_by": "stakeholder",
     "context": "[current workflow/phase]"
   }
   ```
2. Add to decisions log
3. Trigger auto-save if decision_threshold reached
4. Display confirmation

**Examples**:
```
/save-decision "Use PostgreSQL for database"
→ Saves decision without rationale

/save-decision "Switch to TypeScript" "Better type safety for large team"
→ Saves decision with rationale
```

### `/show-learnings`

**Purpose**: Display captured learnings from current project

**Display Format**:
```
📚 Project Learnings
===================

🔍 Technical Learnings
- [Learning 1]
- [Learning 2]

🎯 Process Learnings
- [Learning 1]
- [Learning 2]

💡 Best Practices Discovered
- [Practice 1]
- [Practice 2]

⚠️ Pitfalls to Avoid
- [Pitfall 1]
- [Pitfall 2]

Ready for community contribution: [Yes/No]
To contribute: /contribute-learnings
```

## Auto-Save Integration

### Trigger Points
Commands that should trigger auto-save:
- `/checkpoint` - Always saves
- `/update-state` - Always saves
- `/save-decision` - Saves if threshold reached
- Document creation by any agent
- Section approval in interviews
- Phase transitions in workflows

### Confirmation Messages

Based on `confirmation_style` setting:

**Silent** (no output):
- Commands execute without confirmation
- State saves happen invisibly

**Minimal** (default):
- "✓ State saved"
- "✓ Checkpoint created"
- "✓ Decision recorded"

**Verbose**:
- "✓ State saved: Completed authentication section"
- "✓ Checkpoint created: Frontend refactor complete"
- "✓ Decision recorded: Chose PostgreSQL for database"

## Error Handling

### Invalid Parameters
```
❌ Invalid parameter for /checkpoint
Usage: /checkpoint [message] [--full]
Example: /checkpoint "Completed feature" --full
```

### State Not Found
```
⚠️ No previous state found
Would you like to:
1. Start a new project (/start-new-project-workflow)
2. Analyze existing code (/start-existing-project-workflow)
3. Show help (/aaa-help)
```

### Save Failure
```
❌ Failed to save state
Error: [error message]
Try: /checkpoint --full to force a full save
```

## State File Management

### File Locations
- Current state: `project-state/current-state.json`
- Checkpoints: `project-state/checkpoints/`
- Decisions: `project-state/decisions/decisions-log.json`
- Learnings: `project-state/learnings/`

### Cleanup Rules
- Keep last 20 checkpoints (configurable)
- Archive sessions older than 7 days
- Compress old state files
- Never delete manual checkpoints