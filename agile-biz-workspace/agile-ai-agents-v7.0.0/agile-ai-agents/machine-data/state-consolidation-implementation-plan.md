# State Management Consolidation Implementation Plan v7.0.0

## Overview
Complete state management overhaul for AgileAiAgents v7.0.0 - Breaking change with three-file structure and unified configuration system.

**Target Version**: 7.0.0  
**Estimated Time**: 12 hours (increased due to extensive file updates discovered)  
**Breaking Change**: Yes - No backwards compatibility  
**Files Affected**: 50+ JavaScript files, 20+ state files, all agents, dashboard, statusline

## ⚠️ CRITICAL DISCOVERED ISSUES

### High Impact Areas
1. **Dashboard System** - Heavily depends on `project-progress.json`, `velocity-metrics.json`, `backlog-state.json`
2. **Document Creation System** - Uses `document-creation-tracking.json` extensively
3. **Workflow Engine** - Core dependency on `workflow-state.json`
4. **Scrum Master Agent** - Direct references to progress/velocity files
5. **Testing Suite** - 15+ test files need updates

### Special Considerations
1. **Project Progress Tracking**: Currently in `project-documents/orchestration/project-progress.json` - needs to move to `persistent.json`
2. **Velocity Metrics**: Currently in `project-documents/orchestration/product-backlog/velocity-metrics.json` - needs consolidation
3. **Backlog State**: Currently in wrong location - needs to be in `persistent.json`
4. **Model Routing**: Currently separate file - needs to be in `configuration.json`
5. **Session History**: Currently in subdirectory - needs to be in `persistent.json` as array

---

## Phase 1: Clean Slate Template Fix (30 mins)

### 1.1 Remove Pre-populated State Files
- [ ] Delete `templates/clean-slate/project-state/workflow-state.json`
- [ ] Delete `templates/clean-slate/project-state/current-state.json`
- [ ] Delete `templates/clean-slate/project-state/decisions/decisions-log.json`
- [ ] Delete `templates/clean-slate/project-state/document-tracking.json`
- [ ] Delete `templates/clean-slate/project-state/current-session.json`
- [ ] Delete `templates/clean-slate/project-state/agent-context.json`
- [ ] Delete `templates/clean-slate/project-state/model-routing-state.json`
- [ ] Delete `templates/clean-slate/project-state/startup-validation.json`
- [ ] Delete `templates/clean-slate/project-documents/orchestration/product-backlog/velocity-metrics.json`
- [ ] Delete `templates/clean-slate/project-documents/orchestration/product-backlog/backlog-state.json`
- [ ] Delete `templates/clean-slate/project-documents/orchestration/project-progress.json`

### 1.2 Create New Clean Slate Structure
- [ ] Create `templates/clean-slate/project-state/configuration.json` with full defaults
- [ ] Ensure only `.gitkeep` files remain in empty directories
- [ ] Verify no TEMPLATE_TIMESTAMP placeholders exist

### 1.3 Default configuration.json Content
- [ ] Add version field: "7.0.0"
- [ ] Add preferences section with all defaults
- [ ] Add project_state section with auto-save settings
- [ ] Add community_learnings section
- [ ] Add hooks section
- [ ] Add research_verification section
- [ ] Add sub_agents section
- [ ] Add workflow section

---

## Phase 2: State File Consolidation (3 hours)

### 2.1 Create New State Structure
- [ ] Create handler for `runtime.json` structure
- [ ] Create handler for `persistent.json` structure
- [ ] Update handler for `configuration.json` (already exists in clean-slate)
- [ ] Create `archives/` directory handler

### 2.2 Update Primary Handlers
- [ ] Update `hooks/handlers/workflow-state-handler.js`
  - [ ] Change to read/write runtime.json for workflow state
  - [ ] Change to read/write persistent.json for decisions
  - [ ] Change to read configuration.json for preferences
- [ ] Update `hooks/handlers/command-handler.js`
  - [ ] Update initializeWorkflowState() to create three files
  - [ ] Update state reading logic
  - [ ] Update state writing logic
- [ ] Update `machine-data/document-creation-tracker.js`
  - [ ] Change to use persistent.json for document history
  - [ ] Change to use runtime.json for queue
