# Sprint Organization

## Overview
This folder contains all sprint-related documents organized by sprint. Each sprint has its own folder containing all documents related to that specific sprint.

## Folder Structure

Complete path: `agile-ai-agents/project-documents/orchestration/sprints/`

```
agile-ai-agents/project-documents/orchestration/
├── stakeholder-decisions.md       # Project-level decisions + sprint rollup
├── stakeholder-escalations.md     # Project-level escalations + sprint rollup
└── sprints/
    ├── _templates/                # Templates for sprint documents
    ├── current-sprint -> sprint-XXX   # Symlink to active sprint
    ├── sprint-dependencies.md     # Cross-sprint dependencies
    └── sprint-YYYY-MM-DD-feature/    # Individual sprint folders
        ├── state.md              # Sprint state tracking
        ├── sprint-summary.md     # Overview and goals
        ├── sprint-version.md     # Version tracking
        ├── document-registry.md  # Document creation log
        ├── [planning documents]
        ├── sprint-pulse-updates/ # Daily updates
        ├── [active sprint docs]
        ├── [testing documents]
        ├── [review documents]
        ├── [retrospective documents]
        ├── stakeholder-decisions/    # Sprint-specific decisions
        │   ├── README.md
        │   └── decision-YYYY-MM-DD-HH-MM.md
        └── stakeholder-escalations/  # Sprint-specific escalations
            ├── README.md
            └── escalation-YYYY-MM-DD-HH-MM.md
```

## Sprint Naming Convention
`sprint-YYYY-MM-DD-feature-name`

Example: `sprint-2025-01-09-authentication`

## Sprint States
1. **planning** - Sprint being planned
2. **active** - Sprint in progress
3. **testing** - Features being tested
4. **review** - Sprint review with stakeholders
5. **retrospective** - Team retrospective
6. **completed** - Sprint finished
7. **archived** - Historical reference

## Creating a New Sprint
1. Scrum Master creates new sprint folder
2. Copies templates from `_templates/`
3. Sets initial state to "planning"
4. Updates `current-sprint` symlink when sprint becomes active

## Document Creation
All agents must coordinate with the Scrum Master Agent to create documents within sprint folders. This ensures:
- Proper organization
- Document registry tracking
- Consistent naming
- No scattered documents

## Important Notes
- The old folder structure (sprint-planning/, sprint-reviews/, etc.) is deprecated
- All new sprints use the consolidated folder structure
- Each sprint folder contains ALL documents for that sprint
- The `current-sprint` symlink always points to the active sprint