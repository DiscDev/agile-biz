---
title: Agent Creation Guide
type: agent-context
token_count: 1456
keywords: [create, new, agent, template, scaffold, build]
agents: [agent-admin]
---

# Agent Creation Guide - Specialized Context

## Creating New Agents from Scratch

### Pre-Creation Analysis
1. **Define Purpose**: Clear, specific agent function and scope
2. **Identify Capabilities**: List primary responsibilities and features
3. **Determine Complexity**: Basic agent vs specialized agent with multiple contexts
4. **Plan Integration**: Consider shared tools, logging, and documentation needs
5. **Keyword Strategy**: Design effective trigger words and context patterns

### Agent Creation Workflow

#### Step 1: Requirements Gathering
```markdown
Agent Requirements Template:
- **Name**: Agent identifier (kebab-case for file, Title Case for display)
- **Purpose**: One sentence description of primary function
- **Scope**: Boundaries of what the agent handles
- **Capabilities**: List of specific functionalities
- **Model**: opus (complex reasoning), sonnet (balanced), haiku (simple tasks)
- **Keywords**: Primary trigger words and patterns
- **Contexts**: Required shared tools and agent-specific contexts
- **Integration**: Logging, documentation, and infrastructure needs
```

#### Step 2: Template Selection
- **Basic Agent**: Simple functionality, minimal contexts
- **Specialized Agent**: Complex workflows, multiple context files
- **Domain-Specific**: Highly specialized for particular technology/domain
- **Multi-Function**: Handles diverse but related capabilities

#### Step 3: YAML Frontmatter Configuration
```yaml
---
name: agent-name
description: Brief description of agent purpose and capabilities
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus|sonnet|haiku
token_count: [to be calculated]
---
```

