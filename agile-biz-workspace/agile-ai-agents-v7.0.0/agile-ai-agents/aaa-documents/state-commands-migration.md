# State Commands Migration Guide

## Overview
This guide helps users transition from natural language state commands to the new command-based system.

## Command Mappings

### Old Format → New Command

| Natural Language | New Command | Notes |
|-----------------|-------------|-------|
| "Checkpoint now" | `/checkpoint` | Creates manual save point |
| "Checkpoint now with summary: [text]" | `/checkpoint "[text]"` | Custom message |
| "Where are we?" | `/status` | Comprehensive status |
| "Continue working" | `/continue` | Resume last session |
| "Continue working on [sprint]" | `/continue [sprint]` | Resume specific sprint |
| "Update project state: [details]" | `/update-state "[details]"` | Manual state update |
| "Save decision: [text]" | `/save-decision "[text]"` | Record decision |
| "What did we do last session?" | `/status` | Included in status output |
| "Show learnings" | `/show-learnings` | Display insights |

## New Features Not Previously Available

### Enhanced Checkpoint Options
- `/checkpoint --full` - Forces full checkpoint regardless of settings
- `/checkpoint "message" --full` - Combines custom message with full checkpoint

### Better Decision Tracking
- `/save-decision "decision" "rationale"` - Now supports separate rationale
- Automatic save triggering based on decision count

### Improved Status Display
- `/status` now shows:
  - Last save timestamp
  - Workflow phase progress
  - Formatted task lists
  - Next suggested actions

## Configuration Migration

### Auto-Save Settings
Previously, auto-save was configured but not active. Now you can control it:

1. **Choose a frequency preset**:
   ```yaml
   frequency_preset: "balanced"  # Options: aggressive, balanced, minimal, manual
   ```

2. **Or customize individual triggers**:
   ```yaml
   save_frequency:
     document_creation: true
     section_completion: true
     phase_transitions: true
     time_interval: 30
     decision_threshold: 5
   ```

### Confirmation Styles
Control how much feedback you get:
- `silent` - No confirmations
- `minimal` - Simple "✓ State saved"
- `verbose` - Detailed save information

## Migration Steps

### For Existing Projects

1. **Update your workflow**:
   - Replace "Where are we?" with `/status`
   - Replace "Checkpoint now" with `/checkpoint`
   - Use `/continue` to resume work

2. **Configure auto-save**:
   - Check CLAUDE.md for current settings
   - Adjust frequency_preset if needed
   - Test with a manual `/checkpoint`

3. **Adopt new patterns**:
   - End sessions with `/checkpoint "summary"`
   - Start sessions with `/continue`
   - Track decisions with `/save-decision`

### For New Projects

Start fresh with commands:
1. `/start-new-project-workflow` or `/start-existing-project-workflow`
2. Auto-save will work throughout the workflow
3. Use `/status` to check progress
4. Use `/checkpoint` before major milestones

## Common Scenarios

### Scenario 1: End of Day
**Old way**:
```
"Checkpoint now with summary: Completed auth feature, need to fix OAuth tomorrow"
```

**New way**:
```
/checkpoint "Completed auth feature, need to fix OAuth tomorrow"
```

### Scenario 2: Resuming Work
**Old way**:
```
"Where are we?"
"Continue working from yesterday"
```

**New way**:
```
/status
/continue
```

### Scenario 3: Recording Decisions
**Old way**:
```
"Save decision: Chose PostgreSQL over MySQL for better JSON support"
```

**New way**:
```
/save-decision "Use PostgreSQL for database" "Better JSON support than MySQL"
```

## Troubleshooting

### Auto-save not working?
1. Check `frequency_preset` in CLAUDE.md
2. Ensure it's not set to "manual"
3. Verify `auto_save.enabled: true`

### Commands not recognized?
1. Ensure you're using forward slash: `/status`
2. Check spelling exactly
3. Use `/aaa-help` to see all commands

### State not persisting?
1. Check for save confirmations
2. Use `/checkpoint --full` to force save
3. Verify project-state directory exists

## Benefits of New System

1. **Consistency**: All actions use same pattern
2. **Discoverability**: `/aaa-help` shows everything
3. **Reliability**: Auto-save actually works
4. **Flexibility**: Configure to your preference
5. **Clarity**: No ambiguity in commands

## Getting Help

- `/aaa-help` - See all commands
- `/aaa-help [command]` - Detailed command help
- `/quickstart` - Interactive menu

Remember: The old natural language commands may still work for compatibility, but the new command system is more reliable and feature-rich.