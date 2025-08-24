# Story Point Estimation Guidelines

## Overview
Story points are a unit of measure for expressing the overall effort required to fully implement a product backlog item. This guide helps ensure consistent estimation across all agents.

## Story Point Scale

We use a modified Fibonacci sequence: 1, 2, 3, 5, 8, 13, 20, 40

### Point Definitions

#### 1 Point - Trivial
- Simple configuration change
- Documentation update
- Minor text change
- No testing required
- 1-5 minutes of work

#### 2 Points - Very Small
- Simple bug fix
- Minor feature tweak
- Basic validation addition
- Minimal testing required
- 5-10 minutes of work

#### 3 Points - Small
- Small feature addition
- Simple API endpoint
- Basic UI component
- Standard testing required
- 10-20 minutes of work

#### 5 Points - Medium
- Standard feature implementation
- Multiple file changes
- Integration with existing code
- Full testing required
- 20-40 minutes of work

#### 8 Points - Large
- Complex feature
- New service or module
- Multiple component integration
- Extensive testing required
- 40-90 minutes of work

#### 13 Points - Very Large
- Major feature implementation
- System-wide changes
- Complex integrations
- Comprehensive testing
- 90-180 minutes of work

#### 20 Points - Extra Large
- Epic-level feature
- Architectural changes
- Multiple system impacts
- Full regression testing
- 3-5 hours of work

#### 40 Points - Too Large
- Needs to be broken down
- Multiple sprint effort
- Should be an epic
- Break into smaller stories

## Estimation Factors

### Complexity
- **Technical Complexity**: Algorithm difficulty, integration points
- **Business Logic**: Rules, validations, edge cases
- **Unknown Factors**: Research needed, new technology

### Effort
- **Development Time**: Actual coding effort
- **Testing Time**: Unit, integration, and system testing
- **Review Time**: Code review and feedback cycles

### Risk
- **Technical Risk**: New technology, performance concerns
- **Business Risk**: Critical functionality, customer impact
- **Dependency Risk**: External systems, other teams

### Definition of Done Impact
- Documentation requirements
- Security review needs
- Performance benchmarks
- Deployment complexity

## Estimation Process

### 1. Understand the Requirement
- Read user story completely
- Review acceptance criteria
- Ask clarifying questions

### 2. Identify Tasks
- Break down into development tasks
- Consider testing requirements
- Include documentation needs

### 3. Assess Factors
- Evaluate complexity
- Consider effort required
- Identify risks

### 4. Compare to Reference Stories
- Find similar completed stories
- Use historical data
- Adjust for differences

### 5. Team Discussion
- Present your estimate
- Listen to other perspectives
- Reach consensus

## Common Estimation Mistakes

### Under-estimation
- Forgetting testing effort
- Ignoring integration complexity
- Missing edge cases
- Not considering reviews

### Over-estimation
- Adding too much buffer
- Assuming worst-case scenarios
- Not leveraging existing code
- Ignoring team improvements

## Reference Stories

### Authentication System (Sprint 1)
- User Registration (AUTH-001): 13 points
- Login Flow (AUTH-002): 8 points
- Session Management (AUTH-003): 5 points
- Total: 26 points (completed in ~4 hours)

### API Documentation (Sprint 2)
- OpenAPI Spec (API-001): 5 points
- Endpoint Docs (API-002): 3 points
- Integration Guide (API-003): 8 points
- Total: 16 points (completed in ~2 hours)

## Velocity Considerations

### Team Velocity Factors
- **New Team**: Start conservative (15-20 points)
- **Established Team**: Use 3-sprint average
- **Mixed Skills**: Account for learning curve

### Adjustment Factors
- **Technical Debt**: Reduce by 10-20%
- **New Domain**: Reduce by 20-30%
- **Platform Changes**: Reduce by 15-25%

## Re-estimation Guidelines

### When to Re-estimate
- Significant requirement changes
- New dependencies discovered
- Technical approach changes
- After 50% completion if way off

### When NOT to Re-estimate
- Minor clarifications
- Small scope additions
- To meet sprint capacity
- After work has started

## Tips for Accurate Estimation

1. **Don't Estimate in Hours**: Focus on relative complexity
2. **Consider the Whole Team**: Not just the fastest developer
3. **Include All Work**: Dev, test, review, deploy
4. **Be Honest**: Don't pad or compress
5. **Learn from History**: Track actual vs estimated
6. **Discuss Differences**: Large gaps indicate misunderstanding
7. **Update Knowledge**: Refine estimates as you learn

---

**Remember**: Story points are about relative effort, not time. A 5-point story should take roughly 5 times the effort of a 1-point story, regardless of who does it or how long it takes.

**Last Updated**: 2025-01-18
**Maintained by**: Scrum Master Agent