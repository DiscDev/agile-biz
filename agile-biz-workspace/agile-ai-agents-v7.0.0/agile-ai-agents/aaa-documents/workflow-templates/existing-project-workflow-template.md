# Existing Project Workflow Template

## Overview
This template guides the `/start-existing-project-workflow` command through analyzing existing code and planning enhancements with sequential phases and approval gates.

## Command Options
- `/start-existing-project-workflow` - Run complete workflow (all phases sequentially)
- `/start-existing-project-workflow --status` - Show current phase and progress
- `/start-existing-project-workflow --resume` - Resume from last checkpoint
- `/start-existing-project-workflow --save-state` - Save current progress mid-phase
- `/start-existing-project-workflow --dry-run` - Preview workflow phases without executing
- `/start-existing-project-workflow --parallel` - Enable parallel agent execution where applicable

## Workflow Phases

### Phase 1: Automatic Codebase Analysis (30min-2hrs)
**Agent**: Code Analyzer Agent, Architecture Discovery Agent, Security Agent, Project Structure Agent
**Process**: Analyze code FIRST before asking questions

**Analysis Steps**:
1. Detect project structure and technologies
2. **Analyze folder organization** (NEW):
   - Map current directory structure
   - Identify structure pattern (mixed, separated, monolithic)
   - Detect structure issues (mixed dependencies, no separation)
   - Compare against best practices for detected stack
3. Map system architecture
4. Assess code quality metrics
5. Identify security vulnerabilities
6. Find performance bottlenecks
7. Document existing features

**Structure Analysis Output**:
- Current folder structure visualization
- Detected issues and their impact
- Recommended structure for their tech stack
- Migration effort estimate if needed

**Output**: Initial analysis summary presented to stakeholder

**Auto-Save Point**: ✓
- Trigger: phase_completion (Initial Analysis)
- Action: Update current-state.json with analysis results
- Confirmation: Based on confirmation_style setting

### Phase 2: Contextual Stakeholder Interview (30-60 minutes)
**Agent**: Project Analyzer Agent
**Process**: Section-by-section with analysis-informed questions

#### Section 1: Current State Validation
**Initial Questions** (informed by analysis):
1. "I've analyzed your [detected technology] project. Is this primarily a [detected purpose]?"
2. "I found [X] main components/services. Are there any I missed?"
3. "Is this currently in production? If yes, approximately how many users?"
4. "How long has this project been in development?"
5. "What's your current team size?"

**Analysis-Specific Questions**:
- "I noticed you're using [old version]. Any constraints preventing an upgrade?"
- "Your [component] seems to handle [function]. Is this critical to maintain?"
- "I found [X]% test coverage. What's your target?"

**Follow-up Process**:
- Validate analysis findings
- Document in `project-documents/existing-project-analysis/stakeholder-interview/current-state.md`
- Get approval on understanding

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json
- Confirmation: Based on confirmation_style setting

#### Section 2: Technical Landscape Verification
**Initial Questions**:
1. "I detected [list of technologies]. Are there other key technologies I should know about?"
2. "You're hosted on [detected platform]. Any plans to migrate?"
3. "I found integrations with [APIs/services]. Are these all still active?"
4. "Your database is [type/version]. Any performance concerns?"

**Architecture-Specific Questions**:
- "I see [pattern] architecture. Is this working well for you?"
- "Your authentication uses [method]. Would you consider [alternative]?"
- "I found [number] different state management approaches. Should we standardize?"

**Follow-up Process**:
- Confirm technical understanding
- Document in `project-documents/existing-project-analysis/stakeholder-interview/technical-landscape.md`

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json
- Confirmation: Based on confirmation_style setting

#### Section 2.5: Project Structure Evaluation (NEW)
**Structure Analysis Presentation**:
"I've analyzed your project structure. Here's what I found:"

**Show Current Structure**:
- Display actual folder structure from Phase 1 analysis
- Highlight any structure issues detected
- Compare to best practices for their tech stack

**Structure Issues (if any)**:
- List specific problems (e.g., "Frontend mixed in root", "No separation of concerns")
- Explain impact on development and deployment
- Show recommended structure from `templates/project-scaffolds/`

