# Workflow Enhancement Implementation Plan

## Executive Summary
This plan outlines significant enhancements to both `/new-project-workflow` and `/existing-project-workflow` commands with a unified two-stage approach: sequential required phases followed by flexible phase selection for operational and growth phases.

### Command Renaming
- `/start-new-project-workflow` → `/new-project-workflow`
- `/start-existing-project-workflow` → `/existing-project-workflow`

Rationale: "start" is redundant after workflow begins and causes confusion during resumption.

## Core Workflow Design (Both Workflows)

### New Project Workflow
- **Phases 1-11**: Sequential execution (required for project foundation)
- **Phases 12+**: Phase selection menu (flexible based on priorities)

### Existing Project Workflow
- **Phases 1-8**: Sequential execution (analysis and enhancement planning)
- **Phases 9+**: Phase selection menu (flexible enhancement implementation)

## Enhancement Goals
1. Add setup verification phase to prevent configuration issues
2. Implement phase selection menu AFTER core development phases
3. Expand operations into multiple focused phases with user choice
4. Enhance stakeholder touchpoints and approval processes
5. Improve transparency in research document generation
6. Add comprehensive sprint deployment pipeline

## Implementation Phases

### Phase 0: Create Stakeholder Interview Agent (Week 1 - Priority 1)

#### 0.1 Agent Creation
**New File:** `ai-agents/stakeholder_interview_agent.md`

**Agent Structure:**
```markdown
# Stakeholder Interview Agent

## Quick Reference
- **Agent ID**: stakeholder_interview_agent
- **Type**: Business Strategy Agent
- **Category**: orchestration
- **Expertise**: Stakeholder communication, requirement gathering, iterative discovery
- **Integration Points**: All agents (provides foundational context)
- **Sub-Agent Support**: Yes (for parallel research)

## Core Purpose
Conduct comprehensive stakeholder interviews using iterative discovery methodology for both new and existing projects, gathering requirements, validating understanding, and preventing scope drift through systematic questioning and approval gates.

## Primary Responsibilities
1. Verify system setup and prerequisites (both workflows)
2. Check for pre-filled stakeholder prompts
3. Conduct section-by-section interviews with iterative refinement
4. Present code analysis findings (existing projects)
5. Validate project understanding and boundaries
6. Document all decisions and agreements
7. Facilitate post-research/analysis alignment discussions
8. Manage approval gates throughout both workflows

## Specialized Capabilities
- Adaptive questioning based on responses
- Domain-specific follow-up generation
- Ambiguity detection and clarification
- Multi-format input processing (text, screenshots, documents)
- Progressive disclosure of complexity
- Stakeholder psychology understanding

## Interview Methodology
1. **Pre-Interview Preparation**
   - Check stakeholder-input folder
   - Load any pre-filled prompts
   - Prepare domain-specific questions
   
2. **Iterative Discovery Process**
   - Ask initial questions
   - Record responses
   - Ask clarifying follow-ups
   - Present understanding
   - Get approval
   - Document agreement
   - Move to next section

3. **Decision Documentation**
   - Record in stakeholder-decisions.md
   - Update project state
   - Create reference documents

## Integration with Workflow Phases

### Both Workflows - Phase 1: Setup Verification
- Verify .env file exists
- Check project folder creation
- Validate CLAUDE.md updates
- Confirm setup scripts executed
- Ensure settings.json configured

### New Project - Phase 2: Stakeholder Discovery
**Research Level Selection**:
After core discovery, ask about research depth:
```
How deep should we research your project? 

📋 MINIMAL (15 essential documents, 1-2 hours)
📊 MEDIUM (48 comprehensive documents, 3-5 hours) [RECOMMENDED]  
🔍 THOROUGH (194 enterprise-level documents, 6-10 hours) [DEFAULT if no answer]

Which level would you prefer? (minimal/medium/thorough)
```

**Important**: Default to THOROUGH if stakeholder doesn't respond or is uncertain.

### New Project - Phase 2: Stakeholder Discovery
- Load interview templates
- Conduct comprehensive interview
- Handle pre-filled prompts
- Process additional materials

### Existing Project - Phase 3: Identity Verification
- Present code analysis findings
- Verify project understanding
- Establish what project is NOT
- Confirm domain and users
- Document project boundaries

### Existing Project - Phase 4: Enhancement Goals
- Discover improvement objectives
- Identify pain points
- Prioritize enhancements
- Set timeline expectations

### Both Workflows - Post-Research/Analysis Alignment
- Present findings (research or code analysis)
- Discuss implications
- Adjust project direction
- Document final decisions

## Context Requirements
- stakeholder-interview-templates.md
- stakeholder prompt templates
- Research findings (when available)
- Project state information

## Output Specifications
- Structured interview responses
- Approval documentation
- Decision records with rationale
- Project truth documents
- Scope boundaries definition

## Quality Standards
- 100% stakeholder approval before phase transitions
- Zero ambiguity in requirements
- Complete decision traceability
- Comprehensive scope documentation
```

#### 0.2 Claude Code Native Agent Creation
**New File:** `.claude/agents/stakeholder-interview-agent.md`

This creates a native Claude Code sub-agent that can be invoked directly:

```markdown
# Stakeholder Interview Agent

You are the Stakeholder Interview Agent for AgileAiAgents. Your role is to conduct comprehensive stakeholder interviews using iterative discovery methodology.

## Your Core Responsibilities
1. Verify system setup and prerequisites before starting workflows
2. Check for and process pre-filled stakeholder prompts
3. Conduct section-by-section interviews with iterative refinement
4. Present understanding back to stakeholders and obtain approvals
5. Document all decisions and agreements
6. Facilitate post-research alignment discussions
7. Manage approval gates throughout the workflow

## Communication Style
- Speak in first person when conducting interviews
- Be conversational but professional
- Ask clarifying questions when responses are vague
- Provide clear summaries of understanding
- Use visual indicators (✓ ✗) for checklists
- Number options when giving choices

## Interview Methodology
For each section:
1. Ask initial questions
2. Record responses
3. Identify ambiguities or gaps
4. Ask targeted follow-up questions
5. Present your understanding
6. Get explicit approval
7. Document the agreement
8. Move to next section only after approval

## Setup Verification Checklist
When starting Phase 1, verify:
- [ ] .env file exists in agile-ai-agents folder
- [ ] User's project folder has been created
- [ ] CLAUDE.md updated with project folder name
- [ ] Setup scripts (bash or Windows) have been run
- [ ] .claude/settings.json has correct user path

If any items are missing, guide the user through completion before proceeding.

## Handling Pre-filled Prompts
1. First check: `project-documents/stakeholder-input/project-prompt.md`
2. If exists, load and review with stakeholder
3. Only ask questions for missing or unclear information
4. If no prompt, proceed with full interview

## Decision Documentation
For every approval, create a record in `project-documents/orchestration/stakeholder-decisions.md`:
- Date and time
- Question asked
- Final answer after iterations
- Number of clarification rounds
- Approval method
- Any conditions or caveats

## Example Interactions

### Setup Verification
```
Let me verify your setup is complete.

✓ .env file exists
✗ Project folder not found
✗ CLAUDE.md not updated

I need to help you complete the setup. Would you like me to:
1. Guide you through creating the project folder
2. Update CLAUDE.md automatically
3. Show me where you've set things up

Please respond with 1, 2, or 3:
```

### Iterative Discovery
```
In one sentence, what is this product?
> "A project management tool"

That's a bit broad. Let me help you be more specific:
- Is this for individuals or teams?
- What industry or use case?
- What makes it different from Asana, Jira, etc.?
> "For software teams doing agile development"

Great! So to confirm: "A project management tool specifically designed for software teams practicing agile development."

Is this accurate? (yes/no/refine)
```

### Existing Project Analysis
```
I've completed an initial analysis of your codebase. Here's what I found:
- Technology Stack: React, Node.js, PostgreSQL
- Architecture Pattern: MVC with REST API
- Code Metrics: 72% test coverage, B+ quality score
- Key Observations: Legacy jQuery mixed with React, no TypeScript

Based on this analysis, this appears to be an e-commerce platform. 
In one sentence, what is this product?
> "An online marketplace for handmade crafts"

Great! Let me verify my understanding:
- What specific industry does this serve?
- Who are your current users?
- What is this product NOT? (to prevent scope creep)

This helps me understand the boundaries for our enhancement work.
```

## Operations Vision Questions
After core discovery, ask about post-launch operations:

### General Operations Philosophy
- How do you envision running this product after launch?
- What level of automation do you want in operations?
- What's your vision for scaling operations?
- Do you prefer human oversight or full automation?

### AI Agent Setup Questions

#### Customer Experience AI Agents
- Should we set up AI agents for customer support chat?
- Do you want AI agents handling support ticket triage?
- Should AI agents manage FAQ and knowledge base updates?
- Would you like AI-powered customer onboarding assistants?
- Should we implement AI agents for customer feedback analysis?
- Do you want AI agents for personalized customer recommendations?

#### Sales & Marketing AI Agents
- Should AI agents qualify and score leads automatically?
- Do you want AI agents for email marketing automation?
- Should we set up AI agents for social media management?
- Would you like AI agents creating marketing content?
- Should AI agents handle A/B testing and optimization?
- Do you want AI agents for competitive intelligence monitoring?
- Should we implement AI agents for pricing optimization?

#### Operations & Business AI Agents
- Do you want AI agents monitoring system health 24/7?
- Should AI agents handle incident response and escalation?
- Would you like AI agents for automated financial reporting?
- Should we set up AI agents for inventory management?
- Do you want AI agents for demand forecasting?
- Should AI agents manage vendor relationships?
- Would you like AI agents for compliance monitoring?

#### Data & Analytics AI Agents
- Should AI agents generate daily/weekly business reports?
- Do you want AI agents identifying trends and anomalies?
- Should we set up AI agents for predictive analytics?
- Would you like AI agents for customer behavior analysis?
- Should AI agents monitor and optimize KPIs?
- Do you want AI agents for cohort analysis?

#### Content & Community AI Agents
- Should AI agents moderate user-generated content?
- Do you want AI agents for community engagement?
- Should we set up AI agents for content curation?
- Would you like AI agents translating content for international markets?
- Should AI agents handle review responses?
- Do you want AI agents for influencer identification?

#### Security & Compliance AI Agents
- Should AI agents monitor for security threats?
- Do you want AI agents for fraud detection?
- Should we set up AI agents for GDPR compliance?
- Would you like AI agents for audit trail management?
- Should AI agents handle data privacy requests?

### Priority and Implementation Questions
- Which AI agents are must-haves for launch?
- Which can be added post-launch?
- What's your budget for AI operations?
- Any concerns about AI handling certain functions?

Remember: Your goal is to gather complete, unambiguous requirements that prevent scope drift and ensure project success.
```

