---
title: Agent Creation Guide
type: agent-context
token_count: 1456
keywords: [create, new, agent, template, scaffold, build]
agents: [agent-admin]
---

# Agent Creation Guide - Specialized Context

## ⚠️ MANDATORY YAML FORMAT - NEVER DEVIATE ⚠️
**ALL agent files MUST use this EXACT YAML frontmatter:**
```yaml
---
name: agent-name
description: Brief description of agent purpose and capabilities
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus|sonnet|haiku
token_count: [calculated]
---
```
**FORBIDDEN fields for agent files:** `keywords`, `specialization`, `purpose`, `agents`, `type`, `title`
**Those fields are ONLY for context files, NOT agent files!**

## Creating New Agents from Scratch

### Pre-Creation Analysis
1. **Define Purpose**: Clear, specific agent function and scope
2. **Identify Capabilities**: List primary responsibilities and features
3. **Determine Complexity**: Basic agent vs specialized agent with multiple contexts
4. **Plan Integration**: Consider shared tools, logging, and documentation needs
5. **Keyword Strategy**: Design effective trigger words and context patterns

### Agent Creation Workflow

#### CRITICAL: Hook File Updates Required
**Every agent creation MUST update the hook files for proper logging:**
1. Add detection patterns to `.claude/hooks/agent-detection-hook.sh`
2. Add type extraction to `.claude/hooks/task-completion-hook.sh`
3. Validate hook syntax after modifications
4. Test that agent is properly detected

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

#### Step 2: Agent Type Selection

**Agent Build Rules** (consolidated in this guide):
- **Rule Set A: Basic Agent** - Simple, focused agents with minimal complexity
- **Rule Set B: Specialized Agent** - Complex multi-domain agents with extensive contexts  
- **Rule Set C: Reference Import** - For adapting agents from reference system

**Selection Guidelines**:
- **Basic Agent (Rule Set A)**: Simple functionality, 2-4 responsibilities, minimal contexts
- **Specialized Agent (Rule Set B)**: Complex workflows, 5+ responsibilities, multiple context files
- **Reference Import (Rule Set C)**: Adapting legacy agents from `agile-ai-agents-v7.0.0/`

#### Step 3: YAML Frontmatter Configuration (STRICT VALIDATION REQUIRED)

**MANDATORY YAML Structure** (reference: `yaml-template-mandatory.md`):
```yaml
---
name: agent-name
description: Brief description of agent purpose and capabilities
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus|sonnet|haiku
token_count: [calculated]
---
```

**Model Selection Guidelines**:
- **opus**: Complex reasoning, multi-domain expertise, advanced workflows
- **sonnet**: Balanced performance and cost, general purpose (recommended)
- **haiku**: Simple tasks, fast responses, cost-effective

## Agent Build Rules - Consolidated Templates

### Rule Set A: Basic Agent Template
*For simple, focused agents with minimal complexity*

**Use When**:
- Single domain of expertise
- Straightforward workflows
- 2-4 core responsibilities
- Minimal external integrations
- Standard shared tools only

**Structure Requirements**:
```markdown
# [Agent Name] - [Full Descriptive Title]

## Purpose
[Clear, concise description of the agent's primary function]

## Core Responsibilities
- **[Capability 1]**: [Specific functionality and scope]
- **[Capability 2]**: [Integration requirements and workflows]
- **[Capability 3]**: [Value proposition and outcomes]

## Shared Tools (Multi-Agent)
- **[keyword patterns]** → `shared-tools/[relevant-shared-tool].md`

## Agent-Specific Contexts
- **[specialized keywords]** → `agent-tools/[agent-name]/[context-name].md`

### Context Loading Logic:
1. **FIRST: Logging Check**: isLoggingEnabled()
2. **Always Load**: `agent-tools/[agent-name]/core-[agent-name]-principles.md`
3. **Conditional Loading**: Based on keywords and task requirements

## Task Analysis Examples:
**"[Example user request]"**
- **Keywords**: [detected keywords]
- **Context**: Core principles + relevant contexts

## [Domain] Workflows
### [Primary Workflow]
1. **[Step 1]**: [Action and outcome]
2. **[Step 2]**: [Process and requirements]
3. **[Step 3]**: [Integration and validation]
```