**Questions**:
1. "Would you like to:"
   - Keep the current structure as-is
   - Migrate to recommended structure (gradual plan)
   - Migrate to recommended structure (immediate)
   - Customize the recommended structure

2. "If migrating, when should we do this?"
   - Before starting new features
   - As part of first sprint
   - Gradually over multiple sprints
   - Create dedicated migration sprint

**Follow-up Process**:
- Document decision in `project-documents/existing-project-analysis/stakeholder-interview/structure-evaluation.md`
- If migration chosen, add to improvement goals
- Get explicit approval on approach

**Auto-Save Point**: ✓
- Trigger: structure_decision
- Action: Update current-state.json with structure approach
- Confirmation: Based on confirmation_style setting

#### Section 3: Improvement Goals
**Initial Questions**:
1. "What brings you here today? (bug fixes/new features/optimization/refactoring/other)"
2. "What are your top 3 pain points with the current system?"
3. "Any critical issues that need immediate attention?"
4. "What's your timeline for improvements?"

**Analysis-Informed Questions**:
- "I found [specific issues]. Are you aware of these?"
- "Your [component] could benefit from [improvement]. Is this a priority?"
- "I noticed [security vulnerability]. Should we address this first?"

**Follow-up Process**:
- Prioritize improvements
- Document in `project-documents/existing-project-analysis/stakeholder-interview/improvement-goals.md`

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json
- Confirmation: Based on confirmation_style setting

#### Section 4: Enhancement Boundaries
**Initial Questions**:
1. "Should I analyze the entire codebase or focus on specific areas?"
2. "Are there any parts of the code we should NOT modify?"
3. "Any third-party code or generated files to exclude?"
4. "Interested in a security audit? Performance analysis?"

**Follow-up Process**:
- Define scope clearly
- Document in `project-documents/existing-project-analysis/stakeholder-interview/analysis-boundaries.md`

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json
- Confirmation: Based on confirmation_style setting

#### Final Approval
- Present complete findings and understanding
- Get approval on analysis and goals
- Document in `project-documents/existing-project-analysis/stakeholder-interview/stakeholder-approval.md`

**Auto-Save Point**: ✓
- Trigger: phase_completion (Discovery Phase)
- Action: Create checkpoint if save_mode is "hybrid", otherwise update current-state.json
- Confirmation: Based on confirmation_style setting

### Phase 3: Analysis Depth Selection (5 minutes)
**Agent**: Analysis Coordinator Agent

**Present Options**:
```
How deep should we analyze your codebase? 

🔍 QUICK (30-60 min) - High-level review
  • Basic architecture overview
  • Obvious issues and quick wins
  • Technology inventory
  • Critical security checks

📊 STANDARD (2-4 hours) - Comprehensive analysis [RECOMMENDED]
  • Full architecture documentation
  • Code quality metrics
  • Security vulnerability scan
  • Performance bottleneck analysis
  • Dependency audit
  • Test coverage report
  • Technical debt assessment

🔬 DEEP (4-8 hours) - Line-by-line analysis
  • Everything in standard plus...
  • Line-by-line code review
  • Memory profiling
  • Database query optimization
  • Detailed refactoring plan
  • Microservice decomposition options
  • Scalability assessment

Which level would you prefer? (quick/standard/deep) [default: standard]
```

### Phase 4: Deep Codebase Analysis
**Agents**: Multiple analysis agents based on level
- Execute deeper analysis based on selected level
- Save findings to `project-documents/existing-project-analysis/`

### 🚦 Approval Gate 1: Post-Analysis Review
- Review code analysis findings
- Confirm enhancement priorities
- Address security/performance concerns
- Decide on enhancement scope

### Phase 5: Market Validation & Competitive Research
**Agent**: Research Coordinator Agent with Code Analysis Context

