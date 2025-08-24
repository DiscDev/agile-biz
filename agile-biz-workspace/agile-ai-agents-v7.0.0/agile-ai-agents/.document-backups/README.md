# .document-backups Directory

## Purpose
This directory stores automatic backups created during document operations to ensure data integrity and provide rollback capability.

## How It's Used
The Atomic Document Manager (`machine-data/atomic-document-manager.js`) uses this directory for:

### Transaction-Based Backups
- Creates a backup before any document modification
- Each backup is tied to a unique transaction ID
- Enables rollback if operation fails

### Automatic Creation
Backups are created when:
- Documents are edited via the Document Manager
- MD files are converted to JSON
- Batch document operations are performed
- Critical documents are updated

## File Naming Convention
```
[filename].txn-[timestamp]-[random_id].backup
```

Example: `sprint-plan.md.txn-1754017221106-pyf704iin.backup`

## Automatic Cleanup
- Maximum 5 backups per document (configurable)
- Oldest backups are automatically deleted
- Cleanup occurs after successful operations
- Failed operations preserve backups for recovery

## Recovery Process
1. Transaction fails or is interrupted
2. System identifies the transaction ID
3. Locates corresponding backup file
4. Restores original content
5. Removes temporary/partial files

## Important Notes
- **DO NOT** manually modify backup files
- Backups are temporary and not meant for long-term storage
- All files here are gitignored (except this README)
- Empty directory is normal (backups are cleaned up)

## Related Components
- `atomic-document-manager.js` - Creates and manages these backups
- `document-generation-wrapper.js` - Uses for safe document generation
- `.temp-documents/` - Works in conjunction for atomic operations

## Configuration
Located in `atomic-document-manager.js`:
- `maxBackups`: 5 (default)
- `lockTimeout`: 30000ms
- Auto-cleanup: enabled