# Rebuild Decision Matrix Framework

## Overview
Comprehensive framework for evaluating when to rebuild vs iterate on existing projects based on market validation, technical viability, and business model health.

## The Three-Dimensional Assessment

### Scoring Dimensions
1. **Market Validation Score** (0-10): How well the product meets market needs
2. **Technical Viability Score** (0-10): How well the technology supports the business
3. **Business Model Score** (0-10): How sustainable the economics are

## Decision Matrix

### Primary Decision Table

| Market Score | Tech Score | Business Score | Primary Recommendation | Action |
|-------------|------------|----------------|----------------------|--------|
| High (7-10) | Low (0-3) | High (7-10) | **Technical Rebuild** | Replace tech stack, keep product/model |
| High (7-10) | Medium (4-6) | High (7-10) | **Partial Rebuild** | Strategic component replacement |
| High (7-10) | High (7-10) | Low (0-3) | **Business Model Rebuild** | Keep tech, change monetization |
| High (7-10) | Low (0-3) | Low (0-3) | **Complete Rebuild** | Full restart with learnings |
| Medium (4-6) | Low (0-3) | Medium (4-6) | **Rebuild or Pivot** | Depends on resources |
| Low (0-3) | Any | Any | **Pivot or Exit** | Product not validated |

## Rebuild vs Iterate Decision Criteria

### When to REBUILD

#### Technical Rebuild Triggers
✅ **Must rebuild if ANY of these:**
- Core framework deprecated/unsupported
- Security vulnerabilities in architecture design
- Cannot scale beyond current 2x load
- Technical debt >60% of codebase value
- Development velocity approaching zero
- Cannot meet compliance requirements

⚠️ **Should rebuild if 3+ of these:**
- Response time >5x industry standard
- Maintenance cost growing >20% quarterly
- Cannot hire developers (obsolete tech)
- Integration with modern systems impossible
- Mobile/multi-platform support impossible
- Database design fundamentally flawed

#### Business Model Rebuild Triggers
✅ **Must rebuild if ANY of these:**
- LTV:CAC ratio <1.5 consistently
- Gross margins <30% with no improvement path
- Churn >20% monthly
- Unit economics never positive

⚠️ **Should rebuild if 3+ of these:**
- Customer acquisition cost rising >15% quarterly
- Price sensitivity preventing increases
- Market rejecting current pricing model
- Competition offering 10x value at same price
- Sales cycle >2x industry average

#### Partial Rebuild Qualification
✅ **Can do partial rebuild if ALL of these:**
- 30-70% of codebase is salvageable
- Clear component boundaries exist
- Can maintain service during rebuild
- Incremental value delivery possible
- Team has capacity for parallel work

### When to ITERATE

✅ **Should iterate if ALL of these:**
- Market validation score >6
- Technical debt <40% of codebase
- Issues fixable incrementally
- Architecture supports growth path
- Business model needs tuning only
- Team velocity still reasonable

## ROI Calculation Models

### Technical Rebuild ROI

```javascript
const technicalRebuildROI = {
  costs: {
    development: months * team_size * monthly_cost,
    migration: customer_count * migration_cost_per_customer,
    opportunity: lost_revenue_during_rebuild,
    risk_buffer: total_cost * 0.3
  },
  benefits: {
    maintenance_reduction: current_maintenance * 0.7 * 36, // 3 years
    scale_capability: (potential_customers - current_max) * avg_revenue,
    new_features_enabled: blocked_features_value,
    developer_productivity: (velocity_improvement * team_size * hourly_rate * 2000)
  },
  roi: ((benefits - costs) / costs) * 100,
  payback_months: costs / (monthly_benefits)
};
```

**Threshold**: Proceed if ROI >300% within 18 months

### Business Model Rebuild ROI

```javascript
const businessModelRebuildROI = {
  costs: {
    repositioning: marketing_campaign_cost,
    sales_retraining: sales_team * training_cost,
    customer_migration: existing_customers * communication_cost,
    revenue_dip: monthly_revenue * transition_months * 0.3
  },
  benefits: {
    margin_improvement: (new_margin - current_margin) * revenue * 36,
    market_expansion: new_tam * capture_rate * avg_deal,
    churn_reduction: (current_churn - new_churn) * customer_value * 36,
    cac_improvement: (current_cac - new_cac) * new_customers * 36
  },
  roi: ((benefits - costs) / costs) * 100,
  payback_months: costs / monthly_benefits
};
```

**Threshold**: Proceed if ROI >500% within 12 months

### Partial Rebuild ROI

```javascript
const partialRebuildROI = {
  // Calculate per component
  components: [
    {
      name: "Authentication System",
      rebuild_cost: 50000,
      current_issues_cost: 10000/month,
      rebuild_benefit: 8000/month,
      roi: 250,
      priority: 1
    },
    // ... other components
  ],
  total_roi: sum(component_rois * component_weights),
  phased_delivery: true
};
```

