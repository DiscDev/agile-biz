# /existing-project-workflow

Analyze existing codebase and plan enhancements systematically.

## Description
Launches the AgileAiAgents existing project workflow for comprehensive codebase analysis and enhancement planning.

## Usage
```
/existing-project-workflow [options]
```

## Options
- `--status` - Show current phase and progress
- `--resume` - Resume from last checkpoint
- `--save-state` - Save current progress mid-phase
- `--dry-run` - Preview workflow phases without executing
- `--parallel` - Enable parallel agent execution where applicable

## Workflow Phases

### Stage 1: Sequential Analysis (Phases 1-8)
1. **Setup Verification** (5 minutes) - Validate environment and existing project structure
2. **Code Analysis** (30-60 minutes) - Deep technical analysis by specialized agents
3. **Identity Verification** (15 minutes) - Confirm project identity and goals
4. **Enhancement Goals** (30 minutes) - Interactive discovery of improvement objectives
5. **Analysis Depth Selection** (5 minutes) - Choose Standard/Comprehensive/Enterprise
6. **Deep Analysis** (1-4 hours) - Parallel analysis based on selected depth
7. **Enhancement Planning** (45 minutes) - Prioritized improvement roadmap
8. **Recommendations** (30 minutes) - Final recommendations and next steps

### Stage 2: Flexible Enhancements (Choose from 25 phases post-analysis)
After analysis completion, use `/select-phases` to choose enhancement phases:
- Quick Packages: Performance, Security, Modernization
- Individual phase selection
- Parallel execution option (60% time reduction)

## Analysis Components
- Technology Stack Analysis
- System Architecture Review
- Code Quality Assessment
- Security Implementation Analysis
- Performance Optimization Opportunities
- Feature Functionality Inventory
- External Integrations Mapping
- Development Environment Analysis
- Technical Debt Assessment
- Scalability Analysis

## Approval Gates
- Identity Confirmation (after phase 3)
- Scope Approval (after phase 4)
- Analysis Review (after phase 6)
- Enhancement Plan Approval (after phase 7)
- Pre-Implementation Review (before enhancements)

## Example
```
/existing-project-workflow
```

This will start the pre-flight checks and codebase analysis.

## Notes
- Stakeholder Interview Agent helps identify enhancement goals
- Supports all major languages and frameworks
- Identifies technical debt and optimization opportunities automatically
- Preserves existing functionality while planning improvements
- Creates comprehensive enhancement documentation
- All findings saved to `project-documents/business-strategy/existing-project/`
- Two-stage workflow: Sequential analysis → Flexible enhancements
- Parallel execution reduces timeline by 60% in Stage 2
- Auto-save triggers on analysis completion and approval gates
- Smart error recovery with checkpoint restoration