#### 0.3 Agent Registry Integration
**Update Required Files:**
- `.claude/agents.json` - Register stakeholder-interview-agent
- `ai-agent-manifest.json` - Add stakeholder_interview_agent
- `machine-data/agent-registry.json` - Register new agent
- `hooks/agent-context.js` - Add agent context handler

**Update:** `.claude/agents.json`
```json
{
  "agents": [
    // ... existing agents ...
    {
      "id": "stakeholder-interview-agent",
      "name": "Stakeholder Interview Agent",
      "description": "Conducts comprehensive stakeholder interviews and manages approval gates",
      "category": "orchestration",
      "file": "agents/stakeholder-interview-agent.md",
      "triggers": [
        "/new-project-workflow",
        "/existing-project-workflow",
        "setup-verification",
        "stakeholder-interview",
        "approval-gate"
      ],
      "capabilities": [
        "setup-verification",
        "iterative-discovery",
        "approval-management",
        "decision-documentation"
      ]
    }
  ]
}
```

#### 0.4 Native Agent Invocation
**How Claude Code Invokes the Agent:**

```javascript
// In workflow handler
async function activateStakeholderInterview(phase) {
  // Use Claude Code's native agent invocation
  const result = await claude.invokeAgent({
    agent: 'stakeholder-interview-agent',
    context: {
      phase: phase,
      workflowState: getCurrentState(),
      projectPath: process.cwd()
    },
    interactive: true  // Allows back-and-forth conversation
  });
  
  return result;
}
```

**Command Integration:**
```javascript
// When user runs /new-project-workflow
if (command === '/new-project-workflow') {
  console.log('Starting new project workflow...');
  console.log('Activating Stakeholder Interview Agent for setup verification.\n');
  
  await activateStakeholderInterview('setup-verification');
  if (state.setup_verified) {
    await activateStakeholderInterview('stakeholder-discovery');
  }
}

// When user runs /existing-project-workflow
if (command === '/existing-project-workflow') {
  console.log('Starting existing project workflow...');
  console.log('Activating Stakeholder Interview Agent for setup verification.\n');
  
  await activateStakeholderInterview('setup-verification');
  if (state.setup_verified) {
    // Run code analysis
    const analysis = await runCodebaseAnalysis();
    
    // Present findings and verify understanding
    await activateStakeholderInterview('existing-project-identity', {
      analysisResults: analysis
    });
    
    // Continue with enhancement discovery
    await activateStakeholderInterview('enhancement-goals');
  }
}
```

#### 0.5 Interview Question Banks
**New File:** `machine-data/stakeholder-interview-questions.json`
```json
{
  "setup_verification": {
    "checks": [
      "env_file_exists",
      "project_folder_created",
      "claude_md_updated",
      "setup_scripts_run",
      "settings_json_configured"
    ],
    "missing_setup_response": "I notice you haven't completed [missing_items]. These are required for the workflow to function properly. Would you like me to guide you through the setup?"
  },
  "existing_project_analysis": {
    "identity_verification": [
      "Based on my analysis, this appears to be [initial_assessment]. Is this correct?",
      "What specific industry or domain does this serve?",
      "Who are your current users?",
      "What is this product NOT?",
      "Who are your main competitors?"
    ],
    "enhancement_goals": [
      "What brings you here? (bug fixes/new features/optimization/refactoring)",
      "What are your top 3 pain points with the current system?",
      "Any critical issues needing immediate attention?",
      "What's your timeline for improvements?"
    ],
    "structure_decision": [
      "I've identified some structure issues. Would you like to see them?",
      "Would you prefer to keep current structure or migrate to recommended?",
      "If migrating, when would you prefer to do this?"
    ]
  },
  "project_identity": {
    "initial": [
      "In one sentence, what is this product?",
      "What specific industry/domain is this for?",
      "Who are the primary users? (be specific)",
      "List 3-5 things this is explicitly NOT",
      "Name 3-5 competitor products"
    ],
    "follow_ups": {
      "vague_industry": "You mentioned [industry]. Can you be more specific? For example, 'B2B SaaS for dental practices' rather than just 'healthcare'?",
      "unclear_users": "When you say [user_type], do you mean [clarification]?",
      "missing_boundaries": "It's crucial to define what this is NOT. This prevents scope creep. Can you think of features or capabilities people might assume you'd have but you explicitly won't?"
    }
  },
  "operations_vision": {
    "initial": [
      "How do you envision running this product after launch?",
      "What level of automation do you want in operations?",
      "What's your vision for scaling operations?",
      "Do you prefer human oversight or full automation?"
    ],
    "ai_customer_experience": [
      "Should we set up AI agents for customer support chat?",
      "Do you want AI agents handling support ticket triage?",
      "Should AI agents manage FAQ and knowledge base updates?",
      "Would you like AI-powered customer onboarding assistants?",
      "Should we implement AI agents for customer feedback analysis?",
      "Do you want AI agents for personalized customer recommendations?"
    ],
    "ai_sales_marketing": [
      "Should AI agents qualify and score leads automatically?",
      "Do you want AI agents for email marketing automation?",
      "Should we set up AI agents for social media management?",
      "Would you like AI agents creating marketing content?",
      "Should AI agents handle A/B testing and optimization?",
      "Do you want AI agents for competitive intelligence monitoring?",
      "Should we implement AI agents for pricing optimization?"
    ],
    "ai_operations_business": [
      "Do you want AI agents monitoring system health 24/7?",
      "Should AI agents handle incident response and escalation?",
      "Would you like AI agents for automated financial reporting?",
      "Should we set up AI agents for inventory management?",
      "Do you want AI agents for demand forecasting?",
      "Should AI agents manage vendor relationships?",
      "Would you like AI agents for compliance monitoring?"
    ],
    "ai_data_analytics": [
      "Should AI agents generate daily/weekly business reports?",
      "Do you want AI agents identifying trends and anomalies?",
      "Should we set up AI agents for predictive analytics?",
      "Would you like AI agents for customer behavior analysis?",
      "Should AI agents monitor and optimize KPIs?",
      "Do you want AI agents for cohort analysis?"
    ],
    "ai_content_community": [
      "Should AI agents moderate user-generated content?",
      "Do you want AI agents for community engagement?",
      "Should we set up AI agents for content curation?",
      "Would you like AI agents translating content for international markets?",
      "Should AI agents handle review responses?",
      "Do you want AI agents for influencer identification?"
    ],
    "ai_security_compliance": [
      "Should AI agents monitor for security threats?",
      "Do you want AI agents for fraud detection?",
      "Should we set up AI agents for GDPR compliance?",
      "Would you like AI agents for audit trail management?",
      "Should AI agents handle data privacy requests?"
    ],
    "priority_questions": [
      "Which AI agents are must-haves for launch?",
      "Which can be added post-launch?",
      "What's your budget for AI operations?",
      "Any concerns about AI handling certain functions?"
    ]
  }
}
```

#### 0.6 Agent Test Suite
**New File:** `tests/agents/stakeholder-interview-agent.test.js`
```javascript
// Test cases for stakeholder interview agent
describe('Stakeholder Interview Agent', () => {
  test('detects missing setup steps');
  test('loads pre-filled prompts correctly');
  test('conducts iterative discovery');
  test('handles ambiguous responses');
  test('documents decisions properly');
  test('manages approval gates');
  test('integrates with other agents');
});
```

#### 0.7 AI Agent Questions Presentation Strategy
**How the Stakeholder Interview Agent Presents AI Operations Questions:**

```markdown
## Structured AI Agent Discovery Process

The Stakeholder Interview Agent should present AI agent questions in a progressive, non-overwhelming manner:

### Phase 1: High-Level Vision
First, establish the overall operations philosophy:
"Let's talk about how you want to run your business after launch. Do you see this as a highly automated operation, or do you prefer human oversight for key decisions?"

### Phase 2: Category-Based Discovery
Present one category at a time, starting with most critical:

**Customer Experience**
"Let's start with customer experience. I'll ask about different AI agent possibilities - just answer yes, maybe, or no:
- AI agents for customer support chat? 
- AI handling support ticket triage?
- AI managing FAQ updates?
[Continue through list]"

**Sales & Marketing** 
"Now let's consider sales and marketing automation:
- AI agents qualifying leads?
- AI for email marketing?
[Continue through list]"

### Phase 3: Priority Mapping
After going through all categories:
"Of all the AI agents you said 'yes' to, which are:
1. Must-have for launch?
2. Nice-to-have for launch?
3. Can wait until post-launch?
4. Experimental/future consideration?"

### Phase 4: Concern Addressing
"Are there any specific concerns about AI handling certain functions? For example:
- Privacy concerns with AI handling customer data?
- Quality concerns with AI-generated content?
- Trust issues with AI making business decisions?"

### Phase 5: Budget Alignment
"What's your monthly budget for AI operations?
- Under $500/month
- $500-2000/month
- $2000-5000/month
- $5000+/month
- Budget not determined yet"

### Documentation Format
Record decisions in structured format:
```json
{
  "ai_agents": {
    "customer_experience": {
      "support_chat": "yes",
      "ticket_triage": "yes",
      "faq_management": "maybe",
      "priority": "must_have"
    },
    "sales_marketing": {
      "lead_qualification": "yes",
      "email_automation": "no",
      "priority": "nice_to_have"
    }
  },
  "budget": "$500-2000/month",
  "concerns": ["data_privacy", "content_quality"],
  "launch_requirements": ["support_chat", "ticket_triage"],
  "post_launch_additions": ["lead_qualification", "analytics"]
}
```
```

