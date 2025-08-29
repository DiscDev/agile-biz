# AgileBiz Workspace - Project Rebuild

## CRITICAL: Reference-Only Folder
**NEVER MODIFY agile-ai-agents-v7.0.0/ - THIS IS REFERENCE ONLY**
- agile-ai-agents-v7.0.0/ contains the source system for reference
- This folder must remain untouched and unmodified
- Only READ from this folder for analysis and understanding
- All rebuild implementation work goes in agile-biz/ and .claude/ folders only
- All rebuild planning work goes in rebuild-planning/ folder only

## Rebuild Project Structure
- **Reference Source**: agile-ai-agents-v7.0.0/ (READ ONLY - do not modify)
- **Planning Documents**: rebuild-planning/ (all analysis, strategy, and planning docs)
- **Implementation Target**: agile-biz/ (rebuild destination for business logic)
- **Claude Integration**: .claude/ (commands, agents, hooks, settings)

## 🚨 CRITICAL: Workspace Path Enforcement 🚨
**ABSOLUTE WORKSPACE PATH**: `/Users/phillipbrown/No-iCloud-Folder/AgileBiz/agile-biz-workspace/`

### ⚠️ PATH RULES - NEVER VIOLATE ⚠️:
- ✅ **CORRECT**: All work in `/Users/phillipbrown/No-iCloud-Folder/AgileBiz/agile-biz-workspace/`
- ❌ **FORBIDDEN**: Never create or use `/Users/phillipbrown/No-iCloud-Folder/AgileBiz/agile-bz-workspace/`
- ❌ **FORBIDDEN**: Never create or use any variation of "agile-bz-workspace"
- ❌ **FORBIDDEN**: Never create "agile-bz-workspace" in any location
- ✅ **REQUIRED**: Always use full absolute paths when creating files
- ✅ **REQUIRED**: Always double-check paths contain "agile-biz-workspace" (not "agile-bz-workspace")
- ✅ **VALIDATION**: Before any file operation, verify the path includes "agile-biz-workspace"

### 🔍 Common Path Errors to Avoid:
- `agile-bz-workspace` (WRONG - missing 'i' in 'biz')
- `agile-bz-` (WRONG - truncated)
- Any variation that is NOT exactly `agile-biz-workspace`

**IF YOU ACCIDENTALLY CREATE THE WRONG PATH, IMMEDIATELY STOP AND MOVE FILES TO THE CORRECT LOCATION**

## Workspace Rules
1. NEVER modify files in agile-ai-agents-v7.0.0/
2. Only read/analyze agile-ai-agents-v7.0.0/ for reference
3. All planning documents go in rebuild-planning/
4. All implementation goes in agile-biz/ and .claude/ folders
5. Stay in planning mode until explicitly told to implement
6. Create comprehensive planning documents before any implementation

