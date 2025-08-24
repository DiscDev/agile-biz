# Code-Informed Research Template

## Overview
This template defines how code analysis insights integrate with market research for existing projects, providing more accurate validation and actionable recommendations based on technical reality.

## Core Principle
Research for existing projects leverages the unique advantage of having actual implementation to analyze, making research more grounded, accurate, and actionable.

## Integration Points

### 1. Feature Validation Research

#### Code Analysis Input
```javascript
const codeAnalysis = {
  features: {
    implemented: ["user_auth", "payment_processing", "analytics_dashboard"],
    partially_implemented: ["api_gateway", "notifications"],
    planned_but_not_built: ["mobile_app", "ai_recommendations"]
  },
  usage_patterns: {
    most_used: ["dashboard", "reports"],
    rarely_used: ["advanced_settings", "bulk_import"],
    never_used: ["social_sharing", "gamification"]
  },
  technical_constraints: {
    cannot_scale: ["real_time_sync", "video_processing"],
    expensive_to_run: ["ml_predictions", "data_aggregation"],
    security_risks: ["file_upload", "third_party_integrations"]
  }
};
```

#### Research Questions Generated
Based on code analysis, generate targeted research questions:

**For Implemented Features**:
- "Market demand exists for [user_auth] in [industry]?"
- "How does our [payment_processing] compare to competitor implementations?"
- "Is [analytics_dashboard] a differentiator or table stakes?"

**For Unused Features**:
- "Why is [social_sharing] unused - no demand or poor implementation?"
- "Should we remove [gamification] to reduce complexity?"
- "Can we pivot [unused_feature] for different use case?"

**For Technical Constraints**:
- "Is [real_time_sync] blocking enterprise deals?"
- "Would fixing [video_processing] open new markets?"
- "How critical is [ml_predictions] for competitive parity?"

### 2. Competitive Analysis with Technical Reality

#### Standard Competitive Analysis
```markdown
| Competitor | Feature X | Feature Y | Feature Z |
|:-----------|:----------|:----------|:----------|
| Company A  | ✅ Yes    | ✅ Yes    | ❌ No     |
| Company B  | ✅ Yes    | ❌ No     | ✅ Yes    |
| Our Product| ✅ Yes    | ⚠️ Partial| ❌ No     |
```

#### Enhanced with Code Analysis
```markdown
| Competitor | Feature X | Our Implementation | Effort to Match | Market Value |
|:-----------|:----------|:-------------------|:---------------|:------------|
| Company A  | Real-time | Batch (4hr delay)  | High (rewrite) | Critical    |
| Company B  | AI-powered| Rule-based         | Medium (add ML)| Nice-to-have|
| Company C  | Mobile    | Web-only           | Low (responsive)| Important  |
```

### 3. Technical Feasibility Layer

#### Market Opportunity Assessment
For each market opportunity discovered, assess technical feasibility:

```javascript
const marketOpportunity = {
  opportunity: "Enterprise market entry",
  requirements: ["SSO", "audit_logs", "99.9%_uptime", "SOC2"],
  current_state: {
    SSO: "not_implemented",
    audit_logs: "partial",
    uptime: "95%",
    SOC2: "not_compliant"
  },
  implementation_effort: {
    SSO: "2_sprints",
    audit_logs: "1_sprint",
    uptime: "infrastructure_overhaul",
    SOC2: "6_months_process"
  },
  roi_calculation: {
    market_size: "$10M",
    achievable_share: "5%",
    implementation_cost: "$200K",
    roi: "150%",
    payback_period: "8_months"
  }
};
```

### 4. Monetization Analysis Based on Costs

#### Infrastructure Cost Reality
```javascript
const costAnalysis = {
  current_costs: {
    per_user_per_month: "$3.50",
    infrastructure: "$2.00",
    third_party_apis: "$1.00",
    support: "$0.50"
  },
  competitor_pricing: {
    company_a: "$9.99/user/month",
    company_b: "$14.99/user/month",
    market_average: "$12.00/user/month"
  },
  margin_analysis: {
    at_market_price: "71% margin",
    break_even_price: "$4.50/user/month",
    recommended_price: "$11.99/user/month"
  },
  scaling_economics: {
    at_100_users: "$3.50/user",
    at_1000_users: "$2.80/user",
    at_10000_users: "$2.20/user"
  }
};
```

### 5. Pivot Feasibility Based on Code Assets

#### Asset Reuse Assessment
```markdown
## Pivot Option: From B2C to B2B SaaS

### Reusable Assets (70% of codebase)
- ✅ Authentication system (needs SSO addition)
- ✅ Dashboard framework (needs white-labeling)
- ✅ Data processing pipeline (already scalable)
- ✅ API structure (needs rate limiting)

### Required New Development (30%)
- ❌ Multi-tenancy architecture
- ❌ Enterprise admin panel
- ❌ Billing per organization
- ❌ SLA monitoring

### Effort Estimate: 3-4 months with current team
### Market Opportunity: $50M B2B vs $5M B2C
### Recommendation: PIVOT FEASIBLE with high ROI
```

