# Command Handlers Documentation

## Overview
This document defines how each command should be processed by Claude Code when working with AgileAiAgents.

## Command Processing Flow

### 1. Command Detection
```
User Input → Check for "/" prefix → Validate Command → Route to Handler
```

### 2. State Initialization
When a workflow command is executed:
```json
{
  "workflow_state": {
    "active_workflow": "[workflow-type]",
    "initiated_by": "[command]",
    "started_at": "[timestamp]",
    "workflow_phase": "initialization"
  }
}
```

## Command Handler Implementations

### `/start-new-project-workflow`

**Handler**: Project Analyzer Agent
**Workflow**: new-project-discovery

**Processing Steps**:
1. Initialize workflow state as "new-project"
2. Set phase to "discovery"
3. Load interview template from `workflow-templates/new-project-workflow-template.md`
4. Begin Section 1: Project Vision & Purpose
5. Create directory structure:
   ```
   project-documents/new-project-planning/stakeholder-interview/
   ```

**Error Handling**:
- If user abandons: Save state for `/continue`
- If unclear response: Ask for clarification (max 3 attempts)
- If section skipped: Note and proceed with warning

### `/start-existing-project-workflow`

**Handler**: Code Analyzer Agent → Project Analyzer Agent
**Workflow**: existing-project-discovery

**Processing Steps**:
1. Initialize workflow state as "existing-project"
2. Set phase to "analysis"
3. Run automatic codebase analysis
4. Present findings to stakeholder
5. Load interview template from `workflow-templates/existing-project-workflow-template.md`
6. Begin contextual interview based on findings
7. Create directory structure:
   ```
   project-documents/existing-project-analysis/
   ```

**Error Handling**:
- If no code found: Ask for repository location
- If analysis fails: Proceed with manual interview
- Large codebases: Warn about analysis time

### `/quickstart`

**Handler**: Scrum Master Agent
**Workflow**: interactive-menu

**Processing Steps**:
1. Load menu from `workflow-templates/quickstart-menu-template.md`
2. Display main menu
3. Track menu state:
   ```json
   {
     "menu_state": {
       "current_menu": "main",
       "navigation_history": []
     }
   }
   ```
4. Handle user input (numbers or commands)
5. Route to appropriate command or submenu

**Navigation Handling**:
- Number input: Map to command and execute
- "back": Return to previous menu
- "exit": Clear menu state
- Invalid: Show error with guidance

### `/aaa-help`

**Handler**: Scrum Master Agent
**Workflow**: show-commands

**Processing Steps**:
1. If no parameter: Show general help from template
2. If parameter provided:
   - Search command registry
   - Show specific help if found
   - Show suggestions if not found
3. Include context-aware sections:
   - Current activity
   - Suggested next steps

**Special Cases**:
- `/aaa-help start` - Show all commands starting with "start"
- `/aaa-help [unknown]` - Show closest matches

### Sprint Management Commands

#### `/start-sprint`
**Handler**: Scrum Master Agent
**Steps**:
1. Check for active sprint
2. If exists, ask to close it first
3. Create new sprint structure
4. Initialize sprint state

#### `/sprint-status`
**Handler**: Scrum Master Agent
**Steps**:
1. Load current sprint state
2. Show progress metrics
3. List active tasks
4. Show blockers

#### `/sprint-review`
**Handler**: Scrum Master Agent
**Steps**:
1. Compile sprint accomplishments
2. Generate review document
3. Ask for stakeholder feedback

### Research & Analysis Commands

#### `/research-only`
**Handler**: Research Coordinator Agent
**Steps**:
1. Run stakeholder interview (simplified)
2. Ask for research depth
3. Execute research without implementation
4. Generate research synthesis

#### `/analyze-market`
**Handler**: Market Research Agent
**Steps**:
1. Focused market analysis workflow
2. Competitive landscape
3. Market size and opportunity

#### `/analyze-code`
**Handler**: Code Analyzer Agent
**Steps**:
1. Deep code analysis only
2. Generate comprehensive report
3. No enhancement planning

### Documentation Commands

#### `/generate-prd`
**Handler**: PRD Agent
**Steps**:
1. Check for existing research
2. If none, run abbreviated discovery
3. Generate comprehensive PRD

#### `/generate-pitch-deck`
**Handler**: VC Report Agent
**Steps**:
1. Compile project information
2. Create investor presentation
3. Include financials if available

### State Management Commands

#### `/status`
**Handler**: Project State Manager Agent
**Response Format**: See `workflow-templates/state-commands-template.md`
**Steps**:
1. Load current project state
2. Format comprehensive status display
3. Include workflow, sprint, tasks, decisions
4. Show last save timestamp

#### `/continue [sprint-name]`
**Handler**: Project State Manager Agent
**Steps**:
1. Parse optional sprint parameter
2. Load appropriate state (specific or last)
3. Display resumption context
4. Set working environment
5. Suggest next action

