# AAA-Help Command Template

## Overview
This template defines the output for the `/aaa-help` command and `/aaa-help [command]` variations.

## General Help Output (`/aaa-help`)

```
📚 AgileAiAgents Command Reference
=================================

🚀 WORKFLOW COMMANDS
  /start-new-project-workflow    Start a new project from idea to implementation
  /start-existing-project-workflow    Analyze and enhance existing codebase
  /rebuild-project-workflow      Comprehensive rebuild for inadequate foundations
  /quickstart                    Interactive menu with all options
  /aaa-help                     Show this AgileAiAgents help message
  /aaa-help [command]           Get detailed help for a specific command

📋 SPRINT MANAGEMENT
  /start-sprint                 Begin a new agile sprint
  /sprint-status               Show current sprint progress
  /sprint-review               Conduct sprint review
  /sprint-retrospective        AI agents retrospective

🔍 RESEARCH & ANALYSIS  
  /research-only               Market research without implementation
  /analyze-market              Focused market analysis
  /analyze-competition         Competitive landscape analysis
  /analyze-code               Deep code analysis for existing projects

📄 DOCUMENTATION
  /generate-prd                Create Product Requirements Document
  /generate-pitch-deck         Create investor presentation
  /generate-documentation      Generate technical documentation
  /list-documents             Show all project documents
  /registry-stats             Show document registry statistics
  /registry-display           Display document registry contents
  /registry-find              Search documents in registry

💾 STATE MANAGEMENT
  /status                     Show current project status (replaces "Where are we?")
  /continue                   Resume previous work session
  /continue [sprint]          Resume specific sprint work
  /checkpoint                 Create manual save point
  /checkpoint "msg"           Checkpoint with message
  /checkpoint --full          Force full checkpoint
  /update-state               Manual state update
  /save-decision              Save important decision
  /show-learnings            Display project learnings

🎯 COMMUNITY CONTRIBUTIONS
  /milestone                  Record milestone and trigger contribution
  /deployment-success         Mark deployment success and contribute
  /project-complete          Complete project with final contribution
  /skip-contribution         Skip current contribution prompt
  /contribution-status       View contribution readiness
  /contribute-now            Start contribution immediately

🛠️ QUICK TIPS
  • Start with /quickstart if you're unsure
  • Use /start-new-project-workflow for new ideas
  • Use /start-existing-project-workflow to improve current code
  • Type /aaa-help [command] for detailed command info

Example: /aaa-help start-new-project-workflow
```

## Specific Command Help (`/aaa-help [command]`)

### `/aaa-help start-new-project-workflow`
```
📘 Command: /start-new-project-workflow
=====================================

DESCRIPTION:
Guides you through creating a new project from scratch, including discovery,
research, planning, and implementation using AgileAiAgents.

WORKFLOW PHASES:
1. Stakeholder Discovery (45-90 min)
   - Project vision and goals
   - Technical preferences
   - Business context
   - Feature priorities

2. Research Level Selection (5 min)
   - Minimal: Quick validation (1-2 hrs)
   - Medium: Comprehensive analysis (3-5 hrs) [DEFAULT]
   - Thorough: Enterprise deep-dive (6-10 hrs)

3. Market Research & Analysis
   - Competitive landscape
   - Market validation
   - Technical feasibility
   - Financial projections

4. Product Planning
   - PRD generation
   - Architecture design
   - Sprint planning

5. Implementation
   - Agile development sprints
   - Regular reviews
   - Continuous deployment

USAGE:
  /start-new-project-workflow

EXAMPLE SESSION:
  You: /start-new-project-workflow
  AI: Let's start with understanding your project vision.
      What are you building? Please describe in 1-2 sentences.
  You: A task management app for remote teams
  AI: [Continues with guided questions...]

RELATED COMMANDS:
  /quickstart - Interactive menu
  /research-only - Just research, no building
  /status - Check project progress
```