**Present Analysis-Informed Options**:
```
Based on my analysis of your [product type] with [key features],
I recommend comprehensive market validation research.

Your current product appears to serve [detected use cases].
Let's validate if this aligns with market demand.

How deep should we research your market position?

📋 MINIMAL (15 docs + code analysis insights, 2-3 hours)
  • Market validation for existing features
  • Competitive comparison with your actual capabilities
  • Gap analysis: market needs vs. what you built
  • Quick pivot opportunities based on your tech stack

📊 STANDARD (48 docs + code analysis insights, 4-6 hours) [RECOMMENDED]
  • Everything in minimal plus...
  • Feature-by-feature market validation
  • Detailed competitive analysis against your architecture
  • Customer journey mapping vs. your current UX
  • Monetization analysis based on your cost structure
  • Growth opportunities within your technical constraints

🔍 THOROUGH (194 docs + code analysis insights, 8-12 hours)
  • Everything in standard plus...
  • Deep market segmentation analysis
  • Enterprise buyer psychology vs. your enterprise readiness
  • International market fit with your localization capability
  • Acquisition potential based on your tech assets
  • Complete pivot analysis with migration paths

Which level? (minimal/standard/thorough/skip) [default: standard]
```

**Auto-Save Point**: ✓
- Trigger: research_selection
- Action: Update current-state.json with selected research level
- Confirmation: Based on confirmation_style setting

### Phase 5a: Usage Analytics Research (If Data Available)
**Agent**: Analysis Agent
**Conditional**: Only if usage data exists

**Analytics Questions**:
- What features are actually used vs. unused?
- Where do users drop off in workflows?
- Which user segments are most successful?
- How does actual usage compare to intended design?
- What unexpected use cases have emerged?

**Output**: `project-documents/analysis-reports/usage-analytics-insights.md`

### Phase 5b: Technical Debt vs Market Opportunity Analysis
**Agent**: Research Agent, Analysis Agent

**Cross-Analysis**:
- Map technical debt items to blocked market opportunities
- Calculate ROI for each technical improvement
- Prioritize fixes by market impact
- Identify quick wins vs. long-term investments

**Decision Matrix Output**:
```markdown
| Technical Debt | Effort | Blocked Opportunity | Market Value | ROI |
|:--------------|:------:|:-------------------|:------------|:---:|
| Legacy Auth | High | Enterprise Sales | $2M/year | 300% |
| No API | Medium | Integrations | $500K/year | 250% |
| Poor Mobile | Low | Mobile Users | $100K/year | 400% |
```

### Phase 5c: Pivot Feasibility Analysis
**Agent**: Research Agent, Project Analyzer Agent

**Pivot Assessment**:
- Based on current architecture, what pivots are feasible?
- What would it take to serve adjacent markets?
- Can the codebase support enterprise requirements?
- International expansion technical requirements?
- API-first transformation feasibility?

**Output**: `project-documents/analysis-reports/pivot-opportunities.md`

### Phase 5d: Rebuild Assessment (If Triggered)
**Agent**: Analysis Agent with Rebuild Decision Framework

**Automatic Triggers**:
- Technical Viability Score <3/10
- Business Model Health Score <3/10
- Technical Debt >60% of codebase value
- Core framework deprecated/unsupported
- LTV:CAC ratio <1.5 consistently

**Assessment Output**:
```
🔄 REBUILD ASSESSMENT REPORT

Scores:
• Market Validation: [X]/10 ✅
• Technical Viability: [X]/10 ❌
• Business Model: [X]/10 ⚠️

Recommendation: [TECHNICAL/PARTIAL/BUSINESS MODEL/COMPLETE] REBUILD

ROI Analysis:
• Investment Required: $[XXX,XXX]
• Expected Return: $[X,XXX,XXX]
• Payback Period: [X] months
• Success Probability: [X]%
```

**Rebuild Strategy Options**:

**Option A: Complete Technical Rebuild** 🔧
- Fresh start with modern stack
- Timeline: 6-12 months
- Risk: High | Reward: Highest

**Option B: Partial/Strangler Fig** 🌱
- Gradual component replacement
- Timeline: 4-8 months  
- Risk: Medium | Reward: High

**Option C: Business Model Rebuild** 💰
- Keep tech, change economics
- Timeline: 2-4 months
- Risk: Low | Reward: Medium-High

**Option D: Continue Iterating** 🔄
- Incremental improvements only
- Timeline: Ongoing
- Risk: Low | Reward: Low-Medium

**Output**: `project-documents/analysis-reports/rebuild-assessment.md`