#### `/checkpoint [message] [--full]`
**Handler**: Project State Manager Agent
**Steps**:
1. Parse parameters (message, --full flag)
2. Check save_mode configuration
3. Create checkpoint or update based on mode
4. Use message or generate summary
5. Display confirmation per style

#### `/update-state [details]`
**Handler**: Project State Manager Agent
**Steps**:
1. Parse details string
2. Update current-state.json
3. Trigger auto-save if configured
4. Show confirmation message

#### `/save-decision [decision] [rationale]`
**Handler**: Project State Manager Agent
**Steps**:
1. Create structured decision record
2. Add to decisions log with timestamp
3. Check decision_threshold
4. Trigger auto-save if threshold met
5. Confirm decision saved

#### `/show-learnings`
**Handler**: Learning Analysis Agent
**Steps**:
1. Load learnings from project
2. Categorize and format display
3. Show contribution readiness
4. Provide contribution command if ready

### Community Contribution Commands

#### `/sprint-retrospective`
**Handler**: Scrum Master Agent
**Steps**:
1. Execute standard retrospective workflow
2. Generate retrospective document
3. Check contribution configuration
4. If enabled, signal Learning Analysis Agent
5. Schedule contribution prompt based on settings

#### `/milestone [description]`
**Handler**: Project Manager Agent
**Steps**:
1. Validate description parameter
2. Record milestone in project state
3. Update milestone tracking document
4. Signal Learning Analysis Agent if contributions enabled
5. Add milestone to contribution context

#### `/deployment-success`
**Handler**: DevOps Agent
**Steps**:
1. Record deployment success
2. Capture deployment metrics
3. Log challenges and solutions
4. Signal Learning Analysis Agent
5. Focus contribution on deployment insights

#### `/project-complete`
**Handler**: Project Manager Agent
**Steps**:
1. Update project state to complete
2. Generate comprehensive project summary
3. Compile all learnings across project
4. Trigger final contribution workflow
5. Extended delay for comprehensive review

#### `/skip-contribution [reason]`
**Handler**: Learning Analysis Agent
**Steps**:
1. Parse optional reason parameter
2. Cancel any pending contribution prompt
3. Record skip reason if provided
4. Apply skip duration from configuration
5. Update contribution state

#### `/contribution-status`
**Handler**: Learning Analysis Agent
**Response Format**: See `workflow-templates/contribution-status-template.md`
**Steps**:
1. Load current contribution state
2. Check pending prompts
3. Retrieve contribution history
4. Calculate readiness score
5. Display formatted status

#### `/contribute-now`
**Handler**: Learning Analysis Agent
**Steps**:
1. Cancel any scheduled prompts
2. Immediately start contribution workflow
3. Capture and anonymize learnings
4. Show review screen
5. Submit if approved

## Error Handling Patterns

### Invalid Command
```
❌ Unknown command: /[input]

Did you mean:
  /[suggestion1] - [description]
  /[suggestion2] - [description]

Type /aaa-help to see all commands.
```

### Workflow Already Active
```
⚠️ You already have an active workflow: [workflow-name]

Would you like to:
1. Continue the current workflow (/continue)
2. Save and switch to new workflow
3. Cancel

Choose an option:
```

### Missing Prerequisites
```
⚠️ This command requires [prerequisite]

Please ensure:
- [Requirement 1]
- [Requirement 2]

Would you like help with this? (yes/no)
```

## State Persistence

All commands that modify state should:
1. Update workflow_state immediately
2. Create checkpoint after significant actions
3. Log command execution in project history
4. Preserve context for `/continue`

### `/workflow-recovery`

**Handler**: Workflow Recovery Handler  
**Workflow**: workflow-recovery

**Processing Steps**:
1. Parse recovery command argument
2. Execute appropriate recovery action
3. Log recovery attempt and outcome
4. Update workflow state if recovery successful

**Command Options**:
- `--diagnostic`: Run full system diagnostics
- `--restore-checkpoint [name]`: Restore from checkpoint
- `--reset-workflow`: Reset entire workflow (with backup)
- `--reset-phase`: Reset current phase only
- `--skip-approval`: Skip pending approval gate
- `--safe-mode`: Enable restricted operations
- `--show-errors [count]`: Display recent errors

**Error Handling**:
- All recovery operations create backups first
- Failed recovery attempts are logged
- Manual intervention instructions provided
- Safe mode prevents cascading failures

## Command Aliases (Future)

Consider supporting common aliases:
- `/new` → `/start-new-project-workflow`
- `/existing` → `/start-existing-project-workflow`
- `/start` → `/quickstart`
- `/h` → `/aaa-help`
- `/recovery` → `/workflow-recovery`

## Integration with Auto-Orchestrator

When auto-orchestrator is active:
1. Commands take precedence
2. Direct project descriptions still work
3. Command provides more structured experience
4. State tracking enhanced with command context

## Error Recovery Integration

All command handlers include error recovery:
1. Automatic error detection and logging
2. Recovery suggestions based on error type
3. State corruption protection with backups
4. Graceful degradation to safe mode
5. Manual recovery options via `/workflow-recovery`