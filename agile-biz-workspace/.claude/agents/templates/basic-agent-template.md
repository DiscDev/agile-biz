---
title: [Agent Name] - [Brief Description]
type: agent
model: [opus|sonnet|haiku]
token_count: [TBD]
keywords: [primary, secondary, domain, specific, trigger, words]
specialization: [domain-expertise-area]
agents: [agent-name]
---

# [Agent Name] - [Full Descriptive Title]

## Purpose
[Clear, concise description of the agent's primary function and role within the AgileBiz infrastructure]

## Core Responsibilities
- **[Capability 1]**: [Specific functionality and scope]
- **[Capability 2]**: [Integration requirements and workflows]
- **[Capability 3]**: [Value proposition and outcomes]
- **[Additional capabilities as needed]**

## Shared Tools (Multi-Agent)
- **[keyword patterns]** → `shared-tools/[relevant-shared-tool].md`
- **[additional keyword patterns]** → `shared-tools/[another-shared-tool].md`

## Agent-Specific Contexts
- **[specialized keywords]** → `agent-tools/[agent-name]/[context-name].md`
- **[additional patterns]** → `agent-tools/[agent-name]/[another-context].md`

### Context Loading Logic:
1. **FIRST: Logging Check**: `isLoggingEnabled()` - if true → ALWAYS load `shared-tools/agent-spawn-logging.md` and execute logging
   - **MANDATORY EXECUTION**: When logging is enabled, IMMEDIATELY execute: `node .claude/agents/scripts/logging/logging-functions.js full-log [agent-type] "[user request]"`
   - **Log Agent Spawn**: Extract keywords, generate agent ID, log spawn event and context loading
   - **Error Handling**: If logging fails, continue with agent execution (logging should not block agent operation)
2. **Always Load**: `agent-tools/[agent-name]/core-[agent-name]-principles.md` (base knowledge and responsibilities)
3. **Shared Tools**: Check for shared tool keywords and load from `shared-tools/` folder
4. **Agent-Specific**: Load agent-specific contexts for specialized functionality
5. **Multi-Domain**: If task mentions multiple areas → Load all matching contexts
6. **Fallback**: If task is ambiguous/no matches → Load comprehensive context
7. **Token Optimization**: Conditional loading reduces token usage and improves efficiency

## Task Analysis Examples:

**"[Example user request related to agent domain]"**
- **Keywords**: `[detected]`, `[keywords]`, `[from]`, `[request]`
- **Context**: `agent-tools/[agent-name]/core-[agent-name]-principles.md` + `shared-tools/[relevant-tool].md`

**"[Another example showing complex workflow]"**
- **Keywords**: `[multiple]`, `[domain]`, `[keywords]`
- **Context**: `agent-tools/[agent-name]/core-[agent-name]-principles.md` + `shared-tools/[tool1].md` + `shared-tools/[tool2].md`

## [Domain-Specific Workflows Section]

### [Primary Workflow Name]
1. **[Step 1]**: [Action and outcome]
2. **[Step 2]**: [Process and requirements]
3. **[Step 3]**: [Integration and validation]
4. **[Additional steps as needed]**

### [Secondary Workflow Name]
1. **[Analysis Phase]**: [Requirements gathering and planning]
2. **[Implementation Phase]**: [Core execution and development]
3. **[Validation Phase]**: [Testing and quality assurance]
4. **[Documentation Phase]**: [Recording and knowledge sharing]

## Integration with AgileBiz Infrastructure

### Logging System Integration
- **Automatic Logging**: All agent activities logged when enabled
- **Context Tracking**: Monitor which contexts are loaded for performance optimization
- **Performance Metrics**: Track token usage and efficiency improvements
- **Error Logging**: Capture and log any domain-specific errors

### CLAUDE.md Documentation
- **Automatic Updates**: Agent creation/modification updates CLAUDE.md
- **Consistent Formatting**: Maintains standard agent documentation format
- **Usage Examples**: Provides clear examples of how to use the agent
- **Integration Information**: Documents relationships with other agents and tools

### Quality Standards
- **[Domain Standard 1]**: [Specific quality requirement for agent domain]
- **[Domain Standard 2]**: [Integration requirement with existing systems]
- **[Domain Standard 3]**: [Performance or efficiency requirement]
- **AgileBiz Patterns**: Follows established infrastructure patterns and conventions

## Success Criteria
- ✅ [Primary success metric for agent functionality]
- ✅ [Integration success criteria]
- ✅ [Performance or efficiency criteria]
- ✅ [Quality or reliability criteria]
- ✅ Automatically integrates with logging system
- ✅ Updates CLAUDE.md documentation appropriately
- ✅ Follows AgileBiz infrastructure patterns
- ✅ Provides clear value to users

## Token Usage Optimization
- **Conditional Loading**: Only loads contexts relevant to current task
- **Shared Tools**: Uses established shared tools to reduce duplication
- **Efficient Patterns**: Leverages Claude Code's context caching mechanisms
- **Performance Monitoring**: Tracks and optimizes token usage patterns

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)

## Template Usage Instructions

### For Agent-Admin Use:
1. **Copy Template**: Use this as starting point for new agents
2. **Replace Placeholders**: Fill in all bracketed placeholders with agent-specific information
3. **Customize Sections**: Adapt workflows and examples to agent domain
4. **Calculate Tokens**: Update token_count after completing agent
5. **Validate Structure**: Ensure all required sections present and complete
6. **Test Integration**: Verify logging and documentation systems work correctly

### Placeholders to Replace:
- `[Agent Name]` → Actual agent name (Title Case)
- `[agent-name]` → Agent name in kebab-case for files/references
- `[agent-type]` → Agent type for logging (lowercase)
- `[Brief Description]` → Short description for title
- `[Full Descriptive Title]` → Complete descriptive title
- `[domain-expertise-area]` → Agent's specialization domain
- `[opus|sonnet|haiku]` → Choose appropriate model
- `[keyword patterns]` → Actual keyword patterns for context loading
- All other bracketed content → Replace with agent-specific information