# New Project Workflow Template

## Overview
This template guides the `/start-new-project-workflow` command through a structured discovery, research, and implementation process with sequential phases and approval gates.

## Command Options
- `/start-new-project-workflow` - Run complete workflow (all phases sequentially)
- `/start-new-project-workflow --status` - Show current phase and progress
- `/start-new-project-workflow --resume` - Resume from last checkpoint
- `/start-new-project-workflow --save-state` - Save current progress mid-phase
- `/start-new-project-workflow --dry-run` - Preview workflow phases without executing
- `/start-new-project-workflow --parallel` - Enable parallel agent execution where applicable

## Workflow Phases

### Phase 1: Iterative Stakeholder Discovery (45-90 minutes)
**Agent**: Project Analyzer Agent
**Process**: Section-by-section with iterative refinement

#### Pre-Interview: Stakeholder Prompt File Check
**Initial Question**:
"Before we begin, have you prepared a stakeholder prompt file with project information? This can significantly streamline our discussion. (yes/no)"

**If Yes - Process Prompt File**:
1. Request file location: "Please provide the path to your prompt file (e.g., project-documents/stakeholder-input/project-prompt.md)"
2. Validate and score the file
3. Display quality score and feedback
4. Review each section progressively with confirmation
5. Skip to Section 0 for any missing critical information

**If No - Proceed to Section 0**:
"No problem! We'll go through the questions together. You can prepare a prompt file for future projects using our template."

#### Section 0: Context Verification Setup (NEW - Critical for preventing drift)
**Purpose**: Establish Project Truth to prevent scope drift
**Initial Questions**:
1. "In one sentence, what is this product?"
2. "What specific industry/domain is this for?"
3. "Who are the primary users? (be specific)"
4. "List 3-5 things this is explicitly NOT (critical for focus)"
5. "Name 3-5 competitor products (helps define boundaries)"

**Follow-up Process**:
- Document as initial Project Truth
- These answers become verification constraints
- Save to `project-documents/project-truth/initial-project-truth.md`
- Get explicit approval on NOT THIS items

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Create initial Project Truth document
- Confirmation: Based on confirmation_style setting

#### Section 1: Project Vision & Purpose
**Initial Questions**:
1. "What are you building? Please describe in 1-2 sentences."
2. "What problem does this solve?"
3. "Who will use this? (target audience)"

**Follow-up Process**:
- Ask clarifying questions based on responses
- Document understanding in `project-documents/new-project-planning/stakeholder-interview/project-vision.md`
- Present understanding: "Based on your answers, here's my understanding..."
- Get approval: "Is this correct? (yes/no)"
- If no, iterate with more questions until approved

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json with section completion
- Confirmation: Based on confirmation_style setting

#### Section 2: Technical Preferences & Constraints
**Initial Questions**:
1. "Do you have technology preferences (languages, frameworks), or should I recommend based on your needs?"
2. "Preferred cloud provider? (AWS/Azure/Google Cloud/Other/None/Let me recommend)"
3. "Any technologies or approaches you want to avoid?"
4. "What's your timeline? (MVP in weeks/months, or longer-term project)"

**Follow-up Process**:
- Clarify any vague preferences
- Document in `project-documents/new-project-planning/stakeholder-interview/technical-constraints.md`
- Confirm understanding and get approval

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json
- Confirmation: Based on confirmation_style setting

#### Section 2.5: Project Structure & Organization (NEW)
**Initial Presentation**:
"Based on your technology choices of [selected stack], I recommend the following project structure:"

**Show Structure**:
- Load appropriate template from `templates/project-scaffolds/`
- Present visual folder structure
- Explain key benefits specific to their stack

**Questions**:
1. "Does this structure make sense for your project?"
2. "Would you prefer a different organization?"
3. "Any specific requirements for folder naming?"

**Follow-up Process**:
- If requested, show alternative structures
- Document decision in `project-documents/new-project-planning/stakeholder-interview/project-structure.md`
- Get explicit approval on structure

