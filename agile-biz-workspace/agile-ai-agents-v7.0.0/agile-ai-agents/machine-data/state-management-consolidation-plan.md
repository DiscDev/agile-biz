# State Management Consolidation Plan

## Date: 2025-08-15
## Context: Discussion with user about consolidating AgileAiAgents state management

## Problem Summary

### Issues Identified

1. **Document Creation Not Working**: During workflows (`/new-project-workflow`, `/existing-project-workflow`), when "thorough" research level is selected (should create 194 documents), only a few documents were being created.

2. **Clean Slate Release Issues**: 
   - v6.2.1 release ships with pre-populated state files
   - Users starting fresh inherit old workflow states
   - Template includes "TEMPLATE_TIMESTAMP" placeholders instead of being empty

3. **State File Proliferation**: System has 16+ different state files across multiple directories

4. **Duplicate State Tracking**:
   - Document tracking in 3 places
   - Progress tracking in 3 places  
   - Workflow state in 2+ places

## Complete State File Inventory

### Primary State Files (project-state/)
1. `workflow-state.json` - Workflow phases, approvals, research levels
2. `current-state.json` - Should be master but mostly empty!
3. `current-session.json` - Session tracking
4. `agent-context.json` - Agent execution context
5. `model-routing-state.json` - LLM routing configuration
6. `document-tracking.json` - Document creation history
7. `startup-validation.json` - System startup checks
8. `decisions/decisions-log.json` - Decision tracking
9. `session-history/*.json` - Daily session logs
10. `checkpoints/*.json` - State snapshots
11. `workflow-states/*` - Historical workflow states

### Machine Data States (machine-data/)
12. `document-creation-tracking.json` - Document queue (DUPLICATE!)
13. `project-progress.json` - Dashboard metrics
14. `rebuild-states.json` - Rebuild workflow states
15. `improvement-selection-state.json` - Feature improvements
16. `document-lifecycle-state.json` - Document lifecycle management
17. `repository-evolution-tracking.json` - Code evolution
18. `implementation-tracking.json` - Implementation progress

### Orchestration States (WRONG LOCATION!)
19. `project-documents/orchestration/project-progress.json` - Another progress file!
20. `project-documents/orchestration/product-backlog/backlog-state.json` - Backlog state

## Commands That Manipulate State

```bash
/continue          # Reads workflow-state.json, resumes workflow
/checkpoint        # Creates snapshot in project-state/checkpoints/
/save-decision     # Appends to decisions-log.json AND project-documents/orchestration/
/aaa-status        # Reads multiple state files
/update-state      # Updates current-state.json
/capture-learnings # Updates learnings state
/session           # Session management commands
```

## Hooks That Manage State

1. **session-start.sh** → Calls session-tracker.js to create session
2. **state-backup.js** → Creates periodic backups
3. **state-integrity-check.js** → Validates state consistency  
4. **auto-save-manager.js** → Saves state periodically
5. **workflow-state-handler.js** → Main workflow state manager
6. **project-state-monitor.js** → Monitors state changes
7. **session-tracker.js** → Manages session history

## Statusline State Display

The statusline (`templates/claude-integration/.claude/hooks/statusline.sh`) reads:
- Workflow state: Active workflow, phase, progress
- Sprint info: Current sprint, stories complete/total, velocity
- Agent status: Active agents, parallel/sequential mode
- Cost tracking: Estimated cost from state
- Token usage: If enabled
- Dashboard status: Running/stopped
- Hook status: Active hooks count
- Learning status: Pending contributions

## State Categories Explained

### Runtime State (Changes frequently, resets on new workflow)
- Current workflow and phase
- Active session information
- Document creation queue
- Active agents and coordination
- Temporary execution context

### Persistent State (Survives resets, project history)
- Decision log
- Learnings captured
- Improvements selected
- Completed sprints
- Document creation history
- Checkpoints and backups

