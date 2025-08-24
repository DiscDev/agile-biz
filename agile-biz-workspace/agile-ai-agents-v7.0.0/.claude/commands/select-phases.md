# /select-phases

Select operational or enhancement phases after core workflow completion.

## Description
Opens the phase selection menu after completing the sequential development/analysis phases. Allows users to choose which operational or enhancement phases to execute next.

## Usage
```
/select-phases [options]
```

## Options
- `--list` - List all available phases without selecting
- `--status` - Show current selected phases and progress
- `--package <name>` - Select a quick package (startup/enterprise/growth)
- `--mode <type>` - Set execution mode (sequential/parallel/priority)

## Prerequisites
- For new projects: MVP must be deployed (Phase 11 complete)
- For existing projects: Enhancement planning must be complete (Phase 8 complete)
- Workflow state must show `phase_selection_unlocked: true`

## Available Quick Packages

### Startup Package
Essential growth and analytics for new ventures:
- Launch Marketing Campaigns
- Analytics & Intelligence Setup
- Customer Onboarding Optimization

### Enterprise Package
Security, performance, and scale for established products:
- Security Hardening
- Performance Optimization
- Analytics & Intelligence Setup

### Growth Package
Marketing and revenue optimization:
- SEO Optimization
- Email Marketing Setup
- Monetization & Revenue Strategy

## Individual Phases (New Projects)

### Growth & Marketing
- Launch Campaigns (2-4 hours)
- SEO Optimization (2-3 hours)
- Email Marketing (3-4 hours)
- Social Media Setup (2-3 hours)

### Analytics & Intelligence
- Analytics Setup (2-3 hours)
- Business Intelligence (3-4 hours)
- Performance Monitoring (2-3 hours)

### Customer Success
- Customer Onboarding (3-4 hours)
- Retention Systems (3-4 hours)
- Support Automation (2-3 hours)

### Revenue Optimization
- Pricing Optimization (2-3 hours)
- Monetization Strategy (3-4 hours)
- Subscription Management (2-3 hours)

### Technical Enhancement
- Performance Optimization (2-4 hours)
- Infrastructure Scaling (3-5 hours)
- Security Hardening (3-4 hours)

## Individual Phases (Existing Projects)

### Technical Improvements
- Code Refactoring (variable)
- Performance Optimization (2-4 hours)
- Security Audit & Fixes (3-4 hours)
- Test Coverage Improvement (variable)

### Feature Development
- New Feature Development (variable)
- UI/UX Redesign (variable)
- API Expansion (variable)

### Infrastructure
- Technology Migration (variable)
- Scaling Implementation (3-5 hours)
- Monitoring Setup (2-3 hours)

## Execution Modes

### Sequential
Execute phases one at a time in order. Best for resource-constrained teams.

### Parallel (Recommended)
Execute independent phases simultaneously. Reduces timeline by 60%.

### Priority
Execute based on business value and dependencies.

## Example Workflows

### Example 1: Startup Launch
```
/select-phases --package startup --mode parallel
```
This selects the startup package and executes phases in parallel.

### Example 2: Custom Selection
```
/select-phases
> Select phases: 4,5,6,9
> Execution mode: parallel
```
Manually select specific phases and execution mode.

### Example 3: Enterprise Security Focus
```
/select-phases --package enterprise --mode sequential
```
Select enterprise package with sequential execution for careful rollout.

## State Management
- Selected phases are saved to `workflow-state.json`
- Progress tracked in real-time
- Can pause and resume phase execution
- Checkpoint created before each phase

## Notes
- Some phases may have dependencies
- Parallel execution reduces timeline by ~60%
- All phases create comprehensive documentation
- Each phase has dedicated agent assignments
- Progress visible in project dashboard