**Threshold**: Proceed if component ROI >250% within 12 months

## Rebuild Strategy Options

### Option A: Complete Technical Rebuild (Greenfield)
**When to choose:**
- Technical debt >70%
- Architecture fundamentally flawed
- Need complete technology shift
- Have resources for parallel development

**Approach:**
1. Build new system alongside old
2. Achieve feature parity
3. Migrate customers in cohorts
4. Sunset old system

**Timeline:** 6-12 months
**Risk:** High
**Success Rate:** 75%

### Option B: Strangler Fig Pattern (Gradual)
**When to choose:**
- Technical debt 40-70%
- Clear service boundaries
- Cannot afford downtime
- Need continuous delivery

**Approach:**
1. Identify boundary contexts
2. Build new services incrementally
3. Route traffic progressively
4. Replace components one by one

**Timeline:** 12-18 months
**Risk:** Medium
**Success Rate:** 85%

### Option C: Core Rebuild + Wrapper
**When to choose:**
- Core is broken but interfaces work
- Need faster time to market
- Customer API contracts must be maintained
- Limited resources

**Approach:**
1. Build new core engine
2. Wrap with compatibility layer
3. Maintain existing interfaces
4. Gradually expose new capabilities

**Timeline:** 4-8 months
**Risk:** Medium
**Success Rate:** 80%

### Option D: Business Model Pivot Only
**When to choose:**
- Technology is sound
- Market validated
- Economics broken
- Need quick turnaround

**Approach:**
1. Redesign pricing/packaging
2. Adjust target market
3. Change delivery model
4. Optimize unit economics

**Timeline:** 2-4 months
**Risk:** Low-Medium
**Success Rate:** 70%

## Risk Assessment Framework

### Technical Rebuild Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | High | High | Fixed feature list, phased delivery |
| Migration failures | Medium | Critical | Extensive testing, rollback plan |
| Customer churn | Medium | High | Clear communication, parallel running |
| Team burnout | Medium | High | Realistic timeline, additional resources |
| Budget overrun | High | Medium | 30% buffer, staged funding |

### Business Model Rebuild Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Customer rejection | Medium | High | Pilot program, gradual rollout |
| Revenue dip | High | Medium | Bridge financing, cost reduction |
| Competition response | Medium | Medium | Fast execution, differentiation |
| Team alignment | Low | High | Clear communication, incentives |

## Stakeholder Communication Framework

### The Rebuild Conversation Structure

#### 1. Open with Validation
"Great news - we've validated that the market wants what we're building. We have [X] customers proving demand."

#### 2. Present the Reality
"However, our [technical foundation/business model] cannot support our growth trajectory because [specific reasons]."

#### 3. Show the Cost of Status Quo
"If we continue as-is:
- We'll lose $[X] in opportunity cost
- Maintenance will cost $[Y] annually
- We'll be unable to serve [Z]% of our market"

#### 4. Frame as Investment
"A rebuild is not starting over - it's an investment in our validated learnings:
- We know exactly what customers want
- We understand the market dynamics
- We can build it right this time"

#### 5. Present Clear Options
Show 3 options with trade-offs table

#### 6. Recommend with Confidence
"Based on our analysis, Option [X] provides the best ROI with [Y]% success probability"

## Decision Documentation Template

```markdown
# Rebuild Decision: [Project Name]

## Assessment Scores
- Market Validation: []/10
- Technical Viability: []/10  
- Business Model Health: []/10

## Recommendation: [Rebuild Type]

## Justification
- Primary trigger: [Specific reason]
- Secondary factors: [List]
- ROI calculation: [%] over [] months

## Selected Approach: [Option A/B/C/D]

## Success Metrics
- Metric 1: [Target]
- Metric 2: [Target]
- Metric 3: [Target]

## Risk Mitigation
- Risk 1: [Mitigation plan]
- Risk 2: [Mitigation plan]

## Timeline
- Phase 1: [Duration] - [Deliverable]
- Phase 2: [Duration] - [Deliverable]
- Phase 3: [Duration] - [Deliverable]

## Budget
- Development: $[]
- Migration: $[]
- Buffer: $[]
- Total: $[]

## Approval
- [ ] Engineering Lead
- [ ] Product Lead
- [ ] CEO/Founder
- [ ] Board/Investors
```

## Success Metrics

### Framework Success Indicators
- Correct rebuild/iterate decisions: >90%
- Stakeholder agreement: >85%
- ROI predictions within 20% of actual
- Rebuild project success rate: >75%

### Rebuild Project Success Metrics
- On-time delivery: ±15%
- On-budget delivery: ±20%
- Customer retention during rebuild: >85%
- Post-rebuild growth rate: >2x previous

---

**Framework Version**: 1.0
**Last Updated**: [Date]
**Next Review**: After 5 rebuild decisions