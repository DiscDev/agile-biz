# Rebuild Project Workflow Design (Discussion Document)

## Overview
This design document outlines the `/rebuild-project-workflow` that handles projects after the decision to rebuild has been made. This workflow incorporates ALL phases from both new-project and existing-project workflows, enhanced for rebuild scenarios, plus operations phases for long-term success.

## Core Design Principles

### 1. Side-by-Side Architecture
- **Rebuild Folder**: `rebuilt-[original-name]/` created alongside original
- **Documentation**: All docs stay in `agile-ai-agents/project-documents/`
- **Sprint Naming**: `sprint-YYYY-MM-DD-rebuild-[feature]`
- **State Management**: Separate state tracking for rebuild vs original

### 2. Parallel Operation Support
- Original system continues running during rebuild
- Gradual migration of users/data
- Feature parity tracking
- Dual monitoring dashboards

### 3. Enhanced Approval Gates
- More frequent stakeholder checkpoints (every 2-3 phases)
- Risk assessment at each gate
- Go/pause/pivot options throughout
- Clear rollback strategies

## Command Structure
```
/rebuild-project-workflow                    # Full workflow with all phases
/rebuild-project-workflow --type=[type]      # Specify rebuild type
/rebuild-project-workflow --resume           # Resume from checkpoint  
/rebuild-project-workflow --status           # Current phase and progress
/rebuild-project-workflow --comparison       # Compare old vs new systems
/rebuild-project-workflow --migration-status # Data migration progress
```

## Complete Phase Structure

### PART 1: REBUILD DISCOVERY & PLANNING (Days 1-3)

#### Phase 1: Rebuild Context Verification (1-2 hours)
**Agent**: Stakeholder Interview Agent (Rebuild Mode)
**Purpose**: Establish rebuild parameters and constraints

**Key Questions**:
1. "You've decided to rebuild. Which type of rebuild are we doing?"
   - Technical (same features, new stack)
   - Partial (gradual component replacement)
   - Business Model (new economics, similar tech)
   - Complete (everything new)

2. "What triggered this rebuild decision?"
   - Technical debt overwhelming
   - Scale limitations hit
   - Security vulnerabilities
   - Market pivot needed
   - Cost structure broken

3. "Critical constraints for the rebuild?"
   - Timeline requirements
   - Budget limitations
   - Team availability
   - Migration complexity tolerance
   - Acceptable downtime

4. "What MUST be preserved from original?"
   - User accounts and data
   - Historical data
   - API contracts
   - URLs/SEO rankings
   - Integration points

5. "Parallel operation duration?"
   - How long run both systems?
   - Cutover strategy preference
   - Risk tolerance level

**Sprint Planning Context**:
- Create initial sprint: `sprint-YYYY-MM-DD-rebuild-planning`
- Not "Sprint 0" but proper dated sprint following convention
- Document rebuild goals in sprint planning folder

#### Phase 2: Comprehensive Stakeholder Interview (2-3 hours)
**Agent**: Stakeholder Interview Agent (Enhanced Mode)
**Purpose**: Complete discovery as if new project, but informed by rebuild context

**Sections** (All from new-project-workflow):
1. **Project Vision & Purpose** (with rebuild context)
   - Original vision vs new vision
   - What changes, what stays
   - Success metrics for rebuild

2. **Technical Preferences** (fresh choices)
   - Modern stack selection
   - Cloud-native approach
   - Microservices vs monolithic
   - Database technology choices

3. **Business Context** (updated)
   - New cost targets
   - Scalability requirements
   - Performance benchmarks
   - Security standards

4. **Core Features** (re-prioritized)
   - MVP for rebuild (may differ from original)
   - Features to drop
   - New features to add
   - Migration priorities

5. **AI Operations Vision** (complete 37+ questions)
   - Fresh perspective on automation
   - Lessons learned from original
   - New AI opportunities

**Documentation**:
- Save to `project-documents/rebuild/stakeholder-interview/`
- Create comparison matrix: old decisions vs new

