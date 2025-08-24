# Clean Slate Template

## Overview
This directory contains the clean starting structure for new AgileAiAgents projects. When a new release is created, this template combines with other components to provide users with a complete system:

- Empty folders with standardized READMEs (from this template)
- Claude Code integration with .claude directory (from claude-integration template)
- Document Router system for automatic document organization (from main system)
- System file templates (stakeholder files, backlog templates)
- Document Registry system for efficient document tracking (80-90% token savings)

## Template Contents

### Folder Structure (After Release Creation)
```
workspace/
├── .claude/                # Claude Code integration (from claude-integration template)
│   ├── agents/             # 40 specialized AI agents
│   ├── commands/           # 89 custom commands (includes Document Router commands)
│   ├── hooks/              # 19 automation hooks
│   ├── settings.json       # Auto-configured settings
│   ├── settings.local.json # Local user settings (not in git)
│   ├── commands.json       # Command registry with all 89 commands
│   ├── generate-commands-json.js # Script to regenerate commands.json
│   └── README.md           # Claude Code integration guide
│
├── agile-ai-agents/        # Main system (from clean-slate + system files)
│   ├── aaa-documents/      # System documentation
│   ├── community-learnings/# Community contribution structure
│   ├── project-documents/  # Empty project structure
│   │   ├── orchestration/  # Sprint and project coordination
│   │   ├── business-strategy/# Market research and business planning
│   │   ├── implementation/ # Technical development documents
│   │   └── operations/     # Deployment and growth operations
│   ├── project-state/      # State management structure
│   ├── machine-data/       # System data
│   │   ├── document-router.js                   # 4-tier routing engine (from main system)
│   │   ├── document-lifecycle-manager.js        # Lifecycle management (from main system)
│   │   ├── folder-creation-manager.js           # Dynamic folder creation (from main system)
│   │   ├── document-routing-rules.json          # Routing configuration (from main system)
│   │   ├── folder-consolidation-tracker.json    # Consolidation tracking (from main system)
│   │   ├── project-document-registry.json       # Document registry index (from clean-slate)
│   │   ├── project-document-registry-manager.js # Registry management (from clean-slate)
│   │   └── registry-queue/                      # Update queue directory (from clean-slate)
│   ├── hooks/
│   │   └── handlers/
│   │       ├── registry/
│   │       │   └── document-registry-tracker.js # Auto-tracking hook (from clean-slate)
│   │       └── document/
│   │           └── document-router-hook.js      # Document routing hook (from main system)
│   └── [other system files]
│
└── CLAUDE.md               # Workspace instructions
```

### System Files Included

#### Project Structure
- `orchestration/stakeholder-decisions.md` - Empty template for decisions
- `orchestration/stakeholder-escalations.md` - Empty template for escalations
- `orchestration/product-backlog/` - Clean backlog structure with zero items
- `machine-data/project-document-registry.json` - Empty document registry
- `machine-data/project-document-registry-manager.js` - Registry management logic
- `hooks/handlers/registry/document-registry-tracker.js` - Auto-tracking hook
- `aaa-documents/project-document-registry-guide.md` - Registry documentation

### Document Registry Features
The template includes a complete Document Registry system that:
- **Automatically tracks** all documents created during workflows
- **Reduces token usage** by 80-90% through JSON conversion tracking
- **Provides efficient discovery** for agents to find documents quickly
- **Maintains real-time index** with summaries and token counts
- **Supports commands**: `/registry-stats`, `/registry-display`, `/registry-find`


### What's NOT Included in This Template
- Example sprints or sprint documents
- Sample user stories or backlog items
- Any filled-in documents
- Project-specific content
- Implementation files (these come from the main system)

## How Release Creation Works

The `create-release.sh` script combines multiple sources:

1. **From clean-slate template** (this directory):
   - Basic folder structure
   - Empty project-documents folders
   - Document Registry base files

2. **From claude-integration template**:
   - .claude directory with agents, commands, hooks
   - Settings templates

3. **From main system**:
   - Document Router implementation
   - All system files and scripts
   - Dashboard and monitoring tools

## Maintenance
When updating the template:
1. Ensure all READMEs are current with workflow changes
2. Keep system file templates minimal and generic
3. Test that the structure works for both new and existing projects
4. Version updates separately from main system updates