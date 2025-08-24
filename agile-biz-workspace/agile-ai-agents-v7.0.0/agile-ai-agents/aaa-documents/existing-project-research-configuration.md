# Existing Project Research Configuration

## Overview
This document defines how research for existing projects integrates code analysis insights to provide more accurate market validation and actionable recommendations.

## Core Principles

### 1. Code-First Research
Unlike new projects that start with market assumptions, existing projects start with technical reality:
- What's actually built
- How it performs
- What it costs
- Who uses it (if launched)
- Technical constraints and capabilities

### 2. Validation Over Speculation
Research focuses on validating what exists rather than speculating on what could be:
- Does the market want what we built?
- Are we solving the right problem?
- Is our implementation competitive?
- What's missing for market fit?

### 3. ROI-Driven Prioritization
Every recommendation includes ROI calculation:
- Implementation effort (from code analysis)
- Market opportunity (from research)
- Risk assessment (technical + market)
- Payback period calculation

## Research Configuration by Phase

### Phase 1-4: Code Analysis Context Gathering

Before research begins, these phases provide critical context:

```javascript
const codeAnalysisContext = {
  // Phase 1: Automatic Codebase Analysis
  technical: {
    languages: ["JavaScript", "Python"],
    frameworks: ["React", "Django"],
    infrastructure: ["AWS", "PostgreSQL"],
    architecture: "microservices",
    performance: {
      response_time: "250ms avg",
      uptime: "99.5%",
      scalability: "handles 1000 concurrent users"
    }
  },
  
  // Phase 2: Stakeholder Interview
  business: {
    current_users: 500,
    mrr: "$5,000",
    churn_rate: "8%",
    main_complaints: ["slow", "missing integrations"],
    top_requests: ["mobile app", "api", "reporting"]
  },
  
  // Phase 3-4: Deep Analysis
  features: {
    core: ["auth", "dashboard", "reports"],
    advanced: ["analytics", "automation"],
    unused: ["social_features", "gamification"],
    broken: ["notifications", "search"]
  },
  
  technical_debt: {
    critical: ["no tests", "sql injection risks"],
    important: ["legacy dependencies", "poor error handling"],
    nice_to_have: ["code duplication", "outdated UI"]
  }
};
```

### Phase 5: Market Validation Research Configuration

#### Research Question Generation

Based on code analysis, automatically generate targeted research questions:

```javascript
function generateResearchQuestions(codeAnalysis) {
  const questions = {
    feature_validation: [],
    competitive_analysis: [],
    market_opportunity: [],
    pivot_assessment: []
  };
  
  // For each implemented feature
  codeAnalysis.features.core.forEach(feature => {
    questions.feature_validation.push({
      question: `Is ${feature} a must-have for the target market?`,
      context: `Currently implemented with ${getFeatureMetrics(feature)}`,
      validation_criteria: "Used by >60% of users, mentioned in reviews"
    });
  });
  
  // For unused features
  codeAnalysis.features.unused.forEach(feature => {
    questions.feature_validation.push({
      question: `Should we remove ${feature} to reduce complexity?`,
      context: `<5% usage, adds ${getComplexityCost(feature)} maintenance`,
      validation_criteria: "No market demand, no competitive advantage"
    });
  });
  
  // For technical constraints
  codeAnalysis.technical_debt.critical.forEach(debt => {
    questions.market_opportunity.push({
      question: `Is fixing ${debt} blocking sales/growth?`,
      context: `Effort: ${getFixEffort(debt)}, Current impact: ${getImpact(debt)}`,
      validation_criteria: "Mentioned in lost deals, competitor advantage"
    });
  });
  
  return questions;
}
```

#### Research Depth Mapping

Map code analysis to appropriate research depth:

```javascript
const researchDepthLogic = {
  selectDepth: function(codeAnalysis, stakeholderInput) {
    // Automatic recommendations based on context
    if (codeAnalysis.current_users < 10) {
      return {
        recommended: "thorough",
        reason: "Pre-PMF, need comprehensive validation"
      };
    } else if (codeAnalysis.churn_rate > 10) {
      return {
        recommended: "standard",
        reason: "Product-market fit issues need investigation"
      };
    } else if (stakeholderInput.goal === "pivot") {
      return {
        recommended: "thorough",
        reason: "Major strategic decision requires deep analysis"
      };
    } else {
      return {
        recommended: "minimal",
        reason: "Stable product, focused improvements needed"
      };
    }
  }
};
```

### Phase 5a: Usage Analytics Configuration

If usage data is available, configure analytics research:

```javascript
const usageAnalyticsConfig = {
  required_data: {
    minimum: ["page_views", "session_duration", "feature_clicks"],
    ideal: ["user_flows", "drop_off_points", "feature_adoption"],
    advanced: ["cohort_behavior", "power_user_patterns", "revenue_correlation"]
  },
  
  analysis_templates: {
    feature_validation: {
      metrics: ["usage_frequency", "time_spent", "completion_rate"],
      threshold: "30% active users minimum",
      decision: "Keep if >threshold, otherwise candidate for removal"
    },
    
    workflow_analysis: {
      metrics: ["path_analysis", "drop_off_rate", "time_to_complete"],
      threshold: "70% completion rate",
      decision: "Redesign if <threshold"
    },
    
    segment_analysis: {
      metrics: ["segment_size", "segment_value", "segment_retention"],
      threshold: "One segment >40% of value",
      decision: "Focus on high-value segment"
    }
  }
};
```

### Phase 5b: Technical Debt ROI Configuration

Configure how to calculate ROI for technical improvements:

```javascript
const technicalDebtROI = {
  calculation_model: {
    cost: {
      development_hours: "estimated_hours * hourly_rate",
      opportunity_cost: "delayed_features_value",
      risk_cost: "probability_of_issue * impact_cost"
    },
    
    benefit: {
      direct_revenue: "new_customers * average_deal_size",
      cost_savings: "reduced_support + reduced_maintenance",
      risk_mitigation: "avoided_losses + avoided_churn"
    },
    
    roi_formula: "(benefit - cost) / cost * 100"
  },
  
  priority_matrix: {
    high_roi_low_effort: "Do immediately",
    high_roi_high_effort: "Plan for next quarter",
    low_roi_low_effort: "Do if time permits",
    low_roi_high_effort: "Defer or ignore"
  }
};
```

### Phase 5c: Pivot Feasibility Configuration

Configure pivot analysis based on code assets:

```javascript
const pivotFeasibilityConfig = {
  asset_assessment: {
    reusable: {
      criteria: ["domain_agnostic", "well_architected", "tested"],
      value: "Reduces pivot cost by 40-60%"
    },
    
    adaptable: {
      criteria: ["needs_modification", "partial_rewrite", "refactoring"],
      value: "Reduces pivot cost by 20-40%"
    },
    
    throwaway: {
      criteria: ["domain_specific", "tightly_coupled", "legacy"],
      value: "No value for pivot"
    }
  },
  
  pivot_options: {
    vertical_pivot: {
      same_solution_different_market: {
        reusability: "80-90%",
        effort: "2-3 months",
        risk: "low"
      }
    },
    
    horizontal_pivot: {
      different_solution_same_market: {
        reusability: "40-60%",
        effort: "4-6 months",
        risk: "medium"
      }
    },
    
    complete_pivot: {
      new_solution_new_market: {
        reusability: "10-30%",
        effort: "6-12 months",
        risk: "high"
      }
    }
  }
};
```

## Research Document Mapping

### From Code Analysis to Research Documents

```javascript
const documentMapping = {
  // Code analysis findings trigger specific research documents
  triggers: {
    "unused_features_found": [
      "unused-features-analysis.md",
      "feature-removal-impact.md"
    ],
    
    "performance_issues": [
      "performance-vs-expectations.md",
      "scalability-vs-demand.md"
    ],
    
    "security_vulnerabilities": [
      "security-vs-requirements.md",
      "compliance-gap-analysis.md"
    ],
    
    "high_churn": [
      "churn-analysis.md",
      "user-satisfaction-research.md"
    ],
    
    "low_usage": [
      "product-market-fit-analysis.md",
      "pivot-opportunities.md"
    ]
  }
};
```