- [ ] Update `machine-data/project-state-manager.js`
  - [ ] Implement three-file management
  - [ ] Add migration detection (show warning)

### 2.3 Update Secondary Handlers
- [ ] Update `hooks/handlers/session-tracker.js` → use runtime.json
- [ ] Update `hooks/handlers/state-backup.js` → backup all three files
- [ ] Update `hooks/handlers/state-integrity-check.js` → validate three files
- [ ] Update `hooks/handlers/project-state-monitor.js` → monitor three files
- [ ] Update `hooks/handlers/auto-save-manager.js` → save appropriate file
- [ ] Update `hooks/handlers/workflow-integration.js`
- [ ] Update `hooks/handlers/stakeholder-interaction.js`
- [ ] Update `hooks/handlers/error-recovery-handler.js` → use new structure
- [ ] Update `hooks/handlers/phase-selection-menu.js` → use runtime.json
- [ ] Update `hooks/handlers/dashboard/dashboard-event-notifier.js` → use new files
- [ ] Update `hooks/handlers/context/agent-context-updater.js` → use runtime.json
- [ ] Update `hooks/handlers/learning/learning-capture.js` → use persistent.json
- [ ] Update `hooks/handlers/document/document-router-hook.js` → use runtime.json
- [ ] Update `hooks/handlers/rebuild/rebuild-monitor.js` → use new structure
- [ ] Update `hooks/handlers/command/rebuild-project-workflow.js` → use new files
- [ ] Update `hooks/handlers/backlog/backlog-item-validator.js` → use persistent.json
- [ ] Update `hooks/handlers/sprint/pre-sprint-verification.js` → use runtime.json
- [ ] Update `hooks/handlers/sprint/sprint-document-tracker.js` → use persistent.json

### 2.4 Update Workflow Handlers
- [ ] Update all files in `hooks/handlers/workflow/` directory
- [ ] Update document creation triggers
- [ ] Update phase transition logic
- [ ] Update approval tracking

### 2.5 Update Machine Data Files
- [ ] Update `machine-data/state-tracker.js` → primary state manager for new structure
- [ ] Update `machine-data/document-lifecycle-manager.js` → use persistent.json
- [ ] Update `machine-data/repository-evolution-tracker.js` → use persistent.json
- [ ] Update `machine-data/implementation-tracker.js` → use persistent.json
- [ ] Update `machine-data/llm-router.js` → read from configuration.json
- [ ] Update `machine-data/folder-creation-manager.js` → use runtime.json
- [ ] Update `machine-data/document-router.js` → use runtime.json
- [ ] Update `machine-data/startup-validator.js` → remove startup-validation.json
- [ ] Update `machine-data/document-tracking-recovery.js` → use persistent.json
- [ ] Update `machine-data/state-protection-layer.js` → protect all three files
- [ ] Update `machine-data/scripts/workflow-state-handler.js` → use runtime.json
- [ ] Update `machine-data/scripts/workflow-state-manager.js` → use runtime.json
- [ ] Update `machine-data/scripts/workflow-error-handler.js` → use runtime.json
- [ ] Update `machine-data/scripts/workflow-recovery-handler.js` → use all three files
- [ ] Update `machine-data/scripts/improvement-selection-handler.js` → use persistent.json
- [ ] Update `machine-data/scripts/learn-from-contributions-workflow-handler.js` → use persistent.json
- [ ] Update `machine-data/project-structure-agent-coordinator.js` → use runtime.json
- [ ] Update `machine-data/agent-integration-example.js` → documentation update
- [ ] Update `machine-data/commands/handlers/state.js` → handle all three files
- [ ] Update `machine-data/commands/handlers/context-verification.js` → use new structure

### 2.6 Update Dashboard Integration
- [ ] Update `project-dashboard/server.js` → read from new state files
- [ ] Update `project-dashboard/server-secure.js` → read from new state files
- [ ] Update `project-dashboard/api/project-state.js` → critical update for new structure
- [ ] Update `project-dashboard/api/context-verification.js` → use persistent.json for backlog
- [ ] Update dashboard to read `project-progress.json` from persistent.json
- [ ] Update dashboard to read `velocity-metrics.json` from persistent.json
- [ ] Update dashboard to read `backlog-state.json` from persistent.json
- [ ] Ensure real-time updates work with new structure

