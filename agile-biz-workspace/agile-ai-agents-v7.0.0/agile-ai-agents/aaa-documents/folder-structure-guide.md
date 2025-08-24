# Folder Structure Guide

## Overview
This guide defines the category-based folder structure used by the AgileAiAgents system. It provides the complete structure, agent mappings, and enforcement rules to ensure consistency across all projects.

## Category-Based Organization

The AgileAiAgents system organizes project documents into four main categories:

### Structure: `project-documents` → `category` → `folders` → `documents`

## Complete Folder Structure

### ORCHESTRATION (Core Coordination - Always Present)
*Primary Agent: Scrum Master Agent*

```
orchestration/
├── project-log.md                    # Real-time agent activity log
├── agent-coordination.md             # Agent handoffs and decisions
├── stakeholder-decisions.md          # Project-level stakeholder decisions
├── stakeholder-escalations.md        # Project-level stakeholder escalations
└── sprints/                         # All sprint documents organized by sprint
    └── sprint-YYYY-MM-DD-feature-name/
        ├── sprint-planning.md        # Sprint planning and preparation
        ├── sprint-tracking.md        # Ongoing execution and pulse updates
        ├── sprint-review.md          # Sprint review and stakeholder feedback
        ├── sprint-retrospective.md   # AI agent retrospectives
        ├── sprint-testing.md         # Sprint testing coordination
        ├── document-registry.md      # Sprint document tracking
        └── stakeholder-escalations/ # Sprint-specific escalations
```

### BUSINESS-STRATEGY (Business Analysis & Planning)

#### existing-project/
**Agent**: Project Analyzer Agent
- `project-brief.md` - Comprehensive project summary for all agents
- `technology-stack-analysis.md` - Complete technology inventory
- `system-architecture-analysis.md` - System architecture mapping
- `code-quality-assessment.md` - Code quality metrics
- `feature-functionality-inventory.md` - Complete feature catalog
- `security-implementation-analysis.md` - Security posture assessment
- `performance-optimization-analysis.md` - Performance bottlenecks
- `external-integrations-analysis.md` - External APIs and services
- `enhancement-opportunities.md` - Prioritized improvements
- `development-environment-analysis.md` - Development setup

#### research/
**Agent**: Research Agent
- Market & Competitive Intelligence
- Branding & Identity Research  
- Financial & Business Analysis
- Technical & Implementation
- Risk & Compliance
- Strategic Planning
- Intellectual Property & Legal
- Resource & Implementation Planning
- Stakeholder & Investment
- Strategic Decision Support

#### marketing/
**Agent**: Marketing Agent
- Core Marketing Strategy
- Digital Marketing & Content Strategy
- Lead Generation & Customer Acquisition
- Campaign Planning & Execution
- PPC & Paid Advertising Strategy
- Social Media & Community Strategy
- Financial & Resource Planning
- Performance & Analytics
- Competitive & Market Analysis
- Partnership & Collaboration
- Customer Success & Retention
- Sales Enablement & Product Integration
- Market Expansion & Segmentation

#### finance/
**Agent**: Finance Agent
- `ai-development-cost-analysis.md` - LLM token costs vs developer salaries
- `ai-vs-human-cost-comparison.md` - 70-90% cost savings analysis
- `llm-token-budget-projections.md` - Token usage across all AI agents
- `ai-development-roi-analysis.md` - Accelerated timeline and reduced costs
- `ai-financial-risk-assessment.md` - LLM cost escalation planning

#### market-validation/
**Agent**: Market Validation Product Market Fit Agent
- Market validation framework and customer discovery
- Product-market fit measurement and optimization
- Customer personas and journey validation
- MVP validation and testing strategy

#### customer-success/
**Agent**: Customer Lifecycle Retention Agent
- Customer onboarding and activation
- Churn prediction and retention
- Customer success management
- Expansion revenue and growth

#### monetization/
**Agent**: Revenue Optimization Agent
- Subscription models and pricing strategy
- Revenue forecasting and optimization
- Customer lifetime value strategies
- Revenue stream diversification

#### analysis/
**Agent**: Analysis Agent
- `executive-intelligence-summary.md` - Strategic synthesis
- `strategic-recommendations.md` - Consolidated recommendations
- `risk-opportunity-matrix.md` - Risk assessment
- `go-no-go-recommendation.md` - Clear viability recommendation

#### investment/
**Agent**: VC Report Agent
- Investor materials and pitch decks
- Financial projections and valuations
- Due diligence preparation
- Exit strategy scenarios

### DEVELOPMENT (Technical Implementation)

#### requirements/
**Agent**: PRD Agent
- `prd-document.md` - Comprehensive 16-section PRD
- `user-stories.md` - Detailed user stories
- `acceptance-criteria.md` - Testable acceptance criteria
- `feature-prioritization-matrix.md` - Feature priority planning
- `technical-architecture-requirements.md` - System specifications
- `success-metrics-framework.md` - Success measurement

#### security/
**Agent**: Security Agent
- Security architecture and threat modeling
- Compliance frameworks (GDPR, SOC2, HIPAA, PCI DSS)
- Application and infrastructure security
- Incident response and recovery planning

#### llm-analysis/
**Agent**: LLM Agent
- `feature-to-llm-mapping.md` - Feature-specific LLM analysis
- `llm-selection-analysis.md` - LLM provider comparison
- `llm-integration-strategy.md` - Technical integration
- `llm-cost-analysis.md` - Token costs and projections