**Field Requirements:**
- **name**: Agent name in kebab-case (e.g., "my-agent")
- **description**: Brief description of agent purpose and capabilities
- **tools**: Standard tool set [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
- **model**: Choose based on complexity (opus/sonnet/haiku)
- **token_count**: Calculate after completion

#### Step 4: Agent Structure Implementation

**Basic Structure Template:**
```markdown
# Agent Name - Full Title

## Purpose
Detailed description of agent's primary function and role

## Core Responsibilities
- Specific capability 1 with clear scope
- Specific capability 2 with implementation details
- Integration and workflow requirements

## Shared Tools (Multi-Agent)
- **keyword patterns** → `shared-tools/tool-name.md`

## Agent-Specific Contexts (if needed)
- **keyword patterns** → `agent-tools/agent-name/context-name.md`

### Context Loading Logic:
1. **FIRST: Logging Check**: isLoggingEnabled() - automatic logging integration
2. **Always Load**: Core agent principles or base knowledge
3. **Conditional Loading**: Based on keywords and task requirements
4. **Optimization**: Token-efficient context patterns

## Task Analysis Examples:
**"Example user request"**
- **Keywords**: detected, words, patterns
- **Context**: loaded, context, files

## Integration Requirements
- Logging system integration
- CLAUDE.md documentation
- Token optimization
- AgileBiz attribution
```

#### Step 5: Context Loading Logic Design

**Standard Pattern:**
```markdown
### Context Loading Logic:
1. **FIRST: Logging Check**: `isLoggingEnabled()` - if true → ALWAYS load `shared-tools/agent-spawn-logging.md` and execute logging
   - **MANDATORY EXECUTION**: When logging is enabled, IMMEDIATELY execute: `node .claude/agents/scripts/logging/logging-functions.js full-log {agent-type} "[user request]"`
   - **Log Agent Spawn**: Extract keywords, generate agent ID, log spawn event and context loading
   - **Error Handling**: If logging fails, continue with agent execution
2. **Always Load**: `agent-tools/{agent-type}/core-{type}-principles.md` (base knowledge)
3. **Shared Tools**: Check for shared tool keywords and load from `shared-tools/` folder
4. **Agent-Specific**: Load agent-specific contexts for specialized functionality
5. **Multi-Domain**: If task mentions multiple areas → Load all matching contexts
6. **Fallback**: If task is ambiguous/no matches → Load comprehensive context
7. **Token Optimization**: Shared tools reduce duplication and improve efficiency
```

#### Step 6: Shared Tools Integration

**Available Shared Tools:**
- `context7-mcp-integration.md` - Documentation and library access
- `github-mcp-integration.md` - Git workflows and repository management
- `docker-containerization.md` - Container management
- `git-version-control.md` - Version control best practices
- `supabase-mcp-integration.md` - Database and backend services
- `aws-infrastructure.md` - Cloud infrastructure
- `agent-spawn-logging.md` - Activity tracking

**Keyword Mapping Examples:**
```markdown
## Shared Tools (Multi-Agent)
- **context7, mcp, documentation, library** → `shared-tools/context7-mcp-integration.md`
- **github, git, repository, pr, branch** → `shared-tools/github-mcp-integration.md`
- **docker, container, image, deploy** → `shared-tools/docker-containerization.md`
```

#### Step 7: Agent-Specific Context Planning

**When to Create Agent-Specific Contexts:**
- Specialized domain knowledge not shared with other agents
- Complex workflows specific to agent function
- Detailed procedures and standards for agent domain
- Reference materials and examples for agent tasks

**Context File Structure:**
```
.claude/agents/agent-tools/{agent-name}/
├── core-{agent-name}-principles.md    # Always loaded
├── specialized-context-1.md           # Keyword-based loading
├── specialized-context-2.md           # Keyword-based loading
└── reference-materials.md             # Additional resources
```

#### Step 8: File Creation Process

1. **Create Agent File**: `.claude/agents/{agent-name}.md`
2. **Create Context Directory**: `.claude/agents/agent-tools/{agent-name}/` (if needed)
3. **Implement Context Files**: Core principles and specialized contexts
4. **Calculate Token Counts**: Update frontmatter with accurate counts
5. **Test Context Loading**: Verify keyword patterns work correctly

#### Step 9: CLAUDE.md Documentation

**Required Documentation Format:**
```markdown
#### **Agent Name** (`agent-keyword`)
- **Purpose**: Brief description of agent's primary function
- **Triggers**: "trigger phrases", "keywords", "patterns that spawn this agent"
- **Capabilities**:
  - List of primary capabilities
  - Key functionalities
  - Integration points
- **Model**: Claude model being used (opus, sonnet, haiku)
```

**Documentation Process:**
1. Read existing CLAUDE.md agent section
2. Generate agent documentation block
3. Insert in alphabetical order after existing agents
4. Validate formatting matches existing entries
5. Preserve surrounding documentation structure

#### Step 10: Testing and Validation

**Validation Checklist:**
- ✅ YAML frontmatter parses correctly
- ✅ Keywords trigger correct context loading
- ✅ Logging integration functions properly
- ✅ Agent responds appropriately to test requests
- ✅ CLAUDE.md documentation complete
- ✅ Token counts accurate
- ✅ No conflicts with existing agents

**Test Scenarios:**
1. **Basic Functionality**: Simple request matching agent purpose
2. **Context Loading**: Verify correct contexts load based on keywords
3. **Logging Integration**: Confirm agent spawns are logged when enabled
4. **Documentation**: Check CLAUDE.md entry appears correctly
5. **Performance**: Monitor token usage and optimization

### Advanced Creation Patterns

#### Multi-Domain Agent
For agents handling multiple related domains:
- Broader keyword patterns
- Multiple shared tool integrations
- Flexible context loading logic
- Comprehensive capability documentation

#### Highly Specialized Agent
For narrow, deep expertise:
- Specific, targeted keywords
- Extensive agent-specific contexts
- Domain reference materials
- Detailed procedural knowledge

#### Workflow Automation Agent
For process and automation tasks:
- Process-oriented keywords
- Step-by-step procedural contexts
- Integration with external tools
- Workflow documentation and examples

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)