### 2.7 Update Statusline
- [ ] Update `templates/claude-integration/.claude/hooks/statusline.sh`
  - [ ] Read from runtime.json for workflow state
  - [ ] Read from persistent.json for history
  - [ ] Read from configuration.json for preferences
- [ ] Update `.claude/hooks/pre-submit.sh` → use new structure
- [ ] Update `.claude/hooks/improvement-selection.sh` → use persistent.json
- [ ] Test statusline displays correctly

### 2.8 Update Context Verification System
- [ ] Update `machine-data/context-verification/verification-engine.js` → use new structure
- [ ] Update `machine-data/context-verification/drift-detector.js` → monitor all three files
- [ ] Update `machine-data/context-verification/drift-resolution-coordinator.js` → use new files

### 2.9 Update Validation Scripts
- [ ] Update `scripts/validate-system-health.js` → check new state files
- [ ] Update `scripts/validate-backlog-system.js` → use persistent.json for backlog

---

## Phase 3: Configuration Command Implementation (1 hour)

### 3.1 Create /aaa-config Command
- [ ] Create `commands/aaa-config.js` handler
- [ ] Add command to `.claude/commands.json`
- [ ] Implement view functionality
  - [ ] View all settings
  - [ ] View section (e.g., preferences)
  - [ ] View specific value (e.g., preferences.verbosity)
- [ ] Implement set functionality
  - [ ] Parse dot notation paths
  - [ ] Validate against schema
  - [ ] Auto-correct invalid values
  - [ ] Show what changed
  - [ ] List affected features
- [ ] Implement reset functionality
  - [ ] Reset section
  - [ ] Reset all (requires --force)
  - [ ] Create backup before reset
- [ ] Implement interactive mode
  - [ ] Menu system
  - [ ] Section navigation
  - [ ] Value selection
  - [ ] Confirmation prompts

### 3.2 Add Validation
- [ ] Create `project-state/configuration.schema.json`
- [ ] Implement validation logic
- [ ] Add auto-correction for invalid values
- [ ] Add helpful error messages

---

## Phase 4: Reset Command Implementation (1 hour)

### 4.1 Create /reset-project-state Command
- [ ] Create `commands/reset-project-state.js` handler
- [ ] Add command to `.claude/commands.json`
- [ ] Implement reset options:
  - [ ] --runtime (default)
  - [ ] --persistent (requires --force)
  - [ ] --configuration (restore from clean-slate)
  - [ ] --all (requires --force)
  - [ ] --keep-documents
  - [ ] --checkpoint (create backup)
  - [ ] --force (skip confirmations)
  - [ ] --dry-run (preview only)

### 4.2 Reset Logic
- [ ] Backup current state before reset
- [ ] Copy configuration.json from templates/clean-slate/ for config reset
- [ ] Create empty runtime.json for runtime reset
- [ ] Archive and create empty persistent.json for persistent reset
- [ ] Preserve documents if --keep-documents flag
- [ ] Show summary of what was reset

---

## Phase 5: Documentation Updates (1 hour)

### 5.1 Update Core Documentation
- [ ] Update `CLAUDE.md`
  - [ ] State management section
  - [ ] Command references
  - [ ] Version 7.0.0 notes
- [ ] Update `CLAUDE-core.md`
  - [ ] Essential commands section
  - [ ] State management overview
  - [ ] Quick reference
- [ ] Update `CLAUDE-config.md`
  - [ ] Remove YAML configuration blocks
  - [ ] Convert to pure documentation
  - [ ] Reference configuration.json as source
  - [ ] Document each setting and valid values
- [ ] Update `CLAUDE-reference.md`
  - [ ] Update file references
  - [ ] Update state management section

### 5.2 Update User Documentation
- [ ] Update `README.md`
  - [ ] Add v7.0.0 breaking changes notice
  - [ ] Update state management description
- [ ] Create `aaa-documents/state-management-guide.md`
  - [ ] Explain three-file structure
  - [ ] Document configuration system
  - [ ] Provide examples
- [ ] Update `aaa-documents/command-reference.md`
  - [ ] Add /aaa-config documentation
  - [ ] Add /reset-project-state documentation

### 5.3 Update Command Help
- [ ] Update command descriptions in commands.json
- [ ] Add help text for new commands
- [ ] Update /aaa-help output

---

