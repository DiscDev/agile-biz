# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This project is built using the **AgileAiAgents** system - an AI-powered development workflow that coordinates 38 specialized AI agents for planning, development, testing, and deployment.

### AgileAiAgents Integration

**Location**: The AgileAiAgents system is located at `{{AGILE_AI_AGENTS_PATH}}`

**Key Commands for Development**:
```bash
# Navigate to AgileAiAgents directory
cd {{AGILE_AI_AGENTS_PATH}}

# Continue development with agents
/continue

# Get sprint status
/status

# Start new sprint planning
/sprint-planning

# Get help with implementation
/implement [story-id]
```

**Project Documentation**: All planning documents, sprints, and research are stored in:
- `{{AGILE_AI_AGENTS_PATH}}/project-documents/`
- Sprint plans: `{{AGILE_AI_AGENTS_PATH}}/project-documents/orchestration/sprints/`
- Research: `{{AGILE_AI_AGENTS_PATH}}/project-documents/research/`
- Architecture: `{{AGILE_AI_AGENTS_PATH}}/project-documents/technical/`

**Important**: When working on this project, leverage the AgileAiAgents system for:
- Sprint planning and task management
- Code implementation guidance
- Testing strategies
- Deployment workflows
- Documentation updates

### Development Workflow with AgileAiAgents

1. **Before starting work**: Check current sprint status
2. **During development**: Use agents for implementation guidance
3. **After completing tasks**: Update sprint progress
4. **For new features**: Use sprint planning agents

### AgileAiAgents Features Available

- **38 Specialized Agents**: Each focused on specific development aspects
- **Automatic Mode**: Let agents guide the entire workflow
- **Manual Control**: Direct specific agents as needed
- **State Persistence**: Pick up where you left off
- **Community Learning**: Benefit from shared patterns

## Project-Specific Information

{{PROJECT_SPECIFIC_SECTION}}

## Commands

{{PROJECT_COMMANDS_SECTION}}

## Architecture Overview

{{PROJECT_ARCHITECTURE_SECTION}}

## Important Notes

- This project was scaffolded/developed using AgileAiAgents
- All architectural decisions are documented in the AgileAiAgents project folder
- For major changes, consider using AgileAiAgents sprint planning
- Community learnings may provide patterns for common tasks

## Getting Help

1. **Check AgileAiAgents documentation**: `{{AGILE_AI_AGENTS_PATH}}/README.md`
2. **Review sprint documents**: Find context for existing features
3. **Use help command**: `/aaa-help` in AgileAiAgents directory
4. **Consult agent expertise**: Each agent has specialized knowledge