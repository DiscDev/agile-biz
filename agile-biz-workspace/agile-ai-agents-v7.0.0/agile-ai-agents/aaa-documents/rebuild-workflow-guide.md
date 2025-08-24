# Rebuild Workflow Guide

## Overview
The rebuild workflow (`/rebuild-project-workflow`) is designed for projects where the market validation is strong but the technical or business model foundation is inadequate. This comprehensive workflow manages the complete reconstruction process while maintaining business continuity.

## When to Use Rebuild Workflow

### Automatic Triggers (from existing-project-workflow)
- Technical Viability Score < 3/10
- Business Model Health Score < 3/10
- Technical Debt > 60% of codebase value
- Core framework deprecated/unsupported
- LTV:CAC ratio < 1.5 consistently

### Manual Triggers
- Security breach requiring architecture change
- Scale failure in production
- Major compliance violation
- Market pivot requirement
- Acquisition preparation

## Rebuild Types

### 1. Technical Rebuild
**When**: Technology is outdated but features are right
- Same features, modern stack
- Complete infrastructure replacement
- Performance and scalability focus
- Timeline: 3-6 months
- ROI Threshold: >300%

### 2. Partial Rebuild (Strangler Fig)
**When**: Some components need replacement
- Gradual component replacement
- Continuous operation during rebuild
- Lower risk approach
- Timeline: 4-8 months
- ROI Threshold: >250%

### 3. Business Model Rebuild
**When**: Tech is fine but economics are broken
- New revenue model
- Similar technology stack
- Focus on economic transformation
- Timeline: 2-4 months
- ROI Threshold: >500%

### 4. Complete Rebuild
**When**: Everything needs to change
- New features and technology
- Complete transformation
- Highest risk and reward
- Timeline: 6-12 months
- ROI Threshold: >400%

## Workflow Phases

### Part 1: Discovery & Planning (Days 1-3)
1. **Rebuild Context Verification** - Establish parameters
2. **Stakeholder Interview** - Complete discovery
3. **Legacy Analysis** - Deep system understanding
4. **Research Selection** - Determine depth
5. **Market Validation** - Verify rebuild decision
6. **Strategy Synthesis** - Create rebuild plan

### Part 2: Requirements & Architecture (Days 4-6)
7. **Product Requirements** - Rebuild-focused PRD
8. **Architecture Design** - Greenfield with migration
9. **Backlog Creation** - Rebuild-specific items

### Part 3: Implementation (Weeks 1-N)
10. **Foundation Sprint** - Infrastructure setup
11. **Core Rebuild** - Framework implementation
12. **Feature Parity** - Rebuild existing features
13. **Migration** - Data and user migration
14. **Parallel Operations** - Run both systems
15. **Cutover** - Final switch

### Part 4: Operations (Ongoing)
16. **Stabilization** - Post-cutover monitoring
17. **Optimization** - Performance tuning
18. **Enhancement** - New features
19. **Growth** - Market expansion
20. **Maintenance** - Ongoing support

### Part 5: Legacy Retirement (Months 3-6)
21. **Shutdown Planning** - Archive and compliance
22. **Decommissioning** - Resource cleanup

## Key Features

### Side-by-Side Architecture
- Original system continues running
- Rebuild folder: `rebuilt-[original-name]/`
- Gradual traffic migration
- Complete rollback capability

### Migration Management
- Data integrity validation
- User migration flows
- Feature parity tracking
- Performance comparison

### Risk Mitigation
- Parallel systems always
- Incremental migration only
- Feature flags required
- Dual monitoring mandatory
- Regular stakeholder updates

## Sprint Organization

### Naming Convention
All rebuild sprints follow the pattern:
- `sprint-YYYY-MM-DD-rebuild-planning`
- `sprint-YYYY-MM-DD-rebuild-foundation`
- `sprint-YYYY-MM-DD-rebuild-[feature]`
- `sprint-YYYY-MM-DD-rebuild-migration`
- `sprint-YYYY-MM-DD-rebuild-cutover`

### Sprint Duration
- Shorter sprints (2-3 days) for agility
- More frequent reviews
- Rapid iteration capability

## Documentation Structure

All rebuild documentation is organized under:
```
project-documents/rebuild/
├── stakeholder-interview/
├── legacy-analysis/
├── market-research/
├── requirements/
├── architecture/
├── migration/
├── testing/
└── operations/
```

## Success Metrics

### Technical Metrics
- Performance improvement: >50%
- Cost reduction: >30%
- Scalability increase: >10x
- Security score: >90%
- Technical debt: <10%

### Business Metrics
- User satisfaction increase
- Revenue growth enabled
- Market expansion capability
- Operational cost reduction
- Team productivity gain

### Migration Metrics
- Data integrity: 100%
- User retention: >95%
- Feature parity: 100%
- Downtime: <planned threshold
- Rollback readiness: always

## Command Usage

### Starting a Rebuild
```bash
# Start with type selection
/rebuild-project-workflow

# Start with specific type
/rebuild-project-workflow --type=technical
/rebuild-project-workflow --type=partial
/rebuild-project-workflow --type=business-model
/rebuild-project-workflow --type=complete
```

### Managing the Rebuild
```bash
# Check progress
/rebuild-project-workflow --status

# Resume from checkpoint
/rebuild-project-workflow --resume

# Compare systems
/rebuild-project-workflow --comparison

# Check migration
/rebuild-project-workflow --migration-status
```

## Approval Gates

The rebuild workflow includes 6 approval gates:

1. **Rebuild Scope Confirmation** - After analysis
2. **Strategy Approval** - After planning
3. **Pre-Implementation Review** - Before coding
4. **Feature Parity Checkpoint** - Core complete
5. **Cutover Decision** - Before switch
6. **Project Completion** - Legacy retired

## Best Practices

### Planning Phase
- Thorough legacy system analysis
- Clear migration strategy
- Realistic timelines
- Budget contingency

### Implementation Phase
- Feature flags for everything
- Continuous integration
- Automated testing
- Performance benchmarking

### Migration Phase
- Data validation scripts
- Rollback procedures
- User communication
- Gradual rollout

### Operations Phase
- 24/7 monitoring initially
- Quick response team
- Regular optimization
- Continuous improvement

## Common Pitfalls to Avoid

1. **Underestimating Complexity**
   - Always add buffer time
   - Plan for unknowns

2. **Big Bang Migration**
   - Always use incremental approach
   - Test each phase thoroughly

3. **Insufficient Testing**
   - Test migration scripts
   - Load test new system
   - User acceptance testing

4. **Poor Communication**
   - Regular stakeholder updates
   - Clear success metrics
   - Transparent progress tracking

5. **No Rollback Plan**
   - Always maintain fallback
   - Test rollback procedures
   - Keep old system ready

## Integration with Other Workflows

### From Existing-Project-Workflow
The rebuild assessment can be triggered automatically when:
- Technical viability is too low
- Business model is failing
- Major technical debt detected

### To Normal Operations
After successful rebuild:
- Transition to enhancement sprints
- Regular maintenance cycles
- Continuous optimization

## Support and Resources

- Dashboard: `http://localhost:3001/dashboard/rebuild`
- Documentation: `project-documents/rebuild/`
- Command Help: `/aaa-help rebuild-project-workflow`
- Status Check: `/rebuild-project-workflow --status`

---

**Version**: 1.0.0
**Last Updated**: 2025-01-20
**Workflow Version**: v6.0.0