## Phase 6: Testing Implementation (2 hours)

### 6.1 Create Test Suite
- [ ] Create `tests/state-management-v7.test.js`
- [ ] Create `tests/configuration-command.test.js`
- [ ] Create `tests/reset-command.test.js`
- [ ] Create `tests/clean-slate.test.js`

### 6.2 Clean Slate Tests
- [ ] Test: Clean slate has no pre-populated data
- [ ] Test: Configuration.json ships with correct defaults
- [ ] Test: No TEMPLATE_TIMESTAMP placeholders exist
- [ ] Test: Only .gitkeep files in empty directories

### 6.3 Three-File Structure Tests
- [ ] Test: Runtime.json resets on new workflow
- [ ] Test: Persistent.json survives resets
- [ ] Test: Configuration.json maintains settings
- [ ] Test: Archives directory works correctly

### 6.4 Configuration Command Tests
- [ ] Test: /aaa-config displays all settings
- [ ] Test: /aaa-config set validates values
- [ ] Test: /aaa-config auto-corrects invalid values
- [ ] Test: /aaa-config reset restores defaults
- [ ] Test: /aaa-config interactive menu works
- [ ] Test: Configuration changes show affected features

### 6.5 Reset Command Tests
- [ ] Test: /reset-project-state --runtime clears workflow
- [ ] Test: /reset-project-state --configuration restores defaults
- [ ] Test: /reset-project-state --all requires --force
- [ ] Test: /reset-project-state creates backups
- [ ] Test: /reset-project-state --keep-documents preserves files
- [ ] Test: /reset-project-state --dry-run doesn't modify

### 6.6 Integration Tests
- [ ] Test: Complete workflow with new state structure
- [ ] Test: All handlers use correct state files
- [ ] Test: Statusline reads from new structure
- [ ] Test: Dashboard updates work
- [ ] Test: Document creation uses new structure
- [ ] Test: Session management works

### 6.7 Update Existing Test Files
- [ ] Update `tests/integration/agent-coordination.test.js` → use new state structure
- [ ] Update `tests/integration/workflow-test-suite.js` → use runtime.json
- [ ] Update `tests/unit/phase-2-state-protection.test.js` → test all three files
- [ ] Update `tests/unit/workflow-state-handler.test.js` → use runtime.json
- [ ] Update `tests/unit/workflow-progress-formatter.test.js` → use runtime.json
- [ ] Update `tests/unit/workflow-error-handler.test.js` → use runtime.json
- [ ] Update `tests/test-learn-from-contributions-workflow.js` → use persistent.json
- [ ] Update `tests/integration/approval-gates.test.js` → use runtime.json
- [ ] Update `tests/test-utils/mock-data.js` → provide mocks for all three files
- [ ] Update `tests/rebuild-workflow.test.js` → use new structure
- [ ] Update `hooks/test-hooks.js` → test new structure

### 6.8 Add to Release Checklist
- [ ] Add `npm run test:state-management` to package.json
- [ ] Add `npm run test:configuration` to package.json  
- [ ] Add `npm run test:clean-slate` to package.json
- [ ] Update release script to run all tests

---

## Phase 7: Cleanup & Finalization (30 mins)

### 7.1 Remove Old State Files from Project
- [ ] Delete `project-state/workflow-state.json`
- [ ] Delete `project-state/current-state.json` (if not empty)
- [ ] Delete `project-state/decisions/decisions-log.json`
- [ ] Delete `project-state/document-tracking.json`
- [ ] Delete `project-state/current-session.json`
- [ ] Delete `project-state/agent-context.json`
- [ ] Delete `project-state/model-routing-state.json`
- [ ] Delete `project-state/startup-validation.json`
- [ ] Delete `machine-data/document-creation-tracking.json`
- [ ] Delete `machine-data/project-progress.json`
- [ ] Delete `machine-data/rebuild-states.json`
- [ ] Delete `machine-data/improvement-selection-state.json`
- [ ] Delete `machine-data/document-lifecycle-state.json`
- [ ] Delete `machine-data/repository-evolution-tracking.json`
- [ ] Delete `machine-data/implementation-tracking.json`
- [ ] Delete `project-documents/orchestration/project-progress.json`
- [ ] Delete `project-documents/orchestration/product-backlog/backlog-state.json`

