# /reset-project-state

Reset project state with various options

## Usage

```bash
/reset-project-state [options]

Options:
  --runtime          Reset workflow/session only (default)
  --persistent       Reset history (requires --force)
  --configuration    Reset to shipped defaults
  --all             Reset everything (requires --force)
  --keep-documents   Preserve .md files
  --checkpoint       Auto-backup before reset
  --force           Skip confirmation prompts
  --dry-run         Preview changes without executing
```

## Examples

### Reset just the current workflow
```bash
/reset-project-state --runtime
```

### Reset configuration to defaults
```bash
/reset-project-state --configuration
```

### Full reset with backup
```bash
/reset-project-state --all --checkpoint --force
```

### Start workflow over but keep documents
```bash
/reset-project-state --runtime --keep-documents
```

## What Gets Reset

### Runtime (default)
- Current workflow state
- Active session
- Document and task queues
- Agent coordination

### Persistent (requires --force)
- Project history
- Decisions log
- Sprint records
- Metrics and progress

### Configuration
- User preferences
- Auto-save settings
- Hook configuration
- All settings return to defaults

## Safety Features

- Requires `--force` for destructive operations
- Creates automatic backup with `--checkpoint`
- `--dry-run` shows what would be reset
- `--keep-documents` preserves created .md files

## Notes

- Default behavior (no options) only resets runtime
- Configuration reset copies from clean-slate template
- Backups are stored in project-state/archives/