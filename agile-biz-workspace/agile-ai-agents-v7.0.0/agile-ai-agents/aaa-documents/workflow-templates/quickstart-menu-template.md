# Quickstart Menu Template

## Overview
This template provides an interactive menu when users type `/quickstart`, helping them choose the right workflow.

## Menu Display

```
🚀 AgileAiAgents Quick Start Menu
================================

Choose your path:

1️⃣  START NEW PROJECT
    Build something new from scratch
    • Guided discovery process
    • Market research & validation  
    • Full implementation
    → Type: /start-new-project-workflow

2️⃣  ENHANCE EXISTING PROJECT
    Improve your current codebase
    • Automatic code analysis
    • Enhancement recommendations
    • Incremental improvements
    → Type: /start-existing-project-workflow

3️⃣  REBUILD PROJECT
    Reconstruct when foundation is inadequate
    • Technical or business model rebuild
    • Migration from legacy system
    • Side-by-side deployment
    → Type: /rebuild-project-workflow

4️⃣  RESEARCH ONLY
    Market research without building
    • Competitive analysis
    • Market validation
    • Strategic recommendations
    → Type: /research-only

4️⃣  SPRINT MANAGEMENT
    Manage ongoing development
    • Start new sprint: /start-sprint
    • Check status: /sprint-status
    • Sprint review: /sprint-review

5️⃣  DOCUMENTATION
    Generate project documents
    • PRD: /generate-prd
    • Pitch deck: /generate-pitch-deck
    • Tech docs: /generate-documentation

6️⃣  PROJECT STATE
    Manage your work sessions
    • Current status: /status
    • Continue work: /continue
    • Save checkpoint: /checkpoint

7️⃣  HELP & COMMANDS
    • List all commands: /aaa-help
    • Specific help: /aaa-help [command]

What would you like to do? Type the command or number:
```

## Interactive Response Handler

### If user types a number:
- 1 → Execute `/start-new-project-workflow`
- 2 → Execute `/start-existing-project-workflow`
- 3 → Execute `/rebuild-project-workflow`
- 4 → Execute `/research-only`
- 5 → Show sprint submenu
- 6 → Show documentation submenu
- 7 → Show state submenu
- 8 → Execute `/aaa-help`

### If user types a command:
- Validate and execute the command

### If user types invalid input:
```
I didn't understand that. Please either:
- Type a number (1-8) from the menu
- Type a command like /start-new-project-workflow
- Type /aaa-help for all commands

What would you like to do?
```

## Submenus

### Sprint Management Submenu (Option 5):
```
📋 Sprint Management Options
==========================

a) Start New Sprint
   Begin a new development sprint
   → /start-sprint

b) Current Sprint Status  
   View active sprint progress
   → /sprint-status

c) Sprint Review
   Conduct sprint review meeting
   → /sprint-review

d) Sprint Retrospective
   AI agents retrospective
   → /sprint-retrospective

← Back to main menu (type: back)

Choose an option (a-d):
```

### Documentation Submenu (Option 5):
```
📄 Documentation Options
======================

a) Product Requirements (PRD)
   Generate PRD from research
   → /generate-prd

b) Investor Pitch Deck
   Create presentation materials
   → /generate-pitch-deck

c) Technical Documentation
   API docs, setup guides, etc.
   → /generate-documentation

d) All Project Documents
   List all generated documents
   → /list-documents

← Back to main menu (type: back)

Choose an option (a-d):
```

### State Management Submenu (Option 6):
```
💾 State Management Options
=========================

a) Project Status
   See current project state
   → /status

b) Continue Previous Work
   Resume from last session
   → /continue

c) Save Checkpoint
   Create manual save point
   → /checkpoint

d) Context Summary
   "Where are we?" overview
   → /where-are-we

← Back to main menu (type: back)

Choose an option (a-d):
```

## Navigation Features

- **Back Navigation**: Type "back" from any submenu
- **Exit**: Type "exit" or "quit" to leave menu
- **Direct Commands**: Can type commands directly at any time
- **Smart Suggestions**: If user describes a need, suggest appropriate command

## Example Interactions

### Scenario 1: New User
```
User: /quickstart
AI: [Shows main menu]
User: 1
AI: Great! Starting new project workflow...
     [Begins /start-new-project-workflow]
```

### Scenario 2: Returning User
```
User: /quickstart  
AI: [Shows main menu]
User: I want to continue my authentication feature
AI: It sounds like you want to continue previous work.
    Would you like me to run /continue? (yes/no)
User: yes
AI: [Executes /continue command]
```

### Scenario 3: Exploring Options
```
User: /quickstart
AI: [Shows main menu]
User: 4
AI: [Shows sprint management submenu]
User: back
AI: [Returns to main menu]
User: /help
AI: [Shows all available commands]
```

## State Tracking
Track menu navigation in state:
```json
{
  "menu_state": {
    "current_menu": "main|sprint|docs|state",
    "navigation_history": ["main", "sprint", "main"],
    "last_command": null
  }
}
```