### `/aaa-help start-existing-project-workflow`
```
📘 Command: /start-existing-project-workflow  
==========================================

DESCRIPTION:
Analyzes your existing codebase and guides you through planning and
implementing enhancements, optimizations, and new features.

WORKFLOW PHASES:
1. Automatic Code Analysis (30 min - 2 hrs)
   - Technology detection
   - Architecture mapping
   - Security scanning
   - Performance analysis

2. Contextual Interview (30-60 min)
   - Validate findings
   - Understand goals
   - Define boundaries
   - Prioritize improvements

3. Analysis Depth Selection (5 min)
   - Quick: High-level review (30-60 min)
   - Standard: Comprehensive analysis (2-4 hrs) [DEFAULT]
   - Deep: Line-by-line review (4-8 hrs)

4. Enhancement Planning
   - Improvement roadmap
   - Risk assessment
   - Implementation strategy

5. Incremental Implementation
   - Backward-compatible changes
   - Continuous testing
   - Gradual rollout

USAGE:
  /start-existing-project-workflow

PREREQUISITES:
  - Have your codebase accessible in the current directory
  - Ensure .gitignore is properly configured
  - Remove any sensitive credentials from code

EXAMPLE SESSION:
  You: /start-existing-project-workflow
  AI: I'll start by analyzing your codebase...
      [Analysis runs]
      I've detected a Node.js application using Express and PostgreSQL.
      I found 15 endpoints and 73% test coverage. 
      Is this primarily an API service?
  You: Yes, it's our user management API
  AI: [Continues with contextual questions...]

RELATED COMMANDS:
  /analyze-code - Deep code analysis only
  /generate-documentation - Document existing code
  /sprint-status - Check enhancement progress
```

### `/aaa-help quickstart`
```
📘 Command: /quickstart
=====================

DESCRIPTION:
Interactive menu that helps you choose the right workflow for your needs.
Perfect for first-time users or when you're unsure which command to use.

FEATURES:
- Visual menu with numbered options
- Submenus for related commands
- Can type numbers or commands
- Smart suggestions based on input

USAGE:
  /quickstart

NAVIGATION:
  - Type 1-7 to select main menu options
  - Type command names directly
  - Type "back" to return to previous menu
  - Type "exit" to leave menu

EXAMPLE:
  You: /quickstart
  AI: [Shows interactive menu]
  You: 1
  AI: Great! Starting new project workflow...

RELATED COMMANDS:
  /aaa-help - Command reference
  /start-new-project-workflow - New projects
  /start-existing-project-workflow - Existing projects
```

### `/aaa-help checkpoint`
```
📘 Command: /checkpoint [message] [--full]
======================================

DESCRIPTION:
Creates a manual checkpoint of your current project state. Useful for
saving progress before major changes or at end of work sessions.

PARAMETERS:
  message   Optional custom message for the checkpoint
  --full    Force full checkpoint regardless of save_mode setting

USAGE:
  /checkpoint                    Create checkpoint with auto-summary
  /checkpoint "message"          Create checkpoint with custom message  
  /checkpoint --full            Force full checkpoint
  /checkpoint "message" --full  Both custom message and full checkpoint

EXAMPLES:
  /checkpoint
  → Creates checkpoint with automatic summary
  
  /checkpoint "Completed user auth feature"
  → Creates checkpoint with your message
  
  /checkpoint --full
  → Forces full checkpoint even if save_mode is "update"

CONFIGURATION:
  Behavior depends on save_mode setting:
  - update: Only updates current-state.json
  - checkpoint: Always creates full checkpoint
  - hybrid: Updates current + checkpoint on phases

RELATED COMMANDS:
  /status - Check current state
  /update-state - Update without checkpoint
  /save-decision - Save specific decisions
```

### `/aaa-help status`  
```
📘 Command: /status
==================

DESCRIPTION:
Displays comprehensive project status including current workflow,
active tasks, recent decisions, and next steps. Replaces the
natural language "Where are we?" command.

USAGE:
  /status

OUTPUT INCLUDES:
  - Active workflow and phase
  - Current sprint information  
  - Task progress and completion
  - Recent decisions with rationale
  - Recently modified files
  - Suggested next steps
  - Last save timestamp

EXAMPLE OUTPUT:
  📊 Project Status
  ================
  Workflow: New Project - Research Phase
  Phase: Market Analysis (60% complete)
  Started: 2025-01-20 10:00 AM
  Last Save: 2 minutes ago
  
  📋 Current Sprint
  Sprint: 2025-01-20-authentication
  Progress: 60% complete
  
  ✅ Recent Completions
  - User model implementation
  - JWT token setup
  
  🚧 In Progress  
  - OAuth integration
  - Password reset flow
  
  🎯 Next Steps
  - Complete OAuth setup
  - Begin testing phase

RELATED COMMANDS:
  /continue - Resume work
  /checkpoint - Save current state
  /show-learnings - View insights
```