### 🚦 Approval Gate: Post-Research Decision Point
**Present Validation Results**:
```markdown
## Based on Research + Code Analysis, Your Options:

### Option 1: Validation Success - Double Down ✅
Market validates your approach → Accelerate current direction

### Option 2: Partial Validation - Pivot Features ⚠️
Core value prop is right, features need adjustment → Refocus development

### Option 3: Market Mismatch - Major Pivot ❌
Current approach doesn't match market → Leverage tech for new direction

### Option 4: Technical Barriers - Infrastructure First 🚧
Market opportunity exists but tech blocks it → Technical transformation
```

### Phase 6: Enhancement Planning (Informed by Research)
**Agent**: PRD Agent, Project Manager Agent

**Research-Informed Planning**:
- Create enhancement PRD based on market validation results
- Prioritize features that align with validated market needs
- Deprioritize or remove features with no market demand
- Include technical debt items that unlock market opportunities
- Develop implementation roadmap based on ROI analysis
- Plan sprints balancing market needs with technical reality

**Output Documents**:
- `project-documents/requirements/enhancement-prd.md`
- `project-documents/planning/market-aligned-roadmap.md`
- `project-documents/planning/technical-debt-priority.md`

### 🚦 Approval Gate 2: Pre-Implementation Review
- Approve enhancement roadmap
- Migration strategy approval (if needed)
- Backward compatibility check
- Resource allocation

### Phase 7: Enhancement Backlog Creation (NEW)
**Agents**: Project Manager, Scrum Master
- Transform enhancement PRD into backlog items
- Create epics for major improvements
- Balance new features with technical debt
- Estimate items considering existing code constraints
- Map dependencies with existing components
- Create phased release plan
- Save to `project-documents/orchestration/product-backlog/`

**Special Considerations for Existing Projects**:
- Include refactoring items
- Plan for backward compatibility
- Create technical debt reduction epics
- Consider migration strategies
- Account for testing overhead

### Phase 8: First Sprint - CI/CD & Infrastructure Modernization
**Agents**: DevOps Agent, Coder Agent, Testing Agent, Security Agent, Project Manager Agent
**Duration**: 1-2 days (AI-speed with human collaboration)
**Focus**: Modernize CI/CD pipeline through stakeholder collaboration while preserving existing systems

#### Sprint 1 Kickoff: Infrastructure Assessment & Collaboration
**DevOps Agent initiates collaborative modernization process**:

**Initial Assessment Presentation**:
```
📋 Sprint 1 Infrastructure Modernization Plan
==============================================
I've analyzed your existing infrastructure. Let's modernize it together.
Here's what I found and what we need to set up:

Current State Analysis:
✓ Repository: [GitHub/GitLab/Bitbucket] - [status]
✓ Deployment: [Manual/Semi-automated] - [current process]
✓ Database: [Type & Version] - [connection status]
✓ Hosting: [Platform] - [current setup]
✓ Monitoring: [Tools in use] - [coverage level]

Modernization Requirements:
1. ⚙️ Version control improvements
2. 🚀 CI/CD pipeline automation
3. 🗄️ Database migration safety
4. ☁️ Infrastructure as code
5. 🔐 Secrets management upgrade
6. 📊 Enhanced monitoring

Estimated setup time: 3-4 hours with your help
Ready to modernize? (yes/no)
```

#### Stakeholder Collaboration Workflow for Existing Projects

**Step 1: Repository & Access Audit (45 minutes)**
```
🔧 Repository Modernization
===========================
Let's upgrade your repository setup:

1. Current Repository Review:
   □ "I see you're using [platform]. Let's verify access:"
   □ "Who currently has deployment access?"
   □ "Are there any undocumented deployment keys?"

2. Access Token Upgrade:
   □ "Let's create new deployment tokens with proper scopes"
   □ "Navigate to [specific settings path]"
   □ "Create tokens for: CI/CD, Staging, Production"
   □ "We'll rotate old tokens after testing"

3. Branch Protection:
   □ "Setting up protection for main/master branch"
   □ "Require PR reviews before merge?"
   □ "Enable status checks before merge?"

4. Secrets Migration:
   □ "I found [X] hardcoded values to move to secrets"
   □ "Let's add these to [GitHub Secrets/Vault]:"
     - Current: [list existing secrets]
     - New: [list needed secrets]
     - Deprecated: [list to remove]

Any legacy systems we need to maintain? (list them)
```

