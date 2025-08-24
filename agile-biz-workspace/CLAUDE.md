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

### Agent Usage Examples

When you want to delegate specific tasks to agents, use these patterns:

- **"Have developer agent create a React component"** → Spawns developer agent
- **"DevOps agent deploy this to AWS"** → Spawns devops agent
- **"Developer agent implement authentication"** → Spawns developer agent
- **"Get devops agent to set up monitoring"** → Spawns devops agent

### Agent Context Architecture

Both agents use a shared tools architecture for efficiency:
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