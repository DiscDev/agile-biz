# CLAUDE-core.md

**PATH CONVENTION**: All file paths in this document are relative to the `agile-ai-agents/` directory.

This file contains the essential core information for Claude Code when working with AgileAiAgents. For complete configuration details, see the companion files: CLAUDE-config.md, CLAUDE-agents.md, and CLAUDE-reference.md.

## User Context Awareness

**Important**: Users have access to comprehensive documentation in `README.md` which includes:
- System overview and key features (v4.6.0)
- Installation and setup with workspace structure
- 38 specialized AI agents and their capabilities
- Enhanced workflow commands with options
- Product backlog metrics and velocity profiles
- Project state management with slash commands
- Real-time dashboard features
- Tech stack-specific project scaffolding templates
- Comprehensive hooks system for event-driven automation

**When responding to users:**
- Assume they have read the README.md unless they indicate otherwise
- Focus on implementation details and advanced configurations
- Reference specific README sections for foundational concepts

**Key Command Changes:**
- Old: "Where are we?" → New: `/aaa-status`
- Old: "Checkpoint now" → New: `/checkpoint`
- Old: "Continue working" → New: `/continue`
- Old: "Save decision: [text]" → New: `/save-decision [text]`

## Workflow Commands

### Primary Commands
- `/start-new-project-workflow` - Begin new project from idea to implementation
- `/start-existing-project-workflow` - Analyze and enhance existing codebase
- `/rebuild-project-workflow` - Comprehensive rebuild for inadequate foundations (v6.0.0)
- `/quickstart` - Interactive menu showing all available options
- `/aaa-help` - List all available AgileAiAgents commands

**Note**: For the complete command list, see `aaa-documents/workflow-templates/help-command-template.md`

### Essential Workflow Info
- **New Project**: 7-phase workflow with section-by-section interviews
- **Existing Project**: Code analysis first, then enhanced planning
- **Rebuild Project**: 22-phase workflow with migration and parallel operations
- **Research Levels**: minimal (1-2h), medium (3-5h), thorough (6-10h)
- **Analysis Levels**: quick (30-60m), standard (2-4h), deep (4-8h)
- **Rebuild Types**: technical, partial, business-model, complete

## Quick Start

1. Use workflow commands for guided experiences
2. Copy `.env_example` to `.env` and add credentials
3. Direct project descriptions use `ai-agent-coordination/auto-project-orchestrator.md`

## Essential Commands

### Setup
```bash
./scripts/bash/setup.sh        # Unix/macOS
.\scripts\windows\setup.bat    # Windows
cp .env_example .env           # Then add credentials
```

### Development
```bash
npm run dashboard              # Start dashboard at http://localhost:3001
npm test                       # Run tests
npm run contribute-learnings   # Capture project learnings
```

### State Management
- `/aaa-status` - Full context summary
- `/continue` - Resume from last state
- `/checkpoint` - Create manual checkpoint
- `/save-decision` - Document important decisions

## System Architecture

### 38 Specialized Agents
- **Core Development** (11): PRD, Project Manager, Scrum Master, Coder, Testing, etc.
- **Business & Strategy** (5): Research, Finance, Analysis, Marketing, etc.
- **Growth & Revenue** (7): SEO, PPC, Social Media, Email, Analytics, etc.
- **Technical Integration** (5): API, LLM, MCP, ML, Data Engineer
- **Support** (10): Documentation, Logger, Optimization, Dashboard, etc.

### Key Directories
- `ai-agents/` - Agent definitions (markdown)
- `project-documents/` - All deliverables (category-based folders)
- `project-dashboard/` - Real-time monitoring
- `hooks/` - Event-driven automation
- `project-state/` - Session state and checkpoints
- `.claude/agents/` - Native Claude Code sub-agents

## Core Workflows

### Document Creation Rules
1. ALWAYS create documents as Markdown in `project-documents/` first
2. System auto-converts to JSON (80-90% token savings)
3. Use category-based folders (orchestration, business-strategy, implementation, operations)
4. Sprint documents: `orchestration/sprints/sprint-YYYY-MM-DD-feature-name/`

### Sprint Management
- Task-based sprints (not time-based)
- AI-Native Pulse System: Event-driven updates, NOT daily standups
- State transitions: planning → active → testing → review → retrospective → completed
- Pulse triggers: story completion, blockers, milestones

## Sub-Agent System (v4.0.0+)

Revolutionary parallel execution through Claude Code sub-agents:
- **Research**: 75% faster (parallel research groups)
- **Sprint Execution**: 60% faster (multiple coder sub-agents)
- **Project Analysis**: 75% faster (concurrent categories)
- **API Integration**: 78% faster (parallel setup)

Sub-agents enabled by default. Max 5 concurrent, file-level ownership prevents conflicts.

## Context Management

### Project State System
- **Storage**: `project-state/` directory
- **Commands**: `/aaa-status`, `/continue`, `/checkpoint`, `/save-decision`
- **Auto-saves**: On task completion, sprint changes, decisions, errors
- **Priority Loading**: Current task, recent decisions, active sprint always loaded

### Claude Code Integration
- All Claude Code commands work alongside AgileAiAgents
- `/help` - Claude Code help vs `/aaa-help` - AgileAiAgents help
- Memory optimization through MD→JSON conversion
- Hooks automate workflows and quality checks

## Stakeholder Prompt Templates (v4.6.0)

Pre-filled project information for 70% faster discovery:
- Templates in `templates/stakeholder-prompts/`
- Quality scoring (0-100) with instant feedback
- Progressive review even for completed sections
- Automatic gap filling for missing info

## Common Issues & Solutions

- **Dashboard Won't Start**: Check port 3001, verify node installation
- **State Not Persisting**: Ensure checkpoint creation, check permissions
- **Document Creation Errors**: Confirm Scrum Master coordination

## Performance Tips

- Use JSON files for agent queries (80-90% reduction)
- Batch document operations
- Run `/compact` between major phases
- Monitor token usage with `/cost`

## Essential References

For complete details on specific topics:
- **Configuration**: See CLAUDE-config.md
- **Agent Guidelines**: See CLAUDE-agents.md
- **Full Reference List**: See CLAUDE-reference.md
- **Testing Guide**: `tests/TESTING-GUIDE.md`
- **Hooks Documentation**: `aaa-documents/claude-code-hooks-guide.md`

---

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)