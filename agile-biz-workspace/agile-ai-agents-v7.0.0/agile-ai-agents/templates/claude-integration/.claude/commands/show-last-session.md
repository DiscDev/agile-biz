---
allowed-tools: Read(*), Glob(*)
description: Display details of the last Claude session
---

# Show Last Session

Display comprehensive information about the most recent Claude session and activities.

## Session Information Gathering

1. **Recent Activity Detection**
   - Check most recently modified files
   - Read latest checkpoint data
   - Review recent log entries
   - Analyze timestamp patterns

2. **Session Data Sources**
   ```
   project-state/checkpoints/ (latest checkpoint)
   project-state/logs/ (session logs)
   project-state/decisions/ (recent decisions)
   project-documents/ (recently modified docs)
   workflow-state.json (last state change)
   ```

3. **Activity Analysis**
   - Identify session duration
   - Track commands executed
   - Note documents created/modified
   - Record decisions made

## Session Report Components

1. **Session Overview**
   - Start and end times
   - Total session duration
   - Commands executed count
   - Files modified count

2. **Activities Summary**
   - Documents created or updated
   - Decisions recorded
   - Phase changes
   - Sprint activities

3. **Progress Made**
   - Tasks completed
   - Milestones reached
   - Blockers addressed
   - Next steps identified

## Output Format

```
📅 LAST SESSION REPORT
======================

⏰ Session Details
  Started: [YYYY-MM-DD HH:MM:SS]
  Ended: [YYYY-MM-DD HH:MM:SS]
  Duration: [X hours Y minutes]
  
🎯 Activities Performed
  • Commands executed: [X]
  • Files modified: [Y] 
  • Decisions made: [Z]
  • Phase: [Current Phase]

📝 Documents Activity
  Created:
    • [document-name-1.md] ([timestamp])
    • [document-name-2.md] ([timestamp])
  
  Modified:
    • [document-name-3.md] ([timestamp])
    • [document-name-4.md] ([timestamp])

🎯 Progress Summary
  ✅ [Completed task 1]
  ✅ [Completed task 2]
  🔄 [In progress task]
  📋 [Next action item]

💭 Recent Decisions
  • [Decision 1] ([timestamp])
  • [Decision 2] ([timestamp])

🔄 Current State
  Phase: [Phase Name]
  Progress: [X%] complete
  Next: [Suggested next action]

Use /continue to resume from where you left off.
```

## Session Reconstruction

1. **Timeline Building**
   - Sort activities by timestamp
   - Group related activities
   - Identify session boundaries
   - Track progression flow

2. **Context Recovery**
   - Determine what was being worked on
   - Identify current focus area
   - Note any blockers or issues
   - Suggest continuation points

## Edge Cases

- **No Recent Activity**: Show last known session
- **Multiple Sessions**: Show most recent complete session
- **Incomplete Session**: Show partial information with notes
- **Missing Data**: Reconstruct from available information

## Session Analytics

- Commands most frequently used
- Average session duration
- Most productive time periods
- Common workflow patterns