**Auto-Save Point**: ✓
- Trigger: structure_approval
- Action: Update current-state.json with approved structure template
- Confirmation: Based on confirmation_style setting

#### Section 3: Business Context & Goals
**Initial Questions**:
1. "Is this a personal project, startup, or enterprise initiative?"
2. "What's your budget range? (optional - helps with technology choices)"
3. "How will this generate value? (revenue model, cost savings, efficiency gains)"
4. "What would success look like in 6 months? In 1 year?"

**Follow-up Process**:
- Explore business model if applicable
- Document in `project-documents/new-project-planning/stakeholder-interview/business-context.md`
- Validate understanding and get approval

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json
- Confirmation: Based on confirmation_style setting

#### Section 4: Core Features & Priorities
**Initial Questions**:
1. "List 3-5 must-have features for your MVP (Minimum Viable Product)"
2. "What features can wait for version 2?"
3. "Are there any specific user experiences that are critical to get right?"
4. "Any compliance or security requirements? (GDPR, HIPAA, etc.)"

**Follow-up Process**:
- Create priority matrix
- Document in `project-documents/new-project-planning/stakeholder-interview/features-priorities.md`
- Review priorities and get approval

**Auto-Save Point**: ✓
- Trigger: section_approval
- Action: Update current-state.json
- Confirmation: Based on confirmation_style setting

#### Final Approval
- Present complete summary from all sections
- Get final approval and document in `project-documents/new-project-planning/stakeholder-interview/stakeholder-approval.md`
- Record timestamp and any conditions

**Auto-Save Point**: ✓
- Trigger: phase_completion (Discovery Phase)
- Action: Create checkpoint if save_mode is "hybrid", otherwise update current-state.json
- Confirmation: Based on confirmation_style setting

### Phase 2: Research Depth Selection (5 minutes)
**Agent**: Research Coordinator Agent

**Present Options**:
```
How deep should we research your project? Here's what you'll get:

📋 MINIMAL (Essential market validation and feasibility (1-2 hours))
  You'll receive these 15 essential documents:
  • Market & Competitive Analysis (7 docs)
  • Marketing Strategy (3 docs)
  • Financial Analysis (3 docs)
  • Executive Summary & Recommendations (2 docs)

📊 MEDIUM (Comprehensive research and analysis (3-5 hours)) [RECOMMENDED]
  You'll receive these 48 comprehensive documents:
  • In-depth Market Research (24 docs)
  • Complete Marketing Strategy (8 docs)
  • Financial Planning & ROI (5 docs)
  • Market Validation Framework (6 docs)
  • Strategic Analysis & Recommendations (4 docs)

🔍 THOROUGH (Enterprise-level deep dive with all research areas (6-10 hours))
  You'll receive 194 enterprise-level documents including:
  • Exhaustive Market Research (48 docs)
  • Full Marketing Arsenal (41 docs)
  • Complete Financial Analysis (5 docs)
  • Customer Success Strategy (24 docs)
  • Monetization & Revenue Models (24 docs)
  • Market Validation System (19 docs)
  • Investment & Fundraising Docs (19 docs)
  • Analytics & Intelligence (23 docs)
  • Security & Compliance (13 docs)
  • And much more...

Which level would you prefer? (minimal/medium/thorough) [default: medium]
```

**Auto-Save Point**: ✓
- Trigger: research_selection
- Action: Update current-state.json with selected research level
- Confirmation: Based on confirmation_style setting

### Phase 3: Research Execution
**Agents**: Multiple based on selected level
- Execute research in parallel
- Update progress every 30 minutes
- Save to `project-documents/research/`

### 🚦 Approval Gate 1: Post-Research Review
- Review all research findings
- Market validation assessment
- Adjust project scope based on findings
- Go/No-go decision

### Phase 4: Research Analysis & Synthesis
**Agent**: Analysis Agent
- Synthesize all research findings
- Create `research-synthesis.md`
- Identify key opportunities and risks

