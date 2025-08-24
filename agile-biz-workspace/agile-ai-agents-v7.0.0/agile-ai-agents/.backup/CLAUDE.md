# CLAUDE.md - Backup Directory Guidelines

## For Claude Code: Backup Operations

### ⚠️ Critical Rules
1. **NEVER delete files here without user confirmation**
2. **ALWAYS create backups here before major operations**
3. **CHECK for existing backups before overwriting**
4. **PRESERVE backup integrity - no modifications**

### When to Create Backups Here
- Before major version upgrades
- Before bulk file operations
- Before irreversible changes
- When user explicitly requests backup
- Before running cleanup scripts

### Backup Naming Conventions
```bash
# Single file backup
[original-name].[YYYY-MM-DD].[HHMMSS].backup

# Directory backup
[directory-name]-backup-[YYYY-MM-DD]/

# Operation-specific backup
[operation]-[timestamp]-backup/

# Checkpoint backup
checkpoint-[YYYY-MM-DD]-[description]/
```

### Recovery Operations
When user needs recovery:
```bash
# List available backups
ls -la .backup/

# Check backup age
stat [backup-file]

# Restore file (with confirmation)
cp .backup/[backup-file] [destination]

# Verify restoration
diff .backup/[backup-file] [restored-file]
```

### Automatic Cleanup Rules
- Keep last 10 manual backups
- Remove backups older than 30 days
- Preserve checkpoints indefinitely
- Clean operation backups after success

### DO NOT Use This Directory For
- Temporary files (use `.temp-documents/`)
- Document operation backups (use `.document-backups/`)
- State backups (use `project-state/backups/`)
- Test files or experiments

### Related Commands
- `/backup` - Create manual backup
- `/restore` - Restore from backup
- `/checkpoint` - Create checkpoint
- `/cleanup-backups` - Remove old backups

### Error Prevention
Before any operation in this directory:
1. Confirm with user if deleting
2. Check available disk space
3. Verify file permissions
4. Test recovery process
5. Document what was backed up