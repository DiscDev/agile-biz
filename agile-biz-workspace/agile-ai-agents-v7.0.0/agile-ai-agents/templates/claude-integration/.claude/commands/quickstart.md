---
allowed-tools: Task(subagent_type:*), Read(*), Write(*), LS(*), Bash(echo:*)
description: Interactive menu for all AgileAiAgents options
---

# AgileAiAgents Quick Start Menu

Present an interactive menu to help the user select the right workflow or command.

## Display Menu

```
🚀 AgileAiAgents Quick Start Menu
================================

Choose an option:

📁 PROJECT WORKFLOWS
  1. Start New Project     - Begin from idea to implementation
  2. Existing Project      - Analyze and enhance current code
  3. Research Only         - Market research without building

🎯 CURRENT WORK
  4. Show Status          - View project progress
  5. Continue Working     - Resume from last state
  6. Sprint Planning      - Plan next sprint

📊 QUICK ACTIONS
  7. Generate PRD         - Create requirements document
  8. Code Analysis       - Analyze existing code
  9. Help               - Show all commands

Type a number (1-9) or command name:
```

## Process Selection

Based on user input:
- Numbers 1-9: Execute corresponding command
- Text input: Try to match to command name
- Invalid input: Show menu again with guidance

## Command Execution

After selection, execute the appropriate command:
- Option 1 → /new-project-workflow
- Option 2 → /existing-project-workflow
- Option 3 → /research-only
- Option 4 → /aaa-status
- Option 5 → /continue
- Option 6 → /start-sprint
- Option 7 → /generate-prd
- Option 8 → /analyze-code
- Option 9 → /aaa-help

Guide the user through their selected workflow with appropriate prompts and context.