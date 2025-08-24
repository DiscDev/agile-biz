# Auto-Save Handler Documentation

## Overview
This document defines how the Project State Manager Agent handles automatic state saving based on configured triggers and frequency settings.

## Configuration Reference
Auto-save behavior is controlled by settings in CLAUDE.md:
- `frequency_preset`: aggressive, balanced, minimal, manual
- `save_frequency`: Custom overrides for specific triggers
- `confirmation_style`: silent, minimal, verbose
- `save_mode`: update, checkpoint, hybrid

## Trigger Points

### 1. Document Creation
**Trigger**: Any agent creates a .md file in project-documents/
**Detection**: Watch `project-documents/**/*.md` for new files
**Action**:
```json
{
  "trigger": "document_creation",
  "file": "[filepath]",
  "created_by": "[agent_name]",
  "timestamp": "[ISO timestamp]"
}
```
**Auto-save**: If `save_frequency.document_creation` is true

### 2. Section Approval
**Trigger**: Stakeholder approves interview section
**Detection**: Approval recorded in interview files
**Action**:
```json
{
  "trigger": "section_approval",
  "section": "[section_name]",
  "approved": true,
  "iterations": [number],
  "timestamp": "[ISO timestamp]"
}
```
**Auto-save**: If `save_frequency.section_completion` is true

### 3. Phase Transitions
**Trigger**: Workflow moves between major phases
**Detection**: `workflow_state.workflow_phase` changes
**Action**:
```json
{
  "trigger": "phase_transition",
  "from_phase": "[previous]",
  "to_phase": "[next]",
  "timestamp": "[ISO timestamp]"
}
```
**Auto-save**: If `save_frequency.phase_transitions` is true
**Special**: If save_mode is "hybrid", create checkpoint

### 4. Research/Analysis Selection
**Trigger**: User selects research or analysis depth
**Detection**: Level selection recorded
**Action**:
```json
{
  "trigger": "depth_selection",
  "type": "research|analysis",
  "level": "minimal|medium|thorough",
  "timestamp": "[ISO timestamp]"
}
```
**Auto-save**: Always (important configuration choice)

### 5. Decision Recording
**Trigger**: `/save-decision` command or inline decision
**Detection**: Decision added to log
**Action**:
```json
{
  "trigger": "decision_recorded",
  "decision": "[text]",
  "rationale": "[text]",
  "decision_count": [total],
  "timestamp": "[ISO timestamp]"
}
```
**Auto-save**: If decision_count >= decision_threshold

### 6. Error Occurrence
**Trigger**: Any caught error or failure
**Detection**: Error handlers activated
**Action**:
```json
{
  "trigger": "error_occurrence",
  "error": "[error message]",
  "context": "[what was happening]",
  "timestamp": "[ISO timestamp]"
}
```
**Auto-save**: Always (preserve error context)

### 7. Time Interval
**Trigger**: Elapsed time since last save
**Detection**: Timer running during active work
**Action**:
```json
{
  "trigger": "time_interval",
  "minutes_elapsed": [number],
  "timestamp": "[ISO timestamp]"
}
```
**Auto-save**: If time_interval > 0 and minutes elapsed

## Confirmation Messages

Based on `confirmation_style` setting:

### Silent Mode
- No output to user
- State saves happen invisibly
- Only errors are reported

### Minimal Mode (Default)
```
✓ State saved
```

### Verbose Mode
```
✓ State saved: Document created - market-analysis.md
✓ State saved: Section approved - Project Vision
✓ State saved: Phase complete - Discovery → Research
✓ State saved: 3 decisions recorded
✓ State saved: Auto-save after 30 minutes
```

## Save Operations

### Update Mode (Default)
- Updates `project-state/current-state.json` only
- Lightweight and fast
- No checkpoint created

### Checkpoint Mode
- Creates full checkpoint in `project-state/checkpoints/`
- Includes complete state snapshot
- Used for manual `/checkpoint` commands

### Hybrid Mode
- Updates current-state.json for most triggers
- Creates checkpoint on phase transitions
- Balances performance with recoverability

## Debouncing

To prevent excessive saves during rapid actions:
- `debounce_ms`: 5000 (5 seconds default)
- Batches multiple triggers within window
- Single save operation after activity settles

## Implementation Logic

```pseudo
on_trigger(event):
  if not auto_save.enabled:
    return
    
  if not should_save_for_trigger(event.type):
    return
    
  add_to_save_queue(event)
  
  if debounce_timer_active:
    reset_debounce_timer()
  else:
    start_debounce_timer()
    
on_debounce_timer_expire():
  events = get_queued_events()
  
  if save_mode == "hybrid" and has_phase_transition(events):
    create_checkpoint(events)
  else:
    update_current_state(events)
    
  show_confirmation(events)
  clear_save_queue()
```

## Frequency Presets

### Aggressive
- Saves on every action
- Minimal data loss risk
- Higher overhead
- Good for critical projects

### Balanced (Default)
- Saves on key actions
- 30-minute intervals
- Reasonable overhead
- Good for most projects

### Minimal
- Only phase transitions
- 60-minute intervals
- Low overhead
- Good for stable projects

### Manual
- No automatic saves
- Only explicit commands
- User full control
- Good for experiments

## Best Practices

1. **For New Projects**: Use "balanced" or "aggressive" during discovery
2. **For Existing Projects**: Use "aggressive" when making changes
3. **For Long Sessions**: Ensure time_interval is enabled
4. **For Critical Work**: Use `/checkpoint` before major changes
5. **For Teams**: Use "verbose" confirmation style

## Error Handling

### Save Failures
- Retry with exponential backoff
- Fall back to checkpoint if update fails
- Alert user on persistent failures
- Log errors for debugging

### Corrupt State
- Validate state before saving
- Keep last known good state
- Provide recovery commands
- Never overwrite with bad data

## Performance Considerations

- State updates are incremental when possible
- Checkpoints are compressed
- Old checkpoints auto-cleaned (keep last 20)
- File watches use efficient observers
- Saves happen asynchronously