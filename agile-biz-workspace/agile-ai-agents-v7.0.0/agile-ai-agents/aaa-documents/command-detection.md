# Command Detection System

## Overview
This document defines how AgileAiAgents detects and processes user commands starting with "/" to initiate specific workflows.

## Command Patterns

### Primary Workflow Commands
- `/start-new-project-workflow` - Initiates new project discovery and implementation
  - `--status` - Show current phase and progress
  - `--resume` - Resume from last checkpoint
  - `--save-state` - Save current progress mid-phase
  - `--dry-run` - Preview workflow phases without executing
  - `--parallel` - Enable parallel agent execution where applicable
- `/start-existing-project-workflow` - Analyzes existing code and plans enhancements
  - `--status` - Show current phase and progress
  - `--resume` - Resume from last checkpoint
  - `--save-state` - Save current progress mid-phase
  - `--dry-run` - Preview workflow phases without executing
  - `--parallel` - Enable parallel agent execution where applicable
- `/quickstart` - Interactive menu showing all available options
- `/aaa-help` - Lists all available AgileAiAgents commands with descriptions

### Sprint & State Commands
- `/status` - Shows current project and workflow status
- `/continue` - Resumes previous work session
- `/checkpoint` - Creates manual save point
- `/where-are-we` - Displays comprehensive context summary

### Research & Analysis Commands
- `/research-only` - Conducts research without implementation
- `/analyze-market` - Market analysis workflow
- `/analyze-competition` - Competitive analysis workflow
- `/analyze-code` - Code analysis for existing projects

### Sprint Management Commands
- `/start-sprint` - Begins a new sprint
- `/sprint-status` - Shows current sprint progress
- `/sprint-review` - Triggers sprint review process
- `/sprint-retrospective` - Initiates AI retrospective

### Document Generation Commands
- `/generate-prd` - Creates PRD from research
- `/generate-pitch-deck` - Creates investor materials
- `/generate-documentation` - Technical documentation

### Project Context Commands
- `/add-agile-context` - Add AgileAiAgents context to existing project CLAUDE.md
- `/init` - Initialize CLAUDE.md for current project (enhanced with AgileAiAgents awareness)

### Community Contribution Commands
- `/milestone` - Record milestone achievement and trigger contribution
- `/deployment-success` - Mark successful deployment and trigger contribution
- `/project-complete` - Mark project completion and final contribution
- `/capture-learnings` - Manually capture current project learnings
- `/show-contribution-status` - Check contribution readiness and history
- `/review-learnings` - Review captured learnings before submission
- `/skip-contribution` - Skip current contribution prompt
- `/learn-from-contributions` - Analyze community contributions for system improvements

## Detection Logic

1. **Pattern Matching**: Check if user input starts with "/"
2. **Command Validation**: Verify command exists in registry
3. **Parameter Extraction**: Parse any parameters after command
4. **Workflow Routing**: Route to appropriate agent/workflow
5. **State Initialization**: Set up workflow state tracking

## Command Registry