### Configuration State (Rarely changes, user preferences)
- Project information (name, dates)
- User preferences (research level, verbosity)
- Model routing configuration
- Hook settings
- System defaults

## Proposed Consolidation Options

### Option A: Three-File Approach
```
project-state/
├── runtime.json         # Everything that changes during execution
├── persistent.json      # User decisions, learnings, history
├── configuration.json   # Settings that rarely change
└── archives/           # Checkpoints and history
```

### Option B: Single Master State File
```
project-state/
├── state.json          # Single master state file
├── state.schema.json   # Schema for validation
├── checkpoints/        # Snapshots only
└── archive/           # Old sessions/decisions
```

With sections in state.json:
```json
{
  "version": "3.0.0",
  "workflow": {},      // Current workflow state
  "documents": {},     // Document tracking
  "session": {},       // Current session
  "history": {         // Persistent data
    "decisions": [],
    "learnings": [],
    "sprints": []
  },
  "config": {}         // User preferences
}
```

## Proposed /reset-project-state Command

```bash
/reset-project-state [options]

Options:
  --workflow        Reset workflow state only
  --documents       Reset document tracking only
  --keep-documents  Reset tracking but preserve created documents
  --keep-decisions  Preserve decision log
  --keep-sprints    Preserve sprint history
  --checkpoint      Create checkpoint before reset
  --full           Reset everything (requires confirmation)
  --dry-run        Show what would be reset without doing it
  --phase <name>   Reset to specific workflow phase
```

### Use Cases

1. **Research Level Change**: Stakeholder changes from minimal to thorough
   ```bash
   /reset-project-state --phase=stakeholder_discovery --keep-docs
   ```

2. **Start workflow over but keep research**:
   ```bash
   /reset-project-state --workflow --keep-documents
   ```

3. **Full reset with backup**:
   ```bash
   /reset-project-state --full --checkpoint
   ```

## Clean Slate Template Fix

Instead of shipping with pre-populated states:

```
templates/clean-slate/
├── project-state/
│   ├── .gitkeep
│   └── DEFAULTS/
│       ├── runtime.default.json      # Empty runtime state
│       ├── persistent.default.json   # Empty persistent state
│       └── configuration.default.json # Default settings
└── INIT_SCRIPT.js  # Copies defaults on first run
```

## Key Implementation Decisions Needed

1. **Consolidation Choice**: Three files vs single master file?
2. **Reset Granularity**: Support resetting to any phase or just key checkpoints?
3. **Document Preservation**: Keep .md files but clear tracking, or move to archive?
4. **State File Size Management**: Limit history (last 50 decisions), archive old sessions?
5. **Migration Priority**: Fix clean slate first or consolidation first?

## Fixed Issues (Already Implemented)

### Document Creation Fix
- Updated `workflow-document-manager.js` to use correct folder paths
- Added async/await support for document queueing
- Integrated document creation tracker with workflow state handler
- Set "thorough" as default research level
- Fixed trigger points at workflow phases

### Results
- Now properly queues 216 documents for thorough research (194 base + initialization)
- Documents organized by priority: Critical (6), Important (80), Helpful (130)

## User Requirements

1. **Simplicity**: Keep state management as simple as possible while functional
2. **Reset Flexibility**: Allow granular resets without losing work
3. **No Backwards Compatibility**: Can break existing states for clean implementation
4. **User Choice**: Ask user what to do with documents during reset
5. **Clean Slate Priority**: Ensure releases have truly empty states

## Next Steps

1. Decide on consolidation approach (3 files vs 1 file)
2. Implement state consolidation
3. Create /reset-project-state command
4. Fix clean slate template
5. Update all handlers to use new structure
6. Test complete workflow with new state system

## Notes

- No agents directly manipulate state files (they work through commands/hooks)
- About 30 files need updating to implement consolidation
- State validation schema would prevent future issues
- Consider state versioning for future migrations

---

**This document preserves the complete discussion about state management consolidation from 2025-08-15 for reference after context reset.**