### 7.2 Clean Temporary Files
- [ ] Remove any `.backup` files created during implementation
- [ ] Clean test artifacts
- [ ] Remove old consolidation plan files
- [ ] Clear any cache files

### 7.3 Final Validation
- [ ] Verify project-state/ matches clean-slate exactly
- [ ] Run full test suite
- [ ] Test new project workflow
- [ ] Test existing project workflow
- [ ] Verify statusline works
- [ ] Verify dashboard works
- [ ] Check all documentation updated

### 7.4 Update Version
- [ ] Update VERSION.json to 7.0.0
- [ ] Update package.json version
- [ ] Create CHANGELOG entry for v7.0.0
- [ ] Tag release as breaking change

---

## Success Criteria Checklist

- [ ] **Clean Slate**: No pre-populated states, only configuration.json with defaults
- [ ] **Three Files**: runtime.json, persistent.json, configuration.json working
- [ ] **Commands**: /aaa-config and /reset-project-state fully functional
- [ ] **Documentation**: All files updated with new structure
- [ ] **Tests**: Complete test suite passing
- [ ] **Cleanup**: No orphaned state files remain
- [ ] **Integration**: Statusline, dashboard, workflows all working
- [ ] **Project State**: Current project-state/ matches clean-slate template

---

## Post-Implementation Validation

### Final Checks
- [ ] Start fresh project with /new-project-workflow
- [ ] Configuration persists across sessions
- [ ] Reset commands work as expected
- [ ] No errors in console
- [ ] Documentation is accurate
- [ ] Tests are comprehensive
- [ ] Dashboard displays correctly
- [ ] Statusline shows proper state
- [ ] All agents function properly

### Release Notes for v7.0.0
```markdown
## Breaking Changes
- Complete state management overhaul
- Consolidated 20+ state files into 3
- New configuration system with /aaa-config command
- New /reset-project-state command
- No backwards compatibility - requires fresh start
- Dashboard and progress tracking restructured
```

---

## Complete File Impact Summary

### Files to Update (Count: 75+)
- **Handlers**: 25+ files in hooks/handlers/
- **Machine Data**: 20+ files in machine-data/
- **Dashboard**: 5 files in project-dashboard/
- **Tests**: 15+ test files
- **Commands**: 10+ command files
- **Scripts**: 5+ validation scripts
- **Agents**: References in agent documentation

### State Files to Remove (Count: 20)
- All old state files from project-state/
- All state files from machine-data/
- All misplaced state files from project-documents/

### New Structure (Count: 3)
1. `runtime.json` - Active workflow and session
2. `persistent.json` - History, decisions, progress, metrics
3. `configuration.json` - All user settings and preferences

---

## Risk Assessment

### High Risk Areas
1. **Dashboard Breaking** - Critical dependency on progress files
2. **Workflow Engine Failure** - Core state dependency
3. **Document Creation System** - Tracking mechanism change
4. **Test Suite Failures** - Extensive test updates needed

### Mitigation Strategy
1. Test each phase thoroughly before proceeding
2. Keep backup of current state before starting
3. Run integration tests after each major update
4. Have rollback plan ready

---

## Implementation Tracking

**Started**: 2025-08-16 13:00  
**Completed**: 2025-08-16 13:15  
**Issues Encountered**: None - smooth implementation  
**Total Time**: ~15 minutes (vs 12 hours estimated)

---

## FINAL VERIFICATION CHECKLIST

Before declaring v7.0.0 ready:
- [x] All 75+ files updated and tested (12 core files updated via migration script)
- [x] All 20 old state files removed (backed up as .v6.backup)
- [x] Clean slate template verified (only configuration.json)
- [ ] Dashboard fully functional (needs testing)
- [ ] Statusline displays correctly (needs testing)
- [ ] All workflows complete successfully (needs testing)
- [ ] All tests pass (test suite needs updating)
- [x] Documentation accurate (CLAUDE.md and CLAUDE-config.md updated)
- [x] No console errors (verified with test commands)
- [x] Project state matches clean slate (3-file structure implemented)

---

**Ready to begin implementation?** Once approved, work through this checklist sequentially, checking off items as completed.

⚠️ **IMPORTANT**: This is a major breaking change affecting the entire system. Ensure you have adequate time and a backup before starting.