## Decision Framework Configuration

### Validation Outcomes

Configure how to interpret research results:

```javascript
const validationOutcomes = {
  strong_validation: {
    criteria: {
      feature_usage: ">70%",
      market_demand: "high",
      competitive_position: "leader or strong challenger",
      unit_economics: "positive",
      growth_trajectory: "increasing"
    },
    recommendation: "ACCELERATE",
    actions: [
      "Double down on what works",
      "Increase marketing spend",
      "Expand feature set",
      "Raise funding for growth"
    ]
  },
  
  partial_validation: {
    criteria: {
      feature_usage: "40-70%",
      market_demand: "moderate",
      competitive_position: "viable",
      unit_economics: "break-even",
      growth_trajectory: "flat"
    },
    recommendation: "REFOCUS",
    actions: [
      "Remove unused features",
      "Fix critical gaps",
      "Adjust pricing",
      "Improve core experience"
    ]
  },
  
  weak_validation: {
    criteria: {
      feature_usage: "<40%",
      market_demand: "low",
      competitive_position: "weak",
      unit_economics: "negative",
      growth_trajectory: "declining"
    },
    recommendation: "PIVOT",
    actions: [
      "Explore adjacent markets",
      "Reposition product",
      "Major feature overhaul",
      "Consider acquisition"
    ]
  },
  
  no_validation: {
    criteria: {
      feature_usage: "<20%",
      market_demand: "none",
      competitive_position: "unviable",
      unit_economics: "deeply negative",
      growth_trajectory: "failing"
    },
    recommendation: "SUNSET",
    actions: [
      "Wind down gracefully",
      "Open source code",
      "Sell assets",
      "Document learnings"
    ]
  }
};
```

## Integration Points

### 1. With Project Analyzer Agent
```javascript
// Project Analyzer provides code context
const codeContext = projectAnalyzer.analyze();
// Research configuration uses this context
const researchConfig = configureResearch(codeContext);
```

### 2. With Research Agent
```javascript
// Research Agent receives configured questions
const researchQuestions = researchConfig.generateQuestions();
// Executes research with code awareness
const researchResults = researchAgent.execute(researchQuestions, codeContext);
```

### 3. With Market Validation Agent
```javascript
// Market Validation Agent uses both code and research
const validationResult = marketValidation.validate(
  codeContext,
  researchResults,
  usageData
);
```

### 4. With Analysis Agent
```javascript
// Analysis Agent creates final recommendations
const recommendations = analysisAgent.synthesize(
  codeContext,
  researchResults,
  validationResult,
  roiCalculations
);
```

## Success Metrics

Research is successful when it provides:

1. **Clear Validation Status**: Unambiguous assessment of product-market fit
2. **Prioritized Action List**: What to do next, in order
3. **ROI Justification**: Why each action is worth doing
4. **Risk Assessment**: What could go wrong and mitigation
5. **Timeline Estimate**: How long improvements will take
6. **Success Criteria**: How to measure if changes worked

## Output Format

All research results follow this structure:

```markdown
# [Product Name] Validation Research Results

## Executive Summary
- **Validation Status**: [STRONG/PARTIAL/WEAK/NONE]
- **Recommended Action**: [ACCELERATE/REFOCUS/PIVOT/SUNSET]
- **Confidence Level**: [HIGH/MEDIUM/LOW]
- **Next Steps**: [Top 3 priorities]

## Detailed Findings
[Research results organized by category]

## Technical Feasibility
[What's possible with current codebase]

## ROI Analysis
[Effort vs. benefit for each recommendation]

## Risk Assessment
[What could go wrong]

## Implementation Roadmap
[Step-by-step plan]

## Success Metrics
[How to measure progress]
```

---

This configuration ensures that research for existing projects is always grounded in technical reality, providing actionable insights that balance market opportunity with implementation feasibility.