### Rule Set B: Specialized Agent Template
*For complex, multi-domain agents with extensive capabilities*

**Use When**:
- Multiple domains of expertise
- Complex, multi-step workflows
- 5+ core responsibilities
- Extensive external integrations
- Advanced shared tools integration
- Cross-system coordination required

**Structure Requirements**:
```markdown
# [Agent Name] - [Full Comprehensive Title]

## Purpose
[Detailed description of complex role and strategic importance]

## Core Responsibilities
- **[Primary Domain 1]**: [Complex functionality with integration requirements]
- **[Primary Domain 2]**: [Multi-step workflows and advanced capabilities]
- **[Primary Domain 3]**: [Cross-system integration and coordination]
- **[Secondary Capability 1]**: [Supporting functionality]
- **[Integration & Coordination]**: [Agent-to-agent communication]

## Shared Tools (Multi-Agent) - Extensive Integration
- **[domain1, keywords, patterns]** → `shared-tools/[tool-1].md`
- **[domain2, advanced, terms]** → `shared-tools/[tool-2].md`
- **[integration, workflow, automation]** → `shared-tools/[workflow-tool].md`
- **[monitoring, performance, analytics]** → `shared-tools/[analytics-tool].md`

## Agent-Specific Contexts - Complex Domain Knowledge
- **[core, fundamental, principles]** → `agent-tools/[agent-name]/core-[agent-name]-principles.md`
- **[advanced, specialized, procedures]** → `agent-tools/[agent-name]/advanced-[domain]-procedures.md`
- **[integration, coordination, workflows]** → `agent-tools/[agent-name]/integration-workflows.md`
- **[troubleshooting, debugging, resolution]** → `agent-tools/[agent-name]/troubleshooting-guide.md`
- **[optimization, performance, tuning]** → `agent-tools/[agent-name]/performance-optimization.md`

### Context Loading Logic - Advanced:
1. **FIRST: Logging Check**: isLoggingEnabled()
2. **Always Load**: Core principles (foundational knowledge)
3. **Priority Loading**: Most relevant contexts first
4. **Shared Tools**: Extensive integration based on expertise
5. **Cross-Domain**: Load comprehensive context set for multi-domain tasks
6. **Advanced Workflows**: Load procedural contexts for complex processes
7. **Fallback Strategy**: Complete context suite for ambiguous requests

## Advanced Domain Workflows
### [Primary Complex Workflow]
1. **Requirements Analysis Phase**: [Detailed procedures]
2. **Architecture Design Phase**: [System design patterns]
3. **Implementation Coordination**: [Multi-system strategies]
4. **Integration and Testing**: [Cross-system validation]
5. **Deployment and Monitoring**: [Production strategies]

### Specialized Infrastructure Requirements
```
Context Architecture:
.claude/agents/agent-tools/[agent-name]/
├── core-[agent-name]-principles.md      # 800-1000 tokens
├── advanced-[domain]-procedures.md      # 1200-1500 tokens  
├── integration-workflows.md             # 1000-1200 tokens
├── troubleshooting-guide.md            # 800-1000 tokens
├── performance-optimization.md         # 600-800 tokens
└── specialized-contexts/               # Additional contexts
```
```

### Rule Set C: Reference Import Template
*For adapting agents from the reference system*

**Use When**:
- Importing from `agile-ai-agents-v7.0.0/`
- Modernizing legacy agents
- Preserving existing functionality while updating architecture
- Converting to current infrastructure patterns

