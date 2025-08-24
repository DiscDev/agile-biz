---
allowed-tools: Read(*), Write(*), Bash(cp:*, date:*)
description: Create manual checkpoint of current progress
argument-hint: "[checkpoint-message]"
---

# Create Checkpoint

Save the current project state as a checkpoint for future reference.

## Process Checkpoint

1. **Gather State**
   - Read current `project-state/workflow-state.json`
   - Collect recent modifications
   - Note current phase and progress

2. **Create Checkpoint**
   - Generate timestamp: `YYYY-MM-DD-HHMMSS`
   - Create checkpoint file in `project-state/checkpoints/`
   - Include checkpoint message if provided via $ARGUMENTS

3. **Checkpoint Contents**
   ```json
   {
     "timestamp": "2025-01-01T12:00:00Z",
     "message": "$ARGUMENTS or 'Manual checkpoint'",
     "workflow_state": { ... },
     "documents_created": [...],
     "decisions_made": [...],
     "phase": "current phase",
     "progress": "percentage"
   }
   ```

4. **Backup Critical Files**
   - Copy workflow state
   - Save decisions log
   - Preserve sprint states if active

## Options

Parse $ARGUMENTS for options:
- `--full`: Create comprehensive checkpoint with all documents
- Message text: Use as checkpoint description
- No arguments: Create standard checkpoint

## Output Format

```
✅ Checkpoint Created
====================

📍 Checkpoint ID: checkpoint-2025-01-01-120000
💾 Location: project-state/checkpoints/
📝 Message: [User message or "Manual checkpoint"]

State saved successfully!
Use /continue to resume from this checkpoint.
```

## Error Handling

If checkpoint creation fails:
- Report the error clearly
- Suggest alternative save method
- Ensure no data loss