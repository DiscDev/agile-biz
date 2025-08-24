# Project State Configuration Guide

## Overview
This guide explains how to configure the project state system in AgileAiAgents to control when and how project context is saved, checkpointed, and restored across Claude Code sessions.

## Configuration Location

Project state settings are configured in the **CLAUDE.md** file at the root of your agile-ai-agents directory.

### Location
`agile-ai-agents/CLAUDE.md`

### Configuration Section
```yaml
project_state:
  auto_save:
    enabled: true               # Automatically save state after significant actions
    triggers:                   # Events that trigger automatic state saves
      - task_completion         # When a task is marked complete
      - sprint_changes          # When sprint status changes
      - major_decisions         # When key decisions are made
      - error_occurrences       # When errors occur
      - file_creation          # When new files are created
      - significant_edits      # When major code changes happen
      - milestone_reached      # When project milestones are achieved
      - deployment_complete    # After successful deployments
      - feature_complete       # When features are completed
    debounce_ms: 5000          # Wait 5 seconds before saving (batches rapid changes)
  
  checkpoint:
    auto_checkpoint_interval: 30  # Create checkpoint every 30 minutes
    max_checkpoints: 20          # Keep last 20 checkpoints
    checkpoint_on_phase_change: true  # Create checkpoint when project phase changes
  
  session:
    track_file_access: true     # Track which files are accessed
    max_recent_files: 10        # Number of recent files to track
    preserve_working_directory: true  # Remember working directory between sessions
  
  context:
    max_decisions_in_context: 10  # Number of recent decisions to keep loaded
    compress_old_sessions: true   # Compress sessions older than 7 days
    priority_loading: true        # Use smart context loading priorities
```

## Configuration Options Explained

### auto_save Section

#### enabled
- **Type**: boolean
- **Default**: true
- **Description**: Master switch for automatic state saving
- **Recommendation**: Keep enabled for seamless session continuity

#### triggers
- **Type**: array of strings
- **Description**: Events that trigger automatic state saves
- **Available Triggers**:
  - `task_completion` - When TodoWrite marks a task as completed
  - `sprint_changes` - When sprint status transitions (planning → active → testing, etc.)
  - `major_decisions` - When Project Manager logs key decisions
  - `error_occurrences` - When errors are encountered (helps debug issues)
  - `file_creation` - When new files are created
  - `significant_edits` - When major code changes occur (>50 lines changed)
  - `milestone_reached` - When project milestones are achieved
  - `deployment_complete` - After successful deployments
  - `feature_complete` - When features are marked complete

#### debounce_ms
- **Type**: number (milliseconds)
- **Default**: 5000 (5 seconds)
- **Description**: Delay before saving to batch rapid changes
- **Range**: 1000-30000 (1-30 seconds)
- **Note**: Prevents excessive saves during rapid edits

### checkpoint Section

#### auto_checkpoint_interval
- **Type**: number (minutes)
- **Default**: 30
- **Description**: How often to create automatic checkpoints
- **Range**: 5-120 minutes
- **Note**: Checkpoints are full snapshots for major rollback capability

#### max_checkpoints
- **Type**: number
- **Default**: 20
- **Description**: Maximum number of checkpoints to retain
- **Note**: Older checkpoints are automatically removed

#### checkpoint_on_phase_change
- **Type**: boolean
- **Default**: true
- **Description**: Create checkpoint when project phase changes
- **Phases**: planning → development → testing → deployment → maintenance

### session Section

#### track_file_access
- **Type**: boolean
- **Default**: true
- **Description**: Track which files are read/modified
- **Use**: Helps restore context by showing recent files

#### max_recent_files
- **Type**: number
- **Default**: 10
- **Description**: Number of recent files to track in state
- **Range**: 5-50 files

#### preserve_working_directory
- **Type**: boolean
- **Default**: true
- **Description**: Remember the working directory between sessions
- **Note**: Useful for projects with multiple subdirectories

### context Section

#### max_decisions_in_context
- **Type**: number
- **Default**: 10
- **Description**: Number of recent decisions to keep in active context
- **Note**: Older decisions are archived but still searchable

#### compress_old_sessions
- **Type**: boolean
- **Default**: true
- **Description**: Compress session data older than 7 days
- **Benefit**: Reduces storage while preserving history