**Structure Requirements**:
```markdown
# [Imported Agent Name] - [Enhanced Title with Modern Context]

## Purpose - [Modernized and Enhanced]
[Original purpose enhanced with modern capabilities]

## Import Information
**Source**: `agile-ai-agents-v7.0.0/.claude/agents/[original-file].md`
**Import Date**: [Current Date]
**Adaptations Made**: [Summary of key changes]
**Enhancement Level**: [Minimal|Moderate|Extensive]

## Core Responsibilities - [Enhanced from Original]
- **[Original Capability 1 - Enhanced]**: [Modernized with current tools]
- **[Original Capability 2 - Updated]**: [Updated with AgileBiz integration]
- **[New Capability - Added]**: [New functionality based on current needs]

## Import Adaptations and Modernizations
### Original vs. Current Architecture
- **[Original Tool/Technology]** → **[Current Tool/Technology]**
- **[Legacy Process]** → **[Modern Process]**
- **[Old Integration]** → **[Current Integration]**

### Enhanced Capabilities Added During Import
1. **[New Capability 1]**: [Not in original, added for current needs]
2. **[Enhanced Process 2]**: [Original enhanced with modern practices]
3. **[Integration Feature 3]**: [New AgileBiz infrastructure integration]

## Migration Notes and Change Log
### Original Agent Analysis
- **Original Purpose**: [Reference agent design intent]
- **Original Capabilities**: [Key reference capabilities]
- **Original Architecture**: [Reference structure]

### Adaptation Decisions
- **Technology Updates**: [Why technologies were updated]
- **Process Enhancements**: [How processes were improved]
- **Integration Additions**: [What integrations were added]

### Import Challenges and Solutions
- **Challenge 1**: [Issue] → **Solution**: [Resolution]
- **Challenge 2**: [Compatibility] → **Solution**: [Adaptation]
```

## Mandatory Build Components

### Required Sections (All Agent Types)
1. **YAML Frontmatter** - Correct structure mandatory
2. **Purpose** - Clear agent function description
3. **Core Responsibilities** - Bulleted capability list
4. **Shared Tools** - Keyword mappings to shared-tools/
5. **Agent-Specific Contexts** - Keyword mappings to agent-tools/[name]/
6. **Context Loading Logic** - 7-step loading procedure
7. **Task Analysis Examples** - Usage patterns with keywords
8. **Domain Workflows** - Step-by-step processes
9. **Success Criteria** - Measurable outcomes
10. **Token Usage Optimization** - Efficiency strategies

### Optional Enhancement Sections
- **Integration Patterns** - For specialized agents
- **Quality Standards** - Domain-specific requirements
- **Advanced Workflows** - Multi-phase procedures
- **Emergency Procedures** - For critical system agents
- **Performance Metrics** - Advanced monitoring
- **Cross-Agent Coordination** - Agent-to-agent communication

### Infrastructure Integration Requirements
1. **Logging System Integration**
   ```markdown
   ### Context Loading Logic:
   1. **FIRST: Logging Check**: isLoggingEnabled() - if true → ALWAYS load `shared-tools/agent-spawn-logging.md`
      - **MANDATORY EXECUTION**: `node .claude/scripts/agents/logging/logging-functions.js full-log [agent-type] "[user request]"`
   ```

2. **CLAUDE.md Documentation Updates**
   - Agent must be added to workspace instructions
   - Usage examples and trigger keywords
   - Integration with existing infrastructure

3. **Context File Creation**
   - `core-[agent-name]-principles.md` (always required)
   - Additional contexts based on complexity
   - Proper token count calculation

### Token Optimization Rules
1. **Shared Tools Priority** - Use existing shared tools before creating new contexts
2. **Conditional Loading** - Only load relevant contexts per request
3. **Context Size Limits** - 800-1500 tokens per context file
4. **Duplication Prevention** - No duplicate content across contexts
5. **Performance Monitoring** - Track token usage efficiency

**⚠️ MANDATORY: USE ONLY THE FORMAT IN `yaml-template-mandatory.md`**

**CRITICAL: MUST USE EXACT YAML FORMAT - NO EXCEPTIONS**
```yaml
---
name: agent-name
description: Brief description of agent purpose and capabilities
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus|sonnet|haiku
token_count: [calculated]
---
```

**NEVER USE THESE FORBIDDEN FORMATS:**
```yaml
# ❌ WRONG - NEVER USE THESE FIELDS:
agentName: agent-name  # Use 'name' not 'agentName'
agentRole: ...         # Use 'description' not 'agentRole'  
modelName: claude-...  # Use 'model' not 'modelName'
temperature: 0.3       # Do not include temperature field
provider: anthropic    # Claude Desktop format - FORBIDDEN
maxTokens: 1000        # Claude Desktop format - FORBIDDEN
contextWindow: 16384   # Claude Desktop format - FORBIDDEN
```

