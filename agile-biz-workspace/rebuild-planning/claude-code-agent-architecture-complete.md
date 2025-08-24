---
title: "Claude Code Agent Architecture - Complete Implementation Guide"
type: "documentation"
category: "rebuild-planning"
token_count: 2495
---

# Claude Code Agent Architecture - Complete Implementation Guide

## Overview

This document provides complete documentation for creating Claude Code agents using the shared tools architecture. It covers context management, markdown file referencing, hierarchical loading, and everything needed to maintain consistency when creating future agents.

### Core Philosophy
The shared tools architecture addresses agent context bloat by extracting commonly used tools into shared context files that multiple agents can reference. This approach reduces token usage by 75-80% while maintaining full functionality and creates a scalable foundation for agent development.

## The Problem

**Context Duplication**: Multiple agents were duplicating the same tool information:
- Context7 MCP Server setup: 180 lines × 15 agents = 2,700 duplicated lines
- GitHub MCP Server setup: 200 lines × 12 agents = 2,400 duplicated lines  
- Docker configuration: 150 lines × 8 agents = 1,200 duplicated lines

**Token Inefficiency**: Agents loaded irrelevant context for simple tasks
- Developer agent: 1,406 lines loaded for every task
- Simple "fix bug" task loaded Docker, GitHub, Context7, and database info unnecessarily

## The Solution

### Shared Tools Structure
```
.claude/agents/
├── shared-tools/
│   ├── context7-mcp-integration.md      # Documentation & API access (15+ agents)
│   ├── github-mcp-integration.md        # Repository & CI/CD (12+ agents)
│   ├── docker-containerization.md       # Container deployment (8+ agents)  
│   ├── git-version-control.md          # Version control (20+ agents)
│   ├── supabase-mcp-integration.md     # Backend services (6+ agents)
│   └── [future shared tools]
├── developer/
│   ├── core-principles.md               # Always loaded
│   ├── code-quality-standards.md       # Developer-specific
│   └── [other dev contexts]
└── devops/
    ├── core-principles.md               # Always loaded  
    ├── infrastructure-management.md     # DevOps-specific
    └── [other devops contexts]
```

### Agent-Specific Content in Shared Tools

Each shared tool includes sections for different agent perspectives:

```markdown
## Agent-Specific Usage

### For Developer Agents
- Implementation and coding patterns
- Integration with development workflows

### For DevOps Agents  
- Deployment and infrastructure management
- Production configuration and monitoring

### For Testing Agents
- Test environment setup
- Automated testing integration
```

## Context Router Enhancement

### Before: Simple Keyword Mapping
```
"docker setup" → development-tools.md (entire 500-line file)
```

### After: Hierarchical Loading
```
"docker setup" → shared-tools/docker-containerization.md (specific context)
"refactor code" → code-quality-standards.md (agent-specific)
```

### Router Logic Flow
1. **Always Load**: `core-principles.md` (agent base knowledge)
2. **Shared Tools First**: Check keywords for multi-agent tools
3. **Agent-Specific**: Load specialized contexts for the agent
4. **Multi-Domain**: Load multiple contexts if task spans areas
5. **Fallback**: Load all contexts for ambiguous requests

## Implementation Pattern

### Step 1: Identify Shared Tools
Research agents to find duplicated content:
```bash
grep -r "Context7 MCP" .claude/agents/  # Find shared tools
grep -r "GitHub MCP" .claude/agents/   # Identify duplication
```

### Step 2: Extract to Shared Tools
Create comprehensive shared tool files with:
- **Overview & Capabilities**
- **Agent-Specific Usage Sections** 
- **Core Tool Documentation**
- **Common Workflows**
- **Troubleshooting & Setup**

### Step 3: Update Agent Context Routers
Modify agent keyword maps to prioritize shared tools:
```markdown
#### Shared Tools (Multi-Agent)
- **docker, container** → `shared-tools/docker-containerization.md`

#### Agent-Specific Contexts  
- **refactor, quality** → `code-quality-standards.md`
```

### Step 4: Verify Token Efficiency
Test context loading for various scenarios:
- Simple tasks should load minimal context
- Complex tasks can load multiple contexts
- Fallback ensures no functionality is lost

## Benefits Achieved

### Token Efficiency
- **Developer Agent**: 1,406 lines → 200-400 lines average (70% reduction)
- **Cross-Agent**: Eliminated ~5,000 lines of duplication
- **Smart Loading**: Context relevant to actual task

### Maintainability  
- **Single Source of Truth**: Update shared tools once, affects all agents
- **Consistency**: All agents get identical tool information
- **Scalability**: Easy to add new shared tools as patterns emerge

### Agent Performance
- **Faster Loading**: Less context to process
- **Better Focus**: More relevant information per token
- **Preserved Capability**: Fallback ensures full functionality

