---
allowed-tools: Read(*), LS(*)
description: Show all available AgileAiAgents commands
argument-hint: "[command-name]"
---

# AgileAiAgents Command Help

Display comprehensive help for AgileAiAgents commands.

## Check for Specific Command

If $ARGUMENTS is provided, show detailed help for that specific command.
Otherwise, show the general help menu.

## General Help Display

```
📚 AgileAiAgents + Claude Code Command Reference
================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 NATIVE CLAUDE CODE COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 FILE & DIRECTORY
  /add-dir                    Add additional working directories
  /init                       Initialize project with CLAUDE.md guide
  /memory                     Edit CLAUDE.md memory files

🔧 SYSTEM & CONFIG
  /config                     View/modify configuration
  /permissions                View or update permissions
  /terminal-setup             Install Shift+Enter key binding
  /vim                        Enter vim mode (insert/command)
  /doctor                     Check Claude Code installation health

🤝 COLLABORATION
  /agents                     Manage custom AI subagents
  /mcp                        Manage MCP server connections
  /pr_comments                View pull request comments
  /review                     Request code review

📊 SESSION & STATUS
  /status                     View account and system status
  /cost                       Show token usage statistics
  /compact                    Compact conversation with focus
  /clear                      Clear conversation history

👤 ACCOUNT
  /login                      Switch Anthropic accounts
  /logout                     Sign out from account
  /model                      Select or change AI model

ℹ️ HELP & SUPPORT
  /help                       Get Claude Code usage help
  /bug                        Report bugs to Anthropic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ AGILEAIAGENTS CUSTOM COMMANDS (79 total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 WORKFLOW COMMANDS (4)
  /new-project-workflow       Start new project from idea to implementation
  /existing-project-workflow  Analyze and enhance existing codebase
  /select-phases              Choose operational phases after MVP
  /workflow-recovery          Recover from workflow errors

🎯 HELP & NAVIGATION (2)
  /quickstart                 Interactive menu with all options
  /aaa-help                   Show this comprehensive help

💾 STATE MANAGEMENT (7)
  /aaa-status                 Show current project status
  /continue                   Resume previous work session
  /checkpoint                 Create manual save point
  /save-decision              Save important decision
  /update-state               Manual state update
  /show-last-session          Show last session details
  /show-decisions             Display all project decisions

📋 SPRINT MANAGEMENT (8)
  /start-sprint               Begin a new agile sprint
  /sprint-status              Show current sprint progress
  /sprint-progress            View sprint burndown
  /sprint-review              Conduct sprint review
  /sprint-retrospective       AI agents retrospective
  /sprint-planning            Plan next sprint
  /milestone                  Record major achievement
  /update-burndown            Update sprint metrics

💻 DEVELOPMENT (9)
  /start-development          Begin development phase
  /implement                  Get help implementing task
  /generate-code              Generate code for need
  /review-code                Get code review
  /debug                      Get debugging assistance
  /test                       Generate and run tests
  /refactor                   Get refactoring suggestions
  /update-feature             Update existing feature
  /migrate                    Database/code migration

🔍 RESEARCH & ANALYSIS (4)
  /research-only              Market research without implementation
  /analyze-market             Focused market analysis
  /analyze-competition        Competitive landscape analysis
  /analyze-code               Deep code analysis

📄 DOCUMENTATION (4)
  /generate-prd               Create Product Requirements Document
  /generate-pitch-deck        Create investor presentation
  /generate-documentation     Generate technical documentation
  /list-documents             Show all project documents

🎯 COMMUNITY (8)
  /capture-learnings          Capture project learnings
  /contribution-status        View contribution readiness
  /show-contribution-status   Show contribution status
  /skip-contribution          Skip contribution prompt
  /contribute-now             Start contribution
  /show-learnings             Display learnings
  /learn-from-contributions-workflow  Run learning analysis
  /review-learnings           Review captured learnings

🛠️ ADVANCED (5)
  /task-complete              Mark task as done
  /blocker                    Report blocker
  /context                    Get area context
  /explain                    Get explanations
  /best-practice              Get recommendations

🐛 MAINTENANCE (4)
  /analyze-bug                Analyze bugs
  /fix-bug                    Generate bug fixes
  /regression-test            Create regression tests
  /impact-analysis            Analyze change impact

⚡ OPTIMIZATION (6)
  /profile                    Profile performance
  /optimize                   Get optimization suggestions
  /refactor-legacy            Modernize legacy code
  /health-check               System health analysis
  /security-scan              Security vulnerability check
  /performance-report         Performance metrics analysis

🔄 CONVERSION (4)
  /convert-md-to-json-aaa-documents      Convert aaa-documents
  /convert-md-to-json-ai-agents          Convert AI agents
  /convert-md-to-json-project-documents  Convert project docs
  /convert-all-md-to-json                Run all conversions

⚙️ SYSTEM MANAGEMENT (8)
  /setup-dev-environment      Setup development environment
  /project-state-reset        Clean project state
  /project-documents-reset    Empty document folders
  /community-learnings-reset  Clear contributions
  /clear-logs                 Remove all logs
  /backup-before-reset        Create backup
  /restore-from-backup        Restore from backup
  /reset                      Reset project

📍 CONTEXT (4)
  /init                       Initialize Claude context
  /add-agile-context          Add AgileAI context
  /verify-context             Verify project context
  /select-velocity-profile    Select velocity profile

🚢 DEPLOYMENT (2)
  /deployment-success         Mark deployment success
  /project-complete           Complete project lifecycle

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STATUSLINE MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The statusline at the bottom of Claude Code shows:
• 🟢🟡🔴 Health status and alerts
• 📍 Current workflow phase and progress
• 👥 Active agents and efficiency gains
• 💰 Session cost and token usage
• ⚠️ Stakeholder actions needed
• 🔗 Dashboard connection status

Configure in CLAUDE-config.md verbosity settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 USAGE TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Type /aaa-help [command] for detailed command info
• Example: /aaa-help new-project-workflow
• Use /quickstart for interactive menu
• Native commands work alongside AgileAI commands
• Commands integrate with 38 specialized AI agents
• Monitor progress via statusline at bottom

Total Available Commands: 100 (21 native + 79 custom)
```

## Specific Command Help

When $ARGUMENTS contains a command name, show detailed help including:
- Full description
- Usage syntax
- Options and parameters
- Workflow phases
- Example usage
- Related commands