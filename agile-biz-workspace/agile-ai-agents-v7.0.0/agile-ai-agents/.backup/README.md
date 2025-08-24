# .backup Directory

## Purpose
This directory serves as the general backup storage location for the AgileAiAgents system.

## How It's Used
- **Manual Backups**: Stores user-initiated backups created via commands
- **System Backups**: Holds system-generated backups during major operations
- **Version Snapshots**: Contains snapshots before major updates or migrations
- **Recovery Files**: Preserves critical files before risky operations

## Automatic Management
- Files in this directory are automatically ignored by git (except this README)
- Backups may be automatically cleaned up based on age or count
- The system may create subdirectories for organization

## File Naming Convention
Backup files typically follow patterns like:
- `[filename].[timestamp].backup`
- `[operation]-backup-[date]/`
- `checkpoint-[id]/`

## Recovery
To restore from a backup:
1. Locate the appropriate backup file
2. Verify its integrity
3. Copy/move to replace the current file
4. Remove the backup after successful restoration

## Important Notes
- **DO NOT** manually delete files unless you're certain they're no longer needed
- Backups are not synced to git (by design)
- This directory should persist even if empty
- Maximum backup retention varies by operation type

## Related Systems
- `.document-backups/` - Specific to document operations
- `.temp-documents/` - Temporary file staging
- `project-state/backups/` - State-specific backups