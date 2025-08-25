---
title: Core Agent Management
type: agent-context
token_count: 987
keywords: [core, base, management, principles, agent-admin]
agents: [agent-admin]
---

# Core Agent Management - Always Loaded Context

## AgileBiz Agent Architecture Fundamentals

### Infrastructure Standards
- **YAML Frontmatter**: Required for all agents with title, type, model, token_count, keywords, specialization
- **Logging Integration**: All agents must integrate with automatic logging system
- **Context Loading**: Conditional loading with shared tools and agent-specific contexts
- **Token Optimization**: Efficient context patterns to minimize token usage
- **CLAUDE.md Documentation**: All agents must be documented in workspace instructions

### Agent File Structure Pattern
```yaml
---
name: agent-name
description: Brief description of agent purpose and capabilities
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: opus|sonnet|haiku
token_count: [calculated]
---

# Agent Name - Full Title

## Purpose
Clear description of agent's primary function

## Core Responsibilities
- Specific capability 1
- Specific capability 2
- Integration requirements

## Shared Tools (Multi-Agent)
- **keyword patterns** → `shared-tools/tool-name.md`

## Agent-Specific Contexts
- **keyword patterns** → `agent-tools/agent-type/context-name.md`

### Context Loading Logic:
1. **FIRST: Logging Check**: isLoggingEnabled() integration
2. **Always Load**: Core agent context
3. **Conditional Loading**: Based on keywords and task requirements

## Integration Requirements
- Logging system integration
- CLAUDE.md documentation
- Token optimization patterns
```

### Current Agent Inventory
- **Developer Agent**: Code generation, refactoring, project scaffolding
- **DevOps Agent**: Infrastructure, deployment, operational excellence
- **Agent Admin**: Agent lifecycle management (this agent)

### Shared Tools Available
- `context7-mcp-integration.md` - Documentation and library access
- `github-mcp-integration.md` - Git workflows and repository management
- `docker-containerization.md` - Container management and deployment
- `git-version-control.md` - Version control best practices
- `supabase-mcp-integration.md` - Database and backend services
- `aws-infrastructure.md` - Cloud infrastructure management
- `agent-spawn-logging.md` - Agent activity tracking

### Agent-Specific Context Patterns
- **Always Load**: `agent-tools/{agent-type}/core-{type}-principles.md`
- **Keyword Based**: Load specific contexts based on task requirements
- **Fallback**: Load comprehensive context for ambiguous requests
- **Token Efficient**: Minimize unnecessary context loading

## Agent Management Operations

### Create New Agent
1. **Requirements Analysis**: Define purpose, scope, capabilities
2. **Template Selection**: Choose appropriate base template
3. **Structure Configuration**: Set up YAML frontmatter and metadata
4. **Context Design**: Define keyword patterns and context loading logic
5. **Infrastructure Integration**: Add to agent-spawn-logging.md, select RELEVANT shared tools only, documentation
6. **Validation**: Test agent structure and functionality
7. **Documentation**: Update CLAUDE.md with agent information

### Import from Reference
1. **Source Analysis**: Read and understand reference agent structure
2. **Infrastructure Mapping**: Adapt to current patterns and standards
3. **Context Migration**: Update shared tools and context references
4. **Keyword Modernization**: Align with current keyword strategies
5. **Integration Updates**: Add to agent-spawn-logging.md, logging, and documentation systems
6. **Testing**: Validate imported agent functionality
7. **Documentation**: Record adaptations and changes made

### Optimize Existing Agent
1. **Performance Analysis**: Review current token usage and efficiency
2. **Context Audit**: Identify optimization opportunities
3. **Shared Tools Migration**: Convert duplicated content to shared tools
4. **Keyword Refinement**: Improve context loading patterns
5. **Token Calculation**: Update accurate token counts
6. **Performance Testing**: Validate optimization improvements
7. **Documentation**: Record optimization changes and results

### Delete Agent
1. **Impact Analysis**: Identify dependencies and usage patterns
2. **Backup Creation**: Archive agent configuration before deletion
3. **Context Cleanup**: Remove agent-specific context files
4. **Logging Cleanup**: Remove agent from agent-spawn-logging.md agents array
5. **Documentation Updates**: Remove from CLAUDE.md and references
6. **Reference Cleanup**: Update any cross-references to deleted agent
7. **Validation**: Confirm clean removal without broken dependencies
8. **User Notification**: Inform user that Claude Code must be restarted to update agent list cache

## Quality Standards

### Agent Structure Requirements
- ✅ Valid YAML frontmatter with all required fields
- ✅ Clear purpose and responsibility definition
- ✅ Proper keyword strategy for context loading
- ✅ Integration with logging system
- ✅ Documentation in CLAUDE.md
- ✅ Token count accuracy
- ✅ AgileBiz attribution

### Context Loading Best Practices
- **Conditional Loading**: Only load contexts relevant to current task
- **Shared Tools First**: Use shared tools before agent-specific contexts
- **Token Awareness**: Monitor and optimize token usage patterns
- **Fallback Strategy**: Handle ambiguous requests gracefully
- **Performance Focus**: Prioritize efficiency and speed

### Integration Standards
- **Logging**: All agents must integrate with logging system
- **Documentation**: CLAUDE.md updates required for all changes
- **Templates**: Use established templates and patterns
- **Keywords**: Follow consistent keyword strategies
- **Testing**: Validate all agent changes before deployment

## Error Handling and Validation

### Common Issues
- **Invalid YAML**: Syntax errors in frontmatter
- **Missing Integration**: No logging or documentation updates
- **Token Miscalculation**: Inaccurate token counts
- **Keyword Conflicts**: Overlapping context loading patterns
- **Incomplete Documentation**: Missing CLAUDE.md updates

### Validation Checklist
- ✅ YAML frontmatter parses correctly
- ✅ All required fields present and valid
- ✅ Keywords properly formatted and functional
- ✅ Context loading logic implemented
- ✅ Logging integration functional
- ✅ CLAUDE.md documentation complete
- ✅ Token counts calculated and accurate
- ✅ Agent functionality tested

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)