#### 0.8 Claude Code Integration
**Implementation Approach:**
```markdown
## How the Agent Works with Claude Code

### Direct Communication Mode
When activated, the Stakeholder Interview Agent communicates directly with the user through Claude Code:

1. **Agent Activation**
   ```javascript
   // Claude Code activates the agent
   const agent = await activateAgent('stakeholder_interview_agent', {
     phase: 'setup_verification',
     context: workflowState
   });
   ```

2. **Interactive Questioning**
   ```
   [Stakeholder Interview Agent]: Let me verify your setup is complete.
   
   ✓ .env file exists
   ✗ Project folder not found
   ✗ CLAUDE.md not updated
   
   I need to help you complete the setup. Would you like me to:
   1. Guide you through creating the project folder
   2. Update CLAUDE.md automatically
   3. Show me where you've set things up
   
   Please respond with 1, 2, or 3:
   ```

3. **Iterative Discovery Example**
   ```
   [Phase 2: Project Vision]
   
   Agent: "In one sentence, what is this product?"
   User: "A project management tool"
   
   Agent: "That's a bit broad. Let me help you be more specific:
   - Is this for individuals or teams?
   - What industry or use case?
   - What makes it different from Asana, Jira, etc.?"
   
   User: "For software teams doing agile development"
   
   Agent: "Great! So to confirm: 'A project management tool specifically 
   designed for software teams practicing agile development.' 
   
   Is this accurate? (yes/no/refine)"
   ```

### State Persistence
The agent maintains conversation state across interactions:
```json
{
  "agent_state": {
    "current_section": "project_vision",
    "questions_asked": ["q1", "q2"],
    "responses": {...},
    "follow_ups_needed": ["industry_specificity"],
    "approvals": {
      "setup": true,
      "vision": "pending"
    }
  }
}
```

### Decision Documentation
Every approval creates a permanent record:
```markdown
## Decision Record - Project Vision
**Date**: 2024-01-10 14:30:00
**Stakeholder**: John Doe
**Agent**: stakeholder_interview_agent

**Question**: What is this product?
**Final Answer**: A project management tool for agile software teams

**Iterations**: 3
**Clarifications**:
- Initially too broad ("project management")
- Refined to include target audience
- Added methodology specification

**Approved**: ✓ Yes
**Approval Method**: Explicit confirmation
```
```

#### 0.8 Agent Communication Protocol
**How Claude Code and the Agent Interact:**

1. **Agent speaks in first person** when active
2. **Clear agent identification** in brackets
3. **Visual separation** between agent and Claude Code
4. **Progress indicators** for long operations
5. **Approval checkpoints** clearly marked

**Example Flow:**
```
Claude Code: Starting the new project workflow. Let me activate the 
Stakeholder Interview Agent to guide you through setup.

[Stakeholder Interview Agent]: Hello! I'm the Stakeholder Interview 
Agent. I'll be conducting your project discovery interview today.

First, let me check your system setup...

[Checking prerequisites... ⏳]

I found a few items that need attention before we proceed:
...
```

### Phase 1: Foundation Updates (Week 1)

#### 1.1 Custom Slash Commands Creation
**New Files in `.claude/commands/`:**

##### File: `.claude/commands/new-project-workflow.md`
```markdown
---
description: Start or continue a new project from idea to implementation
---

# New Project Workflow

You are now executing the new project workflow for AgileAiAgents. This workflow takes a project from initial idea through to MVP deployment and beyond.

## Workflow Phases

### Stage 1: Sequential Development (Phases 1-11)
1. Setup Verification
2. Stakeholder Discovery
3. Research Depth Selection
4. Research Execution
5. Analysis & Synthesis
6. Product Requirements
7. Project Planning
8. Backlog Creation
9. Project Scaffolding
10. First Sprint Implementation
11. MVP Deployment

### Stage 2: Operations (Phase Selection Menu)
After MVP, user selects from operational phases.

## Your Actions

1. First, check the current workflow state in `project-state/workflow-states/`
2. If new workflow:
   - Activate Stakeholder Interview Agent for setup verification
   - Begin Phase 1
3. If continuing:
   - Load saved state
   - Resume from last checkpoint
4. Guide user through current phase
5. Save state after each phase completion

## Command Options
- `--status`: Show current phase and progress
- `--resume`: Resume from last checkpoint
- `--save-state`: Save current progress
- `--dry-run`: Preview workflow without executing

Remember to maintain conversation context and guide the user naturally through each phase.
```

##### File: `.claude/commands/existing-project-workflow.md`
```markdown
---
description: Analyze and enhance an existing codebase with structured workflow
---

# Existing Project Workflow

You are now executing the existing project workflow for AgileAiAgents. This workflow analyzes an existing codebase and guides enhancements.

## Workflow Phases

### Stage 1: Sequential Analysis (Phases 1-8)
1. Setup Verification
2. Codebase Analysis
3. Project Identity Verification
4. Enhancement Goals Discovery
5. Technical Assessment
6. Enhancement Planning
7. Structure Decision
8. Enhancement Backlog

### Stage 2: Enhancement Implementation (Phase Selection Menu)
After analysis, user selects enhancement priorities.

## Your Actions

1. Check current workflow state
2. If new workflow:
   - Activate Stakeholder Interview Agent for setup verification
   - Run comprehensive code analysis
   - Present findings to stakeholder
3. If continuing:
   - Load saved state
   - Resume from last phase
4. After Phase 8, present enhancement selection menu
5. Save state throughout process

## Command Options
- `--status`: Check current phase
- `--resume`: Continue from last point
- `--save-state`: Save progress
- `--analyze-only`: Just run analysis without enhancements

Guide the user through understanding their codebase and making informed enhancement decisions.
```

##### File: `.claude/commands/select-phases.md`
```markdown
---
description: Select operational or enhancement phases after core workflow completion
---

# Phase Selection

You are presenting the phase selection menu. This command is only available after completing:
- Phase 11 of new project workflow (MVP deployment)
- Phase 8 of existing project workflow (Enhancement backlog)

## Your Actions

1. Verify prerequisite phases are complete
2. Present available phases based on workflow type
3. Show phase categories:
   - Development & Features
   - Operations & Infrastructure
   - Marketing & Growth
   - Business & Revenue
   - Analytics & Intelligence
   - Scale & Expansion
4. Allow selection of single or multiple phases
5. Offer execution modes:
   - Sequential
   - Parallel
   - Priority-based
   - Scheduled
6. Save selected phases to workflow state

## Quick Packages
- Startup Package: Operations, Marketing, Business, Analytics
- Enterprise Package: Operations, Security, Business, Analytics, Scale
- Growth Package: Marketing, Customer Success, Revenue, Analytics

If user hasn't completed prerequisite phases, inform them and redirect to appropriate workflow.
```

