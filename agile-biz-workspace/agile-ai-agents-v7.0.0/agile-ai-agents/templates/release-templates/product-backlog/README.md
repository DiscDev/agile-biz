# Product Backlog

This folder contains the product backlog and velocity tracking for your AgileAI project.

## Initial State

The backlog starts empty (0 items, 0 points). It will be automatically populated when you run:

### For New Projects
1. Run `/start-new-project-workflow`
2. Complete the discovery phases
3. In Phase 7, the Project Manager Agent will:
   - Transform your PRD into user stories
   - Create epics and backlog items
   - Populate `backlog-state.json`
   - Dashboard will show your actual project items

### For Existing Projects
1. Run `/start-existing-project-workflow`
2. Complete analysis and discovery
3. In Phase 7, the Project Manager Agent will:
   - Create enhancement stories
   - Add technical debt items
   - Update `backlog-state.json`

### Manual Creation
You can also manually create backlog items:
```
Acting as Project Manager Agent, create user story for [feature]
```

## Files

- `backlog-state.json` - Current backlog items and metrics (managed by Project Manager Agent)
- `velocity-metrics.json` - Sprint velocity tracking (managed by Scrum Master Agent)
- `backlog-items/` - Individual story files organized by epic
- `estimation-guidelines.md` - Story point reference (AI-speed: 1 point = 1-5 minutes)

## Dashboard Integration

The AgileAI Dashboard reads these files to display:
- Total backlog items and points
- Ready points for sprint planning
- Average team velocity
- Sprint planning metrics

The dashboard updates automatically as the Project Manager Agent creates and updates backlog items during the workflow phases.

## Workflow Integration

This backlog is actively managed during:
- **Initial Creation**: Phase 7 of new/existing project workflows
- **Sprint Planning**: Items selected and marked "In Sprint"
- **Sprint Review**: Completed items marked "Done"
- **Ongoing**: New items added as discovered

The backlog is NOT just example data - it represents your actual project work items created by the AI agents based on your project requirements.