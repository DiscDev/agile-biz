# Sprint Document Coordination Protocol

## Overview
This protocol ensures all agents consistently organize sprint documents within the `agile-ai-agents/project-documents/orchestration/` folder structure.

## Agent Responsibilities

### Auto Project Orchestrator
**Primary Responsibility**: Initialize folder structure at project start
- Creates all sprint-related folders during project initialization
- Validates folder structure before sprint activities begin
- Enforces naming conventions across all agents

### Scrum Master Agent
**Primary Responsibility**: Sprint execution documents
- Owns `sprint-tracking/` folder for all ongoing sprint activities
- Creates sprint pulse updates throughout the day
- Manages velocity metrics and burndown charts
- Maintains blocker logs and story point tracking
- Coordinates sprint ceremony documentation

### Project Manager Agent
**Primary Responsibility**: Strategic sprint documents
- Creates initial sprint planning templates in `sprint-planning/`
- Documents stakeholder decisions in `stakeholder-decisions.md`
- Manages escalation documents in `stakeholder-escalation/`
- Reviews and approves sprint summaries

### All Other Agents
**When creating sprint-related documents**:
- MUST use the standardized paths defined below
- MUST coordinate with Scrum Master for sprint execution docs
- MUST coordinate with Project Manager for strategic docs

## Standardized Sprint Document Paths

```javascript
const SPRINT_DOCUMENT_PATHS = {
  // Base path for all orchestration documents
  base: 'agile-ai-agents/project-documents/orchestration',
  
  // Sprint-specific folders
  planning: 'agile-ai-agents/project-documents/orchestration/sprint-planning',
  tracking: 'agile-ai-agents/project-documents/orchestration/sprint-tracking',
  reviews: 'agile-ai-agents/project-documents/orchestration/sprint-reviews',
  retrospectives: 'agile-ai-agents/project-documents/orchestration/sprint-retrospectives',
  testing: 'agile-ai-agents/project-documents/orchestration/sprint-testing',
  
  // Stakeholder communication
  escalation: 'agile-ai-agents/project-documents/orchestration/stakeholder-escalation',
  decisions: 'agile-ai-agents/project-documents/orchestration/stakeholder-decisions.md'
};
```

## Sprint Document Types and Locations

### Product Backlog (`product-backlog/`) - NEW
- `backlog-items/` - Epic folders containing user stories (Created by Project Manager)
- `backlog-state.json` - Current backlog state and metrics (Updated by Project Manager)
- `velocity-metrics.json` - Historical velocity data (Updated by Scrum Master after each sprint)
- `dependency-map.md` - Visual dependency tracking (Updated by Project Manager)
- `backlog-refinement-log.md` - Refinement session notes (Updated by Scrum Master)

### Sprint Planning (`sprint-planning/sprint-{N}/`)
- `sprint-{N}-planning-agenda.md` - Created by Project Manager
- `sprint-{N}-selected-backlog-items.md` - Created by Scrum Master from Product Backlog
- `sprint-{N}-sprint-goal.md` - Created by Project Manager
- `sprint-{N}-agent-assignments.md` - Created by Project Manager
- `sprint-{N}-capacity-plan.md` - Created by Scrum Master using velocity data

### Sprint Tracking (`sprint-tracking/sprint-{N}/`)
- `pulse-updates/pulse-YYYY-MM-DD-HHMMSS-[event-type].md` - Created by Scrum Master
- `velocity-metrics.md` - Updated continuously by Scrum Master
- `burndown-chart.md` - Updated on story completion by Scrum Master
- `blockers-log.md` - Updated as needed by Scrum Master
- `story-points-tracking.md` - Updated continuously by Scrum Master

### Sprint Reviews (`sprint-reviews/sprint-{N}/`)
- `sprint-{N}-review-agenda.md` - Created by Scrum Master
- `sprint-{N}-demo-summary.md` - Created by Scrum Master
- `sprint-{N}-stakeholder-feedback.md` - Created by Project Manager
- `sprint-{N}-decisions-made.md` - Created by Project Manager
- `sprint-{N}-action-items.md` - Created by Scrum Master

