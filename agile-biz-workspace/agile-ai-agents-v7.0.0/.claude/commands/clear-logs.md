---
allowed-tools: Read(*), Write(*), Bash(rm:*, find:*)
description: Clear all log files and temporary data
---

# Clear Logs

Remove all log files, temporary data, and cached information from the project.

## Log Clearing Process

1. **Identify Log Files**
   - Find all `.log` files in project
   - Locate temporary files in `tmp/` directories
   - Check for cache files and build artifacts

2. **Safe Removal**
   - Preserve configuration files
   - Keep important state files
   - Remove only non-essential log data

3. **Areas to Clear**
   ```
   project-state/logs/
   tmp/
   cache/
   *.log files
   build artifacts
   node_modules/.cache/ (if exists)
   ```

## Removal Process

1. **System Logs**
   - Clear AgileAiAgents execution logs
   - Remove sprint execution logs
   - Clean agent communication logs

2. **Development Logs**
   - Clear build logs
   - Remove test output logs
   - Clean deployment logs

3. **Cache Cleanup**
   - Clear dependency caches
   - Remove temporary build files
   - Clean up session data

## Safety Checks

Before clearing:
- Confirm no important data in logs
- Create backup if logs contain critical info
- Preserve error logs from last 24 hours

## Output Format

```
🧹 LOGS CLEARED
===============

📁 Directories Cleaned
  • project-state/logs/ (15 files removed)
  • tmp/ (8 files removed)
  • cache/ (23 files removed)

📄 Log Files Removed
  • *.log files (12 removed)
  • Build artifacts (5 removed)

💾 Space Freed: [X.X MB]

✅ Log cleanup complete!
```

## Error Handling

- Skip files currently in use
- Report permission issues
- Preserve critical configuration files
- Warn if unable to clear specific locations