```javascript
const commands = {
  '/start-new-project-workflow': {
    agent: 'Project Analyzer Agent',
    workflow: 'new-project-discovery',
    description: 'Start a new project from idea to implementation',
    parameters: ['--status', '--resume', '--save-state', '--dry-run', '--parallel'],
    phases: ['discovery', 'research', 'analysis', 'requirements', 'planning', 'backlog', 'scaffold', 'sprint'],
    approvalGates: ['post-research', 'post-requirements', 'pre-implementation']
  },
  '/start-existing-project-workflow': {
    agent: 'Code Analyzer Agent', 
    workflow: 'existing-project-discovery',
    description: 'Analyze and enhance existing codebase',
    parameters: ['--status', '--resume', '--save-state', '--dry-run', '--parallel'],
    phases: ['analyze', 'discovery', 'assessment', 'planning', 'backlog', 'implementation'],
    approvalGates: ['post-analysis', 'pre-implementation']
  },
  '/quickstart': {
    agent: 'Scrum Master Agent',
    workflow: 'interactive-menu',
    description: 'Show interactive menu of all options',
    parameters: []
  },
  '/aaa-help': {
    agent: 'Scrum Master Agent',
    workflow: 'show-commands',
    description: 'List all available AgileAiAgents commands',
    parameters: ['command?']
  },
  '/status': {
    agent: 'Project State Manager Agent',
    workflow: 'show-status',
    description: 'Display current project status',
    parameters: []
  },
  '/continue': {
    agent: 'Project State Manager Agent',
    workflow: 'resume-work',
    description: 'Resume from previous session',
    parameters: ['sprint?']
  },
  '/checkpoint': {
    agent: 'Project State Manager Agent',
    workflow: 'create-checkpoint',
    description: 'Create project checkpoint',
    parameters: ['message?', '--full?']
  },
  '/update-state': {
    agent: 'Project State Manager Agent',
    workflow: 'update-state',
    description: 'Manually update project state',
    parameters: ['details']
  },
  '/save-decision': {
    agent: 'Project State Manager Agent',
    workflow: 'save-decision',
    description: 'Save important decision with rationale',
    parameters: ['decision', 'rationale?']
  },
  '/show-learnings': {
    agent: 'Learning Analysis Agent',
    workflow: 'show-learnings',
    description: 'Display captured project learnings',
    parameters: []
  },
  '/sprint-retrospective': {
    agent: 'Scrum Master Agent',
    workflow: 'sprint-retrospective',
    description: 'Conduct sprint retrospective (triggers contribution)',
    parameters: []
  },
  '/milestone': {
    agent: 'Project Manager Agent',
    workflow: 'record-milestone',
    description: 'Record milestone achievement',
    parameters: ['description']
  },
  '/deployment-success': {
    agent: 'DevOps Agent',
    workflow: 'mark-deployment-success',
    description: 'Mark successful deployment',
    parameters: []
  },
  '/project-complete': {
    agent: 'Project Manager Agent',
    workflow: 'mark-project-complete',
    description: 'Mark project as complete',
    parameters: []
  },
  '/skip-contribution': {
    agent: 'Learning Analysis Agent',
    workflow: 'skip-contribution',
    description: 'Skip current contribution prompt',
    parameters: ['reason?']
  },
  '/capture-learnings': {
    agent: 'Learning Analysis Agent',
    workflow: 'capture-learnings',
    description: 'Manually capture current project learnings',
    parameters: []
  },
  '/show-contribution-status': {
    agent: 'Learning Analysis Agent',
    workflow: 'show-contribution-status',
    description: 'Check contribution readiness and history',
    parameters: []
  },
  '/review-learnings': {
    agent: 'Learning Analysis Agent',
    workflow: 'review-learnings',
    description: 'Review captured learnings before submission',
    parameters: []
  },
  '/learn-from-contributions': {
    agent: 'Learning Analysis Agent',
    workflow: 'learn-from-contributions',
    description: 'Analyze community contributions for system improvements',
    parameters: ['--check-only?', '--analyze?', '--status?']
  },
  '/convert-md-to-json-aaa-documents': {
    agent: 'Document Manager Agent',
    workflow: 'convert-aaa-documents',
    description: 'Convert aaa-documents MD files to JSON format',
    parameters: []
  },
  '/convert-md-to-json-ai-agents': {
    agent: 'Document Manager Agent',
    workflow: 'convert-ai-agents',
    description: 'Convert ai-agents MD files to JSON format',
    parameters: []
  },
  '/convert-md-to-json-project-documents': {
    agent: 'Document Manager Agent',
    workflow: 'convert-project-documents',
    description: 'Convert project-documents MD files to JSON format',
    parameters: []
  },
  '/convert-all-md-to-json': {
    agent: 'Document Manager Agent',
    workflow: 'convert-all-documents',
    description: 'Convert all MD files to JSON format (agents, aaa-documents, project-documents)',
    parameters: []
  },
  '/add-agile-context': {
    agent: 'Project Structure Agent',
    workflow: 'add-agile-context',
    description: 'Add AgileAiAgents context to existing project CLAUDE.md',
    parameters: ['project-path?']
  },
  '/init': {
    agent: 'Project Structure Agent',
    workflow: 'init-project-context',
    description: 'Initialize or update CLAUDE.md with project and AgileAiAgents context',
    parameters: []
  },
  '/workflow-recovery': {
    agent: 'Workflow Recovery Handler',
    workflow: 'workflow-recovery',
    description: 'Access workflow error recovery and diagnostic tools',
    parameters: ['--diagnostic', '--restore-checkpoint', '--reset-workflow', '--reset-phase', '--skip-approval', '--skip-agent', '--retry-agent', '--safe-mode', '--exit-safe-mode', '--show-errors', '--validate-state', '--export-state', '--import-state']
  }
}
```