#### Phase 3: Legacy System Deep Analysis (4-6 hours)
**Agent**: Project Analyzer Agent + All Analysis Agents
**Purpose**: Complete understanding of what we're replacing

**Analysis Components** (All from existing-project-workflow):
1. **Complete Code Analysis**
   - Architecture documentation
   - Dependency mapping
   - Database schema analysis
   - API documentation
   - Integration points mapping

2. **Data Analysis**
   - Data models and relationships
   - Data volume assessment
   - Migration complexity scoring
   - Data quality issues
   - Historical data requirements

3. **Usage Analytics** (if available)
   - Feature usage statistics
   - User journey mapping
   - Performance bottlenecks
   - Error patterns
   - Load patterns

4. **Technical Debt Catalog**
   - Complete debt inventory
   - Security vulnerabilities
   - Performance issues
   - Scalability blockers
   - Maintenance nightmares

**Output**: 
- `project-documents/rebuild/legacy-analysis/`
- Migration complexity assessment
- Feature parity checklist

### 🚦 Approval Gate 1: Rebuild Scope Confirmation
- Review complete analysis
- Confirm rebuild type and scope
- Approve migration strategy
- Resource commitment check

#### Phase 4: Research Level Selection (Enhanced)
**Agent**: Research Coordinator Agent
**Purpose**: Determine research depth with rebuild context

```
Research for your rebuild project:

📋 MINIMAL (20 docs, 2-3 hours)
  • Validation of rebuild decision
  • Technology trend analysis
  • Cost-benefit verification
  • Quick competitive check

📊 STANDARD (52 docs, 4-6 hours) [RECOMMENDED]
  • Everything in minimal plus...
  • Deep market evolution analysis
  • Emerging technology assessment
  • Detailed competitor rebuilds
  • Future-proofing analysis

🔍 THOROUGH (198 docs, 8-12 hours)
  • Everything in standard plus...
  • Complete market repositioning
  • International expansion readiness
  • Acquisition potential post-rebuild
  • 5-year trend projections
```

#### Phase 5: Market Validation Research (Parallel Execution)
**Agents**: Research Agent, Market Validation Agent, Competitor Agent
**Purpose**: Validate rebuild decision against market reality

**Research Areas**:
- Has market evolved since original build?
- New competitors or business models?
- Technology adoption in industry
- Customer expectation changes
- Regulatory changes
- Emerging opportunities

**Output**: `project-documents/rebuild/market-research/`

#### Phase 6: Rebuild Strategy Synthesis
**Agent**: Analysis Agent, Project Manager Agent
**Purpose**: Synthesize all inputs into rebuild strategy

**Deliverables**:
1. **Rebuild Strategy Document**
   - Phased approach plan
   - Risk mitigation strategies
   - Success metrics
   - Timeline with milestones

2. **Migration Strategy**
   - Data migration plan
   - User migration approach
   - Feature rollout schedule
   - Rollback procedures

3. **Comparison Matrix**
   - Old vs New feature mapping
   - Performance improvements expected
   - Cost structure comparison
   - Scalability comparison

### 🚦 Approval Gate 2: Strategy Approval
- Approve rebuild strategy
- Confirm migration approach
- Budget final approval
- Team allocation confirmation

### PART 2: REQUIREMENTS & ARCHITECTURE (Days 4-6)

#### Phase 7: Product Requirements Document (Rebuild-Focused)
**Agent**: PRD Agent
**Purpose**: Comprehensive PRD for rebuilt system

**Enhanced Sections**:
- Feature parity requirements
- Migration requirements
- Backward compatibility needs
- Performance requirements (specific improvements)
- Data model evolution
- API versioning strategy

**Output**: `project-documents/rebuild/requirements/rebuild-prd.md`

#### Phase 8: Architecture Design (Greenfield + Migration)
**Agent**: Architecture Agent, DevOps Agent
**Purpose**: Design new architecture with migration in mind

**Components**:
1. **New System Architecture**
   - Modern, scalable design
   - Cloud-native approach
   - Security-first design
   - Performance optimizations

