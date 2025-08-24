# Project Document Creation Timing Guide

## Overview

This guide ensures project documents are created at the right time during the project lifecycle, preventing document overload while ensuring critical documentation is never missed.

## Document Creation Principles

### Just-In-Time Documentation
- Documents should be created only when needed
- Avoid creating documents "just in case"
- Each document must have a clear trigger and purpose

### Progressive Disclosure
- Start with essential documents only
- Add specialized documents based on project needs
- Use decision trees to determine document requirements

### Context-Aware Creation
- Different project types require different documents
- Industry-specific documents only for relevant industries
- Scale documentation based on project size and complexity

## Document Creation Timing Matrix

### Phase 0: Project Initialization (Always Created)
| Document | Trigger | Required | Owner |
|----------|---------|----------|-------|
| `orchestration/project-log.md` | Project start | ✅ Always | Orchestrator |
| `orchestration/agent-coordination.md` | Project start | ✅ Always | Orchestrator |
| `orchestration/stakeholder-decisions.md` | Project start | ✅ Always | Project Manager |

### Phase 1: Discovery & Analysis
| Document | Trigger | Required | Owner |
|----------|---------|----------|-------|
| **For Existing Projects:** | | | |
| `business-strategy/existing-project/project-brief.md` | Existing codebase detected | ✅ If existing | Project Analyzer |
| `business-strategy/existing-project/technology-stack-analysis.md` | After project scan | ✅ If existing | Project Analyzer |
| `business-strategy/existing-project/enhancement-opportunities.md` | After analysis complete | ✅ If existing | Project Analyzer |
| **For New Projects:** | | | |
| `business-strategy/research/market-analysis.md` | New project confirmed | ✅ If new | Research Agent |
| `business-strategy/research/competitive-analysis.md` | Market analysis complete | ✅ If new | Research Agent |
| `business-strategy/research/viability-analysis.md` | After market research | ✅ If new | Research Agent |

### Phase 2: Strategic Planning (Conditional)
| Document | Trigger | Required | Owner |
|----------|---------|----------|-------|
| `business-strategy/research/regulatory-compliance.md` | If regulated industry | ⚡ Conditional | Research Agent |
| `business-strategy/research/patent-ip-landscape.md` | If IP concerns raised | ⚡ Conditional | Research Agent |
| `business-strategy/finance/ai-development-cost-analysis.md` | After viability confirmed | ✅ Always | Finance Agent |
| `business-strategy/analysis/go-no-go-recommendation.md` | After all Phase 2 analysis | ✅ Always | Analysis Agent |

### Phase 3: Requirements & Design (After Approval)
| Document | Trigger | Required | Owner |
|----------|---------|----------|-------|
| `implementation/requirements/prd-document.md` | Stakeholder approval | ✅ Always | PRD Agent |
| `implementation/design/ui-designs.md` | PRD approved | ✅ If UI needed | UI/UX Agent |
| `implementation/security/security-architecture-strategy.md` | If security requirements | ⚡ Conditional | Security Agent |

### Phase 4: Implementation Planning
| Document | Trigger | Required | Owner |
|----------|---------|----------|-------|
| `implementation/project-planning/project-charter.md` | Requirements finalized | ✅ Always | Project Manager |
| `implementation/project-planning/sprint-framework.md` | Project charter approved | ✅ Always | Scrum Master |
| `implementation/llm-analysis/llm-selection-analysis.md` | If AI features needed | ⚡ Conditional | LLM Agent |
| `implementation/api-analysis/api-provider-analysis.md` | If external APIs needed | ⚡ Conditional | API Agent |

### Phase 5: Development & Testing
| Document | Trigger | Required | Owner |
|----------|---------|----------|-------|
| `implementation/implementation/development-log.md` | Sprint 1 start | ✅ Always | Coder Agent |
| `implementation/testing/test-plans.md` | First code commit | ✅ Always | Testing Agent |
| `implementation/documentation/api-documentation.md` | API endpoints created | ⚡ Conditional | Documentation Agent |

### Phase 6: Launch & Growth
| Document | Trigger | Required | Owner |
|----------|---------|----------|-------|
| `operations/deployment/deployment-guide.md` | Pre-deployment | ✅ Always | DevOps Agent |
| `business-strategy/monetization/subscription-model.md` | If SaaS model | ⚡ Conditional | Revenue Agent |
| `operations/analytics/analytics-strategy.md` | Post-launch | ✅ Always | Analytics Agent |

## Conditional Document Trees

### Industry-Specific Documents
```
IF industry == "healthcare" THEN
  - Create: compliance-framework-strategy.md (HIPAA)
  - Create: data-security-encryption.md (PHI protection)
  
IF industry == "finance" THEN
  - Create: compliance-framework-strategy.md (PCI DSS)
  - Create: security-operations-monitoring.md (SOC2)
  
IF industry == "education" THEN
  - Create: compliance-framework-strategy.md (FERPA)
  - Create: accessibility-requirements.md
```