#### api-analysis/
**Agent**: API Agent
- `feature-to-api-mapping.md` - Feature-specific API analysis
- `api-provider-analysis.md` - API provider evaluation
- `api-integration-strategy.md` - Technical integration
- `api-cost-benefit-analysis.md` - API vs custom development

#### mcp-analysis/
**Agent**: MCP Agent
- `development-mcp-strategy.md` - MCP servers for development
- `application-mcp-integration.md` - MCP servers for AI features
- `feature-to-mcp-mapping.md` - Feature-specific MCP analysis
- `mcp-installation-guide.md` - Installation instructions

#### project-planning/
**Agent**: Project Manager Agent
- `project-charter.md` - Comprehensive project planning
- `work-breakdown-structure.md` - Task decomposition
- `sprint-framework.md` - Agile sprint structure
- `agent-coordination-plan.md` - AI agent coordination
- `quality-gates.md` - Quality checkpoints

#### environment/
**Agent**: DevOps Agent
- `setup-complete.md` - Environment setup status

#### design/
**Agent**: UI/UX Agent
- `competitive-design-analysis.md`
- `ui-designs.md`
- `user-flows.md`
- `technical-architecture.md`

#### implementation/
**Agent**: Coder Agent
- `development-log.md`
- `api-documentation.md`
- `code-review-notes.md`

#### testing/
**Agent**: Testing Agent
- `test-plan.md`
- `test-results.md`
- `quality-report.md`

#### documentation/
**Agent**: Documentation Agent
- `technical-documentation.md`
- `api-documentation.md`
- `developer-guides.md`

### OPERATIONS (Launch, Growth, Optimization)

#### deployment/
**Agent**: DevOps Agent
- `deployment-guide.md`
- `monitoring-setup.md`
- `project-summary.md`

#### launch/
**Agent**: Project Manager Agent
- `launch-plan.md`
- `marketing-campaigns.md`
- `success-metrics.md`

#### analytics/
**Agent**: Analytics Growth Intelligence Agent
- Business intelligence and revenue analytics
- Customer analytics and growth metrics
- Predictive models and real-time monitoring
- Strategic decision support systems

#### monitoring/
**Agent**: Logger Agent
- `system-monitoring.md`
- `observability-setup.md`

#### optimization/
**Agent**: Optimization Agent
- Performance optimization strategies
- Frontend, backend, and database optimization
- Cost and security optimization
- Continuous optimization framework

#### seo/
**Agent**: SEO Agent
- `seo-strategy.md` - Traditional and LLM search
- `keyword-research.md` - Search and AI keywords
- `technical-seo-requirements.md` - Implementation requirements
- `seo-implementation-plan.md` - SEO timeline

#### email-marketing/
**Agent**: Email Marketing Agent
- Email marketing strategy and automation
- Revenue-focused campaigns
- Customer lifecycle emails
- Performance analytics

#### media-buying/
**Agent**: PPC Media Buyer Agent
- `ppc-campaign-strategy.md`
- `ad-creative-testing.md`
- `media-buying-optimization.md`

#### social-media/
**Agent**: Social Media Agent
- `social-media-strategy.md`
- `content-calendar-planning.md`
- `community-management.md`

## Folder Enforcement Rules

### Automatic Path Correction
The system automatically corrects common folder naming mistakes:

- `01-research` → `research`
- `02-marketing` → `marketing`
- `finance-docs` → `finance`
- Any numbered prefix is removed
- Folder names are standardized to lowercase

### Validation Process
1. Agent requests document creation
2. System validates folder name
3. Auto-corrects to standard name if needed
4. Creates document in correct location
5. Logs any corrections made

### Agent Folder Ownership
Each folder has a designated primary agent responsible for its contents. Agents should only create documents in their assigned folders unless explicitly coordinating with another agent.

## Key Benefits

1. **Logical Grouping** - Related documents organized by business function
2. **Agent Clarity** - Clear ownership and responsibility boundaries
3. **User-Friendly** - Intuitive navigation without number confusion
4. **Scalable** - Easy to add new folders within categories
5. **Self-Documenting** - Folder names describe their purpose

## Usage Guidelines

### For AI Agents
- Always use the standard folder names (no numbers)
- Create documents only in your assigned folders
- Coordinate with other agents for cross-functional documents
- Use the Document Manager Agent for JSON generation

### For Users
- Navigate by category first, then specific folder
- All project output goes in `project-documents/`
- System files remain in `agile-ai-agents/`
- Use folder names, not numbers, in commands

## Integration with Other Systems

### Document Manager Agent
- Monitors all folders for new/modified files
- Generates JSON equivalents automatically
- Maintains folder structure in JSON organization

### Scrum Master Agent
- Manages the orchestration folder
- Coordinates sprint document organization
- Ensures proper sprint folder naming

### Project State Manager
- Tracks document creation across all folders
- Maintains state persistence by category
- Provides folder-based reporting

## Summary

The category-based folder structure provides:
- ✅ Clear organization by business function
- ✅ No confusing folder numbers
- ✅ Automatic correction of mistakes
- ✅ Agent ownership clarity
- ✅ Scalable growth path

Total: 27 main folders organized into 4 categories, supporting the full project lifecycle from planning through optimization.