2. **Migration Architecture**
   - Bridge components
   - Data sync mechanisms
   - Traffic routing strategy
   - Rollback capabilities

3. **Comparison Architecture**
   - Side-by-side comparison diagrams
   - Data flow changes
   - Integration changes
   - Performance improvements

**Output**: `project-documents/rebuild/architecture/`

#### Phase 9: Product Backlog Creation (Rebuild-Enhanced)
**Agents**: Project Manager Agent, Scrum Master Agent
**Purpose**: Create backlog with rebuild-specific considerations

**Backlog Structure**:
```
Epic: Foundation
  - Set up new infrastructure
  - Core framework setup
  - CI/CD pipeline
  - Monitoring/logging

Epic: Feature Parity
  - [Feature 1] rebuild
  - [Feature 2] rebuild
  - API compatibility layer

Epic: Migration Tools
  - Data migration scripts
  - User migration flow
  - Traffic router setup

Epic: New Capabilities
  - [New Feature 1]
  - [New Feature 2]
  - AI integrations

Epic: Cutover
  - Final data migration
  - Traffic switching
  - Legacy shutdown
```

### 🚦 Approval Gate 3: Pre-Implementation Review
- Architecture approval
- Backlog prioritization
- Sprint planning approval
- Risk acceptance

### PART 3: IMPLEMENTATION SPRINTS (Weeks 1-N)

#### Phase 10: Sprint 0 - Foundation & Infrastructure
**Sprint Name**: `sprint-YYYY-MM-DD-rebuild-foundation`
**Agents**: DevOps Agent, Coder Agent, Security Agent
**Duration**: 2-3 days

**Objectives**:
1. **New Infrastructure Setup**
   - Fresh cloud accounts/resources
   - New CI/CD pipelines
   - Modern monitoring stack
   - Security scanning tools

2. **Development Environment**
   - Docker/container setup
   - Local development tools
   - Testing frameworks
   - Documentation systems

3. **Bridge Infrastructure**
   - Data sync mechanisms
   - Traffic routing setup
   - Feature flags system
   - Dual monitoring

**Stakeholder Collaboration**: Similar to new-project Sprint 1

#### Phase 11: Sprint 1 - Core Rebuild
**Sprint Name**: `sprint-YYYY-MM-DD-rebuild-core`
**Agents**: Coder Agent, Testing Agent, Architecture Agent
**Duration**: 3-5 days

**Objectives**:
- Core framework implementation
- Database schema creation
- Authentication system
- API framework
- Basic UI structure

#### Phase 12: Sprint 2-N - Feature Parity Sprints
**Sprint Names**: `sprint-YYYY-MM-DD-rebuild-[feature]`
**Agents**: Full team rotation
**Duration**: 2-3 days each

**Sprint Pattern**:
- Implement feature from old system
- Enhanced with improvements
- Full test coverage
- Migration script for feature data
- Documentation update

### 🚦 Approval Gate 4: Feature Parity Checkpoint
- Verify core features rebuilt
- Performance benchmarks met
- Security review passed
- Initial user testing

#### Phase 13: Migration Sprint
**Sprint Name**: `sprint-YYYY-MM-DD-rebuild-migration`
**Agents**: DevOps Agent, DBA Agent, Testing Agent
**Duration**: 2-3 days

**Objectives**:
- Data migration execution
- User account migration
- Historical data transfer
- Integration reconnection
- SEO preservation

#### Phase 14: Parallel Operation Sprint
**Sprint Name**: `sprint-YYYY-MM-DD-rebuild-parallel-ops`
**Duration**: 5-10 days (varies by stakeholder decision)

**Objectives**:
- Run both systems simultaneously
- Monitor performance comparison
- Gradual traffic migration
- Issue identification and fixes
- User feedback collection

### 🚦 Approval Gate 5: Cutover Decision
- Performance validation
- User acceptance confirmed
- All data migrated successfully
- Team readiness confirmed
- Rollback plan verified

#### Phase 15: Cutover Sprint
**Sprint Name**: `sprint-YYYY-MM-DD-rebuild-cutover`
**Duration**: 1-2 days

