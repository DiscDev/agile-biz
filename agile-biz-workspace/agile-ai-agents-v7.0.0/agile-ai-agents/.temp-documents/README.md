# .temp-documents Directory

## Purpose
This directory serves as a staging area for atomic file operations, ensuring that document writes are safe and complete before being moved to their final destination.

## How It's Used
The Atomic Document Manager uses this directory for:

### Atomic Write Operations
1. **Write to Temp**: New content is first written here
2. **Validate**: Content is verified for completeness
3. **Atomic Move**: File is moved to final location
4. **Cleanup**: Temp file is removed

This prevents partial writes from corrupting documents.

### Safe Document Generation
- Agents write documents here first
- MD→JSON conversions use this as workspace
- Batch operations stage files here
- Validates before committing to final location

## File Naming Convention
```
[filename].tmp-[timestamp]-[random_id]
```

Example: `user-guide.md.tmp-1754017221106-abc123`

## Automatic Cleanup
- Files are immediately deleted after successful move
- Orphaned files (>1 hour old) are auto-cleaned
- Failed operations trigger immediate cleanup
- Directory remains empty during normal operation

## Failure Scenarios
If you see files here, it may indicate:
- An operation was interrupted
- A process crashed during document generation
- Network failure during multi-file operation
- System shutdown during atomic write

## Recovery
Orphaned temp files can be:
1. Safely deleted if >1 hour old
2. Inspected for content if recent
3. Manually moved if they contain important data
4. Used to identify failed operations

## Important Notes
- **NEVER** work directly with files in this directory
- Files here are incomplete/temporary
- All contents are gitignored (except this README)
- Empty directory is the normal state

## Related Components
- `atomic-document-manager.js` - Primary user of this directory
- `.document-backups/` - Backup counterpart
- `document-generation-wrapper.js` - Stages documents here

## How Atomic Operations Work
```
1. Create backup in .document-backups/
2. Write new content to .temp-documents/
3. Validate new content
4. Atomically rename to final destination
5. Clean up temp file
6. Clean up old backups (keep max 5)
```

## Configuration
- Cleanup threshold: 1 hour
- Auto-cleanup: enabled
- Used by: All document-generating agents