### `/aaa-help save-decision`
```
📘 Command: /save-decision [decision] [rationale]
===============================================

DESCRIPTION:
Saves important project decisions with optional rationale. Decisions
are timestamped and preserved in project history. Auto-save triggers
when decision threshold is reached.

PARAMETERS:
  decision   The decision made (required)
  rationale  Why this decision was made (optional)

USAGE:
  /save-decision "decision"                Save decision only
  /save-decision "decision" "rationale"   Save with reasoning

EXAMPLES:
  /save-decision "Use PostgreSQL for database"
  → Saves: PostgreSQL chosen (no rationale recorded)
  
  /save-decision "Switch to TypeScript" "Better type safety for team"
  → Saves: TypeScript adoption with reasoning

AUTO-SAVE BEHAVIOR:
  Decisions count toward decision_threshold
  When threshold reached, auto-save triggers
  Default threshold: 5 decisions (configurable)

RELATED COMMANDS:
  /status - View recent decisions
  /update-state - General state update
  /checkpoint - Manual save point
```

### `/aaa-help milestone`
```
📘 Command: /milestone [description]
==================================

DESCRIPTION:
Records a significant project milestone and triggers a contribution
opportunity to share learnings from achieving this milestone.

PARAMETERS:
  description   The milestone achieved (required)

USAGE:
  /milestone "description"    Record milestone with description

EXAMPLES:
  /milestone "Launched MVP with first 10 users"
  → Records milestone and schedules contribution prompt
  
  /milestone "Achieved 99.9% uptime for 30 days"
  → Captures operational milestone for sharing

CONTRIBUTION BEHAVIOR:
  After recording, waits 10 minutes (configurable) then prompts
  for contribution focusing on:
  - Key decisions that led to milestone
  - Challenges overcome
  - Resources required vs estimated
  - Lessons learned

RELATED COMMANDS:
  /contribution-status - Check if ready to contribute
  /skip-contribution - Skip the contribution prompt
  /contribute-now - Contribute immediately
```

### `/aaa-help sprint-retrospective`
```
📘 Command: /sprint-retrospective
================================

DESCRIPTION:
Conducts sprint retrospective with AI agents and automatically
triggers contribution opportunity for sprint learnings.

USAGE:
  /sprint-retrospective

WORKFLOW:
  1. Reviews sprint accomplishments
  2. Analyzes what went well
  3. Identifies improvements
  4. Documents learnings
  5. Triggers contribution prompt (if enabled)

CONTRIBUTION INTEGRATION:
  This command is integrated with community contributions.
  After retrospective, you'll be prompted to share:
  - Sprint velocity insights
  - Technical patterns discovered
  - Team collaboration improvements
  - Tool effectiveness

AUTO-PROMPT BEHAVIOR:
  Based on settings, contribution prompt appears:
  - Automatically after delay (default)
  - Only when you run /contribute-now
  - After confirmation prompt

RELATED COMMANDS:
  /sprint-review - Review sprint deliverables
  /contribution-status - Check contribution readiness
  /skip-contribution - Skip this contribution
```

### `/aaa-help contribution-status`
```
📘 Command: /contribution-status
===============================

DESCRIPTION:
Displays your contribution readiness, history, and any pending
contribution prompts.

USAGE:
  /contribution-status

OUTPUT INCLUDES:
  - Pending contribution prompts
  - Previous contributions with IDs
  - Current accumulated learnings
  - Readiness score (red/yellow/green)
  - Skip history if applicable
  - Next contribution opportunity

EXAMPLE OUTPUT:
  Shows formatted status with:
  📋 Pending: Sprint retrospective (in 5 min)
  📜 History: 3 contributions, last 5 days ago
  🎯 Ready: High-value learnings available
  ⏭️ Skipped: 1 (NDA restrictions)

READINESS INDICATORS:
  🟢 Green: Rich learnings ready to share
  🟡 Yellow: Some learnings accumulated
  🔴 Red: Insufficient learnings yet

RELATED COMMANDS:
  /contribute-now - Start contribution
  /skip-contribution - Skip current prompt
  /show-learnings - View detailed learnings
```

## Command Not Found Help

When user types `/aaa-help [unknown-command]`:

```
❌ Command not found: /[unknown-command]

Did you mean one of these?
  /[suggestion-1] - [description]
  /[suggestion-2] - [description]

Type /aaa-help to see all available commands.
```

## Dynamic Sections

### Currently Active Information
If a workflow or sprint is active, append to help output:

