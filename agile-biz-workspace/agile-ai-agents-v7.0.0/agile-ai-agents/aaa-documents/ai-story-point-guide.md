# AI Agent Story Point Reference Guide

## Overview
This guide provides standardized story point estimation for AI agents operating at accelerated speeds. Story points represent complexity and effort, not time duration. Sprints complete when committed story points are delivered.

## Story Point Scale (Fibonacci)

### 1 Point - Trivial
**AI Agent Time**: 1-5 minutes
**Examples**:
- Update configuration file
- Fix typo in documentation
- Add simple validation rule
- Update environment variable
- Simple CSS color change

### 2 Points - Simple
**AI Agent Time**: 5-10 minutes
**Examples**:
- Add new field to existing form
- Create basic CRUD endpoint
- Simple database query optimization
- Add basic unit test
- Update API response format

### 3 Points - Standard
**AI Agent Time**: 10-20 minutes
**Examples**:
- New API endpoint with validation
- Component with multiple interactions
- Database schema migration
- Integration with external service
- Basic authentication implementation

### 5 Points - Complex
**AI Agent Time**: 20-40 minutes
**Examples**:
- Multi-step workflow implementation
- Complex data transformation
- Advanced search functionality
- Real-time feature with WebSockets
- Cross-service integration

### 8 Points - Very Complex
**AI Agent Time**: 40-90 minutes
**Examples**:
- New microservice creation
- Major feature with multiple components
- Complex business logic implementation
- Advanced security implementation
- Performance optimization project

### 13 Points - Epic (Consider Breaking Down)
**AI Agent Time**: 90-180 minutes
**Examples**:
- Complete authentication system
- Multi-tenant architecture implementation
- Major architectural refactoring
- Complex third-party integration
- Advanced analytics dashboard

### 21+ Points - Major Epic (Must Break Down)
**AI Agent Time**: 3-6 hours
- Should be decomposed into smaller stories
- Too large for single sprint commitment
- Requires detailed analysis and breakdown

## Estimation Factors

### Technical Complexity
- **Low**: Standard CRUD operations, simple UI components
- **Medium**: Business logic, integrations, moderate algorithms
- **High**: Complex algorithms, performance optimization, architectural changes

### Integration Points
- **None (0)**: Self-contained work
- **Few (1-2)**: Simple API calls, database interactions
- **Many (3+)**: Multiple service dependencies, complex data flow

### Testing Requirements
- **Basic (+0)**: Unit tests only
- **Moderate (+1)**: Integration tests required
- **Extensive (+2)**: E2E, performance, security testing

### Unknown/Risk Factors
- **Low Risk (+0)**: Well-understood requirements
- **Medium Risk (+1)**: Some unknowns, research needed
- **High Risk (+2)**: Significant unknowns, proof of concept needed

### Documentation Needs
- **Minimal (+0)**: Code comments only
- **Standard (+1)**: API docs, README updates
- **Extensive (+2)**: User guides, architecture docs

## AI Agent Specific Considerations

### Coder Agent Stories
```yaml
1 point: "Fix CSS styling bug"
3 points: "Implement user registration API"
5 points: "Create real-time chat feature"
8 points: "Build notification system"
13 points: "Implement OAuth integration"
```

### Testing Agent Stories
```yaml
1 point: "Add single unit test"
3 points: "Create test suite for API endpoint"
5 points: "Implement E2E testing for workflow"
8 points: "Set up performance testing"
13 points: "Create comprehensive test automation"
```

### UI/UX Agent Stories
```yaml
1 point: "Update button styling"
3 points: "Design new form component"
5 points: "Create responsive dashboard layout"
8 points: "Design complete user onboarding flow"
13 points: "Create comprehensive design system"
```

### DevOps Agent Stories
```yaml
1 point: "Update environment variable"
3 points: "Set up CI/CD pipeline"
5 points: "Configure monitoring and alerting"
8 points: "Implement blue-green deployment"
13 points: "Set up multi-environment infrastructure"
```

### Security Agent Stories
```yaml
1 point: "Add input validation"
3 points: "Implement rate limiting"
5 points: "Set up security scanning"
8 points: "Implement comprehensive audit logging"
13 points: "Complete security compliance framework"
```

## Sprint Planning Guidelines

### Sprint Commitment Rules
- **Total Points**: Aim for 15-25 points per sprint
- **Risk Buffer**: Reserve 20% capacity for unknowns
- **Agent Capacity**: Consider agent specialization and availability

### Velocity Tracking
- **Initial Velocity**: Start conservative (10-15 points)
- **Velocity Adjustment**: Adjust based on completed sprints
- **Team Velocity**: Track points/hour for future planning

### Story Breakdown Guidelines
```yaml
Large Stories (8+ points):
  - Break into smaller, independent stories
  - Ensure each story delivers value
  - Consider dependencies and sequence

Epic Management (13+ points):
  - Always decompose before sprint planning
  - Create user story map
  - Identify MVP scope first
```

## Planning Poker for AI Agents

### Estimation Process
1. **Story Reading**: Review user story and acceptance criteria
2. **Clarification**: Discuss unknowns and dependencies
3. **Individual Estimation**: Each agent estimates independently
4. **Discussion**: Share reasoning for estimates
5. **Consensus**: Agree on final point value

### Common Estimation Biases
- **Optimism Bias**: Underestimating complexity
- **Anchoring**: Being influenced by first estimate
- **Availability Heuristic**: Overweighting recent experiences

### Estimation Calibration
```yaml
After Each Sprint:
  - Review actual vs estimated effort
  - Identify patterns in over/under estimation
  - Adjust future estimates based on learnings
  - Update complexity factors
```

## Velocity Measurement

### Points Per Hour Calculation
```
Sprint Velocity = Completed Story Points / Total Sprint Hours
Team Velocity = Sum of Agent Velocities
Projected Completion = Remaining Points / Team Velocity
```

### Velocity Trends
- **Improving**: Velocity increasing over time
- **Stable**: Consistent velocity (ideal state)
- **Declining**: May indicate technical debt or complexity growth

### Sprint Metrics
```yaml
Key Metrics:
  - Commitment Accuracy: (Delivered Points / Committed Points) * 100
  - Velocity Trend: 3-sprint moving average
  - Estimation Accuracy: Actual effort vs estimated points
  - Sprint Completion Rate: Stories completed vs committed
```

## Quality Gates

### Definition of Done by Points
```yaml
1-2 Points:
  - Code review completed
  - Unit tests passing
  - Basic documentation

3-5 Points:
  - Integration tests passing
  - Security review completed
  - Performance validated

8+ Points:
  - E2E tests passing
  - Stakeholder demo completed
  - Production deployment validated
```

### Story Acceptance Criteria
- All acceptance criteria met
- Code quality standards maintained
- Tests passing at appropriate level
- Documentation updated
- Stakeholder approval received

## Continuous Improvement

### Sprint Retrospective Questions
1. **Estimation Accuracy**: Were our estimates accurate?
2. **Velocity Trends**: Is our velocity improving?
3. **Story Sizing**: Are we breaking down stories appropriately?
4. **Quality Impact**: How did story size affect quality?

### Refinement Process
- **Regular Backlog Grooming**: Keep stories estimated and ready
- **Story Splitting**: Practice breaking large stories
- **Estimation Review**: Calibrate estimates based on outcomes
- **Process Improvement**: Adapt based on team learnings

---

**Remember**: Story points represent complexity and effort, not time. The goal is consistent, predictable delivery of value through well-estimated stories that AI agents can complete efficiently.