### Phase 5: Product Requirements Document
**Agent**: PRD Agent
- Generate comprehensive PRD from research and interviews
- Save to `project-documents/requirements/prd-document.md`

### 🚦 Approval Gate 2: Post-Requirements Review
- Approve PRD and technical specifications
- Confirm feature prioritization
- Resource allocation check
- Budget approval

### Phase 6: Strategic Planning
**Agents**: Project Manager, Architecture, DevOps
- Create project roadmap
- Design system architecture
- Plan infrastructure

### Phase 7: Product Backlog Creation (NEW)
**Agents**: Project Manager, Scrum Master
- Transform PRD into backlog items
- Create epics based on feature areas
- Write user stories with acceptance criteria
- Initial story point estimation
- Identify dependencies between items
- Prioritize based on business value
- Create initial release plan
- Save to `project-documents/orchestration/product-backlog/`

**Backlog Components Created**:
- Epic folders with initial items
- backlog-state.json with all items
- dependency-map.md with visual dependencies
- Initial velocity assumptions
- First sprint planning recommendations

### Phase 8: Project Scaffolding
**Agents**: Project Structure Agent, Coder Agent

**Implementation Steps**:
1. Load approved structure template from Phase 1 Section 2.5
2. Change to existing project directory (user already created it)
3. Create subdirectories based on approved template:
   - `frontend/`, `backend/`, etc. (for separated structures)
   - Framework-specific directories (for monolithic)
   - Service directories (for microservices)
4. Initialize each component with framework tools:
   - Run init commands from template's `init_command` fields
   - Install dependencies for each component
5. Set up root orchestration scripts (from template)
6. Configure cross-component communication:
   - Frontend proxy to backend
   - CORS settings
   - Environment variables
7. Create Docker configuration (if in template)
8. Initialize git repository with proper .gitignore
9. **CRITICAL**: Update existing project CLAUDE.md:
   - Append project structure documentation
   - Add tech stack details
   - Include development commands
   - Document architectural decisions
10. Create initial README with structure explanation

**Structure Documentation in CLAUDE.md**:
- Visual folder structure diagram
- Technology choices and versions
- Development ports and commands
- Architecture rationale
- Key conventions for the stack

### 🚦 Approval Gate 3: Pre-Implementation Review
- Final architecture review
- Deployment strategy approval
- Team readiness check
- Resource allocation confirmation

### Phase 9: First Sprint - Foundation & CI/CD Setup
**Agents**: DevOps Agent, Coder Agent, Testing Agent, Project Manager Agent
**Duration**: 1-2 days (AI-speed with human collaboration)
**Focus**: Establish solid foundation with CI/CD pipeline through stakeholder collaboration

#### Sprint 1 Kickoff: Stakeholder Setup Session
**DevOps Agent initiates collaborative setup process**:

**Statusline During Sprint 1**:
The statusline provides real-time visibility during infrastructure setup:
- **Action Required**: `⚠️ ACTION NEEDED | Create GitHub repo | 5m until blocked`
- **Progress Tracking**: `🔄 Sprint 1 CI/CD | Step 3/7: Database setup | 3 agents`
- **Completion Status**: `🟢 Sprint 1 CI/CD | Infrastructure ready | Deploy enabled`

**Initial Setup Checklist Presentation**:
```
📋 Sprint 1 Infrastructure Setup Requirements
============================================
We'll need your help setting up the following services.
I'll guide you through each step with specific instructions.

Required Accounts & Services:
1. ✅ GitHub/GitLab/Bitbucket account
2. ✅ Cloud provider account (AWS/Azure/GCP)
3. ✅ Database service (managed or self-hosted)
4. ✅ Domain name (if applicable)
5. ✅ SSL certificates
6. ✅ Monitoring service (optional but recommended)

Estimated setup time: 2-3 hours with guidance
Ready to begin? (yes/no)
```

#### Stakeholder Collaboration Workflow