```
📊 CURRENT ACTIVITY
  Active Workflow: New Project - Research Phase
  Current Sprint: 2025-01-20-authentication
  Progress: 60% complete
  
  Continue with: /continue
  Check status: /status
```

### Context-Aware Suggestions
Based on current state, add relevant suggestions:

```
💡 SUGGESTED NEXT STEPS
  Based on your current progress:
  • Complete authentication feature: /continue
  • Review sprint progress: /sprint-status  
  • Save your work: /checkpoint
```

### `/aaa-help registry-stats`
```
📘 Command: /registry-stats
==========================

DESCRIPTION:
Displays comprehensive statistics about the document registry including
document counts, token usage, JSON coverage, and savings metrics.

USAGE:
  /registry-stats

OUTPUT INCLUDES:
  - Total documents tracked
  - Documents per category
  - Token counts (MD vs JSON)
  - JSON conversion coverage %
  - Token savings achieved
  - Registry version info

EXAMPLE OUTPUT:
  📊 Document Registry Statistics
  ===============================
  Version: 2
  Last Updated: 2025-08-11 23:05:20
  Total Documents: 142
  
  📁 Category Breakdown:
  - orchestration: 23 docs (45,230 tokens)
  - business-strategy: 31 docs (78,450 tokens)
  - implementation: 48 docs (112,340 tokens)
  - operations: 40 docs (89,200 tokens)
  
  💾 JSON Coverage: 87%
  🎯 Token Savings: 72%
  
  Total Tokens:
  - Markdown: 325,220 tokens
  - JSON: 91,062 tokens

RELATED COMMANDS:
  /registry-display - View full registry contents
  /registry-find - Search for specific documents
```

### `/aaa-help registry-display`
```
📘 Command: /registry-display
============================

DESCRIPTION:
Displays the complete document registry in a readable format, showing
all tracked documents with their metadata, token counts, and conversion status.

USAGE:
  /registry-display

OUTPUT FORMAT:
  Categories are displayed with document listings including:
  - Document name and path
  - Summary (up to 25 words)
  - Token counts for MD and JSON versions
  - JSON conversion status (✅ or ⏳)
  - Creating agent
  - Dependencies if any

EXAMPLE OUTPUT:
  📚 Document Registry v2
  ========================
  
  📁 orchestration (5 documents)
  ------------------------------
  ✅ project-log
     Summary: Tracks all project activities and decisions
     Tokens: MD: 1,234, JSON: 456
     Agent: Scrum Master
  
  ⏳ sprint-planning
     Summary: Current sprint planning and story breakdown
     Tokens: MD: 2,345
     Agent: Project Manager
     Dependencies: project-log.md, backlog.md

RELATED COMMANDS:
  /registry-stats - View summary statistics
  /registry-find - Search for specific documents
```

### `/aaa-help registry-find`
```
📘 Command: /registry-find [search-term]
========================================

DESCRIPTION:
Searches the document registry for documents matching the search term.
Searches in document names, summaries, and categories.

PARAMETERS:
  search-term   Text to search for in registry (required)

USAGE:
  /registry-find "search-term"

EXAMPLES:
  /registry-find "security"
  → Returns all documents related to security
  
  /registry-find "sprint"
  → Returns all sprint-related documents
  
  /registry-find "API"
  → Returns API documentation and related docs

OUTPUT FORMAT:
  Search results show:
  - Document path
  - Category
  - Summary
  - Token counts
  - Match location (name/summary)

EXAMPLE OUTPUT:
  🔍 Search Results for "security"
  =================================
  Found 3 documents:
  
  1. implementation/security/security-architecture.md
     Summary: Security architecture and threat modeling
     Tokens: MD: 3,456, JSON: 987
     Match: category and name
  
  2. implementation/security/compliance-framework.md
     Summary: GDPR and SOC2 compliance requirements
     Tokens: MD: 2,134, JSON: 634
     Match: category and name

RELATED COMMANDS:
  /registry-display - View full registry
  /registry-stats - View statistics
```

## Help Command Behavior

1. **No Parameters**: Show general help
2. **With Valid Command**: Show detailed help for that command
3. **With Invalid Command**: Show error with suggestions
4. **With Partial Match**: Show all commands that match

Example partial match:
```
You: /aaa-help start
AI: Found multiple commands matching "start":
    
    /start-new-project-workflow - Start a new project
    /start-existing-project-workflow - Enhance existing code
    /start-sprint - Begin a new agile sprint
    
    Type the full command for detailed help.
```