#### priority_loading
- **Type**: boolean
- **Default**: true
- **Description**: Use smart context loading based on relevance
- **Note**: Loads most relevant context first within token budget

## State Storage Structure

```
agile-ai-agents/project-state/
├── current-state.json          # Current project state
├── checkpoints/
│   ├── checkpoint-2025-01-10-1030.json
│   ├── checkpoint-2025-01-10-1100.json
│   └── ...
├── session-history/
│   ├── session-abc123.json    # Individual session records
│   ├── session-def456.json
│   └── ...
└── archives/
    └── compressed/             # Compressed old sessions
```

## Quick Commands

These commands work regardless of configuration:

- `"Where are we?"` - Get current state summary
- `"Continue working"` - Resume from last saved state
- `"What did we do last session?"` - Review session history
- `"Checkpoint now"` - Force manual checkpoint
- `"Show learnings"` - Display captured learnings
- `"Restore from checkpoint"` - List and restore from checkpoint

## Best Practices

### 1. Development Projects
```yaml
project_state:
  auto_save:
    enabled: true
    debounce_ms: 5000
  checkpoint:
    auto_checkpoint_interval: 30
    max_checkpoints: 20
```

### 2. Quick Prototypes
```yaml
project_state:
  auto_save:
    enabled: true
    debounce_ms: 10000  # Less frequent saves
  checkpoint:
    auto_checkpoint_interval: 60
    max_checkpoints: 5
```

### 3. Large Team Projects
```yaml
project_state:
  auto_save:
    enabled: true
    debounce_ms: 3000  # More frequent saves
    triggers:
      - task_completion
      - major_decisions  # Important for team coordination
      - error_occurrences
  checkpoint:
    auto_checkpoint_interval: 15  # Frequent checkpoints
    max_checkpoints: 50
```

### 4. Production Deployments
```yaml
project_state:
  auto_save:
    enabled: true
    triggers:
      - deployment_complete  # Critical for deployment tracking
      - error_occurrences
      - major_decisions
  checkpoint:
    checkpoint_on_phase_change: true  # Checkpoint before deployment
```

## Performance Considerations

### Token Usage
- Each state save uses ~500-2000 tokens
- Smart loading reduces context by 80-90%
- Priority loading ensures critical info loads first

### Storage
- Average state file: 50-200KB
- Checkpoint: 100-500KB
- Compression reduces by ~70%

### Speed
- State save: <1 second
- Checkpoint creation: 1-3 seconds
- Context restoration: 3-5 seconds

## Troubleshooting

### State Not Saving
1. Check `enabled: true` in configuration
2. Verify triggers are configured
3. Check file permissions in project-state/
4. Look for errors in logs

### Context Too Large
1. Reduce `max_decisions_in_context`
2. Enable `compress_old_sessions`
3. Reduce `max_recent_files`
4. Enable `priority_loading`

### Checkpoint Issues
1. Check disk space
2. Verify `max_checkpoints` isn't too low
3. Use manual checkpoint command to test
4. Check checkpoint directory permissions

## Migration from Default Settings

If upgrading from default settings:

1. Backup existing project-state directory
2. Add configuration to CLAUDE.md
3. Run "Checkpoint now" to create baseline
4. Test with "Where are we?" command

## External Projects

When using AgileAiAgents in external projects:

1. Copy the project_state configuration to your project's CLAUDE.md
2. Adjust settings based on project needs
3. State will be saved in your project's directory
4. Commands work the same way

## Integration with Other Systems

### Learning Capture
- Milestones trigger learning capture
- State includes learning summaries
- Contribution workflow integrated

### Smart Context Loading
- Works with priority_loading setting
- Optimizes token usage automatically
- Loads based on relevance scores

### Document Creation Tracker
- File creation triggers state saves
- Tracks document genealogy
- Preserves creation context

## Summary

The project state configuration system provides:
- ✅ Flexible trigger configuration
- ✅ Automatic checkpointing
- ✅ Session continuity
- ✅ Smart context management
- ✅ Performance optimization
- ✅ Easy troubleshooting

Proper configuration ensures seamless work continuity across Claude Code sessions, making every session feel like a continuation rather than a restart.