## Error Handling

### Invalid Commands
If user types an unrecognized command:
```
Unknown command: /[command]
Did you mean: /[suggestion]?
Type /aaa-help to see all available commands.
```

### Missing Parameters
If required parameters are missing:
```
Command /[command] requires: [parameter]
Usage: /[command] [parameter]
Example: /[command] [example]
```

## Implementation Guidelines

### For Claude Code
When detecting a command:
1. Check if input starts with "/"
2. Look up command in registry
3. If found, initiate the specified workflow
4. If not found, show error with suggestions
5. Always update workflow state when starting a new workflow

### State Tracking
When a command initiates a workflow:
```json
{
  "workflow_state": {
    "active_workflow": "new-project",
    "initiated_by": "/start-new-project-workflow",
    "started_at": "2025-01-20T10:00:00Z",
    "current_phase": "discovery"
  }
}
```

## Backward Compatibility
- If user provides project description without command, check for auto-orchestrator
- Commands take precedence over automatic detection
- Existing "Continue working" style commands still function

## MD to JSON Conversion Commands
These commands handle the conversion of markdown files to JSON format:
- `/convert-md-to-json-aaa-documents` - Convert aaa-documents to JSON
- `/convert-md-to-json-ai-agents` - Convert ai-agents to JSON
- `/convert-md-to-json-project-documents` - Convert project-documents to JSON
- `/convert-all-md-to-json` - Convert all document types at once

### Conversion Features
- Progress reporting during conversion
- Token reduction statistics
- Automatic CLAUDE.md reference updates
- File hash-based change detection
- Comprehensive md_reference for all sections

## Workflow Recovery Commands
The `/workflow-recovery` command provides comprehensive error handling and recovery:

### Diagnostic Options
- `--diagnostic` - Run comprehensive workflow diagnostics
- `--validate-state` - Validate current workflow state integrity
- `--show-errors [count]` - Display recent workflow errors

### Recovery Options
- `--restore-checkpoint [name]` - Restore from saved checkpoint
- `--reset-workflow` - Reset entire workflow (creates backup)
- `--reset-phase` - Reset current phase progress
- `--skip-approval` - Skip pending approval gate
- `--skip-agent [agent]` - Skip failed agent and continue
- `--retry-agent [agent]` - Retry failed agent operation

### Safe Mode
- `--safe-mode` - Enable restricted operations mode
- `--exit-safe-mode` - Return to normal operations

### State Management
- `--export-state [file]` - Export workflow state to file
- `--import-state [file]` - Import workflow state from file

## Future Commands
Reserved for future implementation:
- `/start-migration-workflow` - Technology migration projects
- `/start-optimization-workflow` - Performance optimization
- `/start-rescue-workflow` - Troubled project recovery
- `/list-agents` - Show all available agents
- `/list-documents` - Display project documents