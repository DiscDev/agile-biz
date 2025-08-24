# Release Checklist for v7.0.0

## Pre-Release Verification

### ✅ State Structure
- [x] project-state/ contains only configuration.json and README.md
- [x] templates/clean-slate/project-state/ matches project-state/
- [x] No pre-populated state files in clean-slate
- [x] No TEMPLATE_TIMESTAMP placeholders

### ✅ Commands
- [x] /aaa-config command documented
- [x] /reset-project-state command documented
- [x] Commands added to commands.json registry
- [x] Total command count updated to 94

### ✅ Documentation
- [x] CLAUDE.md updated with v7.0.0 notes
- [x] CLAUDE-config.md references configuration.json
- [x] VERSION.json updated to 7.0.0
- [x] MIGRATION-v7.md created for users
- [x] project-state/README.md explains new structure

### ✅ Code Changes
- [x] workflow-state-handler.js uses three-file structure
- [x] 12 core files updated via migration script
- [x] Legacy compatibility methods added
- [x] Configuration loading from clean-slate

### ✅ Cleanup
- [x] Old state files backed up as .v6.backup
- [x] Project-state matches release state
- [x] Migration script removed
- [x] Test files ready for update

## Testing Required Before Release

### Functional Tests
- [ ] Run /new-project-workflow - verify it creates runtime.json and persistent.json
- [ ] Run /aaa-config - verify configuration viewing/editing works
- [ ] Run /reset-project-state --runtime - verify runtime resets
- [ ] Run /checkpoint - verify checkpoint creation
- [ ] Run /aaa-status - verify status display

### Integration Tests
- [ ] Dashboard displays correctly with new state files
- [ ] Statusline reads from new structure
- [ ] Document creation tracking works
- [ ] Session management functions

### Migration Tests
- [ ] Fresh install works (no existing state)
- [ ] Upgrade from v6 creates backups
- [ ] Configuration loads from clean-slate

## Release Package Contents

```
agile-ai-agents-v7.0.0/
├── project-state/
│   ├── configuration.json    # Default settings
│   └── README.md             # State documentation
├── templates/
│   └── clean-slate/
│       └── project-state/
│           ├── configuration.json
│           └── README.md
├── VERSION.json              # v7.0.0
├── MIGRATION-v7.md          # Migration guide
└── [all other files]
```

## Breaking Changes Warning

**This is a BREAKING CHANGE release:**
- Not backwards compatible
- Users must start fresh or manually migrate
- All state file paths have changed
- Configuration structure completely new

## Release Notes Template

```markdown
# AgileAiAgents v7.0.0 - State Management Revolution

## 🚨 Breaking Changes

This release completely overhauls state management and is NOT backwards compatible.

### What's New
- Three-file state system (runtime, persistent, configuration)
- Single source of truth for all settings
- Clean slate ships truly clean
- No more state file chaos

### Migration Required
- Existing users: See MIGRATION-v7.md
- New users: Just start using!
- Backups created automatically as .v6.backup

### New Commands
- `/aaa-config` - Manage all settings
- `/reset-project-state` - Reset with options

### Fixed
- TEMPLATE_TIMESTAMP issues
- Pre-populated state problems
- State file sprawl (20+ files → 3 files)
```

## Post-Release

- [ ] Tag release as v7.0.0
- [ ] Update GitHub release notes
- [ ] Notify users of breaking changes
- [ ] Monitor issues for migration problems

---

**Ready for v7.0.0 Release!** 🚀