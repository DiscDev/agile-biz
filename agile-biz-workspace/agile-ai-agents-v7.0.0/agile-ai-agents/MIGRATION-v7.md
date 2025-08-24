# Migration Guide to v7.0.0

## Breaking Changes

AgileAiAgents v7.0.0 introduces a completely new state management system that is **not backwards compatible**.

### What Changed

**Before (v6.x):** 20+ separate state files scattered across multiple directories
**After (v7.0.0):** 3 clean state files in project-state/

### New Three-File Structure

```
project-state/
├── runtime.json         # Current workflow state (resets on new workflow)
├── persistent.json      # History and metrics (survives resets)  
└── configuration.json   # All settings (ships with defaults)
```

## Migration Steps

### For New Users
1. Download v7.0.0 release
2. Start using - configuration.json ships with sensible defaults
3. Other state files created automatically on first workflow

### For Existing Users

**Option 1: Fresh Start (Recommended)**
1. Back up your current project-state/ directory
2. Download v7.0.0 release
3. Start fresh with new workflows
4. Your old decisions and documents remain in project-documents/

**Option 2: Manual Migration**
1. Your old state files are automatically backed up as `.v6.backup`
2. Decisions from `decisions-log.json` can be manually copied to persistent.json
3. Configuration settings need to be manually transferred to configuration.json

## New Commands

- `/aaa-config` - Manage all configuration settings
- `/reset-project-state` - Reset state with various options

## Configuration Changes

All configuration is now in `project-state/configuration.json`:
- No more YAML blocks in CLAUDE-config.md
- Single source of truth for all settings
- Modified via `/aaa-config` command

## What Ships in Clean Slate

```
project-state/
├── configuration.json   # Complete default settings
└── README.md           # Documentation
```

No more pre-populated states or TEMPLATE_TIMESTAMP issues!

## Backup Location

If you had existing state files, they're backed up in:
- Individual files: `*.v6.backup` in their original locations
- Complete backup: `project-state-backup-v6/` directory

## Getting Help

1. Check project-state/README.md for state structure details
2. Use `/aaa-config` to view and modify settings
3. Use `/reset-project-state --help` for reset options
4. Report issues at: https://github.com/anthropics/claude-code/issues

---

**AgileAiAgents™** v7.0.0 - Created by Phillip Darren Brown (https://github.com/DiscDev)