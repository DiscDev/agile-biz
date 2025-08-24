# CLAUDE.md - Temporary Documents Directory

## For Claude Code: Atomic Write Operations

### ⚠️ Critical Understanding
This is a **staging area** for atomic writes. Files here are:
- **Incomplete** until moved to final destination
- **Temporary** and auto-cleaned
- **Not meant for direct access**
- **Automatically managed** by the system

### How Atomic Writes Work
```javascript
// Never write directly to final location!
// Always use this pattern:
1. Write to .temp-documents/[file].tmp-[id]
2. Validate content completeness
3. Atomically rename to final path
4. Clean up temp file
```

### File Format
```
[filename].tmp-[timestamp]-[random-id]
```
- `.tmp-` prefix = temporary file
- timestamp = creation time
- random-id = collision prevention

### What You'll See Here

#### Normal State: EMPTY
```bash
ls -la .temp-documents/
# Should only show .gitignore, README.md, CLAUDE.md
```

#### During Operations
```bash
# Active document generation
document.md.tmp-1754017221106-abc123  # Currently being written
```

#### Problem Indicators
```bash
# Orphaned files (>1 hour old)
old-doc.md.tmp-1754010000000-xyz789  # Process likely crashed

# Multiple files with same base name
report.md.tmp-1754017221106-abc123
report.md.tmp-1754017221107-def456  # Retry after failure
```

### Recovery Procedures

#### Check for Orphaned Files
```bash
# Find files older than 1 hour
find .temp-documents -name "*.tmp-*" -mmin +60

# These can be safely deleted
rm .temp-documents/*.tmp-* # After user confirmation
```

#### Investigate Recent Failures
```bash
# Check what was being generated
head -20 .temp-documents/[recent-tmp-file]

# May contain valuable content to recover
# But likely incomplete - check carefully
```

### DO NOT
- **Write files here manually**
- **Read files directly from here**
- **Move files from here manually**
- **Assume files here are complete**
- **Keep files here long-term**

### Correct Usage Pattern
```javascript
// RIGHT: Use atomic document manager
const atomicMgr = require('./machine-data/atomic-document-manager');
await atomicMgr.writeDocument(path, content);

// WRONG: Direct write to temp
fs.writeFileSync('.temp-documents/file.tmp', content);
```

### Common Issues

#### "Cannot write to temp directory"
- Check permissions
- Ensure directory exists
- Verify disk space

#### "Temp file already exists"
- Previous operation may have failed
- Check for process still running
- Safe to delete if >1 hour old

#### "Atomic move failed"
- Target directory may not exist
- Permission issues on destination
- Disk space issues

### Cleanup Rules
- Auto-cleanup after successful move
- Orphan cleanup after 1 hour
- Manual cleanup safe for files >1 day
- Never cleanup during active operations

### Related Systems
- `.document-backups/` - Backup before modifications
- `atomic-document-manager.js` - Manages temp files
- File system watchers - May trigger on temp files

### Best Practices
1. Always use atomic operations for documents
2. Never bypass the temp directory for writes
3. Check for orphans during troubleshooting
4. Let system manage cleanup
5. Investigate (don't ignore) persistent files

### Debug Commands
```bash
# Check for active operations
ps aux | grep -E "document|generate|convert"

# Monitor directory during operation
watch -n 1 'ls -la .temp-documents/'

# Check disk space
df -h .

# Verify permissions
ls -ld .temp-documents/
```