### Sprint Retrospectives (`sprint-retrospectives/sprint-{N}/`)
- `sprint-{N}-{agent}-retrospective.md` - Created by each agent
- `sprint-{N}-consolidated-retrospective.md` - Created by Scrum Master
- `sprint-{N}-improvement-actions.md` - Created by Scrum Master

## Coordination Workflow

### Product Backlog Management (NEW)
1. **Project Manager** maintains product backlog items and priorities
2. **Scrum Master** facilitates weekly refinement sessions
3. **Both** collaborate on estimation and dependency identification
4. **Scrum Master** updates velocity metrics after each sprint

### Sprint Start
1. **Scrum Master** loads refined backlog items and velocity data
2. **Project Manager** prioritizes items for sprint selection
3. **Scrum Master** calculates sprint capacity based on velocity
4. **Both** collaborate to select items within capacity
5. **Scrum Master** updates backlog-state.json to mark items "In Sprint"

### During Sprint
1. **Scrum Master** maintains all tracking documents
2. **Agents** create their work in appropriate folders (NOT in orchestration)
3. **Project Manager** handles any stakeholder escalations

### Sprint End
1. **Scrum Master** coordinates review documentation
2. **All Agents** submit retrospectives to correct folder
3. **Scrum Master** consolidates retrospectives
4. **Scrum Master** calculates actual velocity and updates velocity-metrics.json
5. **Both** update backlog-state.json to mark completed items as "Done"
6. **Both** conduct backlog refinement for newly discovered items

## Common Mistakes to Avoid

### ❌ DON'T:
- Create sprint documents in agent-specific folders (e.g., 21-implementation/)
- Put sprint documents in the root project-documents folder
- Use inconsistent naming patterns
- Create duplicate tracking systems

### ✅ DO:
- Always use `00-orchestration/` for ALL sprint documents
- Follow the exact folder structure defined above
- Use consistent sprint numbering (sprint-01, sprint-02, etc.)
- Coordinate with appropriate agent before creating documents

## Validation Checklist

Before creating any sprint document:
1. [ ] Am I using the correct base path (`00-orchestration/`)?
2. [ ] Am I putting it in the right subfolder?
3. [ ] Am I following the naming convention?
4. [ ] Have I coordinated with the responsible agent?
5. [ ] Does the sprint folder structure exist?

## Implementation in Code

### Example: Creating a Sprint Planning Document
```javascript
const sprintNumber = getCurrentSprintNumber();
const planningPath = `${SPRINT_DOCUMENT_PATHS.planning}/sprint-${sprintNumber}`;

// Ensure folder exists
await ensureFolderExists(planningPath);

// Create document with correct naming
const docPath = `${planningPath}/sprint-${sprintNumber}-planning-agenda.md`;
await createDocument(docPath, content);
```

### Example: Creating a Pulse Update
```javascript
const sprintNumber = getCurrentSprintNumber();
const date = new Date().toISOString().split('T')[0];
const period = getPeriodOfDay(); // morning, afternoon, evening

const pulsePath = `${SPRINT_DOCUMENT_PATHS.tracking}/sprint-${sprintNumber}/pulse-updates`;
await ensureFolderExists(pulsePath);

const docPath = `${pulsePath}/${date}-${period}-pulse.md`;
await createDocument(docPath, pulseContent);
```

## Benefits of Consistent Organization

1. **Predictability**: Everyone knows where to find sprint documents
2. **Automation**: Tools can reliably process sprint documents
3. **History**: Easy to review past sprint documentation
4. **Clarity**: Clear separation between sprint phases
5. **Efficiency**: No time wasted searching for documents

## Monitoring and Compliance

The Project Dashboard Agent will:
- Monitor document creation in real-time
- Alert when documents are created in wrong locations
- Provide visual representation of sprint document organization
- Track compliance with naming conventions

---

By following this protocol, all AgileAiAgents will maintain consistent sprint document organization throughout the project lifecycle.