**Step 2: Current Infrastructure Documentation (30 minutes)**
```
☁️ Infrastructure Discovery
===========================
Help me document your current setup:

1. Server/Cloud Details:
   □ "Production servers: ___________"
   □ "Staging servers: ___________"
   □ "Development servers: ___________"
   
2. Access Methods:
   □ "How do you currently deploy? (SSH/FTP/Console)"
   □ "Who has deployment credentials?"
   □ "Any deployment scripts I should know about?"

3. Database Locations:
   □ "Production DB: ___________"
   □ "Staging DB: ___________"
   □ "Backup location: ___________"

4. Critical Services:
   □ "Payment processors: ___________"
   □ "Email services: ___________"
   □ "Third-party APIs: ___________"

I'll create a migration plan that preserves all connections.
```

**Step 3: Zero-Downtime Migration Plan (30 minutes)**
```
🔄 Safe Migration Strategy
==========================
Based on your setup, here's our migration approach:

1. Parallel Infrastructure:
   □ "We'll build new alongside old"
   □ "Test everything before switching"
   □ "Keep rollback ready at all times"

2. Database Safety:
   □ "Current backup strategy: [detected]"
   □ "Let's create fresh backup now"
   □ "Set up automated daily backups"
   □ "Test restore procedure"

3. Gradual Cutover Plan:
   Phase 1: Build new CI/CD (no impact)
   Phase 2: Test with staging (low risk)
   Phase 3: Canary deployment (10% traffic)
   Phase 4: Full production (with rollback ready)

Comfortable with this approach? Any concerns?
```

**Step 4: CI/CD Pipeline Implementation (45 minutes)**
```
🚀 Automated Pipeline Setup
============================
Let's automate your deployment process:

1. Current Process Documentation:
   □ "Walk me through your current deployment"
   □ "What manual steps do you perform?"
   □ "Any pre/post deployment checks?"

2. GitHub Actions Migration:
   □ "I'll create workflows that mirror your process"
   □ "Adding these safety checks:"
     - Automated tests (existing + new)
     - Database migration validation
     - Rollback triggers
     - Smoke tests post-deployment

3. Environment Configuration:
   □ Development: Auto-deploy on commit
   □ Staging: Deploy on PR merge
   □ Production: Manual approval required

Want to test with a harmless change first? (recommended)
```

**Step 5: Docker & Infrastructure as Code (45 minutes)**
```
🐳 Containerization (If Not Already)
=====================================
Let's containerize for consistency:

1. Docker Setup:
   □ "I'll create Dockerfile for your [tech stack]"
   □ "Docker Compose for local development"
   □ "Multi-stage builds for optimization"

2. Infrastructure as Code:
   □ "Current infrastructure in [Terraform/CloudFormation]"
   □ "I'll document everything as code"
   □ "Version control for infrastructure"

3. Container Registry:
   □ "Use GitHub Packages or Docker Hub?"
   □ "Set up automated image builds"
   □ "Configure image scanning"

Skip containerization for now? (can add later)
```

**Step 6: Monitoring & Logging Enhancement (30 minutes)**
```
📊 Observability Upgrade
========================
Enhancing your monitoring:

1. Current Monitoring Gaps:
   □ "I found these blind spots: [list]"
   □ "Critical metrics not tracked: [list]"
   □ "No alerts for: [list]"

2. Quick Wins:
   □ "Adding health check endpoints"
   □ "Setting up uptime monitoring"
   □ "Configuring error alerts"
   □ "Performance baselines"

3. Log Aggregation:
   □ "Centralize logs from all services"
   □ "Set up log retention policies"
   □ "Create debugging dashboards"

Use existing tools or add new ones? (your preference)
```

**Step 7: Team Training & Handoff (30 minutes)**
```
👥 Team Enablement
==================
Ensuring everyone can use the new system:

1. Documentation:
   □ "Creating runbooks for common tasks"
   □ "Troubleshooting guides"
   □ "Emergency procedures"

2. Access Setup:
   □ "Who needs deployment access?"
   □ "Setting up proper roles"
   □ "Emergency override procedures"

3. Training Session:
   □ "Quick demo of new pipeline"
   □ "How to trigger deployments"
   □ "How to rollback if needed"
   □ "Monitoring dashboard tour"

Any team-specific requirements?
```

#### Interactive Migration Support

