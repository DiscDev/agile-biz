# Claude Code Integration for AgileAiAgents

## Overview

This `.claude` directory provides native Claude Code integration for AgileAiAgents, featuring:
- **40 specialized AI agents** accessible via the Task tool
- **83 custom slash commands** for streamlined workflows
- **17 automation hooks** for enhanced productivity
- **Real-time statusline** showing project health and progress

## Quick Start

After running the setup script, all features are immediately available:

1. **View all commands**: Type `/aaa-help` in Claude Code
2. **Interactive menu**: Type `/quickstart` for guided options
3. **Check status**: Type `/aaa-status` for comprehensive project overview
4. **Start a project**: Type `/new-project-workflow` or `/existing-project-workflow`

## Directory Contents

### `/agents/` (40 AI Agents)
Specialized agents for every aspect of software development:
- **Core Development** (11): Coder, Testing, DevOps, UI/UX, etc.
- **Business Strategy** (5): Marketing, Finance, Analytics, etc.
- **Growth & Revenue** (7): SEO, Social Media, Email Marketing, etc.
- **Technical Integration** (5): API, LLM, MCP, Security, etc.
- **Support** (12): Documentation, Research, Project Management, etc.

Access agents using the Task tool with `subagent_type` parameter.

### `/commands/` (83 Custom Commands)
Commands organized in 15 categories:
- **Workflow** (4): Main project workflows
- **State Management** (7): Save, restore, checkpoint
- **Sprint** (8): Agile sprint management
- **Development** (9): Code generation, review, debug
- **Research** (4): Market and competitive analysis
- **Documentation** (4): PRD, pitch deck, technical docs
- **Community** (8): Learning and contribution system
- **And more**: Optimization, maintenance, deployment

### `/hooks/` (17 Automation Hooks)
Automated workflows that enhance your development experience:
- `session-start.sh` - Initializes AgileAiAgents when Claude Code starts
- `statusline.sh` - Real-time project monitoring
- `user-prompt-submit.sh` - Processes user commands
- `on-file-create.sh` - Handles new file creation
- `on-file-change.sh` - Tracks file modifications
- `rebuild-decision.sh` - Monitors rebuild triggers
- `improvement-selection.sh` - Manages improvement workflows
- And 10 more specialized hooks

### `settings.json`
Claude Code configuration with hook definitions. This file contains `{{USER_PATH}}` placeholders that are replaced with your actual installation path during setup.

### `settings.local.json`
Your personal settings and permissions. Customize this file for your preferences.

### `commands.json`
Complete registry of all 83 commands with metadata and categories.

## Statusline Features

The real-time statusline at the bottom of Claude Code shows:

- 🟢🟡🔴 **Health Status**: Project health indicators
- 📍 **Workflow Progress**: Current phase and completion
- 👥 **Active Agents**: Running agents with efficiency metrics (45-75% faster)
- 💰 **Cost Tracking**: Session cost and token usage
- ⚠️ **Action Alerts**: Stakeholder actions with urgency countdown
- 🔧 **Recovery Status**: Active during issue resolution

### Example Displays:
```
🟢 Sprint 1 | 3/5 stories | 2 agents (45% faster) | $2.34
⚠️ ACTION NEEDED | Create GitHub repo | 5m until blocked
🔴 ALERT | 3 blockers | Token 87% | Recovery active
```

## Configuration

### Verbosity Modes
Configure in `agile-ai-agents/CLAUDE-config.md`:
- **quiet**: Minimal display
- **normal**: Balanced information (default)
- **verbose**: Detailed with all components
- **debug**: Internal states and diagnostics

### Hook Settings
In `settings.local.json`:
```json
{
    "hookSettings": {
        "enabled": true,
        "syncEnabled": true,
        "agileHooksProfile": "standard",
        "autoSyncToParent": true
    }
}
```

## Common Commands

### Project Management
- `/new-project-workflow` - Start from idea to implementation
- `/existing-project-workflow` - Analyze and enhance existing code
- `/rebuild-project-workflow` - Rebuild from scratch with 22 phases
- `/quickstart` - Interactive menu with all options

### State & Progress
- `/aaa-status` - Complete context summary
- `/continue` - Resume from last saved state
- `/checkpoint` - Create manual checkpoint
- `/sprint-status` - Current sprint progress

### Development
- `/implement` - Task implementation assistance
- `/generate-code` - AI code generation
- `/review-code` - Automated code review
- `/debug` - Debugging assistance

### Research & Documentation
- `/research-only` - Market research
- `/generate-prd` - Product requirements document
- `/generate-pitch-deck` - Investor presentation
- `/list-documents` - Show all project documents

## Troubleshooting

### Statusline Not Appearing
```bash
chmod +x .claude/hooks/statusline.sh
```

### Clear Cache
```bash
rm .claude/hooks/.statusline-cache
```

### Test Hook
```bash
echo '{"currentWorkingDirectory":"$(pwd)"}' | .claude/hooks/statusline.sh
```

### Hooks Not Working
1. Ensure all hooks are executable: `chmod +x .claude/hooks/*.sh`
2. Check settings.json has correct paths (should have your actual path, not {{USER_PATH}})
3. Verify hooks are enabled in settings.local.json

## Important Notes

- This is a **hidden directory** (starts with `.`)
  - Mac: Press `Cmd+Shift+.` in Finder to show
  - Windows: Enable "Show hidden files" in File Explorer
  - Linux: Use `ls -la` or enable in file manager

- The `settings.json` file will have `{{USER_PATH}}` placeholders until you run the setup script

- All hooks require executable permissions (handled by setup)

- Commands work immediately after setup - no additional configuration needed

## Support

- **All Commands**: Type `/aaa-help` for complete list
- **Documentation**: See `CLAUDE.md` in project root
- **Issues**: Check the troubleshooting section above

---

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)

Version 6.0.0 - Claude Code Integration Release