## Future Expansion

### Implemented Shared Tools
- **context7-mcp-integration.md** ✅ - Documentation & API access (15+ agents)
- **github-mcp-integration.md** ✅ - Repository & CI/CD (12+ agents)
- **docker-containerization.md** ✅ - Container deployment (8+ agents)
- **git-version-control.md** ✅ - Version control (20+ agents)
- **supabase-mcp-integration.md** ✅ - Backend services (6+ agents)
- **aws-infrastructure.md** ✅ - AWS services (DevOps, Developer, DBA)

### Planned Additional Shared Tools
- **testing-frameworks.md** - Jest, PyTest, etc. (Developer, Testing)
- **monitoring-tools.md** - Logging, metrics (DevOps, Developer, DBA)
- **security-tools.md** - Auth, encryption (Security, Developer, DevOps)

### Agent Coverage
- **High Priority**: DevOps, Testing, DBA (infrastructure overlap)
- **Medium Priority**: API, Security, ML (tool overlap)
- **Low Priority**: Marketing, Content (minimal tool overlap)

## Implementation Guidelines

### When to Create Shared Tools
- Tool used by **3+ agents**
- **Substantial content** (100+ lines)
- **Clear agent-specific use cases**
- **Stable, well-defined functionality**

### When to Keep Agent-Specific
- **Unique to one agent type**
- **Highly specialized workflows**  
- **Frequent customization needs**
- **Small content blocks** (<50 lines)

### File Organization
```
shared-tools/
├── [tool-name]-[primary-function].md
├── README.md (index of all shared tools)
└── [category folders if needed]

agent-name/
├── core-principles.md (always loaded)
├── [specialized-context].md  
└── [workflow-specific].md
```

## Success Metrics

### Quantitative
- **Token Reduction**: 75-80% reduction in duplicated context
- **Context Relevance**: 90%+ of loaded context used in response
- **Loading Performance**: Faster agent initialization
- **Maintenance Efficiency**: Single updates affect multiple agents

### Qualitative  
- **Agent Responses**: Maintained quality with reduced context
- **Tool Accuracy**: Consistent tool information across agents
- **Developer Experience**: Easier agent maintenance and updates
- **Scalability**: Simple process to add new agents

## Complete Agent Creation Process

### Phase 1: Analysis and Planning
1. **Analyze Existing Agent** (if converting from monolithic)
   - Count total lines and identify major sections
   - Map content to shared tools vs agent-specific needs
   - Document external file references to integrate

2. **Identify Shared Tool Requirements**
   - Check existing shared tools for reuse
   - Identify new shared tools needed (3+ agent usage)
   - Plan agent-specific sections within shared tools

### Phase 2: Shared Tools Preparation
1. **Create New Shared Tools** (if needed)
   - Follow naming convention: `[tool-name]-[function].md`
   - Include comprehensive documentation
   - Add agent-specific usage sections
   - Provide real-world examples and workflows

2. **Update Existing Shared Tools** (if needed)
   - Add agent-specific usage sections
   - Expand coverage for new use cases
   - Maintain consistency across all agent perspectives

### Phase 3: Agent Creation
1. **Create Main Agent File** (`agent-name.md`)
   - Agent overview and description
   - Context loading strategy with keyword mapping
   - Task analysis examples
   - Clear boundaries (what agent does NOT do)

2. **Create Core Principles** (`agent-name/core-principles.md`)
   - Always loaded base knowledge
   - Primary responsibilities
   - Quality standards and requirements
   - Success metrics

3. **Create Specialized Context Files**
   - Break down agent-specific functionality
   - 200-500 lines per context file (optimal size)
   - Include comprehensive examples and configurations
   - Follow "when to load" keyword documentation

### Phase 4: Context Router Implementation
1. **Keyword Mapping Structure**
   ```markdown
   #### Shared Tools (Multi-Agent)
   - **keyword, keyword** → `shared-tools/tool-name.md`
   
   #### Agent-Specific Contexts
   - **keyword, keyword** → `specific-context.md`
   ```

2. **Loading Logic Hierarchy**
   - Always Load: `core-principles.md`
   - Shared Tools First: Check shared tool keywords
   - Agent-Specific: Load specialized contexts
   - Multi-Domain: Load multiple contexts if needed
   - Fallback: Load all contexts for ambiguous requests

3. **Task Analysis Examples**
   - Provide 5-8 concrete examples
   - Show keyword identification
   - Demonstrate context loading decisions
   - Include complex multi-domain scenarios

### Phase 5: Quality Assurance
1. **Content Integration Verification**
   - Ensure all external references are integrated
   - Check for broken internal links
   - Verify no duplicate content across contexts

2. **Context Loading Testing**
   - Test simple tasks (minimal context loading)
   - Test complex tasks (appropriate multi-context loading)
   - Verify fallback scenarios work properly