**Objectives**:
- Final data sync
- DNS switching
- Traffic cutover
- Legacy system standby
- Monitoring intensified

### PART 4: OPERATIONS & OPTIMIZATION (Ongoing)

#### Phase 16: Stabilization (Week N+1)
**Agents**: DevOps Agent, Monitoring Agent, Support Agent
**Focus**: Ensure stability post-cutover

**Activities**:
- 24/7 monitoring
- Performance tuning
- Bug fixes
- User support
- Documentation updates

#### Phase 17: Optimization Sprints (Weeks N+2 to N+8)
**Sprint Pattern**: `sprint-YYYY-MM-DD-optimization-[area]`
**Agents**: Optimization Agent, Performance Agent

**Optimization Areas**:
- Performance optimization
- Cost optimization
- Security hardening
- Scalability improvements
- AI integration activation

#### Phase 18: Feature Enhancement Sprints (Ongoing)
**Sprint Pattern**: `sprint-YYYY-MM-DD-enhancement-[feature]`
**Agents**: Product team rotation

**Focus Areas**:
- New features enabled by rebuild
- User experience improvements
- API expansions
- Integration additions
- Market expansion features

#### Phase 19: Growth Operations (Months 2-6)
**Agents**: Marketing Agent, Analytics Agent, Revenue Agent

**Activities**:
- Marketing campaign activation
- User acquisition acceleration
- Revenue optimization
- Market expansion
- Partnership development

#### Phase 20: Maintenance & Evolution (Ongoing)
**Agents**: All agents in rotation

**Regular Cycles**:
- Weekly: Performance reviews
- Bi-weekly: Sprint cycles
- Monthly: Security audits
- Quarterly: Architecture reviews
- Semi-annual: Market analysis refresh

### PART 5: LEGACY RETIREMENT (Month 3-6)

#### Phase 21: Legacy Shutdown Planning
**Agent**: Project Manager Agent, DevOps Agent

**Activities**:
- Data archival strategy
- Code repository preservation
- Documentation completion
- Compliance requirements
- Cost reduction planning

#### Phase 22: Legacy Decommissioning
**Sprint Name**: `sprint-YYYY-MM-DD-legacy-shutdown`

**Steps**:
1. Final data backup
2. System shutdown
3. Resource deallocation
4. Account closures
5. Documentation archival

### 🚦 Final Gate: Project Completion
- All objectives achieved
- Legacy system retired
- Team knowledge transfer complete
- Lessons learned documented
- Success metrics validated

## Continuous Patterns Throughout Workflow

### 1. State Management
```json
{
  "workflow_state": {
    "active_workflow": "rebuild-project",
    "rebuild_type": "technical|partial|business_model|complete",
    "workflow_phase": "[current_phase]",
    "parallel_operation": true|false,
    "original_system_status": "active|standby|retired",
    "rebuild_system_status": "building|testing|active"
  }
}
```

### 2. Documentation Strategy
- **Separate Rebuild Section**: `project-documents/rebuild/`
- **Comparison Docs**: Always show old vs new
- **Migration Guides**: Step-by-step procedures
- **Rollback Plans**: At every phase
- **Lessons Learned**: Continuous capture

### 3. Risk Management
- **Parallel Systems**: Always maintain fallback
- **Incremental Migration**: Never big-bang
- **Feature Flags**: Control feature rollout
- **Monitoring**: Dual system monitoring
- **Communication**: Regular stakeholder updates

### 4. Sprint Patterns
- **Naming**: Always `sprint-YYYY-MM-DD-rebuild-[purpose]`
- **Duration**: Shorter sprints (2-3 days) for agility
- **Review Frequency**: After every sprint
- **Retrospectives**: Focus on rebuild learnings
- **Velocity Tracking**: Separate from normal velocity

## Key Differentiators from Other Workflows

### 1. From New-Project-Workflow
- Includes migration complexity
- Parallel operation management
- Legacy system considerations
- Feature parity tracking
- Data preservation requirements