**YAML Validation Requirements:**
- **Field Names**: MUST use exact field names (name, description, tools, model, token_count)
- **Model Values**: MUST be one of: opus, sonnet, haiku (not full model IDs)
- **Tools Array**: MUST be an array of tool names in square brackets
- **Token Count**: MUST be a number representing total context tokens
- **No Extra Fields**: DO NOT add temperature, agentName, agentRole, provider, maxTokens, contextWindow, or ANY other fields

**Example of CORRECT YAML:**
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

## Shared Tools (Multi-Agent) - ONLY INCLUDE RELEVANT TOOLS

**CRITICAL**: Only include shared tools the agent would actually use. Review each tool:

**Available Shared Tools:**
- **context7-mcp-integration.md**: API access, documentation, libraries (most agents need)
- **github-mcp-integration.md**: Git repositories, PRs, code management (developer-focused)
- **docker-containerization.md**: Container builds, deployments (devops-focused)
- **git-version-control.md**: Basic git workflows (developer/devops-focused)
- **supabase-mcp-integration.md**: Database, backend, auth (data/backend-focused)
- **aws-infrastructure.md**: Cloud services, infrastructure (devops/infrastructure-focused)

**Selection Guidelines by Agent Type:**
- **Developer agents**: context7, github, git, docker (for coding tasks)
- **DevOps agents**: context7, github, git, docker, aws (for infrastructure)
- **Data agents**: context7, supabase (for data and APIs)
- **Domain specialists**: context7 only (for documentation/API access)
- **Creative agents**: context7 only (for research and documentation)

**Example for Weather Agent:**
- **context7, mcp, documentation, library, api, weather-api, noaa, nws** → `shared-tools/context7-mcp-integration.md`

**Example for Music Agent:**
- **context7, mcp, documentation, library, api, music-theory, daw, production** → `shared-tools/context7-mcp-integration.md`

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
   - **MANDATORY EXECUTION**: When logging is enabled, IMMEDIATELY execute: `node .claude/scripts/agents/logging/logging-functions.js full-log {agent-type} "[user request]"`
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
3. **⚠️ CRITICAL: Parse Agent File for Referenced Context Files**
   - **Scan agent file** for all `agent-tools/{agent-name}/filename.md` references
   - **Extract ALL context file paths** mentioned in the agent
   - **Create EVERY referenced context file** - no exceptions
   - **Validate file references match created files** 
4. **Implement Context Files**: Core principles and ALL specialized contexts
5. **Calculate Token Counts**: Update frontmatter with accurate counts
6. **Test Context Loading**: Verify keyword patterns work correctly

### ⚠️ MANDATORY: Context File Creation Validation

**BEFORE completing agent creation, ALWAYS:**

1. **Parse Agent Content**: Extract all `agent-tools/{agent-name}/` references
2. **Create Missing Files**: Generate any referenced context files that don't exist
3. **Validate Completeness**: Ensure EVERY referenced file exists on disk
4. **No Broken References**: Agent must never reference non-existent context files

**Context File Creation Template**:
```markdown
---
title: [Context Title]
type: agent-context
token_count: [calculated]
keywords: [relevant, keywords, for, loading]
agents: [{agent-name}]
---

# [Context Title] - [Agent Name] Specialized Context

## Overview
[Purpose and scope of this context]

## [Main Section]
[Comprehensive content covering the context topic]

## Integration with [Agent Name]
[How this context integrates with agent workflows]

## Success Criteria
- [Specific outcomes this context enables]

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)
```

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

#### Step 10: Agent Logging Registration

**CRITICAL**: Add new agent to logging system for activity tracking:

1. **Update agent-spawn-logging.md**: Add agent-name to agents array
   - File: `.claude/agents/shared-tools/agent-spawn-logging.md`
   - Find line: `agents: [developer, devops, agent-admin]`
   - Add new agent: `agents: [developer, devops, agent-admin, new-agent-name]`
   - Maintain alphabetical order in the array

2. **Verification Steps**:
   - Confirm agent appears in agents array
   - Validate YAML syntax remains correct
   - Ensure no duplicate entries

**Example Update:**
```yaml
# Before
agents: [developer, devops, agent-admin]

# After (adding "tester" agent)
agents: [agent-admin, developer, devops, tester]
```

**Why This Matters:**
- Without logging registration, new agents cannot log their activities
- Logging is essential for debugging, monitoring, and optimization
- All agents must have equal access to logging infrastructure

#### Step 11: Testing and Validation

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