# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this workspace.

## Workspace Structure

This workspace uses a three-folder approach with multiple CLAUDE.md files:

1. **agile-ai-agents/** - The AI coordination system (downloaded from release)
   - Contains 38 specialized AI agents
   - Manages sprints, research, and planning
   - All project documentation stored here
   - Has its own `agile-ai-agents/CLAUDE.md` for system operations

2. **[project-folder]/** - Your actual project code
   - Contains the source code for your project
   - Separate from the AI system files
   - Should have its own `CLAUDE.md` to maintain AgileAiAgents context
   - Run `/add-agile-context` to create/update project CLAUDE.md

3. **.claude/** - Claude Code integration (from the release)
   - **Commands** (79 custom + 21 native):
     - Custom commands in `.claude/commands/` - AgileAiAgents workflows
     - Access via `/aaa-help` for complete command list
     - Primary workflows: `/new-project-workflow`, `/existing-project-workflow`
     - State management: `/aaa-status`, `/continue`, `/checkpoint`
   - **Agents** (38 specialized):
     - Native Claude sub-agents in `.claude/agents/`
     - Token-optimized for parallel execution
     - Accessed via Task tool with `subagent_type` parameter
   - **Hooks** (54 automated workflows):
     - Event-driven automation in `.claude/hooks/`
     - Session management, state tracking, document sync
     - Pre/post tool validation and monitoring
   - **StatusLine** (real-time project monitoring):
     - Shows project health, sprint progress, active agents
     - Configured in `.claude/settings.json`
     - Adaptive display based on verbosity settings
     - Updates every 300ms with current context
   - **Settings** (`.claude/settings.json`):
     - StatusLine configuration
     - Hook configurations
     - Path mappings (uses {{USER_PATH}} placeholder)
   - **Hidden folder**: Use `Cmd+Shift+.` (macOS) or "Show hidden files" (Windows) to see it

## Important: Three CLAUDE.md Files and Claude Integration

This workspace intentionally uses THREE CLAUDE.md files plus Claude Code integration:
- **Workspace CLAUDE.md** (this file): Explains the three-folder structure
- **AgileAiAgents CLAUDE.md**: Located in `agile-ai-agents/CLAUDE.md` - full system documentation
- **Project CLAUDE.md**: Should be in your project folder - maintains context about AgileAiAgents
- **.claude folder**: Contains native Claude Code agents, hooks, and settings for enhanced automation

This ensures that when you open just the project folder in a new Claude Code session, it still knows about AgileAiAgents.

## Workflow

1. **Planning Phase**: AgileAiAgents operates from `agile-ai-agents/` folder
2. **Documentation**: All research, sprints, and planning stored in `agile-ai-agents/project-documents/`
3. **Implementation**: Actual project code goes in separate project folder
4. **Project Setup**: Run `/init` in project folder to analyze codebase and create project-specific context

## Key Principles

- **Separation of Concerns**: AI system files stay in `agile-ai-agents/`, project code in project folder
- **No Mixing**: Never put AgileAiAgents documentation in the project folder
- **Clear Boundaries**: Sprint documents, research, and planning belong to the AI system, not the project

## CRITICAL: File Placement Rules

**⚠️ NEVER place .md documentation files in the root directory or code folders**

### Where Files Belong:
- **Documentation**: ALL .md files (except this workspace CLAUDE.md) → `agile-ai-agents/project-documents/`
- **Code**: Source files only → `[project-folder]/`
- **Root Directory**: Should only contain:
  - This CLAUDE.md file
  - Essential config files (.gitignore, etc.)
  - NO other .md documentation files

### Specific Documentation Locations:
- Competitive analysis → `agile-ai-agents/project-documents/business-strategy/research/`
- Sprint documents → `agile-ai-agents/project-documents/orchestration/sprints/`
- Development guides → `agile-ai-agents/project-documents/implementation/`
- Financial docs → `agile-ai-agents/project-documents/business-strategy/finance/`
- Testing strategies → `agile-ai-agents/project-documents/implementation/testing/`
- Security guides → `agile-ai-agents/project-documents/implementation/security/`

## Git Commit Messages

When creating git commits, **ALWAYS** use the following attribution format instead of the default Claude Code message:

```
[Your commit message here]

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
```

**Do NOT use** the default Claude Code attribution (`🤖 Generated with Claude Code`).

## Getting Started

1. **First Time Setup**:
   - Navigate to your project folder
   - Run `/add-agile-context` to create project CLAUDE.md with AgileAiAgents awareness
   - This ensures future Claude Code sessions know about AgileAiAgents

2. **Using AgileAiAgents**: 
   - Navigate to `agile-ai-agents/` folder
   - See `agile-ai-agents/CLAUDE.md` for all commands and workflows

3. **Working on Project Code**:
   - Your project's CLAUDE.md will have paths back to AgileAiAgents
   - Use commands like `/continue` and `/status` from either folder

4. **System Documentation**: 
   - Check `agile-ai-agents/machine-data/aaa-documents-json` for detailed guides

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)

---

For detailed AgileAiAgents operations, commands, and agent coordination, see `agile-ai-agents/CLAUDE.md`