### Project Type Documents
```
IF project_type == "saas" THEN
  - Create: subscription-model.md
  - Create: customer-lifecycle-analytics.md
  - Create: churn-prediction-system.md
  
IF project_type == "marketplace" THEN
  - Create: vendor-onboarding-strategy.md
  - Create: payment-processing-strategy.md
  - Create: trust-safety-framework.md
  
IF project_type == "mobile_app" THEN
  - Create: app-store-optimization.md
  - Create: mobile-analytics-strategy.md
  - Create: push-notification-strategy.md
```

### Scale-Based Documents
```
IF expected_users > 10000 THEN
  - Create: infrastructure-scaling-strategy.md
  - Create: performance-optimization-plan.md
  - Create: cdn-strategy.md
  
IF team_size > 10 THEN
  - Create: team-coordination-plan.md
  - Create: code-review-process.md
  - Create: knowledge-management-strategy.md
```

## Implementation Strategy

### Document Creation Service
```javascript
class DocumentCreationService {
  constructor(projectContext) {
    this.context = projectContext;
    this.createdDocuments = new Set();
    this.documentQueue = [];
  }
  
  shouldCreateDocument(documentPath, trigger) {
    // Check if document already exists
    if (this.createdDocuments.has(documentPath)) return false;
    
    // Check trigger conditions
    const rules = this.getDocumentRules(documentPath);
    return rules.evaluate(trigger, this.context);
  }
  
  queueDocument(documentPath, agent, priority = 'normal') {
    this.documentQueue.push({
      path: documentPath,
      agent: agent,
      priority: priority,
      timestamp: new Date()
    });
  }
}
```

### Trigger System
```javascript
const DocumentTriggers = {
  PROJECT_START: 'project_start',
  EXISTING_PROJECT_DETECTED: 'existing_project_detected',
  STAKEHOLDER_APPROVAL: 'stakeholder_approval',
  PHASE_COMPLETE: 'phase_complete',
  SPRINT_START: 'sprint_start',
  FEATURE_DETECTED: 'feature_detected',
  COMPLIANCE_REQUIRED: 'compliance_required',
  SCALE_THRESHOLD: 'scale_threshold'
};
```

### Document Rules Engine
```javascript
const DocumentRules = {
  'business-strategy/research/regulatory-compliance.md': {
    triggers: ['COMPLIANCE_REQUIRED'],
    conditions: {
      OR: [
        { industry: ['healthcare', 'finance', 'education'] },
        { handles_pii: true },
        { requires_certification: true }
      ]
    }
  },
  'business-strategy/monetization/subscription-model.md': {
    triggers: ['STAKEHOLDER_APPROVAL'],
    conditions: {
      AND: [
        { project_type: 'saas' },
        { monetization_model: 'subscription' }
      ]
    }
  }
};
```

## Document Creation Workflow

### Trigger Detection
```
Event Occurs → Check Document Rules → Queue Required Documents
```

### Document Creation
```
Process Queue → Assign to Agent → Create Document → Update Tracking
```

### Dependency Management
```
Check Dependencies → Wait for Prerequisites → Create in Order
```

## Monitoring & Optimization

### Track Document Usage
- Monitor which documents are actually read/referenced
- Identify documents that are never used
- Refine creation rules based on usage patterns

### Feedback Loop
```
Document Created → Track Usage → Analyze Value → Update Rules
```

## Best Practices

### Start Minimal
- Begin with core documents only
- Add specialized documents based on actual needs
- Review and prune unused documents

### Clear Ownership
- Each document has one responsible agent
- Clear handoff procedures
- Version control for updates

### Quality Over Quantity
- Focus on high-value documentation
- Ensure documents are actionable
- Regular reviews and updates

### Progressive Enhancement
- Basic documents first
- Detailed documents as needed
- Specialized documents for edge cases

## Document Prioritization

### Priority Levels
1. **🔴 Critical**: Project cannot proceed without these
2. **🟡 Important**: Significantly improves project success
3. **🟢 Helpful**: Provides additional value
4. **⚪ Optional**: Nice to have for completeness

### Creation Order
1. Critical documents immediately
2. Important documents within phase
3. Helpful documents as time permits
4. Optional documents on request only

## Integration with Agents

### Agent Responsibilities
Each agent should:
1. Check document triggers at phase boundaries
2. Create only assigned documents
3. Update document tracking
4. Mark documents as complete
5. Handle document dependencies

### Orchestrator Coordination
The Orchestrator should:
1. Monitor document creation progress
2. Enforce dependency order
3. Prevent duplicate creation
4. Track document completion
5. Report documentation status

## Conclusion

By implementing this timing guide, the AgileAiAgents system can:
- Reduce document overload by 70-80%
- Ensure critical documents are never missed
- Create context-appropriate documentation
- Improve agent efficiency
- Provide better user experience

The key is moving from "create everything" to "create what's needed when it's needed."