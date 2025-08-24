# Workflow Enhancements v3.4.0

## Overview

Version 3.4.0 introduces significant enhancements to the `/start-new-project-workflow` and `/start-existing-project-workflow` commands, providing phase-level control, approval gates, state management, and comprehensive error recovery.

## New Features

### 1. Sequential Phase Execution

Both workflows now execute in distinct, manageable phases:

**New Project Workflow (8 phases)**:
1. Discovery - Stakeholder interview
2. Research - Market analysis and validation
3. Analysis - Synthesis and insights
4. Requirements - PRD creation
5. Planning - Technical architecture
6. Backlog - Sprint planning
7. Scaffold - Project setup
8. Sprint - Implementation

**Existing Project Workflow (6 phases)**:
1. Analyze - Code quality assessment
2. Discovery - Stakeholder interview
3. Assessment - Enhancement opportunities
4. Planning - Implementation strategy
5. Backlog - Task prioritization
6. Implementation - Code changes

### 2. Command Parameters

#### Status Commands
```bash
/start-new-project-workflow --status
/start-existing-project-workflow --status
```
Shows current phase, progress percentage, active agents, and documents created.

#### Resume Workflow
```bash
/start-new-project-workflow --resume
/start-existing-project-workflow --resume
```
Continues from the last saved state or after approval gates.

#### Save State
```bash
/start-new-project-workflow --save-state "Taking a break"
/start-existing-project-workflow --save-state "Checkpoint before meeting"
```
Creates a checkpoint with optional note for later resumption.

#### Dry Run
```bash
/start-new-project-workflow --dry-run
/start-existing-project-workflow --dry-run
```
Preview all phases, approval gates, and estimated time without execution.

#### Parallel Mode
```bash
/start-new-project-workflow --parallel
/start-existing-project-workflow --parallel
```
Enable parallel agent execution within phases where applicable.

### 3. Approval Gates

Strategic checkpoints requiring stakeholder approval:

**New Project Workflow Gates**:
- **Post-Research**: After market research, before analysis
- **Post-Requirements**: After PRD creation, before planning
- **Pre-Implementation**: After scaffolding, before sprints

**Existing Project Workflow Gates**:
- **Post-Analysis**: After code analysis, before discovery
- **Pre-Implementation**: After backlog, before implementation

### 4. Real-Time Progress Display

#### Claude Code Display
```
🚀 New Project Workflow Progress
================================
Current Phase: Market Research & Analysis (2 of 8)
Progress: 45% █████████░░░░░░░░░░░

📊 Active Agents (2):
  🔍 Research Agent: Analyzing market trends
  💰 Finance Agent: Calculating financial projections

📄 Documents Created: 8 of 14

⏱️ Time Elapsed: 1h 15m | Est. Remaining: 2.5 hours
```

#### Dashboard Widget
Real-time workflow monitoring at `http://localhost:3001`:
- Visual progress bars
- Phase timeline with completion status
- Active agent tracking
- Document creation progress
- Approval gate alerts

### 5. Error Recovery System

#### Recovery Command
```bash
/workflow-recovery [option]
```

**Diagnostic Options**:
- `--diagnostic` - Run comprehensive diagnostics
- `--validate-state` - Check state integrity
- `--show-errors [count]` - Display recent errors

**Recovery Options**:
- `--restore-checkpoint [name]` - Restore from checkpoint
- `--reset-workflow` - Reset entire workflow
- `--reset-phase` - Reset current phase
- `--skip-approval` - Skip pending approval
- `--safe-mode` - Enable restricted operations

### 6. State Management

#### Automatic State Saving
- After each phase completion
- At approval gates
- On error occurrence
- Every 30 minutes (configurable)

#### Manual State Commands
```bash
/checkpoint "End of day progress"
/update-state "Completed research phase, found 3 key competitors"
/save-decision "Chose React over Vue" "Better ecosystem support"
```

## Workflow Execution Examples