**Step 1: Version Control Setup (30 minutes)**
```
🔧 GitHub/GitLab Setup Guide
============================
Let's set up your repository and CI/CD pipeline:

1. Repository Creation:
   □ "Please create a new repository named: [project-name]"
   □ "Make it private/public based on your needs"
   □ "I'll need you to add me as a collaborator (if applicable)"

2. Access Tokens:
   □ "Navigate to Settings > Developer Settings > Personal Access Tokens"
   □ "Create a token with these permissions: [repo, workflow, packages]"
   □ "Save this token securely - we'll add it to secrets next"

3. Repository Secrets:
   □ "Go to Settings > Secrets > Actions"
   □ "Add these secrets (I'll provide values for each):"
     - DEPLOYMENT_TOKEN
     - CLOUD_ACCESS_KEY
     - DATABASE_URL
     - API_KEYS (as needed)

Need help with any step? Type 'help' or paste any errors you see.
```

**Step 2: Cloud Infrastructure Setup (45 minutes)**
```
☁️ Cloud Provider Setup
=======================
Based on your choice of [AWS/Azure/GCP], let's set up:

For AWS:
1. Account Setup:
   □ "Log into AWS Console: https://console.aws.amazon.com"
   □ "Create new IAM user for deployments"
   □ "Attach these policies: [specific policies listed]"
   
2. Services Configuration:
   □ EC2/ECS for compute
   □ RDS for database (or your preference)
   □ S3 for storage
   □ CloudFront for CDN (if needed)
   
3. Access Keys:
   □ "Generate access key ID and secret"
   □ "We'll add these to GitHub secrets"

[Similar guides for Azure/GCP]

I'll generate Terraform/CloudFormation templates for you.
Would you prefer infrastructure-as-code or manual setup?
```

**Step 3: Database Configuration (30 minutes)**
```
🗄️ Database Setup
==================
For your [PostgreSQL/MySQL/MongoDB] database:

1. Managed Service Setup:
   □ "Navigate to RDS/Cloud SQL/Atlas"
   □ "Create new instance with these specs:"
     - Type: [recommended instance]
     - Storage: [recommended size]
     - Region: [same as application]
   
2. Connection Details:
   □ "Note down the connection string"
   □ "Set up database user with appropriate permissions"
   □ "Configure security groups/firewall rules"
   
3. Local Development:
   □ "Install Docker Desktop for local database"
   □ "I'll provide docker-compose configuration"

Need me to generate the schema setup scripts? (yes/no)
```

**Step 4: CI/CD Pipeline Configuration (30 minutes)**
```
🚀 CI/CD Pipeline Setup
=======================
Let's configure your automated pipeline:

1. GitHub Actions Setup:
   □ "I'll create .github/workflows/ directory"
   □ "Configure these workflows:"
     - ci.yml (continuous integration)
     - deploy-staging.yml
     - deploy-production.yml
   
2. Environment Configuration:
   □ "Set up these environments in GitHub:"
     - Development (auto-deploy on main)
     - Staging (manual approval)
     - Production (manual approval + protection)
   
3. Deployment Targets:
   □ "Provide server/cluster details:"
     - Staging URL: ___________
     - Production URL: ___________
     - SSH keys or cluster credentials

Should I set up blue-green deployments? (yes/no)
```

**Step 5: Domain & SSL Setup (20 minutes)**
```
🌐 Domain & SSL Configuration
==============================
If you have a domain ready:

1. Domain Setup:
   □ "Point domain to load balancer/server IP"
   □ "Configure these DNS records:"
     - A record: [IP address]
     - CNAME: www -> main domain
   
2. SSL Certificate:
   □ "Let's Encrypt (automatic) or custom?"
   □ "I'll configure auto-renewal"
   □ "Set up HTTPS redirect"

No domain yet? We can use a temporary subdomain.
```

