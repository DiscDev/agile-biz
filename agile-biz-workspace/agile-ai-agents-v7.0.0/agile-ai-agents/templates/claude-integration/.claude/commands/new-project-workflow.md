# /new-project-workflow

Start a structured new project discovery and implementation process.

## Description
Launches the AgileAiAgents new project workflow with sequential phases, approval gates, and comprehensive research.

## Usage
```
/new-project-workflow [options]
```

## Options
- `--status` - Show current phase and progress
- `--resume` - Resume from last checkpoint
- `--save-state` - Save current progress mid-phase
- `--dry-run` - Preview workflow phases without executing
- `--parallel` - Enable parallel agent execution where applicable

## Workflow Phases

### Stage 1: Sequential Development (Phases 1-11)
1. **Setup Verification** (5 minutes) - Validate environment and configuration
2. **Stakeholder Discovery** (45-90 minutes) - Interactive requirements gathering with AI operations vision
3. **Research Depth Selection** (5 minutes) - Choose MINIMAL/MEDIUM/THOROUGH (defaults to THOROUGH after 24h)
4. **Research Execution** (1-10 hours) - Parallel research based on selected level
5. **Requirements Synthesis** (30 minutes) - Consolidate findings into PRD
6. **Architecture Design** (45 minutes) - Technical architecture and system design
7. **Development Planning** (30 minutes) - Sprint planning and timeline
8. **First Sprint** (2-4 hours) - Core implementation
9. **Testing & QA** (1 hour) - Quality assurance and validation
10. **Documentation** (1 hour) - Technical and user documentation
11. **MVP Deployment** (30 minutes) - Initial deployment and verification

### Stage 2: Flexible Operations (Choose from 29 phases post-MVP)
After MVP deployment, use `/select-phases` to choose operational phases:
- Quick Packages: Startup, Enterprise, Growth
- Individual phase selection
- Parallel execution option (60% time reduction)

## Approval Gates
- Post-Research Review (after phase 4)
- Requirements Approval (after phase 5)  
- Pre-Implementation Review (after phase 7)
- Identity Confirmation (for existing projects)
- Scope Approval (for enhancements)

## Example
```
/new-project-workflow
```

This will start the interactive stakeholder interview process.

## Notes
- Stakeholder Interview Agent guides you through setup
- Default research level is THOROUGH if stakeholder doesn't respond within 24 hours
- All documents saved to `project-documents/` folder organized by category
- State automatically saved with checkpoint system for resumption
- Parallel execution reduces timeline by 60% in Stage 2
- Two-stage workflow: Sequential development → Flexible operations
- Approval gates ensure quality at key milestones
- Auto-save triggers on document creation and phase transitions