### Starting a New Project
```bash
/start-new-project-workflow

# System response:
🚀 New project workflow initialized
📋 Workflow ID: workflow-2025-01-20-123456
📊 Starting phase: Stakeholder Discovery Interview
⏱️ Estimated total time: 24-32 hours (8 phases)
💡 Use --status to check progress anytime
```

### Checking Progress
```bash
/start-new-project-workflow --status

# System response:
📊 Workflow Status Report
========================
Workflow ID: workflow-2025-01-20-123456
Type: New Project
Started: 2 hours ago
Execution Mode: Sequential

📅 Phase Timeline:
✅ Stakeholder Discovery Interview - Completed (45 min)
🔄 Market Research & Analysis - In Progress (65%)
○ Analysis & Synthesis - Pending
[... more phases ...]
```

### Handling Approval Gates
```bash
# When reaching an approval gate:
⚠️ Approval Gate: Post-Research Review
========================================
Phase completed: Market Research & Analysis
Documents created: 14
Next phase: Analysis & Synthesis

Review documents in: project-documents/research/

To continue: /start-new-project-workflow --resume
To modify: Review documents and update as needed
```

### Error Recovery
```bash
/workflow-recovery --diagnostic

# System response:
🔍 Workflow Diagnostics Report
==============================
📊 Workflow State: Active
✅ Validation: PASSED
💾 Recent Checkpoints: 3 available
❌ Recent Errors: 1 (Agent timeout)

💡 Recommendations:
- Recovery checkpoint available from 15 minutes ago
- Use --restore-checkpoint to recover
```

## Best Practices

### 1. Regular Checkpoints
- Use `--save-state` before breaks
- Add descriptive notes for context
- Checkpoint before risky operations

### 2. Approval Gate Reviews
- Review all generated documents
- Provide feedback before approval
- Use gate pauses for stakeholder alignment

### 3. Error Handling
- Run diagnostics if issues occur
- Use safe mode for critical workflows
- Keep backups of important states

### 4. Parallel Execution
- Enable for faster execution
- Monitor agent coordination
- Disable if consistency issues arise

## Migration from Previous Versions

### For Users of v3.3.x
- Commands remain backward compatible
- Old `/start-new-project-workflow` still works
- New parameters are optional enhancements

### State File Locations
- Workflow states: `project-state/workflow-states/`
- Checkpoints: `project-state/workflow-states/checkpoints/`
- Error logs: `project-state/error-logs/`

## Technical Details

### State Structure
```json
{
  "workflow_id": "workflow-2025-01-20-123456",
  "workflow_type": "new-project",
  "current_phase": "research",
  "phase_index": 1,
  "phase_details": {
    "name": "Market Research & Analysis",
    "progress_percentage": 45,
    "active_agents": [...],
    "documents_created": 8,
    "documents_total": 14
  },
  "awaiting_approval": null,
  "can_resume": true,
  "checkpoints": {...}
}
```

### Integration Points
- Command detection: `/aaa-documents/command-detection.md`
- State handler: `/machine-data/scripts/workflow-state-handler.js`
- Progress formatter: `/machine-data/scripts/workflow-progress-formatter.js`
- Error handler: `/machine-data/scripts/workflow-error-handler.js`

## Troubleshooting

### Common Issues

**Workflow won't resume**:
- Check for pending approval gates
- Verify state file exists
- Run `/workflow-recovery --diagnostic`

**Progress not updating**:
- Ensure agents are active
- Check for errors in logs
- Try `--reset-phase` if stuck

**Dashboard not showing workflow**:
- Verify dashboard is running (port 3001)
- Check browser console for errors
- Refresh page or restart dashboard

### Support Commands
```bash
/workflow-recovery --help
/aaa-help workflow
/status
```

## Future Enhancements

Planned for future releases:
- Phase-specific timeouts
- Custom approval workflows
- Workflow templates
- Multi-project coordination
- Advanced analytics

---

For more information, see:
- `/aaa-documents/command-detection.md`
- `/aaa-documents/command-handlers.md`
- `/tests/TESTING-GUIDE.md`