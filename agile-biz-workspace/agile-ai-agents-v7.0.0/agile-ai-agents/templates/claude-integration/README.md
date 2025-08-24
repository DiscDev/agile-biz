# Claude Code Integration Template

This directory contains the Claude Code integration template for AgileAiAgents releases.

## Purpose

This is the **source template** used by the release scripts to create the `.claude` directory in release packages.

## For Users

If you're looking for documentation about Claude Code integration, please see:
- `.claude/README.md` in your workspace after installation
- `CLAUDE.md` in the project root for complete AgileAiAgents documentation

## For Maintainers

### Template Structure
```
.claude/
├── agents/                      # 40 AI agent definitions
├── commands/                     # 83 command definitions
├── hooks/                        # 17 automation hooks
├── settings.json.template        # Settings with {{USER_PATH}} placeholders
├── settings.local.json.template  # Default local settings
├── commands.json                 # Command registry
├── generate-commands-json.js     # Utility to regenerate commands.json
└── README-RELEASE.md             # Documentation for release packages
```

### Important Files
- `settings.json.template` - Contains `{{USER_PATH}}` placeholders that get replaced during setup
- `settings.local.json.template` - Default user settings
- `README-RELEASE.md` - Gets copied as README.md in release packages

### Release Process
1. The `create-release.sh` script copies this entire `.claude` directory to the release package
2. Templates are renamed (removing .template extension)
3. Setup scripts replace `{{USER_PATH}}` with actual user paths

### Updating the Template
1. Make changes in this directory
2. Test by manually copying to a workspace
3. Run release script to include in next release

### Hook Permissions
All `.sh` files in hooks/ must be executable:
```bash
chmod +x hooks/*.sh
```

---

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)