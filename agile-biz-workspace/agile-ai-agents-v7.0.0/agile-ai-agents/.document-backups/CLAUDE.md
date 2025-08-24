# CLAUDE.md - Document Backups Directory

## For Claude Code: Atomic Document Operations

### ⚠️ Critical Understanding
This directory is **automatically managed** by `atomic-document-manager.js`. 
- Files here are **transaction-specific**
- Backups are **temporary** (auto-cleaned)
- Maximum 5 backups per document
- **DO NOT manually manage** unless recovering from failure

### How Backups Work Here
```javascript
// Automatic backup creation flow:
1. Start transaction → Create backup
2. Modify document → Backup preserved
3. Success → Old backups cleaned (keep 5)
4. Failure → Backup used for recovery
```

### File Format
```
[document].txn-[timestamp]-[txn-id].backup
```
- `txn-` prefix = transaction backup
- timestamp = milliseconds since epoch
- txn-id = unique transaction identifier

### When You See Files Here
**Normal**: Empty or few recent backups
**Warning**: Many old files (>1 hour)
**Error**: Files with same timestamp (interrupted operation)

### Recovery Scenarios

#### Interrupted MD→JSON Conversion
```bash
# Check for orphaned backups
ls -la .document-backups/*.md.txn-*.backup

# Identify the original file
# [filename].md.txn-[timestamp]-[id].backup → [filename].md

# Restore if needed (with user confirmation)
cp .document-backups/[backup-file] [original-path]
```

#### Failed Batch Operation
```bash
# Find all backups from same timestamp
ls -la .document-backups/*.txn-175401*

# These are related - restore as a set
```

### Automatic Cleanup
The system automatically:
- Removes backups after successful operations
- Keeps maximum 5 backups per document
- Cleans orphaned files >1 hour old
- Preserves backups from failed operations

### DO NOT
- Create manual backups here (use `.backup/`)
- Modify backup files directly
- Delete recent backups (<1 hour)
- Rename backup files
- Use for long-term storage

### Integration Points
- `atomic-document-manager.js` - Creates/manages
- `document-generation-wrapper.js` - Uses for safety
- MD→JSON converter - Transaction backups
- Batch operations - Multi-file backups

### Error Messages You Might See
- "Transaction failed, backup preserved" - Check here for recovery
- "Backup cleanup failed" - May have permission issues
- "Maximum backups exceeded" - Auto-cleanup may have failed

### Best Practices
1. Let the system manage this directory
2. Only intervene for recovery operations
3. Always confirm with user before restoring
4. Check transaction IDs match when recovering
5. Clean orphaned files >1 day old

### Related Files to Check
- `machine-data/atomic-document-manager.js` - Main logic
- `logs/document-operations.log` - Transaction logs
- `.temp-documents/` - Corresponding temp files