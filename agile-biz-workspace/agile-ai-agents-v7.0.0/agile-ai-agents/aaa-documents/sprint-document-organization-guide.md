# Sprint Document Organization Guide
## Consolidated Sprint-Based Document Management

### Overview
This guide defines the new consolidated sprint organization structure where ALL documents for a sprint are kept together in a single sprint folder. This approach improves cohesion, simplifies navigation, and makes sprint archival straightforward.

## Required Folder Structure

All sprint documents MUST be organized in this structure:

```
agile-ai-agents/project-documents/orchestration/
├── stakeholder-decisions.md                     # Project-level decisions + sprint rollup
├── stakeholder-escalations.md                   # Project-level escalations + sprint rollup
└── sprints/
    ├── _templates/                              # Document templates for consistency
    │   ├── planning-agenda-template.md
    │   ├── sprint-summary-template.md
    │   ├── retrospective-template.md
    │   ├── pulse-update-template.md
    │   ├── state-template.md
    │   ├── document-registry-template.md
    │   ├── sprint-version-template.md
    │   ├── stakeholder-decision-template.md    # Includes README template
    │   └── stakeholder-escalation-template.md  # Includes README template
    │
    ├── current-sprint -> sprint-2025-01-09-authentication  # Symlink to active sprint
    ├── sprint-dependencies.md                   # Cross-sprint dependency tracking
    │
    ├── sprint-2025-01-09-authentication/        # Example sprint folder
    │   ├── state.md                            # Sprint state: planning/active/testing/review/retrospective/completed/archived
    │   ├── sprint-summary.md                   # Quick overview of goals and outcomes
    │   ├── sprint-version.md                   # Version tracking (start/end versions)
    │   ├── document-registry.md                # Which agent created which documents
    │   │
    │   ├── # Planning Phase Documents
    │   ├── planning-agenda.md
    │   ├── backlog-items.md
    │   ├── sprint-goal.md
    │   ├── agent-assignments.md
    │   ├── capacity-plan.md
    │   ├── risk-assessment.md
    │   ├── dependencies.md
    │   ├── definition-of-done.md
    │   ├── historical-learnings-applied.md
    │   │
    │   ├── # Active Sprint Documents
    │   ├── sprint-pulse-updates/               # Continuous updates during sprint
    │   │   ├── 2025-01-09-morning-pulse.md
    │   │   ├── 2025-01-09-afternoon-pulse.md
    │   │   └── 2025-01-09-evening-pulse.md
    │   ├── velocity-metrics.md
    │   ├── burndown-chart.md
    │   ├── blockers-log.md
    │   ├── story-points-tracking.md
    │   │
    │   ├── # Testing Phase Documents
    │   ├── test-coordination.md
    │   ├── test-results-summary.md
    │   │
    │   ├── # Review Phase Documents
    │   ├── review-agenda.md
    │   ├── demo-summary.md
    │   ├── stakeholder-feedback.md
    │   ├── decisions-made.md
    │   ├── action-items.md
    │   ├── scope-changes.md
    │   │
    │   ├── # Retrospective Phase Documents
    │   ├── coder-agent-retrospective.md
    │   ├── testing-agent-retrospective.md
    │   ├── devops-agent-retrospective.md
    │   ├── consolidated-retrospective.md
    │   ├── improvement-actions.md
    │   │
    │   ├── # Escalation & Decisions (Sprint-Specific)
    │   ├── stakeholder-escalations/
    │   │   ├── README.md
    │   │   └── escalation-YYYY-MM-DD-HH-MM.md
    │   └── stakeholder-decisions/
    │       ├── README.md
    │       └── decision-YYYY-MM-DD-HH-MM.md
    │
    └── sprint-2025-01-16-payment-integration/  # Next sprint
        └── ... (same structure)
```

## Sprint Naming Convention

### Format
`sprint-YYYY-MM-DD-feature-name`

### Examples
- `sprint-2025-01-09-authentication`
- `sprint-2025-01-16-payment-integration`
- `sprint-2025-01-23-user-dashboard`

### Rules
- Use the sprint start date in ISO format (YYYY-MM-DD)
- Feature name should be lowercase with hyphens instead of spaces
- Keep feature names concise but descriptive

## Sprint State Management

### State Transitions
The Scrum Master Agent enforces these state transitions:

```
planning → active → testing → review → retrospective → completed → archived
```

### State File (state.md)
Each sprint folder MUST contain a `state.md` file tracking:
```yaml
sprint: sprint-2025-01-09-authentication
state: active
started: 2025-01-09T09:00:00-08:00
last_updated: 2025-01-09T14:30:00-08:00
updated_by: scrum_master_agent
```

## Document Creation Workflow

### All Agents Request Through Scrum Master
```javascript
// Instead of creating documents directly:
// ❌ DON'T: await createDocument('/project-documents/my-doc.md', content);

// ✅ DO: Request through Scrum Master
const documentPath = await scrumMasterAgent.requestDocumentCreation({
  agentId: 'coder_agent',
  documentName: 'api-design.md',
  content: documentContent,
  purpose: 'API design documentation for authentication feature'
});
```