**Step 6: Monitoring & Alerts (15 minutes)**
```
📊 Monitoring Setup (Optional but Recommended)
===============================================
Choose your monitoring solution:

1. Free Options:
   □ GitHub Actions status badges
   □ Uptime Robot (free tier)
   □ CloudWatch (AWS free tier)
   
2. Paid Options:
   □ DataDog
   □ New Relic
   □ Sentry (error tracking)

Want basic monitoring now and upgrade later? (yes/no)
```

#### Interactive Troubleshooting Support

**DevOps Agent provides real-time assistance**:
```
🤝 I'm here to help! Common issues and solutions:

ERROR: "Permission denied (publickey)"
→ "Let's set up your SSH key. Run: ssh-keygen -t ed25519"

ERROR: "Invalid credentials"
→ "Check if the token has required permissions. Need a new one?"

ERROR: "Resource limit exceeded"
→ "Let's adjust to free tier limits. I'll modify the config."

Paste any error messages and I'll help resolve them immediately.
```

**Sprint 1 Objectives** (Updated):
1. **Collaborative Infrastructure Setup (Day 1 Morning)**:
   - Guide stakeholder through account creation
   - Set up GitHub repository and secrets
   - Configure cloud provider services
   - Establish database connections
   - Domain and SSL configuration

2. **CI/CD Pipeline Implementation (Day 1 Afternoon)**:
   - Create GitHub Actions workflows
   - Configure deployment pipelines
   - Set up environment-specific configs
   - Implement secrets management
   - Configure monitoring and alerts

3. **Core Foundation Components (Day 1 Evening)**:
   - Authentication system foundation
   - Database schema and migrations
   - API structure and contracts
   - Basic UI framework setup
   - Error handling framework
   - Logging infrastructure

4. **Testing & Validation (Day 2 Morning)**:
   - Test framework setup
   - CI pipeline validation
   - Deployment testing (staging)
   - Security scanning setup
   - Performance baselines

5. **Documentation & Handoff (Day 2 Afternoon)**:
   - Update CLAUDE.md with all configurations
   - Create runbooks for common operations
   - Document troubleshooting guides
   - Record all credentials in secure vault
   - Team training on new systems

**Definition of Done for Sprint 1**:
- [ ] All required accounts created and configured
- [ ] GitHub repository with proper access controls
- [ ] CI/CD pipeline fully operational
- [ ] Database connected and migrations working
- [ ] Staging environment deployed successfully
- [ ] Production environment ready (not deployed)
- [ ] Monitoring and alerts configured
- [ ] All secrets securely stored
- [ ] Team can independently trigger deployments
- [ ] Documentation complete in CLAUDE.md
- [ ] Stakeholder trained on deployment process

**Stakeholder Time Commitment**:
- Active participation: 2-3 hours on Day 1
- On-call for questions: Throughout sprint
- Validation and approval: 30 minutes on Day 2

**Auto-Save Point**: ✓
- Trigger: sprint_completion
- Action: Update current-state.json with Sprint 1 completion
- Create deployment-ready checkpoint with all credentials documented

### Phase 10-N: Subsequent Sprint Implementation
- Continue with feature development sprints
- Leverage CI/CD pipeline for all deployments
- Regular reviews and updates
- Sprint completion triggers:
  - Run `/sprint-review` for sprint review
  - Followed by `/sprint-retrospective` for retrospective
  - Automatic contribution prompt after retrospective (if configured)
- Milestone achievements:
  - Use `/milestone "description"` to record major achievements
  - Triggers contribution opportunity
- Deployment successes:
  - Use `/deployment-success` after successful production deployments

## State Management
Throughout the workflow, maintain state in:
```json
{
  "workflow_state": {
    "active_workflow": "new-project",
    "workflow_phase": "discovery|research|planning|implementation",
    "initiated_by": "/start-new-project-workflow"
  }
}
```

## Error Handling
- If user abandons workflow, save state for resumption
- Allow skipping optional sections with confirmation
- Provide clear navigation: "Type 'skip' to skip this section, 'back' to go back"