#### 1.2 Command Registration
**Update:** `.claude/commands.json` (create if doesn't exist)
```json
{
  "commands": [
    {
      "name": "new-project-workflow",
      "description": "Start or continue a new project from idea to implementation",
      "aliases": ["npw", "start-new-project-workflow"],
      "category": "workflow",
      "agent": "stakeholder-interview-agent"
    },
    {
      "name": "existing-project-workflow", 
      "description": "Analyze and enhance an existing codebase",
      "aliases": ["epw", "start-existing-project-workflow"],
      "category": "workflow",
      "agent": "stakeholder-interview-agent"
    },
    {
      "name": "select-phases",
      "description": "Select operational or enhancement phases",
      "aliases": ["phases", "phase-select"],
      "category": "workflow",
      "requirements": ["workflow-complete"]
    }
  ]
}
```

#### 1.3 How Custom Commands Work
**According to Claude Code Documentation:**
- Commands are markdown files in `.claude/commands/`
- File name becomes the command name
- Commands can have YAML frontmatter for metadata
- Claude Code automatically loads and registers them
- Aliases provide backward compatibility

**Benefits of Custom Commands:**
1. **Native Integration**: Claude Code handles command parsing
2. **Auto-discovery**: No manual registration needed
3. **Context Awareness**: Commands have full project context
4. **Agent Integration**: Can trigger specific agents
5. **State Management**: Automatic state persistence

#### 1.4 Backward Compatibility
**Through Aliases:**
- Old command `/start-new-project-workflow` works via alias
- Old command `/start-existing-project-workflow` works via alias
- Users see gentle notification about new names
- No breaking changes for existing users

#### 1.5 Setup Verification System
**Files to Update:**
- `workflow-templates/new-project-workflow-template.md`
- `command-handlers.md`

**New Components:**
```javascript
// Add to workflow initialization
const setupVerification = {
  checks: [
    '.env file exists',
    'project folder created',
    'CLAUDE.md updated',
    'setup scripts executed',
    'settings.json configured'
  ],
  handler: 'stakeholder-interview-agent',
  fallback: 'provide setup instructions'
}
```

#### 1.2 Two-Stage Workflow System
**New Architecture:** Sequential Development → Flexible Operations

```markdown
## Stage 1: Core Development (Sequential - Phases 1-11)
These phases MUST run in order to establish project foundation:

1. Setup Verification (Required)
2. Stakeholder Discovery 
3. Research Depth Selection
4. Research Execution
5. Analysis & Synthesis
6. Product Requirements
7. Project Planning
8. Backlog Creation
9. Project Scaffolding
10. First Sprint Implementation
11. MVP Deployment

## Stage 2: Post-Deployment Phase Selection Menu
After MVP deployment, users get full phase selection control:

### Available Post-Deployment Phases
12. Continue Sprint Development
13. Operations Foundation
14. Marketing & Growth Operations
15. Business Operations
16. Customer Success Operations
17. Analytics & Intelligence
18. Optimization & Automation
19. Security & Compliance
20. Scale & Expansion
21. International Growth
22. Advanced Innovation
23. Exit Strategy Planning

### Phase Selection Interface (Activated After Phase 11)
- Select single or multiple phases
- Run phases in parallel where possible
- Skip phases not relevant to business
- Return to any phase anytime
- Create custom phase sequences
```

#### 1.3 Enhanced State Management
**Update:** `project-state-configuration-guide.md`
```json
{
  "workflow_state": {
    "stage": "development|operations",
    "development_phases": {
      "current": 1-11,
      "completed": [...],
      "must_complete_sequentially": true
    },
    "operations_phases": {
      "available": [12-23],
      "active": [...],
      "completed": [...],
      "skipped": [...],
      "selection_mode": "menu|parallel|custom"
    },
    "mvp_deployed": false,
    "phase_selection_unlocked": false
  }
}
```

### Phase 2: Stakeholder Interaction Enhancements (Week 1-2)

#### 2.1 Comprehensive Input Detection
**Update:** Stakeholder interview to check:
- `project-documents/stakeholder-input/` folder
- Screenshots from competitors
- Preference documents
- Vision statements

#### 2.2 Post-Launch Operations Questions
**New Section in Interview:**
```markdown
## Operations Vision Questions
1. "How do you envision running this product after launch?"
2. "What level of automation do you want in operations?"
3. "Should we set up AI agents for customer support?"
4. "What marketing channels are priorities?"
5. "Do you want automated financial reporting?"
6. "What's your vision for scaling operations?"
```

#### 2.3 Document-by-Document Research Display
**Update:** Research selection to show full document list
```javascript
// Transform research-level-documents.json display
function displayResearchDocuments(level) {
  const docs = researchLevels[level];
  return formatDocumentTree(docs, {
    showFullPaths: true,
    groupByCategory: true,
    includeDescriptions: true
  });
}
```

### Phase 3: Post-MVP Phase Selection System (Week 2)

#### 3.1 MVP Completion Trigger
**New Component:** MVP deployment detection and phase menu activation
```javascript
// After Phase 11 (MVP Deployment) completes
async function onMVPDeploymentComplete() {
  // Mark development stage complete
  updateWorkflowState({
    stage: 'operations',
    mvp_deployed: true,
    phase_selection_unlocked: true
  });
  
  // Present phase selection menu
  await presentPhaseSelectionMenu();
}
```

#### 3.2 Interactive Phase Selection Menu
**After MVP Deployment:**
```markdown
## 🎉 Congratulations! Your MVP is Live!

You've completed the core development phases. Now you have full control over your project's future direction.

## Available Phases (Choose Your Path)

### 📱 Development & Features
□ 12. Continue Sprint Development - Add more features
□ 13. Mobile App Development - iOS/Android apps
□ 14. API Development - Public API & integrations

### 🏗️ Operations & Infrastructure  
□ 15. Operations Foundation - Monitoring, logging, alerts
□ 16. DevOps Automation - CI/CD, infrastructure as code
□ 17. Security & Compliance - Security hardening, audits

### 🚀 Growth & Marketing
□ 18. Marketing & Growth - Campaigns, SEO, content
□ 19. Customer Acquisition - Paid ads, referrals
□ 20. Community Building - Forums, social, events

### 💰 Business & Revenue
□ 21. Business Operations - Finance, reporting, KPIs
□ 22. Customer Success - Support, onboarding, retention
□ 23. Revenue Optimization - Pricing, upsells, expansion

### 📊 Analytics & Intelligence
□ 24. Analytics Platform - Data warehouse, BI tools
□ 25. Machine Learning - Predictions, recommendations
□ 26. Performance Optimization - Speed, cost, efficiency

### 🌍 Scale & Expansion
□ 27. Scaling Infrastructure - Handle growth
□ 28. International Expansion - Multi-region, localization
□ 29. Partnership Development - Strategic alliances

### 🎯 Selection Options
1. **Quick Start Packages**
   - [ ] Startup Package (15, 18, 21, 24)
   - [ ] Enterprise Package (15, 17, 21, 24, 27)
   - [ ] Growth Package (18, 19, 20, 22)
   
2. **Custom Selection**
   - Select any combination of phases
   - Set your own priorities and timeline
   
3. **Guided Recommendation**
   - Answer a few questions for AI recommendations

Enter phase numbers (comma-separated) or package name:
```

#### 3.3 Phase Execution Modes
**User Options for Selected Phases:**
```markdown
## How would you like to execute these phases?

1. **Sequential** - One phase at a time in order
2. **Parallel** - Multiple phases simultaneously (where possible)
3. **Priority** - High-priority phases first, others in background
4. **Scheduled** - Set specific timelines for each phase

Select execution mode (1-4):
```

### Phase 4: Sprint Enhancement (Week 2-3)

#### 4.1 First Sprint Structure
**Update:** Sprint framework to include:
```markdown
## First Sprint Standard Tasks
1. Repository Setup
   - GitHub/GitLab initialization
   - Branch protection rules
   - CI/CD pipeline setup

2. Project Structure
   - Create approved folder structure
   - Initialize frameworks
   - Configure linting/formatting

3. Deployment Pipeline
   - Local development environment
   - Staging environment setup
   - Production environment prep

4. Database Setup
   - Database creation
   - Connection configuration
   - Initial migrations

5. Basic Application
   - "Hello World" deployment
   - Health check endpoints
   - Monitoring integration
```

#### 4.2 Complete Sprint Workflow
**New:** Detailed sprint execution flow
```markdown
## Sprint Execution Pipeline
1. Sprint Planning (Scrum Master)
2. Task Assignment (Project Manager)
3. Development (Coder Agents)
4. Code Review (Senior Agents)
5. Testing (QA Agents)
6. PR Creation (DevOps)
7. Staging Deployment (DevOps)
8. Staging Testing (QA)
9. Production Deployment (DevOps)
10. Production Verification (QA)
11. Sprint Review (Scrum Master + Stakeholder)
12. Sprint Retrospective (All Agents)
```

### Phase 5: Hook Integration (Week 3)

#### 5.1 New Workflow Hooks
**Create:** New hooks for workflow events
```javascript
// workflow-phase-transition.js
module.exports = {
  event: 'workflow-phase-transition',
  handler: async (context) => {
    const { fromPhase, toPhase, trigger } = context;
    // Log transition
    // Update state
    // Notify agents
    // Check prerequisites
  }
}

// approval-gate-reached.js
module.exports = {
  event: 'approval-gate-reached',
  handler: async (context) => {
    const { gate, requirements, documents } = context;
    // Present for approval
    // Record decision
    // Update state
  }
}
```

#### 5.2 Hook Registry Update
**Update:** Register new workflow hooks
```javascript
hooks.register('workflow-phase-transition');
hooks.register('approval-gate-reached');
hooks.register('operations-phase-selected');
hooks.register('sprint-deployment-complete');
```

### Phase 6: Command Enhancements (Week 3-4)

#### 6.1 New Command Structure
**Core Workflow Commands:**
```bash
# New project workflow (Phases 1-11 sequential)
/new-project-workflow              # Start or continue workflow
/new-project-workflow --status     # Check current phase and progress
/new-project-workflow --resume     # Resume from last checkpoint
/new-project-workflow --save-state # Save current progress

# Existing project workflow
/existing-project-workflow         # Start or continue workflow
/existing-project-workflow --status
/existing-project-workflow --resume
/existing-project-workflow --save-state

# Post-MVP phase selection (after Phase 11)
/select-phases                    # Opens phase selection menu
/select-phases --package startup  # Quick package selection
/select-phases 15,18,21          # Direct phase selection
/phase-status                     # Show all phase statuses
/phase-activate <number>          # Activate specific phase
/phase-pause <number>             # Pause active phase
```

#### 6.2 Phase Selection CLI
**New:** Post-MVP phase management
```javascript
async function phaseSelectionCLI() {
  // Only available after MVP deployment
  if (!state.mvp_deployed) {
    return "Phase selection available after MVP deployment (Phase 11)";
  }
  
  const selection = await prompt({
    type: 'checkbox',
    name: 'phases',
    message: 'Select phases to activate:',
    choices: getAvailablePhases(),
    validate: (answer) => {
      if (answer.length < 1) {
        return 'Select at least one phase';
      }
      return true;
    }
  });
  
  const mode = await prompt({
    type: 'list',
    name: 'execution',
    message: 'Execution mode:',
    choices: ['Sequential', 'Parallel', 'Priority', 'Scheduled']
  });
  
  return activatePhases(selection.phases, mode.execution);
}
```

## Existing Project Workflow Enhancements

### Stage 1: Sequential Analysis (Phases 1-8)
```
┌─────────────────────────────────────────┐
│  Phase 1: Setup Verification             │
│  ↓                                       │
│  Phase 2: Codebase Analysis              │
│  ↓                                       │
│  Phase 3: Project Identity Verification  │
│  ↓                                       │
│  🚦 Approval Gate 1: Identity Confirmed  │
│  ↓                                       │
│  Phase 4: Enhancement Goals Discovery    │
│  ↓                                       │
│  Phase 5: Technical Assessment           │
│  ↓                                       │
│  🚦 Approval Gate 2: Scope Approved      │
│  ↓                                       │
│  Phase 6: Enhancement Planning           │
│  ↓                                       │
│  Phase 7: Structure Decision             │
│  ↓                                       │
│  Phase 8: Enhancement Backlog            │
└─────────────────────────────────────────┘
                    ↓
        🎉 ANALYSIS COMPLETE - UNLOCK PHASE SELECTION

### Stage 2: Flexible Enhancement Implementation
```
┌─────────────────────────────────────────────┐
│      ENHANCEMENT PHASE SELECTION MENU       │
├─────────────────────────────────────────────┤
│  Choose your enhancement priorities:        │
│                                             │
│  📱 Feature Development                     │
│  □ 9. New Feature Development              │
│  □ 10. API Development                     │
│  □ 11. Mobile App Development              │
│                                             │
│  🔧 Technical Improvements                  │
│  □ 12. Refactoring & Modernization         │
│  □ 13. Performance Optimization            │
│  □ 14. Security Hardening                  │
│                                             │
│  🏗️ Infrastructure                          │
│  □ 15. Migration (Cloud/Platform)          │
│  □ 16. DevOps & Automation                 │
│  □ 17. Monitoring & Observability          │
│                                             │
│  📊 Business Operations                     │
│  □ 18. Analytics Implementation            │
│  □ 19. Integration Development             │
│  □ 20. Compliance Updates                  │
│                                             │
│  🚀 Growth & Scale                          │
│  □ 21. Scaling Architecture                │
│  □ 22. International Support               │
│  □ 23. Multi-tenant Conversion             │
└─────────────────────────────────────────────┘
```

### Key Enhancements for Existing Projects

1. **Setup Verification** (Phase 1)
   - Same as new project workflow
   - Ensures environment is ready

2. **Comprehensive Code Analysis** (Phase 2)
   - Automated by Analysis Agent
   - Presents findings to stakeholder via Interview Agent

3. **Project Identity Verification** (Phase 3)
   - Stakeholder Interview Agent validates understanding
   - "Based on analysis, this appears to be [X]. Is this correct?"
   - Establishes boundaries: "What is this NOT?"

4. **Structure Decision Point** (Phase 7)
   - Present current structure issues
   - Offer migration options
   - Get stakeholder decision on restructuring

5. **Phase Selection After Analysis**
   - Similar to new project post-MVP
   - Choose enhancement priorities
   - Flexible execution order

## New Project Workflow Flow Diagram

### Stage 1: Sequential Development (Required)
```
┌─────────────────────────────────────────┐
│  Phase 1: Setup Verification             │
│  ↓                                       │
│  Phase 2: Stakeholder Discovery          │
│  ↓                                       │
│  Phase 3: Research Depth Selection       │
│  ↓                                       │
│  Phase 4: Research Execution             │
│  ↓                                       │
│  🚦 Approval Gate 1: Research Review     │
│  ↓                                       │
│  Phase 5: Analysis & Synthesis           │
│  ↓                                       │
│  Phase 6: Product Requirements           │
│  ↓                                       │
│  🚦 Approval Gate 2: Requirements Review │
│  ↓                                       │
│  Phase 7: Project Planning               │
│  ↓                                       │
│  Phase 8: Backlog Creation               │
│  ↓                                       │
│  Phase 9: Project Scaffolding            │
│  ↓                                       │
│  🚦 Approval Gate 3: Pre-Implementation  │
│  ↓                                       │
│  Phase 10: First Sprint Implementation   │
│  ↓                                       │
│  Phase 11: MVP Deployment                │
└─────────────────────────────────────────┘
                    ↓
        🎉 MVP COMPLETE - UNLOCK PHASE SELECTION

### Stage 2: Flexible Operations (User Choice)
```
┌─────────────────────────────────────────────┐
│        PHASE SELECTION MENU ACTIVATED       │
├─────────────────────────────────────────────┤
│  User can now:                              │
│  • Select any phases 12-29                  │
│  • Run phases in parallel                   │
│  • Skip irrelevant phases                   │
│  • Return to any phase                      │
│  • Create custom sequences                  │
│                                             │
│  Available Phases:                          │
│  Development: 12-14                         │
│  Operations: 15-17                          │
│  Marketing: 18-20                           │
│  Business: 21-23                            │
│  Analytics: 24-26                           │
│  Scale: 27-29                               │
└─────────────────────────────────────────────┘
```

## Key Design Decisions

### Why Sequential for Phases 1-11?
1. **Dependencies**: Each phase builds on previous work
2. **Foundation**: Must establish project basics before flexibility
3. **Quality**: Ensures proper research, planning, and architecture
4. **Risk Mitigation**: Prevents skipping critical setup steps

### Why Flexible for Phases 12+?
1. **Business Variability**: Different businesses need different priorities
2. **Resource Optimization**: Focus on what matters most
3. **Parallel Execution**: Many operations phases can run simultaneously
4. **Iterative Growth**: Return to phases as needed
5. **Custom Paths**: Every business is unique

### Phase Transition Logic
```javascript
// Automatic transition after Phase 11
if (currentPhase === 11 && phaseComplete) {
  // Deploy MVP
  await deployMVP();
  
  // Update state
  state.mvp_deployed = true;
  state.phase_selection_unlocked = true;
  
  // Present selection menu
  await showPhaseSelectionMenu();
}
```

## Clean Slate Template Integration

### Template Location
The AgileAiAgents release clean slate template is located at:
`agile-ai-agents/templates/clean-slate/`

This template serves as the foundation for new projects and includes:
- Pre-configured project structure
- Empty folder hierarchy with README files
- Essential system files (stakeholder decisions, escalations, etc.)
- Project state management structure
- Community learnings framework

### Claude Code Native Integration for Clean Slate

#### Custom Commands Template Structure
**Template Files Required:** (To be added to `templates/clean-slate/.claude/`)

##### Directory Structure for Clean Slate
```
templates/clean-slate/
├── .claude/                       # Claude Code integration
│   ├── commands/                  # Custom slash commands
│   │   ├── new-project-workflow.md
│   │   ├── existing-project-workflow.md
│   │   └── select-phases.md
│   ├── commands.json              # Command registry
│   ├── agents/                    # Native Claude agents
│   │   └── stakeholder-interview-agent.md
│   ├── agents.json                # Agent registry
│   ├── hooks/                     # Claude Code hooks
│   │   ├── session-start.sh
│   │   ├── user-prompt-submit.sh
│   │   └── on-file-change.sh
│   └── settings.json              # Claude Code settings
├── project-documents/             # Existing structure
├── project-state/                 # Existing structure
└── community-learnings/           # Existing structure
```

#### New Template Files to Create

##### File: `templates/clean-slate/.claude/commands/new-project-workflow.md`
```markdown
---
description: Start or continue a new project from idea to implementation
---

# New Project Workflow

You are now executing the new project workflow for AgileAiAgents. This workflow takes a project from initial idea through to MVP deployment and beyond.

## Command Context
- This is a native Claude Code custom slash command
- The command automatically activates the Stakeholder Interview Agent
- State is persisted in project-state/workflow-state.json
- Command supports --status, --resume, --save-state, and --dry-run flags

## Workflow Execution
When this command is invoked:
1. Check for existing workflow state
2. Activate Stakeholder Interview Agent for setup verification
3. Begin Phase 1 if new, or resume from saved state
4. Guide user through each sequential phase (1-11)
5. After Phase 11 (MVP), present phase selection menu

## Stage 1: Sequential Development (Required)
Phases 1-11 must complete in order.

## Stage 2: Operations (User Selection)
After MVP, phases 12+ available for selection.

Remember: You are the primary assistant, but activate the Stakeholder Interview Agent for all interactive discovery and approval gates.
```

##### File: `templates/clean-slate/.claude/commands/existing-project-workflow.md`
```markdown
---
description: Analyze and enhance an existing codebase with structured workflow
---

# Existing Project Workflow

You are executing the existing project workflow for AgileAiAgents. This workflow analyzes an existing codebase and guides enhancements.

## Command Context
- Native Claude Code custom slash command
- Activates multiple specialized agents
- Analysis results stored in project-documents/analysis-reports/
- State persisted across sessions

## Workflow Execution
When invoked:
1. Check workflow state
2. Activate Stakeholder Interview Agent for setup
3. Run comprehensive code analysis (Project Analyzer Agent)
4. Present findings via Stakeholder Interview Agent
5. Guide through sequential phases 1-8
6. After Phase 8, unlock enhancement selection menu

## Stage 1: Sequential Analysis (Phases 1-8)
Required for proper understanding and planning.

## Stage 2: Enhancement Implementation
User selects from available enhancement phases.

The Stakeholder Interview Agent handles all user interaction and approval gates.
```

##### File: `templates/clean-slate/.claude/commands/select-phases.md`
```markdown
---
description: Select operational or enhancement phases after core workflow completion
---

# Phase Selection

Present the phase selection menu for post-MVP or post-analysis phase selection.

## Prerequisites
- New Project: Must complete Phase 11 (MVP Deployment)
- Existing Project: Must complete Phase 8 (Enhancement Backlog)

## Available Phases
Display categorized phases:
- Development & Features
- Operations & Infrastructure  
- Marketing & Growth
- Business & Revenue
- Analytics & Intelligence
- Scale & Expansion

## Quick Packages
- Startup Package: Operations, Marketing, Business, Analytics
- Enterprise Package: Operations, Security, Business, Analytics, Scale
- Growth Package: Marketing, Customer Success, Revenue, Analytics

## Execution Modes
Allow user to choose:
- Sequential (one at a time)
- Parallel (multiple simultaneously)
- Priority (high-priority first)
- Scheduled (specific timelines)

Save selections to workflow state for execution.
```

##### File: `templates/clean-slate/.claude/commands.json`
```json
{
  "version": "1.0.0",
  "commands": [
    {
      "name": "new-project-workflow",
      "description": "Start or continue a new project from idea to implementation",
      "aliases": ["npw", "start-new-project-workflow"],
      "category": "workflow",
      "agent": "stakeholder-interview-agent",
      "flags": ["--status", "--resume", "--save-state", "--dry-run"]
    },
    {
      "name": "existing-project-workflow",
      "description": "Analyze and enhance an existing codebase",
      "aliases": ["epw", "start-existing-project-workflow"],
      "category": "workflow",
      "agent": "stakeholder-interview-agent",
      "flags": ["--status", "--resume", "--save-state", "--analyze-only"]
    },
    {
      "name": "select-phases",
      "description": "Select operational or enhancement phases",
      "aliases": ["phases", "phase-select"],
      "category": "workflow",
      "requirements": ["workflow-complete"],
      "flags": ["--package", "--mode"]
    },
    {
      "name": "aaa-help",
      "description": "Show all AgileAiAgents commands",
      "aliases": ["help", "commands"],
      "category": "help"
    },
    {
      "name": "aaa-status",
      "description": "Show current workflow and project status",
      "aliases": ["status"],
      "category": "state"
    },
    {
      "name": "quickstart",
      "description": "Interactive menu for all workflows",
      "aliases": ["qs", "start"],
      "category": "workflow"
    }
  ]
}
```

##### File: `templates/clean-slate/.claude/agents/stakeholder-interview-agent.md`
```markdown
# Stakeholder Interview Agent

You are the Stakeholder Interview Agent for AgileAiAgents. Your role is to conduct comprehensive stakeholder interviews using iterative discovery methodology.

## Core Responsibilities
1. Verify system setup before workflows
2. Process pre-filled stakeholder prompts
3. Conduct iterative section-by-section interviews
4. Present understanding and obtain approvals
5. Document all decisions
6. Manage approval gates throughout workflows

## Communication Protocol
- Speak in first person during interviews
- Use visual indicators (✓ ✗) for checklists
- Number options for clear choices
- Request explicit approvals before proceeding
- Document every decision with timestamp

## Setup Verification
Always check these items first:
- [ ] .env file exists in agile-ai-agents folder
- [ ] User's project folder created
- [ ] CLAUDE.md updated with project name
- [ ] Setup scripts executed
- [ ] .claude/settings.json configured

## Iterative Discovery Process
1. Ask initial question
2. Record response
3. Identify ambiguities
4. Ask clarifying follow-ups
5. Present understanding
6. Get explicit approval
7. Document agreement
8. Move to next section

## Decision Documentation
Create records in `project-documents/orchestration/stakeholder-decisions.md`:
- Date/time
- Question asked
- Final answer
- Clarification rounds
- Approval method
- Any conditions

Remember: Zero ambiguity is the goal. Every requirement must be crystal clear.
```

##### File: `templates/clean-slate/.claude/agents.json`
```json
{
  "version": "1.0.0",
  "agents": [
    {
      "id": "stakeholder-interview-agent",
      "name": "Stakeholder Interview Agent",
      "description": "Conducts comprehensive stakeholder interviews and manages approval gates",
      "category": "orchestration",
      "file": "agents/stakeholder-interview-agent.md",
      "triggers": [
        "/new-project-workflow",
        "/existing-project-workflow",
        "setup-verification",
        "stakeholder-interview",
        "approval-gate"
      ],
      "capabilities": [
        "setup-verification",
        "iterative-discovery",
        "approval-management",
        "decision-documentation"
      ],
      "interactive": true,
      "priority": 1
    }
  ]
}
```

##### File: `templates/clean-slate/.claude/settings.json`
```json
{
  "version": "1.0.0",
  "project": {
    "name": "AgileAiAgents Project",
    "type": "new-project",
    "user_path": "/path/to/be/configured"
  },
  "agents": {
    "enabled": true,
    "auto_activate": true,
    "default_agent": "stakeholder-interview-agent"
  },
  "commands": {
    "enabled": true,
    "auto_discover": true,
    "command_prefix": "/"
  },
  "hooks": {
    "enabled": true,
    "session_start": true,
    "user_prompt_submit": true,
    "file_change": true
  },
  "workflow": {
    "auto_save": true,
    "checkpoint_frequency": "phase_complete",
    "state_file": "project-state/workflow-state.json"
  }
}
```

### Clean Slate Deployment Process

#### 1. Template Preparation
When creating a new project with AgileAiAgents:

```bash
# Copy clean slate template to new project
cp -r templates/clean-slate/* /path/to/new/project/

# The .claude folder with commands is now included
# User gets native slash commands immediately
```

#### 2. Auto-Configuration
On first run of `/new-project-workflow`:
1. Stakeholder Interview Agent activates
2. Verifies setup completion
3. Updates `.claude/settings.json` with user path
4. Begins stakeholder discovery

#### 3. Benefits of Clean Slate Integration
- **Zero Setup**: Commands work immediately
- **Native Experience**: Claude Code recognizes commands automatically
- **Agent Ready**: Stakeholder Interview Agent pre-configured
- **State Management**: Workflow state tracking built-in
- **Backward Compatible**: Old commands work via aliases

### Release Package Structure

The complete AgileAiAgents release package includes:

```
agile-ai-agents-release/
├── templates/
│   └── clean-slate/           # Complete project template
│       ├── .claude/           # NEW: Native Claude integration
│       │   ├── commands/      # Custom slash commands
│       │   ├── agents/        # Native agents
│       │   └── *.json         # Configuration files
│       ├── project-documents/ # Existing structure
│       ├── project-state/     # Existing structure
│       └── community-learnings/
├── ai-agents/                 # 38 agent definitions
├── machine-data/              # System configuration
├── scripts/                   # Workflow scripts
└── README.md                  # Setup instructions
```

### User Experience Flow

#### New User Setup
1. Clone AgileAiAgents repository
2. Copy clean-slate template to project folder
3. Open project in Claude Code
4. Run `/new-project-workflow`
5. Stakeholder Interview Agent guides setup
6. Workflow begins automatically

#### Existing User Migration
1. Update AgileAiAgents to latest version
2. Copy `.claude` folder from clean-slate
3. Existing commands continue working via aliases
4. New commands available immediately

## Key System Learnings Applied to This Plan

Based on comprehensive research of the AgileAiAgents system, the following enhancements should be incorporated:

### 1. Pre-flight Checks Integration
From `workflow-preflight-checker.js`, implement pre-flight validation before workflow starts:

```javascript
// Add to Stakeholder Interview Agent's setup verification
const preflightChecks = {
  agentsAvailable: checkRequiredAgents(),
  stateIntegrity: validateStateSystem(),
  diskSpace: checkDiskSpace(),
  permissions: checkFilePermissions(),
  hooksEnabled: checkHookSystem(),
  researchConfig: validateResearchLevels()
};
```

**Implementation**: Add pre-flight checks to Phase 1 (Setup Verification) that run automatically before workflow initialization.

### 2. Enhanced Error Handling Pattern
From `new-project-workflow-enhanced.js`, implement robust error handling:

```javascript
// Wrap all phase executions in error handlers
const safePhaseExecutor = createSafePhaseExecutor(
  phaseName,
  agentName,
  phaseFunction
);
await executePhaseWithErrorHandling(safePhaseExecutor);
```

**Implementation**: Each workflow phase should have:
- Error catching and recovery options
- Automatic state saving on errors
- Clear recovery instructions for users

### 3. Parallel Execution Coordinator
From `parallel-execution-coordinator.js`, implement conflict-free parallel execution:

```javascript
// For operations phases (12+)
const coordinator = new ParallelExecutionCoordinator();
const assignments = await coordinator.assignWork(agents, phases);
```

**Key Features to Include**:
- Conflict-free document assignments
- Resource allocation management
- Deadlock prevention
- Progress tracking for parallel phases

### 4. Auto-Save Triggers
From `auto-save-handler.md`, implement automatic state saving at:

```javascript
const autoSaveTriggers = {
  document_creation: true,      // When any document is created
  section_approval: true,       // When stakeholder approves
  phase_transitions: true,      // Between workflow phases
  depth_selection: true,        // Research/analysis level selection
  decision_recorded: true,      // Important decisions
  error_occurrence: true        // Always on errors
};
```

**Implementation**: Stakeholder Interview Agent should trigger saves after each approval.

### 5. Command Handler Pattern
From `command-handlers.md`, ensure proper command processing:

```javascript
// Command detection and routing
const commandFlow = {
  detect: checkForSlashPrefix(),
  validate: validateCommand(),
  route: routeToHandler(),
  initState: initializeWorkflowState(),
  handleError: saveStateForContinue()
};
```

**Implementation**: Custom slash commands should follow this pattern for consistency.

### 6. Resource Allocation Strategy
From the parallel execution coordinator, implement resource management:

```javascript
const resourcePools = {
  memory: 100,        // Percentage allocation
  cpu: 100,           // CPU allocation
  fileHandles: 1000   // Max concurrent operations
};

// Allocate based on phase priority
const allocation = calculateResourceAllocation(
  baseShare, workload, priority, resourceType
);
```

**Implementation**: Phase selection menu should consider resource constraints when allowing parallel execution.

### 7. Approval Timeout Handling
From the enhanced workflow handler, implement approval timeouts:

```javascript
// Check for stale approvals
const timeoutCheck = checkApprovalTimeouts();
if (timeoutCheck.timedOut) {
  notifyApprovalTimeout(gateName);
  offerSkipOption();
}
```

**Implementation**: Add 24-hour timeout for approval gates with notification system.

### 8. State Validation Pattern
From the pre-flight checker, validate state integrity:

```javascript
const stateValidation = {
  checkRequired: ['workflow_id', 'workflow_type', 'current_phase'],
  validateStructure: ensureValidJSON(),
  verifyCheckpoints: checkBackupAvailability(),
  repairCorruption: attemptStateRecovery()
};
```

**Implementation**: Validate state before phase transitions and after resuming.

### 9. Progress Formatting
From `workflow-progress-formatter.js`, implement clear progress display:

```javascript
const progressDisplay = {
  showPhaseProgress: formatWorkflowProgress(),
  showDetailedStatus: formatDetailedStatus(),
  showApprovalGate: formatApprovalGate(),
  showDryRun: formatDryRun()
};
```

**Implementation**: Stakeholder Interview Agent should display progress bars and completion percentages.

### 10. Conflict Resolution Strategies
From parallel execution coordinator:

```javascript
const conflictStrategies = {
  document_lock: preventSimultaneousEdits(),
  resource_queue: queueResourceRequests(),
  priority_resolution: higherPriorityWins(),
  deadlock_detection: detectAndResolveDeadlocks()
};
```

**Implementation**: When multiple phases run in parallel, implement these conflict prevention strategies.

## Research Document Creation Requirements

### Research Level Configuration
The system must respect the research level selected by the stakeholder:

#### 1. Research Level Selection (Phase 2)
**Stakeholder Interview Agent** presents options:
- **Minimal**: 15 essential documents (1-2 hours)
- **Medium**: 48 comprehensive documents (3-5 hours) 
- **Thorough**: 194 enterprise-level documents (6-10 hours) **[DEFAULT if no answer]**

**Implementation Requirements**:
```javascript
// In stakeholder interview
const researchLevel = await askResearchLevel();
if (!researchLevel || researchLevel === undefined) {
  researchLevel = 'thorough'; // Default to thorough
}
saveToState({ research_level: researchLevel });
```

#### 2. Document Creation by Agent (Phase 3: Research Execution)

Based on selected level, the following agents create documents:

**Research Agent** creates:
- Market analysis documents
- Competitive analysis
- Customer research
- Industry trends
- Technology landscape
- Risk assessments
- Executive summaries

**Marketing Agent** creates:
- Marketing strategy
- Brand positioning
- Digital marketing strategy
- Content marketing strategy (medium+)
- Social media strategy (medium+)
- PPC campaign strategy (medium+)
- SEO content strategy (medium+)
- Email marketing strategy (medium+)

**Finance Agent** creates:
- AI development cost analysis
- AI vs human cost comparison
- ROI analysis
- Token budget projections (medium+)
- Financial risk assessment (medium+)

**Market Validation & Product Market Fit Agent** creates (medium+):
- Market validation strategy
- Customer discovery report
- Competitive landscape analysis
- Market demand quantification
- Product-market fit framework
- PMF measurement system

**Analysis Agent** creates:
- Executive intelligence summary
- Strategic recommendations
- Risk opportunity matrix (medium+)
- Go/no-go recommendation

**Customer Lifecycle & Retention Agent** creates (thorough):
- Customer journey mapping
- Retention strategy
- Churn analysis
- Lifetime value models

**Revenue Optimization Agent** creates (thorough):
- Pricing strategy
- Monetization models
- Revenue projections
- Subscription frameworks

**VC Report Agent** creates (thorough):
- Investment analysis
- Fundraising documents
- Pitch deck content
- Valuation models

#### 3. Document Save Locations
All research documents must be saved to correct locations:

```
project-documents/
├── business-strategy/
│   ├── research/           # Research Agent documents
│   ├── marketing/          # Marketing Agent documents  
│   ├── finance/            # Finance Agent documents
│   ├── market-validation/  # Market Validation Agent
│   ├── analysis/           # Analysis Agent documents
│   ├── customer-success/   # Customer Lifecycle Agent (thorough)
│   ├── monetization/       # Revenue Optimization Agent (thorough)
│   └── investment/         # VC Report Agent (thorough)
```

#### 4. Research Verification Configuration
From `CLAUDE-config.md`, respect verification levels:

```yaml
research_verification:
  agent_overrides:
    research_agent: "thorough"     # Always thorough verification
    finance_agent: "thorough"      # Financial data needs verification
    analysis_agent: "thorough"     # Analysis needs solid foundation
    marketing_agent: "balanced"    # Balanced verification
```

**Document Type Overrides** (highest priority):
- Financial projections: "paranoid"
- Market research: "thorough"
- Competitor analysis: "thorough"
- Executive summaries: "balanced"

#### 5. Document Creation Timing

**Phase 3: Research Execution** (Parallel Execution)
Multiple agents work simultaneously based on research level:

```javascript
// Parallel execution based on level
const agentsToActivate = getAgentsForResearchLevel(researchLevel);
const results = await Promise.all(
  agentsToActivate.map(agent => agent.createDocuments())
);
```

**Minimal Level Agents** (1-2 hours):
- Research Agent (7 docs)
- Marketing Agent (3 docs)
- Finance Agent (3 docs)
- Analysis Agent (2 docs)

**Medium Level Agents** (3-5 hours):
- All Minimal agents with expanded docs
- Market Validation Agent (6 docs)
- Additional Marketing docs (5 more)
- Additional Finance docs (2 more)

**Thorough Level Agents** (6-10 hours):
- All Medium agents with full document sets
- Customer Lifecycle Agent (24 docs)
- Revenue Optimization Agent (24 docs)
- VC Report Agent (19 docs)
- Security Agent (13 docs)
- Analytics Growth Agent (23 docs)

#### 6. Quality Assurance for Documents

Each document must include:
- Clear document header with agent name
- Creation timestamp
- Research level indicator
- Verification level applied
- Sources and citations (where applicable)
- Confidence indicators for uncertain data

#### 7. Auto-Save After Document Creation

From `CLAUDE-config.md`:
```yaml
auto_save:
  save_frequency:
    document_creation: true  # Save after each document
```

The system must auto-save state after each document is created to prevent data loss.

## Implementation Timeline

### Week 1 - Agent & Foundation
- [ ] **Day 1-2**: Create Stakeholder Interview Agent
  - Write agent markdown file
  - Create question banks JSON
  - Update agent registry
  - Write initial tests
- [ ] **Day 3-4**: Setup verification system
  - Implement prerequisite checks
  - Create setup guidance flow
- [ ] **Day 5**: Enhanced state management
  - Two-stage workflow states
  - MVP transition logic

### Week 2 - Workflow Enhancements
- [ ] **Day 1-2**: Phase selection interface
  - Post-MVP menu system
  - Package definitions
  - Custom path builder
- [ ] **Day 3-4**: Stakeholder interaction improvements
  - Integrate new agent into workflow
  - Operations vision questions
  - Iterative discovery implementation
- [ ] **Day 5**: Research display enhancement
  - Document-by-document display
  - Research level visualization

### Week 3 - Technical Implementation
- [ ] **Day 1-2**: Sprint workflow enhancements
  - First sprint structure
  - CI/CD pipeline integration
- [ ] **Day 3-4**: Hook integration
  - Workflow phase transitions
  - Approval gate hooks
  - Agent coordination hooks
- [ ] **Day 5**: Testing framework
  - Agent integration tests
  - Workflow transition tests

### Week 4 - Finalization & Testing
- [ ] **Day 1-2**: Command enhancements
  - Phase selection commands
  - Navigation commands
- [ ] **Day 3**: Documentation updates
  - Update all workflow docs
  - Agent documentation
  - User guides
- [ ] **Day 4-5**: Integration testing
  - Full workflow testing
  - Agent communication testing
  - Phase transition testing

## Testing Strategy

### Unit Tests
- Phase transition logic
- State management updates
- Hook execution
- Command parsing

### Integration Tests
- Full workflow execution
- Phase jumping/skipping
- State recovery
- Parallel execution

### User Acceptance Tests
- Setup verification flow
- Phase selection interface
- Operations priority selection
- Sprint deployment pipeline

## Migration Path

### For Existing Projects
1. Detect current workflow state
2. Map to new phase structure
3. Preserve completed work
4. Offer upgrade options

### For New Projects
1. Default to enhanced workflow
2. Offer simplified mode option
3. Guide through setup verification
4. Enable all new features

## Rollback Plan

### If Issues Arise
1. Preserve existing workflow as `--legacy` option
2. State migration tools
3. Automatic detection of workflow version
4. Gradual feature rollout

## Success Metrics

### Stage 1: Development Metrics (Phases 1-11)
- Setup verification success rate > 95%
- Sequential phase completion rate > 90%
- Time to MVP deployment < 2 weeks
- Stakeholder approval at all gates > 95%

### Stage 2: Operations Metrics (Phases 12+)
- Phase selection adoption rate > 80%
- Parallel phase execution success > 85%
- Custom path creation usage > 60%
- Post-MVP growth metrics improvement > 40%

### Overall Success Indicators
- Improved stakeholder control and satisfaction
- Clear transition from development to operations
- Flexibility in post-MVP strategy
- Reduced time to business value

## Documentation Updates Required

### Files to Update
1. `CLAUDE.md` - Update all command references
2. `README.md` - Update workflow commands
3. `workflow-templates/` - Rename command references in all templates
4. `command-handlers.md` - Update command definitions
5. `aaa-documents/` - Update all documentation with new commands
6. `claude-code-commands-reference.md` - Update command list
7. `/aaa-help` output - Update help text with new commands

### New Documentation
1. Phase selection guide
2. Operations priority guide
3. Sprint deployment guide
4. Workflow customization guide

## Risk Mitigation

### Technical Risks
- **State corruption**: Enhanced validation and backups
- **Phase conflicts**: Dependency checking
- **Performance impact**: Lazy loading and caching

### User Experience Risks
- **Complexity overload**: Progressive disclosure
- **Migration confusion**: Clear upgrade paths
- **Feature discovery**: Interactive tutorials

## Critical Dependencies

### New Agent Required
**Stakeholder Interview Agent** must be created FIRST as it's essential for both workflows:

**New Project Workflow:**
- Phase 1: Setup Verification
- Phase 2: Stakeholder Discovery
- Phase 4: Post-Research Alignment
- All approval gates
- Decision documentation

**Existing Project Workflow:**
- Phase 1: Setup Verification
- Phase 3: Project Identity Verification
- Phase 4: Enhancement Goals Discovery
- Phase 7: Structure Decision
- All approval gates

This agent doesn't currently exist and is the foundation of both enhanced workflows.

### Claude Code Native Integration
The implementation leverages Claude Code's native features:

#### Agent Integration
**Stakeholder Interview Agent**:
- **Location**: `.claude/agents/stakeholder-interview-agent.md`
- **Registry**: `.claude/agents.json`
- **Invocation**: Direct through Claude Code's agent system
- **Interactive**: Supports back-and-forth conversation

#### Custom Slash Commands
**Workflow Commands**:
- **Location**: `.claude/commands/`
  - `new-project-workflow.md`
  - `existing-project-workflow.md`
  - `select-phases.md`
- **Registry**: `.claude/commands.json`
- **Auto-discovery**: Claude Code loads automatically
- **Aliases**: Support old command names

This ensures seamless integration with Claude Code's built-in capabilities and enables natural workflow execution.

## Approval Checklist

Before implementation:
- [ ] **Approve Research Document Requirements**
  - [ ] Research level selection with THOROUGH as default
  - [ ] Document creation by correct agents
  - [ ] Proper save locations for all documents
  - [ ] Verification levels respected
  - [ ] Auto-save after document creation
  - [ ] Parallel execution for research phase
- [ ] **Approve Clean Slate Template Integration**
  - [ ] `.claude` folder addition to `templates/clean-slate/`
  - [ ] Custom commands in clean slate template
  - [ ] Native agents in clean slate template
  - [ ] Auto-configuration on project setup
  - [ ] Template will be part of release package
- [ ] **Approve custom slash commands in `.claude/commands/`**
  - [ ] `/new-project-workflow` command file
  - [ ] `/existing-project-workflow` command file
  - [ ] `/select-phases` command file
- [ ] Approve command aliases for backward compatibility
- [ ] Confirm command registry structure (`.claude/commands.json`)
- [ ] **Approve creation of Stakeholder Interview Agent** (Priority 1)
- [ ] Approve Claude Code native agent implementation (`.claude/agents/`)
- [ ] Confirm agent handles both workflows
- [ ] Approve agent registry integration (`.claude/agents.json`)
- [ ] Confirm agent communication protocol
- [ ] Approve two-stage workflow design (Sequential → Flexible)
- [ ] Confirm Phases 1-11 must be sequential
- [ ] Approve MVP as transition point to phase selection
- [ ] Review post-MVP phase selection menu (Phases 12-29)
- [ ] Confirm parallel execution for operations phases
- [ ] Approve Quick Start packages (Startup, Enterprise, Growth)
- [ ] Validate custom path creation feature
- [ ] Approve 4-week implementation timeline
- [ ] Review testing strategy for both stages
- [ ] Confirm backward compatibility approach

## Summary of All Enhancements

### Complete Enhancement List

1. **Stakeholder Interview Agent** (NEW - Priority 1)
   - Native Claude Code agent in `.claude/agents/`
   - Handles both new and existing project workflows
   - Iterative discovery methodology
   - Comprehensive AI operations questions (35+ questions in 6 categories)
   - Progressive question presentation strategy

2. **Custom Slash Commands** (Native Claude Code)
   - `/new-project-workflow` (renamed from `/start-new-project-workflow`)
   - `/existing-project-workflow` (renamed from `/start-existing-project-workflow`)
   - `/select-phases` (new command for post-MVP/post-analysis)
   - All commands in `.claude/commands/` directory
   - Backward compatibility through aliases

3. **Clean Slate Template Integration**
   - `.claude` folder added to `templates/clean-slate/`
   - Zero-setup experience for new projects
   - Pre-configured agents and commands
   - Auto-configuration on first run

4. **Two-Stage Workflow Design**
   - Stage 1: Sequential phases (1-11 for new, 1-8 for existing)
   - Stage 2: Flexible phase selection menu
   - MVP/Analysis completion as transition point
   - Parallel execution capability for operations phases

5. **Enhanced Setup Verification**
   - Pre-flight checks before workflow start
   - Agent availability validation
   - State integrity checking
   - Resource availability verification
   - Clear setup guidance for missing components

6. **Comprehensive AI Operations Discovery**
   - Customer Experience AI agents (6 types)
   - Sales & Marketing AI agents (7 types)
   - Operations & Business AI agents (7 types)
   - Data & Analytics AI agents (6 types)
   - Content & Community AI agents (6 types)
   - Security & Compliance AI agents (5 types)
   - Priority mapping and budget alignment

7. **System Improvements from Research**
   - Pre-flight validation system
   - Enhanced error handling with recovery
   - Parallel execution coordinator
   - Auto-save triggers at key points
   - Approval timeout handling (24-hour)
   - State validation and repair
   - Progress formatting with visual indicators
   - Conflict resolution strategies
   - Resource allocation management
   - Deadlock prevention

8. **State Management Enhancements**
   - Automatic saving on approvals
   - Checkpoint creation at phase transitions
   - Error state preservation
   - Resume capability improvements
   - State validation before operations

9. **User Experience Improvements**
   - Progress bars and completion percentages
   - Clear approval gates with timeouts
   - Recovery instructions on errors
   - Visual indicators (✓ ✗) in checklists
   - Structured decision documentation

10. **Existing Project Workflow Enhancements**
    - Same two-stage approach as new projects
    - Code analysis presentation through Interview Agent
    - Project identity verification
    - Enhancement goal discovery
    - Structure migration decisions
    - Phase selection after analysis

## Research Document Requirements

### Research Level Selection
The workflow MUST implement research level selection with the following requirements:

#### Selection Timing
- **New Projects**: After stakeholder interview approval (Phase 2)
- **Existing Projects**: After initial code analysis (Phase 3)
- **Default**: THOROUGH level if stakeholder doesn't respond within 24 hours

#### Research Levels
1. **MINIMAL** (1-2 hours): 15 essential documents
2. **MEDIUM** (3-5 hours): 48 comprehensive documents  
3. **THOROUGH** (6-10 hours): 194 enterprise-level documents [DEFAULT]

#### Implementation Requirements
```javascript
// Research level selection in Stakeholder Interview Agent
async function selectResearchLevel() {
  const prompt = `
    How deep should we research your project?
    
    📋 MINIMAL (1-2 hours) - 15 essential documents
    📊 MEDIUM (3-5 hours) - 48 comprehensive documents [RECOMMENDED]
    🔍 THOROUGH (6-10 hours) - 194 enterprise documents [DEFAULT]
    
    Which level? (minimal/medium/thorough) [default: thorough]:
  `;
  
  const response = await getStakeholderResponse(prompt, {
    timeout: 24 * 60 * 60 * 1000, // 24 hours
    default: 'thorough'
  });
  
  return response;
}
```

### Document Creation Mapping

#### Agent Responsibilities by Category
Based on `workflow-document-manager.js` and system configuration:

| Category | Primary Agent | Document Count | Verification Level |
|----------|---------------|----------------|-------------------|
| Research | research_agent | 48 docs | THOROUGH |
| Marketing | marketing_agent | 41 docs | BALANCED |
| Finance | finance_agent | 5 docs | THOROUGH |
| Market Validation | market_validation_product_market_fit_agent | 19 docs | THOROUGH |
| Customer Success | customer_lifecycle_retention_agent | 24 docs | BALANCED |
| Monetization | revenue_optimization_agent | 24 docs | THOROUGH |
| Investment | vc_report_agent | 19 docs | PARANOID |
| Security | security_agent | 13 docs | PARANOID |
| Analytics | analytics_growth_intelligence_agent | 23 docs | THOROUGH |
| Analysis | analysis_agent | 4 docs | THOROUGH |

#### Document Creation Timing
Documents MUST be created at the appropriate workflow phase:

**Phase 3: Research Execution**
- All research category documents (based on selected level)
- Marketing strategy documents (core set)
- Finance documents (AI cost analysis)
- Initial market validation

**Phase 4: Analysis & Synthesis**
- Analysis documents (executive summary, recommendations)
- Risk opportunity matrix
- Go/no-go recommendation

**Phase 5: Strategic Planning**
- Investment documents (if fundraising)
- Security architecture (if compliance required)
- Monetization strategy (based on business model)

**Phase 12+: Operations**
- Customer success documents
- Analytics setup documents
- Optimization strategies
- Email marketing sequences

### Verification Levels
Per `CLAUDE-config.md`, documents must respect verification levels:

```yaml
research_verification:
  agent_overrides:
    research_agent: "thorough"      # All research docs
    finance_agent: "thorough"       # Financial projections
    analysis_agent: "thorough"      # Strategic analysis
    security_agent: "paranoid"      # Security assessments
    marketing_agent: "balanced"      # Marketing materials
    vc_report_agent: "paranoid"     # Investment docs
    
  document_type_overrides:
    financial_projections: "paranoid"
    security_assessment: "paranoid"
    investment_analysis: "paranoid"
    market_research: "thorough"
    competitor_analysis: "thorough"
```

### Document Save Locations
All documents MUST be saved to correct locations:

```
project-documents/
├── business-strategy/
│   ├── research/           # Research Agent outputs
│   ├── marketing/          # Marketing Agent outputs
│   ├── finance/            # Finance Agent outputs
│   ├── market-validation/  # Market Validation Agent outputs
│   ├── customer-success/   # Customer Success Agent outputs
│   ├── monetization/       # Revenue Optimization Agent outputs
│   ├── investment/         # VC Report Agent outputs
│   └── analysis/           # Analysis Agent outputs
├── implementation/
│   └── security/           # Security Agent outputs
└── operations/
    └── analytics/          # Analytics Agent outputs
```

### Auto-Save Triggers
Documents MUST trigger auto-save per configuration:

```yaml
auto_save:
  save_frequency:
    document_creation: true   # Save after EVERY document
    section_completion: true  # Save after document batches
    phase_transitions: true   # Save when changing phases
```

### Parallel Execution Strategy
For THOROUGH level (194 documents), use parallel execution:

**Phase 3: Research Execution**
- Group 1 (5 agents): Research, Marketing, Finance agents
- Group 2 (4 agents): Market Validation, Customer Success agents  
- Group 3 (3 agents): Monetization, Investment, Security agents
- Estimated time: 2-3 hours with parallelization (vs 6-10 hours sequential)

### Document Quality Requirements
Each document MUST:
1. Include verification sources when required
2. Separate facts from analysis
3. Include confidence indicators
4. Follow GitHub markdown standards
5. Be saved in JSON format for agent context

### Error Handling
If document creation fails:
1. Save partial progress
2. Log failure reason
3. Continue with other documents
4. Report failures in summary
5. Allow retry of failed documents

### Progress Tracking
Show real-time progress:
```
Research Phase Progress: [████████░░░░░░░░] 48/97 documents (49%)
Active Agents: research_agent (12/24), marketing_agent (8/15), finance_agent (3/5)
Estimated Time Remaining: 1h 23m
```

## Benefits Summary

### For Users
- **Zero Setup**: Commands work immediately with clean slate template
- **Flexibility**: Choose operational priorities post-MVP
- **Control**: Approval gates and iterative discovery
- **Transparency**: Clear progress and state visibility
- **Recovery**: Robust error handling and resume capability

### For System
- **Scalability**: Parallel execution for operations
- **Reliability**: Pre-flight checks and validation
- **Maintainability**: Native Claude Code integration
- **Extensibility**: Easy to add new phases and agents
- **Compatibility**: Full backward compatibility

## Risk Mitigation Summary

1. **Technical Risks**: Mitigated through pre-flight checks, state validation, error handling
2. **User Experience Risks**: Mitigated through progressive disclosure, clear guidance
3. **Performance Risks**: Mitigated through resource allocation, parallel coordination
4. **Data Loss Risks**: Mitigated through auto-save, checkpoints, state preservation
5. **Compatibility Risks**: Mitigated through aliases, gradual rollout options

## Next Steps

1. **Stakeholder Review**: Review this comprehensive plan and provide feedback
2. **Prioritization**: Identify must-have vs nice-to-have features
3. **Resource Allocation**: Assign implementation tasks to team
4. **Begin Implementation**: Start with Stakeholder Interview Agent creation

---

*This implementation plan incorporates all system learnings and best practices from AgileAiAgents to create a robust, user-friendly, and scalable workflow enhancement that maintains full backward compatibility while adding significant new capabilities.*