## Folder Purposes
- **rebuild-planning/**: Strategy docs, analysis reports, architecture plans, migration guides
- **agile-biz/**: Business logic, core application, project structure
- **.claude/**: Claude Code integration (commands, agents, hooks, statusline)
- **agile-ai-agents-v7.0.0/**: Reference system for analysis and understanding

## Specialized Agents

### Available Claude Code Agents

The workspace has specialized Claude Code agents for specific tasks:

#### **Developer Agent** (`developer`)
- **Purpose**: Software implementation, code quality, and technical architecture
- **Triggers**: "developer agent", "dev agent", "implement", "code", "build", "create app", "frontend", "backend"
- **Capabilities**: 
  - Code generation (HTML, CSS, JavaScript, React, Node.js)
  - Code refactoring and quality improvement
  - Project scaffolding and setup
  - Development workflows and best practices
  - GitHub integration and version control
- **Model**: Claude 3.5 Opus (complex reasoning for coding tasks)

#### **DevOps Agent** (`devops`)
- **Purpose**: Infrastructure management, deployment automation, operational excellence
- **Triggers**: "devops agent", "deploy", "infrastructure", "docker", "kubernetes", "aws", "ci/cd"
- **Capabilities**:
  - Infrastructure provisioning (Terraform, CloudFormation)
  - Container orchestration (Docker, Kubernetes)
  - CI/CD pipeline management
  - Monitoring and observability setup
  - Security and compliance automation
- **Model**: Claude 3.5 Opus (complex reasoning for infrastructure tasks)

#### **Agent Admin** (`agent-admin`)
- **Purpose**: Claude Code agent infrastructure management and lifecycle operations
- **Triggers**: "agent-admin", "create agent", "new agent", "edit agent", "delete agent", "import agent", "agent management"
- **Capabilities**:
  - Create new agents from scratch using templates
  - Import and adapt agents from reference files
  - Edit existing agent configurations and contexts
  - Delete obsolete agents and clean up infrastructure
  - Validate agent YAML frontmatter and structure
  - Optimize context loading and token usage
  - Automatically update CLAUDE.md documentation
- **Model**: Claude 3.5 Opus (complex reasoning for infrastructure management)

#### **Content Writer** (`content-writer`)
- **Purpose**: Comprehensive content creation agent specializing in blog writing, SEO optimization, content editing, social media adaptation, and research with fact-checking capabilities
- **Triggers**: "content writer", "content-writer", "blog writer", "blog writing", "content creation", "seo optimization", "content editing", "social media content", "research fact-check"
- **Capabilities**:
  - Blog writing and content creation
  - SEO optimization and keyword analysis
  - Content editing and proofreading
  - Social media content adaptation
  - Research and fact-checking
  - Content strategy and planning
  - Brand voice consistency
  - Performance optimization
- **Model**: Claude 3.5 Sonnet (balanced creativity and analytical capabilities for content tasks)

#### **Finance Agent** (`finance`)
- **Purpose**: Provides comprehensive financial analysis and planning services including budgeting, investment analysis, and financial reporting
- **Triggers**: "finance", "financial", "budget", "investment", "portfolio", "accounting", "tax", "financial analysis", "financial planning"
- **Capabilities**:
  - Financial planning and budgeting
  - Investment analysis and portfolio management
  - Financial reporting and data analysis
  - Risk assessment and mitigation strategies
  - Tax planning and compliance guidance
  - Integration with financial APIs and market data feeds
  - Accounting system integrations
  - Real-time market data analysis
- **Model**: Claude 3.5 Sonnet (balanced capabilities for financial analysis and calculations)



### Agent Usage Examples

When you want to delegate specific tasks to agents, use these patterns:

- **"Have developer agent create a React component"** → Spawns developer agent
- **"DevOps agent deploy this to AWS"** → Spawns devops agent
- **"Developer agent implement authentication"** → Spawns developer agent
- **"Get devops agent to set up monitoring"** → Spawns devops agent
- **"Agent-admin create a new testing agent"** → Spawns agent-admin
- **"Finance agent create a budget for Q1"** → Spawns finance agent
- **"Have finance analyze our investment portfolio"** → Spawns finance agent
- **"Content-writer create a blog post about digital marketing"** → Spawns content-writer agent
- **"Have content writer optimize this article for SEO"** → Spawns content-writer agent
- **"Content-writer adapt this blog for social media"** → Spawns content-writer agent

### Agent Context Architecture

All agents use a shared tools architecture for efficiency:
- **Shared Tools**: Docker, GitHub, AWS, Git, Context7 MCP, Supabase MCP
- **Agent-Specific Contexts**: Loaded based on keywords and task requirements
- **Token Optimization**: 75-80% reduction in context duplication
- **Agent Logging**: Optional logging system tracks agent spawning and context usage

## Git Commit Messages

When creating git commits, **ALWAYS** use the following attribution format instead of the default Claude Code message:

```
[Your commit message here]

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
```

**Do NOT use** the default Claude Code attribution (`🤖 Generated with Claude Code`).

- Add to memory naming convention for folders and files is lower case with dashes.  Example: my-example.md