### 2. From Existing-Project-Workflow
- Complete rebuild vs enhancement
- Greenfield architecture opportunity
- Side-by-side deployment
- Full market repositioning option
- Technology stack freedom

### 3. Unique to Rebuild
- Dual system management
- Migration orchestration
- Comparison dashboards
- Cutover planning
- Legacy retirement process

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

## Workflow Triggers

### Entry Points
1. From existing-project-workflow rebuild assessment
2. Direct stakeholder decision
3. Technical crisis (security breach, scale failure)
4. Market pivot requirement
5. Acquisition preparation

### Exit Points
1. Successful legacy retirement
2. Transition to normal operations
3. Pivot to different strategy
4. Project cancellation (with rollback)

## Required Agents (38 Total)

### Core Orchestration (Priority 1)
1. Stakeholder Interview Agent
2. Project Manager Agent
3. Scrum Master Agent
4. Project Analyzer Agent

### Technical Implementation (Priority 1)
5. Coder Agent
6. Architecture Agent
7. DevOps Agent
8. Testing Agent
9. Security Agent
10. DBA Agent

### Research & Planning (Priority 2)
11. Research Agent
12. Market Validation Agent
13. PRD Agent
14. Analysis Agent
15. Document Manager Agent

### Operations & Optimization (Priority 2)
16. Optimization Agent
17. Logger Agent
18. API Agent
19. UI/UX Agent
20. Project Structure Agent

### Business & Growth (Priority 3)
21. Marketing Agent
22. Revenue Optimization Agent
23. Finance Agent
24. Analytics Agent
25. Customer Lifecycle Agent

### Specialized Support (Priority 3)
26. ML Agent
27. LLM Agent
28. Email Marketing Agent
29. Social Media Agent
30. SEO Agent
31. PPC Media Buyer Agent
32. VC Report Agent
33. MCP Agent
34. Business Documents Agent
35. Documentator Agent
36. Project Dashboard Agent
37. Learning Analysis Agent
38. Project State Manager Agent

## Implementation Considerations

### 1. Parallel Execution Opportunities
- Phases 3-5: Analysis and research in parallel
- Phases 7-9: Requirements and architecture in parallel
- Feature sprints: Multiple features in parallel
- Operations phases: Continuous parallel operations

### 2. Checkpoint Strategy
- After every approval gate
- End of each sprint
- Before risky operations
- After successful migrations
- Regular scheduled checkpoints

### 3. Rollback Procedures
- At every phase until cutover
- Data rollback scripts ready
- Traffic switching prepared
- Team trained on procedures
- Documentation maintained

### 4. Communication Patterns
- Daily updates during sprints
- Phase completion reports
- Approval gate presentations
- Risk alerts immediate
- Success celebrations

## Questions for Discussion

1. **Sprint Duration**: Should rebuild sprints be shorter (2-3 days) for more agility?

2. **Parallel Duration**: How long should both systems run in parallel by default?

3. **Approval Gates**: Are 5-6 gates too many? Should we add more?

4. **Documentation**: Should we maintain THREE sets (old, new, comparison)?

5. **Feature Parity**: Should 100% parity be required or can we drop features?

6. **Team Structure**: Should we have dedicated rebuild team or rotate?

7. **Testing Strategy**: How much testing before cutover? User acceptance testing?

8. **Rollback Timeline**: How long keep rollback option after cutover?

9. **Cost Tracking**: Should we track rebuild ROI in real-time?

10. **Learning Capture**: How to best capture rebuild learnings for community?

---

**Note**: This is a discussion document for the `/rebuild-project-workflow` design. It incorporates all phases from both new-project and existing-project workflows, enhanced for rebuild scenarios, plus comprehensive operations phases for long-term success.

**Key Design Decisions**:
- Side-by-side deployment (original + rebuilt)
- Sprint naming follows convention (not "Sprint 0")
- Documentation stays in agile-ai-agents
- More frequent approval gates
- Parallel operations duration from stakeholder interview
- Complete workflow from discovery through legacy retirement