**DevOps Agent provides real-time assistance**:
```
🤝 Migration Support Available
==============================
I'm here throughout the migration:

CONCERN: "What if something breaks?"
→ "We'll test everything in staging first"
→ "Rollback plan ready at each step"
→ "Your current system stays untouched until ready"

CONCERN: "Our clients can't have downtime"
→ "Zero-downtime deployment strategy"
→ "Blue-green deployment for seamless switch"
→ "Can schedule during low-traffic window"

CONCERN: "We have custom scripts and processes"
→ "I'll preserve all custom logic"
→ "Migrate scripts to automated workflows"
→ "Keep manual override options"

Share any concerns and I'll address them immediately.
```

**Sprint 1 Objectives** (Updated for Existing Projects):
1. **Collaborative Infrastructure Audit (Day 1 Morning)**:
   - Document current infrastructure thoroughly
   - Identify all manual processes
   - Map dependencies and integrations
   - Create safety/rollback plans
   - Secure stakeholder credentials

2. **Parallel Infrastructure Build (Day 1 Afternoon)**:
   - Set up new CI/CD alongside existing
   - Configure automated testing
   - Implement gradual rollout strategy
   - Set up monitoring and alerts
   - Create infrastructure as code

3. **Migration Testing (Day 1 Evening)**:
   - Test new pipeline with staging
   - Validate all integrations work
   - Performance comparison
   - Security scanning
   - Rollback procedure testing

4. **Gradual Cutover (Day 2 Morning)**:
   - Deploy to staging via new pipeline
   - Monitor for issues
   - Canary deployment to production
   - Full cutover with monitoring
   - Keep old system ready

5. **Documentation & Training (Day 2 Afternoon)**:
   - Update all documentation
   - Train team on new processes
   - Create emergency procedures
   - Document lessons learned
   - Archive legacy processes

**Definition of Done for Sprint 1**:
- [ ] All existing functionality preserved
- [ ] Zero-downtime deployment achieved
- [ ] CI/CD pipeline fully operational
- [ ] All tests automated and passing
- [ ] Rollback tested and documented
- [ ] Security scanning integrated
- [ ] Monitoring coverage increased
- [ ] Team trained on new system
- [ ] Legacy systems properly archived
- [ ] Documentation complete in CLAUDE.md
- [ ] Stakeholder sign-off on new process

**Stakeholder Time Commitment**:
- Active participation: 3-4 hours on Day 1
- Testing and validation: 1 hour on Day 2
- On-call for questions: Throughout sprint
- Final approval: 30 minutes

**Risk Mitigation**:
- Keep existing system operational throughout
- Test every change in staging first
- Gradual rollout with monitoring
- Immediate rollback capability
- Stakeholder approval at each phase

**Auto-Save Point**: ✓
- Trigger: sprint_completion
- Action: Update current-state.json with Sprint 1 completion
- Create infrastructure-ready checkpoint with migration complete

### Phase 9-N: Enhancement Sprint Implementation
- Implement improvements leveraging new CI/CD pipeline
- All changes deployed through automated pipeline
- Maintain backward compatibility
- Regular testing and validation
- Enhancement milestones:
  - Use `/milestone "description"` for major improvements
  - Run `/deployment-success` after successful deployments
- Sprint completion:
  - `/sprint-review` followed by `/sprint-retrospective`
  - Contribution prompts focus on enhancement learnings
- Project completion:
  - Use `/project-complete` when enhancements are done
  - Comprehensive contribution on improvement journey

## State Management
```json
{
  "workflow_state": {
    "active_workflow": "existing-project",
    "workflow_phase": "analysis|discovery|planning|enhancement",
    "initiated_by": "/start-existing-project-workflow",
    "context": {
      "existing_tech": ["detected", "technologies"],
      "codebase_size": "small|medium|large",
      "production_status": true|false
    }
  }
}
```

## Key Differences from New Project Workflow
1. **Analysis First**: Analyze code before asking questions
2. **Informed Questions**: Questions based on actual findings
3. **Preservation Focus**: Emphasis on not breaking existing functionality
4. **Incremental Approach**: Enhancements vs. full rebuild
5. **Code-Informed Research**: Research enhanced with actual code analysis insights
6. **Market Validation**: Validate existing features against market demand
7. **Decision Framework**: Clear go/pivot/stop recommendations based on validation