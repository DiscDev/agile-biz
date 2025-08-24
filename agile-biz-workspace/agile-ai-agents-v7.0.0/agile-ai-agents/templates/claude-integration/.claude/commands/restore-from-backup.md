---
allowed-tools: Read(*), Write(*), Bash(cp:*, mv:*, rm:*)
description: Restore project from a backup
argument-hint: "[backup-name]"
---

# Restore From Backup

Restore project state and data from a previously created backup.

## Restore Process

1. **Validate Backup**
   - Check if backup exists in `backups/[backup-name]/`
   - Verify backup metadata and integrity
   - Confirm backup is complete

2. **Pre-Restore Safety**
   - Create emergency backup of current state
   - Check for unsaved changes
   - Warn about data loss

3. **Restoration Steps**
   - Stop any active processes
   - Clear current project data
   - Restore from backup archive
   - Verify restoration integrity

## Backup Selection

Parse $ARGUMENTS for backup selection:
- Specific backup name: Use exact backup
- No arguments: Show available backups and prompt
- `--latest`: Use most recent backup
- `--list`: Show all available backups

## Available Backups Display

```
📦 Available Backups
===================

🗓️  backup-2025-01-15-143022    25.6 MB    (pre-reset backup)
🗓️  backup-2025-01-14-091545    23.1 MB    (milestone checkpoint)
🗓️  backup-2025-01-13-170030    21.8 MB    (sprint completion)
🗓️  backup-custom-name          28.3 MB    (manual backup)

Use: /restore-from-backup [backup-name]
```

## Restoration Components

1. **Project State**
   - Restore workflow-state.json
   - Recover all checkpoints
   - Restore sprint data
   - Recover decision history

2. **Documentation**
   - Restore all project documents
   - Recover business specifications
   - Restore technical documentation
   - Recover research reports

3. **Configuration**
   - Restore CLAUDE.md files
   - Recover agent settings
   - Restore environment configuration

## Validation Checks

1. **Pre-Restore Validation**
   - Verify backup exists and is readable
   - Check backup integrity checksum
   - Confirm sufficient disk space

2. **Post-Restore Validation**
   - Verify all critical files restored
   - Check file permissions
   - Validate workflow state integrity
   - Test system functionality

## Output Format

```
♻️  BACKUP RESTORED
===================

📦 Backup: [backup-name]
📍 Source: backups/[backup-name]/
⏰ Created: [backup-timestamp]

🔄 Restoration Summary
  ✅ Project State Restored
  ✅ Documentation Recovered  
  ✅ Configuration Applied
  ✅ Decision History Restored

📊 Files Restored: [X files]
💾 Data Size: [Y.Y MB]
🔍 Integrity: VERIFIED

⚠️  Emergency backup saved as: emergency-[timestamp]

Project restored successfully!
Use /aaa-status to verify system state.
```

## Error Handling

- Handle missing backup gracefully
- Report corruption issues clearly
- Preserve current state if restoration fails
- Offer partial restoration options
- Guide user to manual recovery steps

## Safety Features

- Always create emergency backup first
- Validate backup before starting restoration
- Stop on first sign of corruption
- Preserve logs of restoration process