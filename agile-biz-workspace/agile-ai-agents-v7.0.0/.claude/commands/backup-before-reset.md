---
allowed-tools: Read(*), Write(*), Bash(cp:*, tar:*, date:*)
description: Create comprehensive backup before project reset
argument-hint: "[backup-name]"
---

# Backup Before Reset

Create a comprehensive backup of all project data before performing a reset operation.

## Backup Process

1. **Generate Backup ID**
   - Create timestamp-based backup name
   - Use custom name from $ARGUMENTS if provided
   - Format: `backup-YYYY-MM-DD-HHMMSS` or custom name

2. **Critical Data Backup**
   ```
   project-state/
   project-documents/
   project-dashboard/
   CLAUDE.md
   decisions-log.json
   workflow-state.json
   ```

3. **Create Backup Structure**
   ```
   backups/
   └── [backup-name]/
       ├── metadata.json
       ├── project-state/
       ├── project-documents/
       ├── project-dashboard/
       └── system-files/
   ```

## Backup Contents

1. **Project State**
   - Complete workflow state
   - All checkpoints
   - Sprint data and progress
   - Decision history

2. **Documentation**
   - All business documents
   - Technical specifications
   - Research reports
   - Meeting notes

3. **Configuration**
   - CLAUDE.md files
   - Agent configurations
   - Workflow settings
   - Environment variables

## Backup Metadata

Create `metadata.json` with backup information:
```json
{
  "backup_id": "[backup-name]",
  "created_at": "2025-01-01T12:00:00Z",
  "reason": "pre-reset backup",
  "project_name": "[project-name]",
  "files_count": 150,
  "size_mb": 25.6,
  "checksum": "sha256-hash"
}
```

## Validation

1. **Verify Backup Integrity**
   - Check file counts match
   - Validate critical files exist
   - Verify backup size is reasonable

2. **Test Restoration Path**
   - Ensure backup can be restored
   - Check permissions are preserved
   - Validate file integrity

## Output Format

```
💾 BACKUP CREATED
=================

📦 Backup ID: [backup-name]
📍 Location: backups/[backup-name]/
📊 Files: [X files, Y.Y MB]

📁 Backed Up Components
  ✅ Project State (workflow, checkpoints)
  ✅ Documentation (business, technical)
  ✅ Configuration (CLAUDE.md, settings)
  ✅ Decision History
  ✅ Sprint Data

🔍 Integrity Check: PASSED
⏰ Created: [timestamp]

Ready for reset operation!
Use /restore-from-backup [backup-name] to restore.
```

## Error Handling

- Report missing critical files
- Handle permission issues gracefully
- Verify disk space before backup
- Create partial backup if full backup fails