3. **Documentation Completeness**
   - All contexts have "when to load" sections
   - Keywords are clearly mapped
   - Examples are practical and actionable
   - Universal guidelines are included

## Detailed Implementation Lessons

### What Worked Exceptionally Well
- **Hierarchical keyword mapping** with shared tools priority
- **Agent-specific sections** in shared tools maintain perfect relevance
- **Fallback to all contexts** ensures zero functionality loss
- **Comprehensive shared tools** eliminate cross-references completely
- **Real-world examples** in every context make agents immediately useful
- **"When to load" documentation** makes context selection transparent

### Critical Success Factors
- **Token efficiency** achieved through smart context loading
- **Maintainability** via single source of truth for shared tools
- **Scalability** through reusable shared tool architecture
- **Consistency** across all agents using same shared tools
- **Flexibility** with fallback ensuring no edge case failures

### Technical Implementation Details
- **Context file size**: 200-500 lines optimal for focused loading
- **Keyword overlap handling**: Shared tools always take priority
- **External reference integration**: Must be complete during creation
- **Universal guidelines**: Required footer in every context file
- **Environment separation**: Critical for production vs development

### Agent Development Standards

#### File Naming Conventions
```
agent-name.md                     # Main agent with context router
agent-name/
├── core-principles.md            # Always loaded base knowledge
├── specific-functionality.md     # Agent-specialized contexts
├── workflow-management.md        # Process-specific contexts
└── advanced-features.md          # Complex scenario contexts
```

#### Required Sections in Every Context
1. **When to Load This Context** - Keywords and scenarios
2. **Overview** - Purpose and scope
3. **Core Content** - Comprehensive documentation
4. **Best Practices** - Implementation guidelines
5. **Universal Guidelines** - Standard footer

#### Context Loading Logic Template
```markdown
### Context Loading Logic:
1. **Always Load**: `core-principles.md` (base knowledge)
2. **Shared Tools First**: Check for shared tool keywords
3. **Agent-Specific**: Load specialized contexts
4. **Multi-Domain**: If task mentions multiple areas → Load all matching
5. **Fallback**: If task is ambiguous/no matches → Load all contexts
6. **Token Optimization**: Shared tools reduce duplication
```

---

## Implementation Results and Future Roadmap

### Successfully Completed Agents

#### Developer Agent ✅
- **Total Contexts**: 4 specialized + 6 shared tools
- **Token Reduction**: ~75% (1,406 lines → 200-400 average)
- **Key Innovation**: Defensive programming integration
- **Shared Tools Used**: Context7, GitHub, Docker, Git, Supabase

#### DevOps Agent ✅  
- **Total Contexts**: 6 specialized + 6 shared tools
- **Key Innovation**: Dynamic port management across all contexts
- **New Shared Tool Created**: AWS Infrastructure
- **Specialized Contexts**: Infrastructure, Container Orchestration, CI/CD, Monitoring, Security, Environment Config
- **Shared Tools Used**: Context7, GitHub, Docker, Git, Supabase, AWS

### Agent Creation Template (for Future Agents)

#### Next Priority: Testing Agent
- **Expected Shared Tools**: Context7, GitHub, Docker (testing containers), Git
- **New Shared Tool Needed**: Testing Frameworks (Jest, PyTest, Selenium)
- **Specialized Contexts**: Test Strategy, Automation, Performance Testing, Security Testing
- **Token Efficiency**: Expected 70-80% reduction from shared tools

#### Next Priority: DBA Agent
- **Expected Shared Tools**: AWS (database services), Docker (database containers), Git
- **New Shared Tool Needed**: Database Management (PostgreSQL, MySQL, MongoDB)
- **Specialized Contexts**: Schema Design, Performance Tuning, Backup/Recovery, Security
- **Key Feature**: Database-specific security and compliance requirements

#### Future Agents Roadmap
1. **API Agent** - Development and deployment tool overlap
2. **Security Agent** - DevOps and infrastructure tool overlap  
3. **ML/AI Agent** - Some development tool overlap
4. **Project Manager Agent** - Minimal technical tool overlap

### Success Metrics Achieved

#### Quantitative Results
- **Token Reduction**: 75-80% across both completed agents
- **Context Duplication Elimination**: ~5,000+ lines of duplicate content removed
- **Maintenance Efficiency**: Single updates to shared tools affect multiple agents
- **Loading Performance**: Faster agent initialization with focused context

#### Qualitative Improvements
- **Agent Response Quality**: Maintained high quality with reduced context
- **Tool Consistency**: Identical tool information across all agents
- **Developer Experience**: Significantly easier agent maintenance
- **Scalability**: Proven process for rapid new agent creation

This architecture has established a robust, scalable foundation for Claude Code agent development that maintains full functionality while dramatically improving token efficiency and maintainability.