# AgileAiAgents v7.0.0 - AI Agent Coordination System

Transform Claude Code into a specialized team of 38 AI agents using agile methodology. Now with **intelligent Document Router** for automatic document organization, **multi-LLM support** for 60-80% cost reduction, **parallel sub-agent execution** for 60-75% faster project completion, and **deep research capabilities** with citation support!

## Table of Contents

* [Overview](#overview)
* [What You Get](#what-you-get)
* [Built on Claude Code](#built-on-claude-code)
* [Installation](#installation)
* [Quick Start](#quick-start)
* [Usage Guide](#usage-guide)
* [Command Reference](#command-reference)
* [System Architecture](#system-architecture)
* [Project Folder Structure](#project-folder-structure-v300)
* [MD to JSON Conversion System](#md-to-json-conversion-system)
* [Available Agents](#available-agents)
* [Common Workflows](#common-workflows)
* [Real-Time Dashboard](#real-time-dashboard)
* [Project State System](#project-state-system)
* [Stakeholder Prompt Templates](#stakeholder-prompt-templates-v430)
* [Verbosity System](#verbosity-system)
* [Community Learnings System](#community-learnings-system)
* [Configuration](#configuration)
* [Troubleshooting](#troubleshooting)
* [Updates and Versioning](#updates-and-versioning)
* [Claude Code Native Integration](#claude-code-native-integration-v410)
* [Sub-Agent System](#sub-agent-system-v400)
* [Hooks System](#hooks-system)
* [Contributing](#contributing)
* [Support](#support)

## Overview

AgileAiAgents is a comprehensive AI agent coordination system that transforms Claude Code into a team of specialized experts. Instead of one generalist AI, you get 37 domain-specific agents working together through proven agile methodologies, all coordinated by an intelligent orchestration system.

### Key Features

* 🚨 **NEW: Document Router System** - 4-tier intelligent document routing with automatic folder creation (v6.2.0)
* 🚨 **NEW: Dynamic Folder Creation** - Semantic folder names created automatically as needed (v6.2.0)
* 🚨 **NEW: Document Lifecycle Management** - Track document freshness and staleness (v6.2.0)
* 🚀 **Multi-LLM Support** - 60-80% cost reduction with intelligent model routing (v6.1.0)
* 🚀 **Deep Research Mode** - Perplexity Pro-style research with citations (v6.1.0)
* 🚀 **Improvement Selection System** - Stakeholders have full control over which improvements to implement (v6.1.0)
* 🚀 **Multi-Model Routing** - Use Gemini, OpenAI, Perplexity alongside Claude
* 🚀 **Intelligent Fallback** - Claude always available as guaranteed fallback
* 🚀 **Cost Management** - Real-time tracking with automatic limits
* 🚀 **Parallel Research** - 3-5x faster research with multiple models
* 🚀 **Claude Code Native Integration** - All agents available as native Claude sub-agents
* 🚀 **Parallel Sub-Agent Execution** - 60-75% faster with Claude Code sub-agents
* ✅ **38 Specialized AI Agents** - Each expert in their domain
* ✅ **Agile Sprint Coordination** - Structured workflow management
* ✅ **Real-Time Dashboard** - Monitor all agent activities and model status
* ✅ **Context Persistence** - Never lose work between sessions
* ✅ **Automatic Orchestration** - Describe your idea, agents handle the rest
* ✅ **Production-Ready Output** - From idea to deployment
* ✅ **Tech Stack Scaffolding** - Proper project structure from the start
* ✅ **Hooks System** - Event-driven automation for workflows and monitoring

## What You Get

### 🔧 Core Development Agents (11)

* **PRD Agent** - Requirements gathering and documentation
* **Project Manager Agent** - Agile sprint planning and coordination (with requirement completeness checks)
* **Scrum Master Agent** - Sprint execution and facilitation (with velocity anomaly detection)
* **Project State Manager Agent** - Context persistence and state management
* **Project Structure Agent** - Repository structure management
* **Coder Agent** - Software development with defensive programming (enforced by hooks)
* **Testing Agent** - Quality assurance and comprehensive testing (with coverage gatekeeper)
* **UI/UX Agent** - User interface and experience design
* **DevOps Agent** - Infrastructure and deployment (with deployment window enforcement)
* **Security Agent** - Enterprise security and compliance (with vulnerability scanning)
* **DBA Agent** - Database design and optimization

### 📊 Business & Strategy Agents (5)

* **Research Agent** - Market research and competitive analysis
* **Finance Agent** - Budget management and financial modeling
* **Analysis Agent** - Data analysis and business intelligence
* **Marketing Agent** - Marketing strategy and execution
* **Business Documents Agent** - Business plans and proposals

### 🚀 Growth & Revenue Agents (7)

* **SEO Agent** - Search engine optimization
* **PPC Media Buyer Agent** - Paid advertising campaigns
* **Social Media Agent** - Social media strategy
* **Email Marketing Agent** - Email automation and campaigns
* **Revenue Optimization Agent** - Revenue growth strategies
* **Customer Lifecycle Agent** - Customer retention and success
* **Analytics & Growth Intelligence Agent** - Performance tracking

### ⚙️ Technical Integration Agents (5)

* **API Agent** - API research and integration
* **LLM Agent** - AI model selection and optimization
* **MCP Agent** - MCP server setup and integration
* **ML Agent** - Machine learning development
* **Data Engineer Agent** - Data pipeline development

### 📝 Support Agents (10)

* **Documentation Agent** - Technical writing and docs
* **Document Manager Agent** - JSON context optimization
* **Logger Agent** - Monitoring and observability
* **Optimization Agent** - Performance improvements
* **Project Dashboard Agent** - Real-time monitoring
* **Project Analyzer Agent** - Existing project analysis
* **Learning Analysis Agent** - Pattern detection
* **Project State Manager Agent** - Session continuity
* **Project Structure Agent** - Folder organization
* **VC Report Agent** - Investment documentation

## Multi-LLM Support (NEW in v6.1.0)

AgileAiAgents now supports multiple LLM providers for dramatic cost savings and performance improvements while maintaining 100% reliability with Claude as the guaranteed fallback.

### Supported Models

* **Claude** (Required) - Haiku, Sonnet, Opus
* **Gemini** - 1.5 Flash, 1.5 Pro (40% cheaper)
* **OpenAI** - GPT-3.5, GPT-4
* **Perplexity** - Sonar, Sonar Pro (citations)
* **Zen MCP** - Unified routing (75% savings)

### Quick Setup

```bash
# Basic setup (Claude only - always works)
export ANTHROPIC_API_KEY="your-claude-key"

# Enhanced setup (add any combination)
export GOOGLE_AI_API_KEY="your-gemini-key"    # 40% savings
export PERPLEXITY_API_KEY="your-perplexity-key" # Deep research
export OPENAI_API_KEY="your-openai-key"        # Fallback

# Run setup wizard
./scripts/setup-multi-llm.sh
```

### Commands

* `/configure-models` - Interactive setup wizard
* `/model-status` - View current configuration
* `/research-boost` - Enable 3-5x faster research

### Performance Improvements

| Feature | Before | After | Improvement |
|---------|--------|-------|-------------|
| Research | 3-5 hours | 45-75 min | 75% faster |
| Cost | $50/project | $12.50/project | 75% cheaper |
| Parallel | Sequential | 5 models | 5x throughput |

For detailed setup, see [`project-documents/system/multi-llm-setup-guide.md`](project-documents/system/multi-llm-setup-guide.md).

## Built on Claude Code

AgileAiAgents extends [Claude Code](https://claude.ai/code), Anthropic's powerful AI coding assistant, providing specialized agent coordination, agile project management, and multi-model support on top of Claude Code's core capabilities.

### Why This Matters

* **All Claude Code features available**: Direct file editing, command execution, Git integration
* **Enhanced with specialized agents**: 38 domain experts working together
* **Optimized token usage**: Automatic MD→JSON conversion saves 80-90% on context
* **Integrated workflows**: Commands and features from both systems work seamlessly together

### Prerequisites

1. **Claude Code** - Install from [claude.ai/code](https://claude.ai/code)
   ```bash
   # Verify installation
   claude --version
   ```
2. **Node.js 16+** - Required for dashboard functionality
3. **Git** - For version control and collaboration

### Key Integration Features

* **Dual Command Systems**: Claude Code (`/help`) + AgileAiAgents (`/aaa-help`)
* **Memory Optimization**: Automatic document conversion for efficiency
* **MCP Server Support**: Real-time data access through Model Context Protocol
* **Hooks Automation**: Comprehensive event-driven workflow automation system
* **Cost Management**: Built-in token tracking with `/cost` command

For detailed integration information, see [`aaa-documents/claude-code-integration-guide.md`](aaa-documents/claude-code-integration-guide.md).

## Installation

> ⚠️ **IMPORTANT: DO NOT CLONE THIS REPOSITORY** ⚠️  
> Download the latest release instead to avoid accidentally committing sensitive data to GitHub.

### Step 1: Download Latest Release

1. Visit [Releases Page](https://github.com/DiscDev/agile-ai-agents/releases)
2. Download `agile-ai-agents-v5.0.0.zip` (or latest version)
2. Create a workspace directory (e.g., `mkdir ~/workspace`)
3. Extract to your workspace:
   ```bash
   unzip agile-ai-agents-v5.0.0.zip -d ~/workspace/
   cd ~/workspace/agile-ai-agents
   ```
   
   > **⚠️ Hidden Folder Alert ⚠️**: The release includes a hidden `.claude` folder that contains essential Claude Code integration files (agents, hooks, settings). This folder might not be visible or copied on some systems!  The Agile AI Agents system will not work without this folder.
   >
   > **macOS/Linux users**: Use Finder's `Cmd+Shift+.` or `ls -la` to see hidden files  
   > **Windows users**: Enable "Show hidden files" in File Explorer options
   >
   > If you don't see the `.claude` folder after extraction, the setup.sh that you will run later will automatically create it from the template.

### Step 2: Workspace Structure Setup

AgileAiAgents uses a **three-folder workspace structure** with **three CLAUDE.md files** and **Claude Code integration**:

1. **CLAUDE.md** (workspace root) - Main workspace configuration
   - This file comes from the release package
   - **IMPORTANT**: Edit this file to replace `[project-folder]` with your actual project folder name

2. **.claude/** - Claude Code integration (from the release)
   - Contains 38 native Claude sub-agents in `.claude/agents/`
   - Hooks for automated workflows in `.claude/hooks/`
   - Settings for Claude Code integration in `.claude/settings.json`
   - **Hidden folder**: Use `Cmd+Shift+.` (macOS) or "Show hidden files" (Windows) to see it
   
3. **agile-ai-agents/** - The AI system (from the release)
   - Has its own CLAUDE.md with complete system documentation
   - All 38 agent definitions and coordination logic
   
4. **[your-project-name]/** - Your actual project code
   - Create this folder with a name appropriate to your project (e.g., `my-saas-app`, `ecommerce-site`, etc.)
   - For existing projects: Place your existing code files here
   - For new projects: This will contain all your project code
   - Should have its own CLAUDE.md to maintain AgileAiAgents context
   - Run `/add-agile-context` in your from the claude code to create this

Example workspace structure:
```
~/workspace/
├── CLAUDE.md                # Edit this to replace [project-folder] with my-saas-app
├── .claude/                 # Claude Code integration (hidden folder)
│   ├── agents/             # 38 native Claude sub-agents
│   ├── hooks/              # Automated workflow hooks
│   └── settings.json       # Claude Code configuration
├── agile-ai-agents/         # The AI system
└── my-saas-app/            # Your project (you create this)
```

**Setup Steps:**
1. Verify the `.claude` folder exists (if not, setup script will create it)
2. Create your project folder (e.g., `mkdir my-saas-app`)
3. Edit the workspace CLAUDE.md to replace `[project-folder]` with `my-saas-app`
4. Run `/add-agile-context` in your project folder

This ensures that when you open just your project folder in a new Claude Code session, it still knows about AgileAiAgents.

### Step 3: Run Setup Script

**Unix/macOS:**
```bash
./scripts/bash/setup.sh
```

**Windows:**
```powershell
.\scripts\windows\setup.bat
```

### Step 4: Fix Claude Code Hook Paths (Recommended)

To prevent "No such file or directory" errors in Claude Code:
```bash
./fix-claude-hooks.sh
```
This is a one-time fix that ensures hooks work correctly with Claude Code.

### Step 5: Configure Environment

```bash
cp .env_example .env
# Edit .env to add your API keys (optional but recommended)
```

That's it! Claude Code automatically has all the context it needs from the CLAUDE.md file.

## Quick Start

### 🚀 Choose Your Path

#### Optional: Prepare a Stakeholder Prompt (NEW - v4.8.0)
Save 70% of interview time by preparing your project information in advance:
1. Use our template: `templates/stakeholder-prompts/universal-project-prompt.md`
2. Fill it out thoughtfully (with your team if desired)
3. Save to: `project-documents/stakeholder-input/project-prompt.md`
4. The system will detect and use it automatically!

#### For New Projects:
```
/new-project-workflow
```
This command will:
* Check for your stakeholder prompt file (if prepared)
* Guide you through project discovery
* Conduct market research (with depth options)
* Plan product architecture
* Execute sprint-based implementation

#### For Existing Projects:
```
/existing-project-workflow
```
This command will:
* Check for your enhancement prompt file
* Analyze your current codebase
* Ask contextual questions based on findings
* Plan enhancements and improvements
* Guide incremental implementation

#### For Major Architectural Changes (Rebuild):
```
/rebuild-project-workflow
```
This command provides a 22-phase rebuild process for:
* Major architectural changes requiring side-by-side development
* Complete technology stack migrations
* Fundamental structural improvements
* Production system replacements with zero downtime
* Includes migration, feature parity, and legacy retirement phases

#### Not Sure? Use Quick Start Menu:
```
/quickstart
```
An interactive menu that helps you choose the right workflow.

#### Need Help?
```
/aaa-help
```
Shows all AgileAiAgents commands and their usage.

## Usage Guide

### Command-Based Workflows

AgileAiAgents now uses commands to guide you through structured workflows:

#### Starting a New Project
```
You: /new-project-workflow
AI: Let's start with understanding your project vision.
    What are you building? Please describe in 1-2 sentences.
You: A task management app for remote teams
AI: What problem does this solve?
You: Remote teams struggle to coordinate tasks across timezones
AI: [Continues guided discovery...]
```

The workflow includes:
1. **Discovery Interview** - Section-by-section questions with approval
2. **Research Level Selection** - Choose depth of market research
3. **Automated Research** - Parallel execution by multiple agents
4. **Product Planning** - PRD, architecture, and roadmap creation
5. **Sprint Implementation** - Agile development with regular reviews

**Enhanced workflow commands with options**:
```bash
# New Project Workflow options:
/new-project-workflow --status      # Check current phase and progress
/new-project-workflow --resume      # Continue from saved state or approval gates
/new-project-workflow --save-state  # Create checkpoint with note
/new-project-workflow --dry-run     # Preview workflow without execution
/new-project-workflow --parallel    # Enable parallel agent execution

# Existing Project Workflow options (same functionality):
/existing-project-workflow --status      # Check current phase and progress
/existing-project-workflow --resume      # Continue from saved state or approval gates
/existing-project-workflow --save-state  # Create checkpoint with note
/existing-project-workflow --dry-run     # Preview workflow without execution
/existing-project-workflow --parallel    # Enable parallel agent execution

# Rebuild Project Workflow options (22-phase rebuild):
/rebuild-project-workflow --status       # Check current phase and progress
/rebuild-project-workflow --resume       # Continue from saved state
/rebuild-project-workflow --save-state   # Create checkpoint with note
/rebuild-project-workflow --dry-run      # Preview rebuild plan
/rebuild-project-workflow --parallel     # Enable parallel execution
```

#### Enhancing Existing Projects
```
You: /existing-project-workflow
AI: I'll start by analyzing your codebase...
    [After analysis]
    I've detected a Node.js application using Express and PostgreSQL.
    Is this primarily an API service?
You: Yes, it's our user management API
AI: I found 73% test coverage. What's your target?
You: We'd like to reach 90%
AI: [Continues with contextual questions based on findings...]
```

The workflow includes:
1. **Automatic Code Analysis** - Understand your codebase first
2. **Contextual Interview** - Questions based on analysis findings
3. **Analysis Depth Selection** - Choose how deep to analyze
4. **Enhancement Planning** - Prioritized improvement roadmap
5. **Incremental Implementation** - Safe, backward-compatible changes

#### Rebuilding Projects (NEW in v6.0.0)
```
You: /rebuild-project-workflow --type=technical
AI: Starting rebuild project workflow...
    You've selected Technical Rebuild (same features, modern stack).
    Let's establish the parameters for your rebuild.
    
    What triggered this rebuild decision?
    - Technical debt overwhelming
    - Scale limitations hit
    - Security vulnerabilities
    [Continues with rebuild-specific questions...]
```

The rebuild workflow supports:
1. **Technical Rebuild** - Same features, modern technology stack
2. **Partial Rebuild** - Gradual component replacement (Strangler Fig)
3. **Business Model Rebuild** - New economics, similar technology
4. **Complete Rebuild** - Everything new from scratch

Features include:
- Side-by-side deployment (original + rebuilt)
- Parallel operation support
- Gradual migration capability
- Feature parity tracking
- Comprehensive rollback procedures

**New in v3.5.0**: Both workflows now feature:
- **Approval Gates** - Strategic checkpoints requiring stakeholder review
- **Real-time Progress** - Visual progress tracking in Claude Code and dashboard
- **Error Recovery** - Comprehensive `/workflow-recovery` command
- **State Management** - Automatic and manual checkpoint creation
- **Tech Stack Scaffolding** - Stakeholder-approved project structure templates
- **Structure Validation** - Automated compliance checking with scaffold templates

### Direct Project Descriptions (Legacy Mode)

You can still describe your project directly without commands:
```
I want to build an e-commerce platform for handmade goods
```

This triggers the auto-orchestrator if present, but we recommend using the new command-based workflows for a better guided experience.

### Manual Agent Control (Advanced)

For direct control over specific agents, you can still use:
```
Acting as the PRD Agent from ai-agents/prd_agent.md, 
help me document requirements for [your feature]
```
```
Acting as the Coder Agent from ai-agents/coder_agent.md, 
implement [feature] following the "Feature Development Workflow" 
in your guidelines using [your tech stack].
```

#### Multi-Agent Coordination
```
Acting as the AI Agent Orchestrator from ai-agent-coordination/orchestrator-workflows.md, 
coordinate between PRD, UI/UX, Coder, and Testing agents to implement 
[complex feature] using the "Sequential Handoff Pattern".
```

## Command Reference

### Claude Code Built-in Commands

These are Claude Code's native commands that work alongside AgileAiAgents:

| Command | Description |
|---------|-------------|
| **Essential Commands** |  |
| `/help` | Show Claude Code help (built-in commands) |
| `/cost` | Show total cost and duration of current session |
| `/clear` | Clear conversation history and free up context |
| `/compact` | Clear conversation history but keep a summary |
| `/exit` or `/quit` | Exit the REPL |
| **File & Directory** |  |
| `/add-dir` | Add a new working directory |
| `/export` | Export conversation to file or clipboard |
| `/memory` | Edit CLAUDE.md memory files |
| **Configuration** |  |
| `/config` | Open config panel (theme settings) |
| `/terminal-setup` | Configure terminal for better multiline support |
| `/vim` | Enable vim mode editing |
| `/model` | Change AI model mid-session |
| `/login` | Switch Anthropic accounts |
| **Development** |  |
| `/review` | Request code review of recent changes |
| `/bug` | Submit feedback about Claude Code |
| `/doctor` | Diagnose and verify Claude Code installation |
| **Keyboard Shortcuts** |  |
| `Ctrl+C` | Cancel current generation |
| `Ctrl+D` | Exit Claude Code |
| `Ctrl+L` | Clear terminal screen |
| `Esc+Esc` | Edit previous message |
| `#` prefix | Quick add to memory |

### AgileAiAgents Commands

These commands are specific to the AgileAiAgents system:

| Command | Description |
|---------|-------------|
| **Workflow Commands** |  |
| `/aaa-help` | Show this AgileAiAgents command guide |
| `/quickstart` | Interactive menu for all options |
| `/new-project-workflow` | Structured new project discovery (v3.5.0: Added --status, --resume, --save-state, --dry-run, --parallel) |
| `/existing-project-workflow` | Analyze existing code and plan enhancements (v3.5.0: Added parameters) |
| `/rebuild-project-workflow` | 22-phase rebuild for architectural changes (v6.0.0: Major system rebuild workflow) |
| `/workflow-recovery` | Error recovery and diagnostics (v3.5.0: New) |
| **State Management** |  |
| `/status` | Show current project status |
| `/continue` | Resume from last state |
| `/checkpoint` | Create manual checkpoint |
| `/update-state` | Manually update state |
| `/save-decision` | Document important decisions |
| **Community Contributions** |  |
| `/milestone` | Record milestone achievement |
| `/deployment-success` | Mark successful deployment |
| `/project-complete` | Mark project completion |
| `/skip-contribution` | Skip learning contribution |
| `/contribution-status` | Check contribution readiness |
| `/contribute-now` | Immediate contribution |
| **Learning Analysis Workflow** |  |
| `/learn-from-contributions-workflow` | Run complete 7-phase learning analysis |
| `/learn-from-contributions-workflow --check-only` | Check for new contributions |
| `/learn-from-contributions-workflow --validate` | Validate with manual override |
| `/learn-from-contributions-workflow --analyze` | Analyze patterns |
| `/learn-from-contributions-workflow --plan` | Generate implementation plans |
| `/learn-from-contributions-workflow --approve` | Review and approve plans |
| `/learn-from-contributions-workflow --implement` | Execute approved changes |
| `/learn-from-contributions-workflow --archive` | Archive results and decisions |
| `/learn-from-contributions-workflow --status` | Show workflow status |
| `/learn-from-contributions-workflow --resume` | Resume interrupted workflow |
| `/learn-from-contributions-workflow --rollback` | Rollback last implementation |
| **Sprint Management** |  |
| `/sprint-retrospective` | Conduct sprint retrospective |
| `/sprint-review` | Review sprint deliverables |
| `/sprint-status` | Show current sprint progress |
| **MD to JSON Conversion** |  |
| `/convert-md-to-json-aaa-documents` | Convert aaa-documents to JSON |
| `/convert-md-to-json-ai-agents` | Convert ai-agents to JSON |
| `/convert-md-to-json-project-documents` | Convert project-documents to JSON |
| `/convert-all-md-to-json` | Convert all MD files to JSON |

💡 **Tip**: Use `/aaa-help [command]` for detailed help on any AgileAiAgents command.

📚 **Full Documentation**: 
* Claude Code commands: [`aaa-documents/claude-code-commands-reference.md`](aaa-documents/claude-code-commands-reference.md)
* AgileAiAgents integration: [`aaa-documents/claude-code-integration-guide.md`](aaa-documents/claude-code-integration-guide.md)

## System Architecture

### Directory Structure

**agile-ai-agents/**
* **ai-agents/** - 38 agent definitions
* **ai-agent-coordination/** - Coordination patterns
* **project-documents/** - All deliverables (category-based v3.2)
  * **orchestration/** - Core coordination
  * **business-strategy/** - Business & planning
  * **implementation/** - Technical development
  * **operations/** - Launch & growth
* **project-dashboard/** - Real-time monitoring
* **hooks/** - Event-driven automation system
  * **handlers/** - Hook implementations
  * **registry.json** - Hook configurations
* **aaa-documents/** - Advanced documentation
* **aaa-mcps/** - MCP server guides
* **machine-data/** - JSON optimization
* **community-learnings/** - Shared patterns
* **scripts/** - Setup and utilities

### Sprint Organization

All sprint documents are consolidated in:

**project-documents/orchestration/sprints/sprint-YYYY-MM-DD-feature-name/**
* sprint-planning.md
* sprint-tracking.md
* sprint-review.md
* sprint-retrospective.md
* sprint-testing.md
* document-registry.md
* stakeholder-escalations/

## Tech Stack-Specific Project Scaffolding (v3.5.0)

AgileAiAgents now ensures projects start with proper folder structure based on their technology stack, preventing common organization issues.

### Available Scaffold Templates

Located in `/templates/project-scaffolds/`:

#### Separated Stack Architecture
* **React + Node.js** - Frontend and backend in separate directories
* **Vue + Django** - Vue.js frontend with Django REST backend
* **Laravel + React** - PHP Laravel backend with React frontend

#### Full-Stack Frameworks
* **Next.js** - React framework with integrated backend
* **Nuxt.js** - Vue framework with server-side rendering
* **SvelteKit** - Svelte with full-stack capabilities

#### Monolithic Applications
* **Django** - Python web framework following MVT pattern
* **Laravel** - PHP framework with MVC architecture
* **Ruby on Rails** - Convention over configuration

#### Microservices
* **Node.js Microservices** - Distributed services with API gateway

#### Mobile Applications
* **React Native + Node.js** - Cross-platform mobile with API backend
* **Flutter + Django** - Dart mobile app with Python backend

### How Scaffolding Works

1. **Stakeholder Interview (Section 2.5)**
   - Tech stack analysis
   - Structure recommendation based on stack
   - Visual preview of folder organization
   - Approval before implementation

2. **Structure Validation**
   - Testing Agent validates 90%+ compliance
   - Anti-pattern detection (e.g., mixed frontend/backend in root)
   - Automated structure analysis reports

3. **Existing Projects**
   - Structure analysis during project onboarding
   - Migration recommendations if needed
   - Gradual or immediate migration options

### Benefits
* ✅ Prevents mixed concerns and anti-patterns
* ✅ Enables smooth repository evolution
* ✅ Follows framework best practices
* ✅ Reduces refactoring needs
* ✅ Improves team onboarding

See `/templates/project-scaffolds/decision-tree.md` for selecting the right template.

## Project Folder Structure (v3.5.0)

AgileAiAgents now uses a **category-based folder structure** for better organization and clarity, replacing the previous numbered system.

### 📁 Category-Based Organization

All project deliverables are organized in 4 main categories:

#### 1. orchestration/ - Core coordination (Scrum Master Agent)
* project-log.md
* agent-coordination.md
* stakeholder-decisions.md
* stakeholder-escalations.md
* sprints/
  * sprint-YYYY-MM-DD-feature-name/

#### 2. business-strategy/ - Business analysis & planning
* existing-project/ (Project Analyzer Agent)
* research/ (Research Agent)
* marketing/ (Marketing Agent)
* finance/ (Finance Agent)
* market-validation/ (Market Validation PMF Agent)
* customer-success/ (Customer Lifecycle Agent)
* monetization/ (Revenue Optimization Agent)
* analysis/ (Analysis Agent)
* investment/ (VC Report Agent)

#### 3. implementation/ - Technical development
* requirements/ (PRD Agent)
* security/ (Security Agent)
* llm-analysis/ (LLM Agent)
* api-analysis/ (API Agent)
* mcp-analysis/ (MCP Agent)
* project-planning/ (Project Manager Agent)
* environment/ (DevOps Agent)
* design/ (UI/UX Agent)
* implementation/ (Coder Agent)
* testing/ (Testing Agent)
* documentation/ (Documentation Agent)

#### 4. operations/ - Launch & growth
* deployment/ (DevOps Agent)
* launch/ (Project Manager Agent)
* analytics/ (Analytics Agent)
* monitoring/ (Logger Agent)
* optimization/ (Optimization Agent)
* seo/ (SEO Agent)
* crm-marketing/ (Email Marketing Agent - multi-channel)
* media-buying/ (PPC Media Buyer Agent)
* social-media/ (Social Media Agent)

### 🚀 Key Benefits

* **Logical Grouping** - Related documents organized by purpose
* **Clear Agent Ownership** - Each folder has a designated responsible agent  
* **No Number Confusion** - Self-documenting folder names
* **Scalable Structure** - Easy to understand and navigate
* **40-45% Faster** - Optimized for parallel document creation

### 🔄 Migration from Numbered Folders

The system maintains backward compatibility during transition:
* Both structures work simultaneously
* Automatic validation ensures correct usage
* Migration tools: `npm run migrate-categories`

**Example mappings:**
* `02-research/` → `business-strategy/research/`
* `27-email-marketing/` → `operations/crm-marketing/`
* `11-requirements/` → `implementation/requirements/`

## Clean Slate Project Structure

When you download a fresh AgileAiAgents release, the `project-documents` folder comes with a complete clean slate structure designed for immediate use.

### What's Included

Every folder contains:
* **README.md** - Explains the folder's purpose and managing agent
* **System Files** - Essential JSON files for backlog and velocity tracking
* **No Example Content** - Clean workspace ready for your project

### Standardized README System

Each folder's README follows a consistent template:
```markdown
# [Folder Name]

## Purpose
[Clear description of what documents belong here]

## Managing Agent(s)
- **Primary**: [Agent Name]
- **Secondary**: [Other agents that contribute]

## Generated By Workflows
- `/new-project-workflow` - Phase X: [What gets created]
- `/existing-project-workflow` - Phase Y: [What gets created]
- Manual triggers: [Any manual commands]
```

### Template-Based Initialization

The release process uses templates from `/templates/clean-slate/` to ensure:
* All 30 folders have proper READMEs
* System files are initialized with correct defaults
* Timestamps are set at release creation
* No legacy content or examples

### Benefits

* **Immediate Start** - No cleanup needed before beginning
* **Clear Guidance** - Every folder explains its purpose
* **Agent Awareness** - READMEs show which agent manages what
* **Workflow Integration** - READMEs document when files get created

## MD to JSON Conversion System

Understanding how AgileAiAgents optimizes token usage through automatic document conversion.

### How It Works

The system uses a two-tier document storage approach for maximum efficiency:

1. **Markdown Creation** (Human-Readable)
   * All documents created as `.md` files in `project-documents/`
   * Agents write markdown for readability and version control
   * Full folder structure pre-created for organization

2. **Automatic JSON Conversion** (Token-Optimized)
   * Document Manager Agent monitors for new/updated MD files
   * Automatically converts to JSON in `machine-data/project-documents-json/`
   * JSON folders created on-demand (only when content exists)
   * 80-90% token reduction for agent operations

### Why Different Folder Structures?

You may notice differences between the two directories:

**project-documents/** (Full Structure)
* orchestration/
* business-strategy/
* implementation/
* operations/

*All folders exist from the start for organization*

**machine-data/project-documents-json/** (On-Demand)
* orchestration/ (Only if MD files exist)
* business-strategy/ (Folders appear as needed)
* ... (Not all folders may be present)

*JSON folders created only when documents are converted*

### Key Benefits

* **Token Efficiency**: JSON uses 80-90% fewer tokens than markdown
* **Automatic Sync**: JSON always reflects latest MD content
* **Space Efficient**: No empty JSON folders cluttering the structure
* **Best of Both**: Human-readable MD + machine-optimized JSON

### Technical Components

* **Converter**: `machine-data/markdown-to-json-converter.js`
* **Generator**: `machine-data/document-json-generator.js`
* **Loader**: `machine-data/agent-context-loader.js`
* **Guide**: `aaa-documents/json-context-guide.md`

## Available Agents

### Core Development Team

| Agent | Expertise | Key Capabilities |
|-------|-----------|------------------|
| PRD Agent | Requirements | User stories, acceptance criteria, specifications |
| Coder Agent | Development | Full-stack, defensive programming, latest dependencies |
| Testing Agent | Quality Assurance | Unit, integration, E2E, performance testing |
| DevOps Agent | Infrastructure | CI/CD, deployment, monitoring, scaling |
| UI/UX Agent | Design | User flows, wireframes, responsive design |

### Business & Strategy Team

| Agent | Expertise | Key Capabilities |
|-------|-----------|------------------|
| Research Agent | Market Analysis | Competitive research, industry trends, validation |
| Finance Agent | Financial Planning | Budgets, ROI, cost analysis, projections |
| Marketing Agent | Go-to-Market | Strategy, campaigns, positioning, messaging |
| VC Report Agent | Fundraising | Pitch decks, valuations, due diligence prep |

### Growth & Revenue Team

| Agent | Expertise | Key Capabilities |
|-------|-----------|------------------|
| SEO Agent | Search Optimization | Technical SEO, content strategy, keywords |
| PPC Media Buyer | Paid Advertising | Google, Meta, LinkedIn ads, optimization |
| Analytics Agent | Growth Intelligence | KPIs, dashboards, insights, reporting |
| Revenue Agent | Monetization | Pricing, upsells, conversion optimization |

### Technical Integration Team

| Agent | Expertise | Key Capabilities |
|-------|-----------|------------------|
| API Agent | Integrations | REST, GraphQL, webhooks, documentation |
| LLM Agent | AI Integration | Model selection, prompt engineering, cost optimization |
| ML Agent | Machine Learning | Model development, training, deployment |
| Data Engineer | Data Infrastructure | Pipelines, ETL, warehousing, real-time processing |

## Common Workflows

### New Project (Automatic)
```
1. Describe your idea
2. Answer clarifying questions
3. Review viability report
4. Approve requirements
5. Review designs
6. Test deployment
7. Launch!
```

### Feature Development (Manual)
```bash
# 1. Requirements
Acting as PRD Agent → "New Feature Requirements Workflow"

# 2. Design  
Acting as UI/UX Agent → "New Feature Design Workflow"

# 3. Implementation
Acting as Coder Agent → "Feature Development Workflow"

# 4. Testing
Acting as Testing Agent → "Comprehensive Feature Testing Workflow"

# 5. Deployment
Acting as DevOps Agent → "Production Deployment Workflow"
```

### Bug Fix Process
```bash
# 1. Investigation
Acting as Coder Agent → "Bug Fix Workflow"

# 2. Testing
Acting as Testing Agent → "Regression Testing Workflow"

# 3. Deployment
Acting as DevOps Agent → "Hotfix Deployment Workflow"
```

### Performance Optimization
```bash
# 1. Analysis
Acting as Optimization Agent → "Performance Analysis Workflow"

# 2. Implementation
Acting as Coder Agent → "Performance Optimization Workflow"

# 3. Validation
Acting as Testing Agent → "Performance Testing Workflow"
```

## Real-Time Dashboard

### Starting the Dashboard
```bash
cd project-dashboard
node start-dashboard.js
```

Opens at `http://localhost:3001` with:
* 📄 **Documents Tab** - Live file updates
* 🤖 **Agents Tab** - Agent capabilities
* ⚙️ **System Tab** - Documentation and guides
* 📊 **Activity Feed** - Real-time progress
* 🎯 **Decision Alerts** - User approval requests

### Dashboard Features
* WebSocket real-time updates
* File tree navigation
* Markdown rendering
* Agent activity tracking
* Sprint progress monitoring
* Stakeholder notifications
* Product backlog metrics display
* **Project state widget** - Current workflow and phase tracking
* **Recent decisions display** - View important project decisions
* **Active tasks counter** - Monitor ongoing work items
* **State last updated** - Know when state was last saved

### Product Backlog Metrics
The dashboard displays real-time backlog metrics in the header:
* **Total Items** - Number of user stories in the backlog
* **Total Points** - Sum of all story points
* **Ready Points** - Points ready for sprint planning
* **Avg Velocity** - Team's average sprint velocity (shows 📊 when using community defaults)
* **Sprints Remaining** - Estimated sprints to complete backlog

These metrics are automatically populated during Phase 7 of the workflow when the Project Manager Agent transforms your PRD into user stories. The metrics update in real-time as:
* Stories are added or modified
* Sprint planning marks items "In Sprint"
* Sprint review marks items "Done"
* Velocity metrics are calculated after each sprint

### Community Velocity Profiles (v3.5.0+)
Start with realistic velocity estimates based on your project type:
* **Standard Web App** - 45 points/sprint (75% confidence)
* **API-Only Service** - 65 points/sprint (80% confidence)
* **SaaS MVP** - 40 points/sprint (70% confidence)
* **Mobile Application** - 35 points/sprint (65% confidence)
* **Data Pipeline** - 55 points/sprint (85% confidence)
* **Enterprise System** - 30 points/sprint (60% confidence)

Select a profile during project initialization with `/select-velocity-profile` or let the system recommend based on your project characteristics. The velocity gradually transitions from community defaults to your team's actual performance over 3-4 sprints.

## Project State System

Never lose work between Claude Code sessions! The Project State Manager Agent maintains complete context across all your work sessions.

### Dashboard Integration

The real-time dashboard now displays project state information:
* **Project State Widget** - Shows current workflow, phase, and last update time
* **Active Tasks** - Count of ongoing work items
* **Recent Decisions** - Latest project decisions with timestamps
* **Workflow Tracking** - Displays main workflows and learning workflows separately

View your project state at `http://localhost:3001` after starting the dashboard.

### Quick Commands

#### Status & Navigation
* `/status` - Get comprehensive project status including current sprint, active tasks, recent decisions, and next steps
* `/show-last-session` - Review accomplishments from your previous work session
* `/show-decisions` - View decision history with rationales
* `/show-learnings` - Display captured learnings from this project

#### State Management
* `/checkpoint` - Create manual save point with current progress
* `/checkpoint [your summary]` - Create checkpoint with specific context
* `/continue` - Resume from last saved state
* `/continue sprint:[name]` - Resume specific sprint work
* `/update-state [details]` - Manually update state with specific information
* `/save-decision [decision and rationale]` - Document important decisions

### Manual State Updates (End of Day)

When ending your work session, create comprehensive state updates:

```bash
# Simple checkpoint
/checkpoint Auth feature 75% done, 2 blockers resolved, starting tests tomorrow

# Detailed state update
/update-state Sprint: 2025-01-20-authentication (60% complete)
* Completed: User model, JWT implementation, login endpoint
* In Progress: OAuth integration (Google provider)
* Blocked: Need Google OAuth credentials from client
* Tomorrow: Finish OAuth, start password reset feature
* Decision: Using Passport.js for OAuth strategy

# Environment-specific state
/checkpoint Dev environment configured with PostgreSQL 15, Redis for sessions, running on port 3000

# Save important decision
/save-decision Using Passport.js for OAuth strategy due to extensive provider support and active maintenance
```

### Resuming Work (Next Session)

When returning to your project:

```bash
# 1. Load previous state
/continue

# 2. Get context summary
/status
# Returns complete context including sprint status, active tasks, blockers

# 3. Review last session
/show-last-session
# Shows completed tasks, decisions, files modified

# 4. Resume specific sprint
/continue sprint:2025-01-20-authentication

# 5. Review recent decisions
/show-decisions
# Shows decision history with rationales
```

### What Gets Automatically Saved

The system automatically saves state after:
* ✅ **Task Completion** - When any task is marked complete
* ✅ **Sprint Changes** - Status updates, phase transitions
* ✅ **Major Decisions** - Important choices with rationales
* ✅ **File Operations** - Creation or significant edits
* ✅ **Error Occurrences** - Problems encountered with context
* ✅ **Milestone Achievements** - Major project accomplishments
* ✅ **Deployment Completion** - After successful deployments
* ✅ **Feature Completion** - When features are fully implemented

### State Storage Structure

**agile-ai-agents/project-state/**
* current-state.json (Active project state)
* checkpoints/ (Manual and auto checkpoints)
  * checkpoint-YYYY-MM-DD-HH-MM-SS.json
* session-history/ (Daily session summaries)
  * session-YYYY-MM-DD.json
* decisions/ (Decision log with rationales)
  * decisions-log.json
* learnings/ (Captured project insights)
  * learnings-summary.json
* verification-cache/ (Research data cache)
* learning-workflow/ (Contribution workflow state)

### Clean Slate Project State

When you download a fresh AgileAiAgents release, the `project-state` directory comes pre-configured and ready to use:

**What's Included:**
* **Complete Directory Structure** - All subdirectories with .gitkeep files
* **README.md** - Comprehensive guide to state management
* **Empty Templates** - current-state.json and decisions-log.json initialized
* **Version Control Ready** - .gitignore configured to protect your data

**Benefits:**
* **Instant Functionality** - State management works from first command
* **No Setup Required** - All directories and files pre-created
* **Clear Documentation** - README explains each directory's purpose
* **Privacy Protected** - .gitignore prevents accidental commits

### Automatic Checkpoints

* Created every 30 minutes during active work
* Triggered by project phase changes
* Maximum of 20 checkpoints retained (oldest auto-removed)
* Manual checkpoints never auto-deleted

### Smart Context Loading

The system prioritizes what to load based on relevance:

**Always Loaded:**
1. Current task and active blockers
2. Recent decisions (last 10)
3. Active sprint information
4. Recently modified files (last 10)
5. System rules and configurations

**Loaded as Needed:**
* Historical decisions and completed tasks
* Previous sprint data
* Archived session summaries
* Old error logs and resolutions

### Best Practices

1. **End of Session**: Always create a checkpoint with summary before closing Claude Code
2. **Include Context**: Add specific details about blockers, next steps, or important decisions
3. **Document Environment**: Note any special configurations or external dependencies
4. **Use Descriptive Summaries**: Help your future self understand exactly where you left off
5. **Regular Checkpoints**: Don't rely only on auto-saves for critical progress

### Example Session Flow

```bash
# Monday - Starting new feature
"Starting Sprint 2025-01-20-user-authentication"
# ... work on authentication ...
"Checkpoint: Completed user model and JWT setup, starting OAuth tomorrow"

# Tuesday - Continue work
"Continue working from yesterday"
"Where are we?"
# ... implement OAuth ...
"Save decision: Using Google OAuth for social login - most users prefer it"
"Checkpoint: OAuth working, need to add error handling"

# Wednesday - Finish feature
"Continue working on Sprint 2025-01-20-user-authentication"
# ... complete implementation ...
"Update project state: Authentication feature complete, all tests passing, ready for review"
```

## Stakeholder Prompt Templates (v4.8.0)

NEW! Prepare comprehensive project information before your interview to save time and improve outcomes.

### Overview

The Stakeholder Prompt Template system allows you to thoughtfully prepare all project details in advance, resulting in:
- **70% faster** stakeholder interviews
- **Better project outcomes** through thoughtful preparation
- **Team collaboration** - multiple people can contribute
- **Automatic quality scoring** to ensure completeness

### How to Use

1. **Choose Your Template**:
   - **New Projects**: `templates/stakeholder-prompts/universal-project-prompt.md`
   - **Existing Projects**: `templates/stakeholder-prompts/existing-project-prompt.md`

2. **Fill It Out** (1-2 hours):
   - Use Google Docs for team collaboration
   - Export as Markdown when done
   - Or edit directly in Markdown

3. **Save Your File**:
   ```
   project-documents/stakeholder-input/project-prompt.md
   ```

4. **Run Your Workflow**:
   The system automatically detects and uses your prompt file!

### What to Include

#### Critical Sections
- **Project Vision**: One-sentence description and problem statement
- **NOT THIS List**: 5+ specific items (prevents scope creep)
- **Target Users**: Detailed personas with pain points
- **Success Metrics**: Measurable goals with timeframes
- **Technical Stack**: Preferences and constraints

#### Quality Scoring
Your prompt is automatically scored:
- **90-100**: Excellent ✨ (minimal clarification needed)
- **70-89**: Good ✅ (some clarification helpful)
- **50-69**: Adequate ⚠️ (significant clarification needed)
- **Below 50**: Needs Work ❌ (major gaps to fill)

### Examples Provided
- **B2B SaaS**: TaskFlow Pro (Score: 92/100)
- **Mobile App**: FitFlow fitness tracker (Score: 88/100)
- **Enhancement**: ArtisanMarket upgrade (Score: 85/100)

### Integration Benefits
Your prompt automatically feeds into:
- **Context Verification**: NOT THIS items → Project Truth
- **Research Focus**: Based on your industry/domain
- **Success Monitoring**: Metrics tracked throughout
- **Architecture Decisions**: Technical preferences applied

### Tips for Success
- ✅ Be specific, especially in the NOT THIS section
- ✅ Include measurable metrics
- ✅ Involve your whole team
- ✅ Review examples first
- ❌ Don't rush - thoughtful inputs = better outputs

For complete documentation, see: `templates/stakeholder-prompts/README.md`

## Verbosity System

Control how much detail you see from the AI agents during operations. Perfect for debugging or getting more insight into what's happening.

### Verbosity Levels

Configure in `CLAUDE.md`:
* **quiet** - Minimal output, only critical information
* **normal** - Standard output with key milestones (default)
* **verbose** - Detailed progress updates and timings
* **debug** - Everything including internal agent decisions

### What Verbose Mode Shows

When set to `verbose` or `debug`, you'll see:
* ⏱️ **Timing Information** - How long each operation takes
* 📊 **Progress Updates** - Real-time status as agents work
* 🔄 **Phase Transitions** - When agents hand off work
* 📝 **Decision Points** - Why agents make specific choices
* 🔍 **Research Sources** - Where data comes from
* ✅ **Validation Steps** - Quality checks being performed

### Example Verbose Output

```
[Research Agent] 🔍 Starting market research for "AI task manager"
[Research Agent] ⏱️ Phase 1/4: Industry Analysis (Started: 10:15:32 PST)
[Research Agent] 📊 Analyzing 3 market reports...
[Research Agent] ✓ Gartner report processed (2.3s)
[Research Agent] ✓ IDC data analyzed (1.8s)
[Research Agent] ✓ Competitor landscape mapped (3.1s)
[Research Agent] ⏱️ Phase 1 complete (7.2s total)
[Research Agent] 🔄 Handing off to Finance Agent for TAM calculation...
```

### Changing Verbosity

Edit the `verbosity` section in `CLAUDE.md`:
```yaml
verbosity:
  level: "verbose"  # Change this value
```

## Community Learnings System

Help improve AgileAiAgents by sharing what works! The system captures successful patterns and shares them with all users.

### How It Works

1. **Automatic Capture** - System identifies successful patterns during your project
2. **Privacy First** - All data is anonymized before sharing
3. **Pattern Analysis** - Learning Analysis Agent finds common success factors
4. **Community Benefit** - Validated improvements shared with everyone

### Contribution Triggers

You'll be prompted to contribute learnings after:
* 🏁 **Sprint Completion** - What worked well in this sprint?
* 🎯 **Milestone Achievement** - Key success factors
* 🚀 **Successful Deployment** - Deployment strategies that worked
* ✅ **Project Completion** - Overall project insights

### What Gets Captured

The system looks for:
* **Performance Wins** - 50%+ improvements in speed or efficiency
* **Novel Solutions** - Creative approaches to common problems
* **Agent Patterns** - Which agents work best together
* **Tool Usage** - Effective MCP server combinations
* **Error Resolutions** - How you solved tricky problems
* **Process Improvements** - Better workflows you discovered

### Privacy Protection

Before any contribution:
* 🔒 **Automatic Scanning** - Removes API keys, passwords, secrets
* 👤 **Anonymization** - Strips names, emails, company info
* 📁 **Path Conversion** - Changes absolute paths to relative
* 👁️ **Your Review** - You approve everything before submission

### Quick Commands

```bash
# Manual capture
/capture-learnings

# Check contribution status
/show-contribution-status

# Review before submitting
/review-learnings

# Skip if needed
/skip-contribution

# Analyze contributions for improvements
/learn-from-contributions-workflow
```

### Example Contribution Flow

```
[System] 🎉 Sprint completed! Would you like to contribute learnings?
[System] 📊 Detected: 73% reduction in API calls using caching strategy
[System] 🔍 Analyzing patterns...

Learnings Summary:
✓ Caching Strategy: Reduced API calls by 73%
✓ Agent Coordination: Research → Finance → Implementation flow
✓ Performance: 2.5x faster using parallel agent execution
✓ Error Resolution: Fixed CORS issues with proxy configuration

[System] 🔒 Privacy scan complete - no sensitive data found
[System] 👁️ Review above learnings (will be anonymized)
> "Approve contribution"
[System] ✅ Thank you! Your learnings help improve AgileAiAgents for everyone
```

### What Happens to Contributions

1. **Stored Locally**: `community-learnings/contributions/YYYY-MM-DD/`
2. **Pattern Analysis**: Learning Analysis Agent identifies trends
3. **Validation**: Patterns tested across multiple contributions
4. **Implementation**: Successful patterns become system improvements
5. **Attribution**: Contributors credited in CHANGELOG.md (anonymously)

### Learning From Contributions

The Learning Analysis Agent can analyze all contributions to improve the system:

```bash
# Analyze new contributions
/learn-from-contributions-workflow

# Just check what's new
/learn-from-contributions-workflow --check-only

# Check analysis status
/learn-from-contributions-workflow --status
```

**How It Works**:
1. **Discovery**: Scans new contributions and archive history
2. **Validation**: Scores contributions using historical success data
3. **Analysis**: Groups related patterns, identifies conflicts
4. **Planning**: Creates implementation plans with confidence levels
5. **Approval**: You review and approve each improvement
6. **Implementation**: Executes changes and archives everything
7. **Evolution**: Tracks how patterns improve over time

**Archive System**:
- `archive/implemented/` - Successful patterns with full history
- `archive/rejected/` - Patterns not used (for future reference)
- `archive/superseded/` - Patterns replaced by better ones
- Searchable index for finding patterns by category or success rate

### Opting Out

Don't want to contribute? No problem:
```yaml
# In CLAUDE.md
community_learnings:
  contribution:
    enabled: false  # Disables all contribution prompts
```

### Viewing Community Patterns

See what others have discovered:
```bash
# View all patterns
cat community-learnings/analysis/validated-patterns.json

# View specific improvements
cat community-learnings/analysis/pattern-auth-optimization.md
```

## Configuration

### Environment Variables (.env)
```bash
# Dashboard
DASHBOARD_PORT=3001
DASHBOARD_AUTH_ENABLED=false
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=secure_password

# Project Ports (for multiple projects)
FRONTEND_PORT=5173
BACKEND_PORT=3000
WEBSOCKET_PORT=8080

# API Keys (optional but recommended)
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
PERPLEXITY_API_KEY=your_key

# MCP Servers (optional)
GITHUB_TOKEN=your_token
FIGMA_ACCESS_TOKEN=your_token
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Port Strategy for Multiple Projects
* Project 1: Dashboard 3001, Frontend 5173, Backend 3000
* Project 2: Dashboard 4001, Frontend 5273, Backend 4000
* Project 3: Dashboard 5001, Frontend 5373, Backend 5000

### MCP Server Setup (Optional)

Essential servers for enhanced capabilities:
* **Zen MCP** - 60-80% cost savings on LLM calls
* **Context7 MCP** - Latest framework documentation
* **Perplexity MCP** - Real-time research
* **GitHub MCP** - Git automation
* **Figma MCP** - Design integration

See `/aaa-mcps/` for detailed setup guides.

## Troubleshooting

### Claude Code Hook Path Configuration (v4.8.0)

AgileAiAgents now automatically configures hook paths during setup, eliminating the "No such file or directory" errors.

**How it works:**
1. During setup, the system automatically detects your installation path
2. Hook paths in `.claude/settings.json` are configured for your specific installation
3. If you move your installation, use the path update utility

**If you move your installation:**
```bash
# Run from AgileAiAgents root:
./scripts/bash/change-user-path.sh

# This updates all hook paths to your new location
```

**Manual path update (if needed):**
If the automatic configuration doesn't work, you can manually update `.claude/settings.json`:
1. Find all lines with `"command": "/path/to/.claude/hooks/..."`
2. Replace `/path/to` with your actual installation path
3. Save and restart Claude Code

**Template System:**
The system uses `templates/claude-integration/.claude/settings.template.json` with `{{USER_PATH}}` placeholders that get replaced during setup. This ensures portability across all installations.

See `aaa-documents/troubleshooting/claude-code-hook-errors.md` for legacy troubleshooting.

### Dashboard Issues

**Won't Start:**
```bash
# Check Node.js version
node --version  # Should be 16+

# Manual install
cd project-dashboard
npm install
npm start
```

**"Cannot find module 'fs-extra'" Error:**
```bash
# Quick fix
cd project-dashboard
npm install
npm start
```

See `aaa-documents/troubleshooting-dashboard-dependencies.md` for detailed solutions.
```

**Port Conflicts:**
```bash
# Dashboard auto-scans ports 3001-3010
# Or specify manually:
PORT=4001 node start-dashboard.js
```

### Agent Issues

**Agent Not Following Instructions:**
* Ensure you reference the specific agent file
* Include the workflow name from guidelines
* Provide more context about your project

**Responses Too Generic:**
* Use exact format: "Acting as [Agent] from ai-agents/[file].md"
* Reference specific workflow sections
* Include tech stack and requirements

### Common Problems

**"Which agent should I use?"**
1. Check each agent's "Clear Boundaries" section
2. Start with PRD Agent if unsure
3. Use Orchestrator for multi-agent tasks

**"How do I coordinate multiple agents?"**
```
Acting as the AI Agent Orchestrator from 
ai-agent-coordination/orchestrator-workflows.md, 
coordinate [list agents] using the "Sequential Handoff Pattern"
```

### Diagnostic Tools
```bash
# Run comprehensive diagnostics
./scripts/bash/diagnose.sh     # Unix/macOS
.\scripts\windows\diagnose.bat  # Windows

# Checks:
# ✅ System requirements
# ✅ Dependencies
# ✅ File structure
# ✅ Port availability
# ✅ Configuration
```

## Updates and Versioning

### Checking Version
```bash
cat VERSION.json
```

### Update Process
1. **Backup** your `project-documents/` and `.env`
2. **Download** latest release
3. **Extract** over existing installation
4. **Restore** your backups
5. **Check** CHANGELOG.md for breaking changes

### Semantic Versioning
* **Major (X.0.0)** - Breaking changes
* **Minor (1.X.0)** - New features, agents
* **Patch (1.0.X)** - Bug fixes, docs

## Claude Code Native Integration (v4.8.0)

AgileAiAgents now provides complete integration with Claude Code's native systems, including sub-agents and hooks.

### Three-Tier Document System
- **Source**: `ai-agents/*.md` - Full agent definitions (single source of truth)
- **Tokens**: `machine-data/ai-agents-json/*.json` - Token-optimized for API calls (95% reduction)
- **Claude**: `.claude/agents/*.md` - Native Claude Code sub-agents with YAML frontmatter

### Claude Code Hooks Integration
The system integrates with Claude Code's hook system for automated workflows:

#### Hook Architecture
- **Dual Hook Systems**: AgileAiAgents hooks + Claude Code native hooks
- **Unified Control**: Dashboard provides master control for both systems
- **Auto-Sync**: Repository changes automatically sync to parent workspace
- **Context Aware**: Hooks detect and adapt to workspace vs repository execution

#### Workspace Structure
```
Parent Directory/                    # Your workspace
├── .claude/                        # Claude Code integration (from release)
│   ├── agents/                     # Native sub-agents
│   ├── hooks/                      # Claude Code hooks
│   └── settings.json               # Proper hook configuration
├── agile-ai-agents/                # AgileAiAgents system
└── [your-project]/                 # Your project code
```

#### Hook Features
- **PostToolUse**: File change detection and MD→JSON sync
- **PreToolUse**: Command validation before execution
- **UserPromptSubmit**: Context awareness and command detection
- **Master Control**: Single toggle affects all hooks
- **Performance Profiles**: minimal/standard/advanced configurations

### Using Claude Sub-Agents
When working in Claude Code, all 38 agents are automatically available as native sub-agents:
```
Use the coder_agent to implement the authentication feature
Use research_agent and finance_agent in parallel for market analysis
```

### Automatic Synchronization
Complete automation from source to runtime:
1. Edit source in `ai-agents/*.md`
2. Hooks automatically update JSON and Claude agents
3. Changes sync to parent workspace (if auto-sync enabled)
4. No manual commands needed - everything flows automatically

### Benefits
- **Native Performance**: Direct integration with Claude Code's sub-agent system
- **Full Agent Content**: No token limits - complete verbose agent definitions
- **Automatic Updates**: All changes propagate automatically
- **Unified Control**: Single dashboard for all hook systems
- **Release Ready**: `.claude/` directory deployed at parent level

## Sub-Agent System (v4.0.0+)

The Sub-Agent System enables parallel execution of tasks, dramatically reducing project completion time while maintaining quality.

### Key Benefits

* **60-75% Time Reduction** - Research phase: 4-6 hours → 1-2 hours
* **Parallel Sprint Execution** - Multiple stories developed simultaneously
* **Token Efficiency** - 30-40% reduction through isolated contexts
* **Realistic Team Simulation** - Multiple "developers" working in parallel

### How It Works

1. **Research Phase**: Instead of sequential document creation, sub-agents work in parallel:
   - Market Intelligence Sub-Agent: Competitive analysis, market research
   - Business Analysis Sub-Agent: Financial analysis, business models
   - Technical Research Sub-Agent: Technology landscape, feasibility
   - Result: 75% time reduction (4-6 hours → 1-2 hours)

2. **Sprint Execution**: Multiple coder sub-agents work on different stories:
   - Up to 3 coder sub-agents working simultaneously
   - Each sub-agent owns specific files/modules (exclusive access)
   - Smart conflict prevention through file-level ownership assignment
   - Real-time coordination via `code-coordination.md`
   - Integration phase handles shared files sequentially
   - Result: 60% time reduction (5 days → 2 days typical sprint)

3. **Project Analysis**: Analyze different aspects simultaneously:
   - Architecture, quality, security, and performance in parallel
   - Each analysis category handled by dedicated sub-agent
   - Results consolidated into comprehensive report
   - Result: 70% time reduction (2-4 hours → 30-60 minutes)

### Sprint Execution Example

When executing a sprint with 4 stories (AUTH-001 through AUTH-004):

**Traditional Sequential Approach**:
- Day 1: AUTH-001 (5 story points)
- Day 2: AUTH-002 (8 story points)
- Day 3-4: AUTH-003 (3 story points)
- Day 4-5: AUTH-004 (4 story points)
- **Total: 5 days**

**Parallel Sub-Agent Approach**:
- Day 1: All stories start simultaneously
  - coder_sub_1: AUTH-001 + AUTH-003 (owns /api/auth/*)
  - coder_sub_2: AUTH-002 (owns /api/oauth/*)
  - coder_sub_3: AUTH-004 (owns /middleware/*)
- Day 2: Integration and testing
- **Total: 2 days (60% faster!)**

### Configuration

Enable sub-agents in your CLAUDE.md:
```yaml
sub_agents:
  enabled: true
  default_mode: "parallel"
  orchestration:
    max_concurrent: 5
```

### Analysis & Integration Examples

**Project Analysis (7 categories analyzed in parallel)**:
- Traditional: 4 hours sequential analysis
- Sub-Agents: 1 hour parallel analysis
- **75% faster with comprehensive coverage**

**API Integration (8 services configured simultaneously)**:
- Traditional: 4 hours one-by-one setup
- Sub-Agents: 45 minutes parallel configuration
- **78% faster with consistent patterns**

### Learn More

- Complete guide: `aaa-documents/sub-agent-system-guide.md`
- Sprint coordination: `aaa-documents/sprint-code-coordination-guide.md`
- Analysis & integration: `aaa-documents/analysis-integration-sub-agents-guide.md`

## Hooks System

AgileAiAgents includes a comprehensive hooks system that provides automated workflows triggered by Claude Code events. This enables powerful automation for sprint management, state persistence, monitoring, and quality assurance.

### What Are Hooks?

Hooks are event-driven handlers that automatically execute when specific Claude Code events occur. They allow you to:
- Automate repetitive tasks
- Track sprint progress in real-time
- Maintain state consistency
- Monitor performance and costs
- Capture learnings automatically
- Ensure security compliance

### Available Hook Types

#### 1. Sprint Management Hooks
- **Sprint Document Tracker** - Monitors sprint documents for state changes and velocity updates
- **Pulse Generator** - Creates AI-native pulse updates for significant sprint events
- **Sprint Pulse Coordinator** - Manages the flow between document changes and pulse generation

#### 2. State & Session Management
- **State Backup** - Creates periodic backups with compression and validation
- **State Integrity Check** - Validates state files and auto-repairs common issues
- **Session Tracker** - Maintains continuity between Claude Code sessions

#### 3. Agent Coordination
- **Agent Context Updater** - Detects active agents from user prompts
- **Command Validator** - Validates AgileAiAgents commands before execution

#### 4. Dashboard Integration
- **Dashboard Event Notifier** - Sends real-time events to the dashboard
- **Cost Monitor** - Tracks token usage and sends alerts

#### 5. Learning & Quality
- **Learning Capture** - Automatically captures insights from sprints and milestones
- **Input Security Scan** - Scans user input for sensitive data

### Agent-Specific Hooks

AgileAiAgents v3.6.0 introduces specialized hooks designed for AI agent workflows, providing automated security scanning, quality gates, and productivity enhancements.

#### Hook Categories by Value and Impact

##### Critical Hooks (Security & Quality)
- **Vulnerability Scanner** - Scans dependencies for security vulnerabilities using npm/yarn audit
- **Defensive Patterns** - Enforces defensive programming patterns (optional chaining, null checks)
- **Coverage Gatekeeper** - Enforces minimum code coverage thresholds before deployment
- **Deployment Window Enforcer** - Prevents deployments outside approved time windows
- **Requirement Completeness** - Validates all requirements are met before marking stories done
- **Secret Rotation Reminder** - Tracks secret age and sends rotation reminders

##### Valuable Hooks (Team Productivity)
- **Dependency Checker** - Monitors for outdated, deprecated, and vulnerable dependencies
- **Import Validator** - Validates imports and detects circular dependencies
- **Test Categorizer** - Categorizes tests and ensures proper test balance

##### Enhancement Hooks (Code Quality)
- **Code Formatter** - Automatically formats code before commits (Prettier, Black, Gofmt, Rustfmt)
- **Commit Message Validator** - Validates commit messages against conventional standards
- **PR Template Checker** - Ensures PR descriptions follow template guidelines
- **Dead Code Detector** - Detects unused code, imports, and exports
- **Complexity Analyzer** - Analyzes cyclomatic complexity and suggests refactoring

#### Profile-Based Configuration

Agent hooks use performance profiles to balance automation with system performance:

- **Minimal Profile** (300ms budget) - Critical hooks only for minimal impact
- **Standard Profile** (500ms budget) - Critical + valuable hooks for balanced approach  
- **Advanced Profile** (1000ms budget) - Most hooks enabled for maximum quality
- **Custom Profile** - User-defined configuration

#### Smart Performance Management

All agent hooks include:
- **Automatic Performance Tracking** - Monitors execution time for every hook
- **Auto-Disable Mechanism** - Disables hooks that exceed thresholds or fail repeatedly
- **Caching System** - Reduces redundant operations for expensive checks
- **Graceful Degradation** - Continues operation even if individual hooks fail

Performance thresholds:
- Warning: 1000ms execution time
- Auto-disable: 2000ms or 5 consecutive failures
- Cache TTL: Varies by hook (0 for validation, up to 1 hour for analysis)

### Hook Configuration

#### Configuration UI
Access the web-based configuration interface:
```bash
# In your project dashboard
http://localhost:3001
# Click on the "🎣 Hooks" tab
# Or click "⚙️ Configure Hooks" button
```

The Hooks UI provides two tabs:
- **General Hooks** - System-wide hooks for sprint management, state, and monitoring
- **Agent Hooks** - Agent-specific hooks with profile selection and categorized display

#### Configuration File
Hooks can also be configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "enabled": true,
    "profile": "standard",
    "hooks": {
      "sprint-document-tracker": {
        "enabled": true,
        "config": {
          "watchPaths": ["project-documents/orchestration/sprints"],
          "updateInterval": 5000
        }
      },
      "vulnerability-scanner": {
        "enabled": true,
        "config": {
          "thresholds": {
            "critical": 0,
            "high": 0,
            "moderate": 5
          }
        }
      },
      "code-formatter": {
        "enabled": false,
        "config": {
          "formatOnSave": true,
          "formatOnCommit": true
        }
      }
    },
    "agent_hook_profiles": {
      "standard": {
        "performanceBudget": 500,
        "description": "Balanced performance and features"
      }
    }
  }
}
```

### Hook Profiles

Choose from pre-configured profiles that apply to both general and agent-specific hooks:

- **Minimal** (300ms budget) - Essential hooks only: state backup, basic tracking, critical security hooks
- **Standard** (500ms budget) - Recommended: sprint tracking, state management, monitoring, critical + valuable agent hooks
- **Advanced** (1000ms budget) - Comprehensive: all general hooks + most agent hooks for maximum quality
- **Custom** - Define your own configuration with specific hooks enabled/disabled

### Hook Events

Common events that trigger hooks:

- `file.created` - When a new file is created
- `file.modified` - When a file is updated
- `command.executed` - When a command runs
- `sprint.state.changed` - When sprint status changes
- `threshold.exceeded` - When limits are exceeded
- `session.start` / `session.end` - Session lifecycle

### Performance Monitoring

The hooks system includes built-in performance monitoring:
- Execution time tracking
- Success/failure rates
- Resource usage metrics
- Performance alerts for slow hooks

Access performance metrics at:
```
http://localhost:3001/hooks.html
# Click "Performance" tab
```

### Creating Custom Hooks

To create a custom hook:

1. Create handler in `/hooks/handlers/` (extending BaseAgentHook for agent-specific hooks):
```javascript
const BaseAgentHook = require('./shared/base-agent-hook');

class MyCustomHook extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'my-custom-hook',
      agent: 'custom_agent',
      category: 'valuable',
      impact: 'low', // low, medium, high, or async
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      ...config
    });
  }

  async handle(event) {
    // Your hook logic here
    // Automatic performance tracking, caching, and error handling
    console.log('Event received:', event);
    
    return {
      success: true,
      message: 'Hook executed successfully'
    };
  }
}

module.exports = MyCustomHook;
```

2. Register in `/hooks/registry.json`:
```json
{
  "my-custom-hook": {
    "name": "My Custom Hook",
    "description": "Description of what it does",
    "handler": "handlers/my-custom-hook.js",
    "triggers": ["file.created"],
    "priority": "helpful",
    "category": "agents/valuable"
  }
}
```

3. Add to agent defaults in `/hooks/config/agent-hooks/agent-defaults.json` for profile integration

### Security Considerations

The security scan hook automatically:
- Detects API keys, passwords, and tokens
- Identifies personally identifiable information (PII)
- Supports whitelisting for test data
- Provides real-time alerts
- Logs all detections for audit

### Best Practices

1. **Start with Standard Profile** - Provides good balance of automation
2. **Monitor Performance** - Check the performance tab regularly
3. **Review Logs** - Activity logs show what hooks are doing
4. **Customize Gradually** - Adjust individual hooks as needed
5. **Test Changes** - Use the test button before enabling hooks

### Troubleshooting Hooks

Common issues and solutions:

**Hooks not triggering:**
- Check if hooks are enabled globally
- Verify specific hook is enabled
- Check trigger configuration
- Review activity logs for errors

**Performance issues:**
- Increase timeout values
- Disable non-essential hooks
- Check for infinite loops
- Review performance metrics

**Configuration not saving:**
- Ensure proper JSON format
- Check file permissions
- Verify API endpoints are accessible

## Contributing

### Share Your Learnings
After completing projects, contribute patterns back:

```bash
# 1. Create unique folder
mkdir community-learnings/contributions/2025-01-your-project-type

# 2. Copy learning files
cp project-documents/orchestration/sprint-retrospectives/*.md \
   community-learnings/contributions/your-folder/

# 3. Submit PR
# Title: "Community Learning: [Project Type] - [Month Year]"
```

### What Makes Great Contributions
* 50%+ performance improvements
* Novel problem solutions
* Industry-specific patterns
* Cross-agent coordination insights

## Creating AgileAiAgents System Releases

**Note**: These instructions are specifically for creating new AgileAiAgents system releases, not for your project releases.

### Release Process for Maintainers

Follow this two-step process when creating a new AgileAiAgents release:

#### Step 1: Run the Create-Release Script

- update this file  for release version vX.Y.Z: @agile-ai-agents/CHANGELOG.md

```bash
cd /path/to/agile-ai-agents
./scripts/bash/create-release.sh X.Y.Z  # Replace X.Y.Z with version number
```

This script will:
- Create the release ZIP file (`agile-ai-agents-vX.Y.Z.zip`)
- Generate template release notes files (if they don't exist)
- Copy all necessary files with proper structure
- Set up the .claude directory at parent level
- Update version references in key files

#### Step 2: Update Release Notes with Claude Code

After running the script, ask Claude Code to populate the release notes:

```
"Please update the release notes @agile-ai-agents/release-notes/RELEASE-NOTES-vX.Y.Z.md and @agile-ai-agents/release-notes/GITHUB-RELEASE-NOTES-vX.Y.Z.md for vX.Y.Z based on the @agile-ai-agents/CHANGELOG.md entries"
```

Claude Code will:
- Read CHANGELOG.md to understand what changed
- Create user-friendly summaries for GITHUB-RELEASE-NOTES
- Format technical details appropriately
- Add emojis and structure for better readability
- Ensure both release notes files are properly filled

#### Step 3: Review and Publish

1. Review the generated release notes
2. Upload the ZIP file to GitHub releases
3. Use the GITHUB-RELEASE-NOTES content for the release description
4. Tag the release as `vX.Y.Z`
5. Publish the release

### Pro Tip: Enhanced Release Notes Request

For better results, use a more specific prompt like:

```
"Update release notes for vX.Y.Z. Focus on:
- Major features from CHANGELOG.md
- Migration instructions for existing users
- Any breaking changes
- Quick start guide
Make the GitHub notes exciting with emojis, and keep the user notes practical."
```

### Why This Process Works

1. **Automation handles structure**: File copying, version updates, template creation
2. **AI handles content**: Summarizing changes, formatting, user-friendly descriptions
3. **Human maintains control**: Review everything before publishing

### Pre-Release Checklist

Before creating a release:
- [ ] Update VERSION.json with new version number
- [ ] Update CHANGELOG.md with all changes
- [ ] Run tests: `npm test`
- [ ] Verify all documentation is current
- [ ] Check that examples work correctly

## Development Environment Setup

**Note**: This section is for AgileAiAgents system developers, not for users building projects with AgileAiAgents.

### Setting Up Your Dev Environment

After cloning the AgileAiAgents repository, use these commands to set up your development environment to match what users experience with releases.

#### Quick Setup

```bash
# Set up complete development environment
/setup-dev-environment

# This will prompt you to:
# 1. Copy .claude to parent directory
# 2. Copy CLAUDE.md template to parent
# 3. Reset project-state to clean templates
# 4. Reset project-documents to empty folders
# 5. Clear logs
```

#### Individual Commands

If you need to reset specific components:

```bash
# Copy components to parent directory
/copy-dot-claude-to-parent      # Copy .claude/ directory
/copy-claude-md-to-parent       # Copy CLAUDE.md template

# Reset to clean state
/project-state-reset            # Clean project state
/project-documents-reset        # Empty document folders
/community-learnings-reset      # Clear contributions
/clear-logs                     # Remove all logs

# Backup management
/backup-before-reset            # Manual backup
/restore-from-backup            # Restore from backup
/list-backups                   # View available backups
```

### Command Line Note

**Important**: The `/status` command has been renamed to `/aaa-status` to avoid conflicts with Claude Code's built-in `/status` command.

### Safety Features

- **Auto-backup**: Destructive commands automatically create backups
- **Confirmation prompts**: All commands ask before making changes
- **Restore capability**: Use `/restore-from-backup` if needed
- **Dry run**: Add `--dry-run` to preview changes

### For More Information

- Run `/aaa-help development` to see all development commands
- Check CLAUDE.md for detailed command documentation
- Backups are stored in `.backup/` (gitignored)

## Support

* **Documentation**: See `/aaa-documents/` for advanced guides
* **Issues**: [GitHub Issues](https://github.com/DiscDev/agile-ai-agents/issues)
* **Discussions**: [GitHub Discussions](https://github.com/DiscDev/agile-ai-agents/discussions)
* **Help in Claude**: `/aaa-help` command

## Author

**Phillip Darren Brown** - Creator of AgileAiAgents

## Trademark

AgileAiAgents™ is a trademark of Phillip Darren Brown. All rights reserved.

---

## 🚀 Ready to Start?

1. **Download** the latest release (don't clone!)
2. **Run** the setup script
3. **Tell Claude** to read the agile-ai-agents folder
4. **Describe** your project idea
5. **Watch** your AI team build it!

Transform your development process with 38 specialized AI agents working together. From idea to deployment, AgileAiAgents handles it all.

**Version**: 4.0.0 | **License**: MIT | **Created by**: [DiscDev](https://github.com/DiscDev)