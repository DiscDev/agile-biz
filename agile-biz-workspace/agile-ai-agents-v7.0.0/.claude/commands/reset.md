---
allowed-tools: Read(*), Write(*), Bash(rm:*, cp:*), Task(subagent_type:project_state_manager_agent)
description: Reset project with confirmation and backup
argument-hint: "[reset-type] or --confirm or --dry-run"
---

# Reset Project

Perform controlled project reset with comprehensive backup and confirmation procedures.

## Reset Types

1. **Soft Reset**
   - Clear logs and temporary files
   - Reset sprint data only
   - Preserve all documents and decisions
   - Maintain system configuration

2. **Medium Reset**
   - Reset all project state
   - Clear sprint and workflow data
   - Preserve documents and decisions
   - Rebuild fresh workflow state

3. **Hard Reset**
   - Complete project reset
   - Remove all generated data
   - Preserve only core configuration
   - Start completely fresh

4. **Factory Reset**
   - Complete system reset
   - Remove all project data
   - Reset to initial installation state
   - Requires complete reconfiguration

## Safety Procedures

1. **Pre-Reset Validation**
   - Confirm reset type and scope
   - Check for unsaved work
   - Verify backup requirements
   - Validate user authorization

2. **Automatic Backup**
   - Create comprehensive backup
   - Include all project data
   - Generate backup metadata
   - Verify backup integrity

3. **Confirmation Process**
   - Display reset impact summary
   - Require explicit confirmation
   - Support dry-run mode
   - Provide cancellation option

## Reset Process

### Dry Run Mode (`--dry-run`)
Show what would be reset without making changes:
```
🔍 DRY RUN: Medium Reset
========================

📁 Files to be removed:
  • project-state/workflow-state.json
  • project-state/logs/ (all files)
  • project-state/checkpoints/ (all files)
  • project-state/sprint-data/ (all files)

📁 Files to be preserved:
  • project-documents/ (all files)
  • project-state/decisions/ (all files)
  • CLAUDE.md
  • Configuration files

⚠️  This operation is reversible via backup restoration.

To proceed: /reset medium --confirm
```

### Confirmation Required (`--confirm`)
Execute reset only with explicit confirmation:
```
⚠️  RESET CONFIRMATION REQUIRED
================================

Reset Type: [Medium Reset]
Impact: Will remove workflow state, logs, and sprint data
Backup: Will be created automatically

🚨 This action will:
  ❌ Clear all sprint progress
  ❌ Reset workflow state
  ❌ Remove execution logs
  ✅ Preserve all documents
  ✅ Preserve all decisions
  ✅ Keep system configuration

Type 'CONFIRM MEDIUM RESET' to proceed: _
```

## Reset Implementation

### Soft Reset Procedure
```bash
# Clear logs and temporary files
rm -rf project-state/logs/*
rm -rf tmp/*
rm -rf cache/*

# Reset sprint data only
rm -rf project-state/sprint-data/*
touch project-state/sprint-data/.keep

# Preserve everything else
echo "Soft reset completed"
```

### Medium Reset Procedure
```bash
# Create backup first
/backup-before-reset "pre-medium-reset-$(date +%Y%m%d-%H%M%S)"

# Remove state and transient data
rm -rf project-state/workflow-state.json
rm -rf project-state/logs/*
rm -rf project-state/checkpoints/*
rm -rf project-state/sprint-data/*

# Initialize fresh state
touch project-state/workflow-state.json
echo '{"phase": "initialization", "progress": 0}' > project-state/workflow-state.json
```

### Hard Reset Procedure
```bash
# Create comprehensive backup
/backup-before-reset "pre-hard-reset-$(date +%Y%m%d-%H%M%S)"

# Remove all generated data
rm -rf project-state/
rm -rf project-documents/
rm -rf project-dashboard/

# Preserve only core files
mkdir -p project-state/decisions
mkdir -p project-state/checkpoints
mkdir -p project-state/logs
touch project-state/.keep
```

## Output Format

```
🔄 PROJECT RESET COMPLETE
=========================

🎯 Reset Type: [Medium Reset]
⏰ Completed: [timestamp]
💾 Backup: backup-pre-reset-20250115-143022

📋 Reset Summary
  ❌ Removed:
    • Workflow state data
    • Sprint execution logs
    • Checkpoint files
    • Temporary cache files
  
  ✅ Preserved:
    • Project documents
    • Decision history
    • System configuration
    • Core templates

📊 Space Freed: [X.X MB]
💾 Backup Size: [Y.Y MB]

🚀 Fresh Start Ready
  • Clean workflow state initialized
  • All agents ready for new work
  • Previous work preserved in backup
  • System health: OPTIMAL

🎯 Next Steps
  1. Run /aaa-status to verify reset
  2. Start fresh project phases
  3. Use /restore-from-backup if needed

Reset successful! System ready for fresh start.
```

## Recovery Options

Always provide recovery information:
- Backup location and restore command
- Partial restoration options
- Manual recovery procedures
- Support contact information

## Reset Validation

After reset completion:
- Verify system functionality
- Test agent communication
- Validate configuration integrity
- Confirm backup accessibility

## Advanced Options

- Selective reset of specific components
- Custom reset procedures
- Scheduled reset operations
- Multi-project reset coordination