## Research Document Structure

### 1. Executive Summary with Code Context
```markdown
# Market Validation Report for [Product Name]

## Current State Analysis
- **Codebase**: [Language/Framework] application with [X] features
- **Active Users**: [Number] with [usage pattern]
- **Technical Debt**: [High/Medium/Low] blocking [specific opportunities]
- **Market Position**: [Current assessment based on research]

## Key Findings
1. **Validation Result**: [SUCCESS/PARTIAL/FAILURE]
2. **Recommended Action**: [ACCELERATE/PIVOT/REBUILD/SUNSET]
3. **Critical Next Steps**: [Top 3 priorities based on research + code]
```

### 2. Feature-by-Feature Validation
```markdown
## Feature Validation Matrix

| Feature | Built | Used | Market Demand | Competitor Has | Action |
|:--------|:------|:-----|:-------------|:--------------|:-------|
| Auth | ✅ 100% | ✅ High | Required | All | Maintain |
| Reports | ✅ 100% | ✅ High | Critical | Most | Enhance |
| Social | ✅ 100% | ❌ None | Low | Few | Remove |
| API | ⚠️ 50% | ⚠️ Some | High | All | Complete |
| Mobile | ❌ 0% | N/A | High | Most | Build |
```

### 3. Technical ROI Prioritization
```markdown
## Technical Investment Priorities

### Quick Wins (High ROI, Low Effort)
1. **Fix Mobile Responsiveness**
   - Effort: 1 sprint
   - Market Impact: +30% addressable market
   - ROI: 500%

### Strategic Investments (High ROI, High Effort)
1. **Build API Gateway**
   - Effort: 4 sprints
   - Market Impact: Enable integrations ecosystem
   - ROI: 300%

### Consider Deferring (Low ROI)
1. **Blockchain Integration**
   - Effort: 6 sprints
   - Market Impact: Minimal demand
   - ROI: 20%
```

### 4. Decision Framework Output
```markdown
## Recommended Path Forward

### Scenario: Partial Market Validation

**What's Working**:
- Core value proposition resonates
- 60% of features have market demand
- Technical foundation is solid

**What's Not Working**:
- Missing key enterprise features
- Performance issues blocking scale
- Pricing model misaligned

**Recommended 6-Month Plan**:
1. **Months 1-2**: Fix performance bottlenecks
2. **Months 2-3**: Add enterprise features (SSO, audit)
3. **Months 4-5**: Rebuild pricing model
4. **Month 6**: Relaunch to enterprise segment

**Success Metrics**:
- Technical: <100ms response time, 99.9% uptime
- Market: 10 enterprise pilots, $50K MRR
- Product: 80% feature usage rate
```

## Usage in Workflow

### Phase 5: Research Execution
1. Load code analysis from Phase 1-4
2. Generate research questions based on actual features
3. Execute research with code context
4. Map findings back to technical reality

### Phase 5a-5c: Deep Analysis
- 5a: Compare usage data with market expectations
- 5b: Calculate ROI for each technical improvement
- 5c: Assess pivot feasibility with current assets

### Phase 6: Planning
- Use validation results to prioritize backlog
- Focus on validated features only
- Plan technical improvements by ROI

## Templates for Agents

### Research Agent Context
```javascript
// Provided to Research Agent
const context = {
  code_analysis: {/* from Phase 1 */},
  feature_list: {/* extracted features */},
  technical_constraints: {/* identified limits */},
  usage_data: {/* if available */},
  competitive_gaps: {/* from analysis */}
};

// Research Agent generates targeted research based on context
```

### Analysis Agent Context
```javascript
// Provided to Analysis Agent
const context = {
  market_research: {/* from Research Agent */},
  code_reality: {/* from code analysis */},
  cost_structure: {/* from infrastructure */},
  technical_debt: {/* from analysis */}
};

// Analysis Agent creates ROI matrices and recommendations
```

## Success Criteria

Research is successful when it provides:
1. **Clear Validation Status**: Is current product validated?
2. **Actionable Priorities**: What to build/fix/remove?
3. **ROI Justification**: Why invest in specific improvements?
4. **Feasible Path**: Can we get there from here?
5. **Decision Confidence**: Enough data to commit?

## Common Patterns

### Pattern 1: Feature Sprawl
- **Symptom**: Many unused features
- **Research Focus**: Core value identification
- **Typical Outcome**: Remove 40%, focus on core

### Pattern 2: Wrong Market
- **Symptom**: Good product, no traction
- **Research Focus**: Adjacent market discovery
- **Typical Outcome**: Pivot to better-fit segment

### Pattern 3: Technical Barriers
- **Symptom**: Market wants it, can't deliver
- **Research Focus**: MVP vs. full requirements
- **Typical Outcome**: Incremental technical upgrade

### Pattern 4: Validation Success
- **Symptom**: Growing but slowly
- **Research Focus**: Growth accelerators
- **Typical Outcome**: Double down on what works

---

This template ensures that research for existing projects is always grounded in technical reality, making recommendations more accurate, feasible, and actionable.