### Scrum Master Validates and Creates
The Scrum Master Agent:
1. Validates the request is appropriate for current sprint
2. Ensures proper naming conventions
3. Creates document in correct sprint folder
4. Updates document-registry.md
5. Returns path to requesting agent

### Document Registry Format
```markdown
# Document Registry - sprint-2025-01-09-authentication

| Document | Created By | Created At | Purpose |
|----------|------------|------------|---------|
| api-design.md | coder_agent | 2025-01-09T10:30:00-08:00 | API design for auth |
| test-plan.md | testing_agent | 2025-01-09T11:00:00-08:00 | Test strategy |
```

## Template Usage

### Creating New Sprints
1. Copy templates from `_templates/` folder
2. Customize with sprint-specific information
3. Maintain consistent format across all sprints

### Template Categories
- **Planning Templates**: For sprint planning phase
- **Tracking Templates**: For active sprint monitoring
- **Review Templates**: For sprint review ceremonies
- **Retrospective Templates**: For team retrospectives

## Active Sprint Management

### Current Sprint Symlink
- Always maintain `current-sprint` symlink pointing to active sprint
- Update when transitioning to new sprint
- Enables quick access without knowing sprint name

### Example Commands
```bash
# View current sprint
ls -la sprints/current-sprint/

# Update current sprint (Scrum Master only)
ln -sfn sprint-2025-01-16-payment-integration sprints/current-sprint
```

## Cross-Sprint Dependencies

### Tracking in sprint-dependencies.md
```markdown
# Sprint Dependencies

## sprint-2025-01-16-payment-integration
Depends on:
- sprint-2025-01-09-authentication: User auth system required for payments
- sprint-2025-01-02-database-setup: Payment tables need base schema

## sprint-2025-01-23-user-dashboard
Depends on:
- sprint-2025-01-09-authentication: User must be logged in
- sprint-2025-01-16-payment-integration: Show payment history
```

## Stakeholder Interaction Dual Structure

### Overview
Stakeholder decisions and escalations operate at both project and sprint levels:

### Project Level (in 00-orchestration root)
- **stakeholder-decisions.md**: Major project-wide decisions + sprint decision rollup
- **stakeholder-escalations.md**: Project-wide escalations + sprint escalation rollup

### Sprint Level (in each sprint folder)
- **stakeholder-decisions/**: Sprint-specific decisions
- **stakeholder-escalations/**: Sprint-specific escalations

### Implementation Guide

#### For Decisions:
1. **Sprint-specific decisions** (e.g., "Use JWT for auth") go in sprint folder
2. **Project-wide decisions** (e.g., "Use React framework") go in project file
3. Project file maintains links to all sprint decisions for easy access

#### For Escalations:
1. Issues start at sprint level
2. If resolved within sprint, stays in sprint folder
3. If impacts beyond sprint, gets "promoted" to project level
4. Original stays in sprint, summary added to project file

### Benefits:
- Clear separation between sprint and project scope
- Easy to find decisions/escalations at both levels
- Natural escalation path from sprint to project
- Historical tracking preserved in sprint folders
- Rollup view for reporting and analysis

## Version Control Integration

### Sprint Version Tracking (sprint-version.md)
```yaml
sprint: sprint-2025-01-09-authentication
start_version: v1.2.3
end_version: v1.3.0
commits: 47
features_added: 
  - JWT authentication
  - Password reset flow
  - Two-factor authentication
bugs_fixed: 12
```

## Benefits of Consolidated Structure

1. **Better Cohesion**: All sprint artifacts in one place
2. **Clear Chronology**: Sprint folders show natural progression
3. **Easier Archival**: Complete sprints easily archived
4. **Reduced Navigation**: No jumping between directories
5. **Improved Context**: Full sprint story in one location
6. **Simplified Access**: Current sprint always accessible
7. **Better Tracking**: Document registry shows complete picture

## Migration Notes

This structure is for **new projects going forward**. Existing projects should continue using their current structure unless a migration is specifically planned.

## Common Patterns

### Starting a New Sprint
1. Scrum Master creates new sprint folder
2. Copies templates from `_templates/`
3. Sets initial state to "planning"
4. Updates current-sprint symlink
5. Notifies all agents

### During Active Sprint
1. Agents request document creation through Scrum Master
2. Pulse updates created multiple times daily
3. Metrics updated continuously
4. Blockers logged as they occur

### Completing a Sprint
1. State transitions through testing → review → retrospective
2. All ceremonies documented
3. State set to "completed"
4. Sprint can be archived later

## Anti-Patterns to Avoid

### ❌ DON'T:
- Create sprint documents outside the sprints folder
- Bypass Scrum Master for document creation
- Mix documents from different sprints
- Forget to update state.md
- Create documents without registry entries

### ✅ DO:
- Always work within current sprint folder
- Coordinate through Scrum Master
- Maintain clear sprint boundaries
- Keep state.md current
- Track all documents in registry

## Monitoring and Compliance

The Project Dashboard Agent monitors:
- Document creation patterns
- Compliance with structure
- State transition validity
- Registry completeness
- Current sprint activity

---

This consolidated approach ensures all sprint information is organized, accessible, and maintainable throughout the project lifecycle.