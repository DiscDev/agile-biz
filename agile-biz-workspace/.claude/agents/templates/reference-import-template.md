---
name: [imported-agent-name]
description: [Modernized description of imported agent purpose and enhanced capabilities]
tools: [Read, Write, Edit, MultiEdit, Bash, Grep, Glob, LS]
model: [opus|sonnet|haiku]
token_count: [TBD]
---

# [Imported Agent Name] - [Enhanced Title with Modern Context]

## Purpose - [Modernized and Enhanced]
[Original agent purpose enhanced with modern capabilities, current best practices, and integration with AgileBiz infrastructure]

## Import Information
**Source**: `agile-ai-agents-v7.0.0/.claude/agents/[original-agent-file].md`
**Import Date**: [Current Date]
**Adaptations Made**: [Summary of key adaptations and modernizations]
**Enhancement Level**: [Minimal|Moderate|Extensive] - [Brief reasoning]

## Core Responsibilities - [Enhanced from Original]
- **[Original Capability 1 - Enhanced]**: [Modernized capability with current tools and practices]
- **[Original Capability 2 - Updated]**: [Updated workflow with AgileBiz infrastructure integration]
- **[New Capability - Added]**: [New functionality not in original, based on current needs]
- **[Integration Capability - New]**: [Modern infrastructure integration capabilities]
- **[Quality Assurance - Enhanced]**: [Improved quality standards and validation procedures]

## Shared Tools (Multi-Agent) - [Modernized Integration]
- **[modernized, keyword, patterns]** → `shared-tools/[current-shared-tool].md`
- **[updated, integration, workflows]** → `shared-tools/[relevant-modern-tool].md`
- **[enhanced, automation, processes]** → `shared-tools/[automation-tool].md`

## Agent-Specific Contexts - [Adapted and Enhanced]
- **[core, foundational, knowledge]** → `agent-tools/[agent-name]/core-[agent-name]-principles.md`
- **[modernized, procedures, workflows]** → `agent-tools/[agent-name]/modern-[domain]-procedures.md`
- **[enhanced, integration, patterns]** → `agent-tools/[agent-name]/integration-workflows.md`

### Context Loading Logic - [Current Infrastructure Pattern]:
1. **FIRST: Logging Check**: `isLoggingEnabled()` - if true → ALWAYS load `shared-tools/agent-spawn-logging.md` and execute logging
   - **MANDATORY EXECUTION**: When logging is enabled, IMMEDIATELY execute: `node .claude/agents/scripts/logging/logging-functions.js full-log [agent-type] "[user request]"`
   - **Log Agent Spawn**: Extract keywords, generate agent ID, log spawn event and context loading
   - **Error Handling**: If logging fails, continue with agent execution (logging should not block agent operation)
2. **Always Load**: `agent-tools/[agent-name]/core-[agent-name]-principles.md` (modernized base knowledge)
3. **Shared Tools**: Enhanced integration with current shared tools ecosystem
4. **Agent-Specific**: Load adapted and modernized agent-specific contexts
5. **Multi-Domain**: Enhanced cross-domain capability with current infrastructure
6. **Fallback**: Comprehensive context loading for complex imported capabilities
7. **Token Optimization**: Modern optimization patterns with shared tools integration

## Import Adaptations and Modernizations

### Original vs. Current Architecture
```markdown
# Original Reference Structure (Old)
[Document original agent structure and key characteristics]

# Current Adapted Structure (New)
[Document how structure was modernized and adapted]

# Key Adaptations Made:
- [Adaptation 1]: [What was changed and why]
- [Adaptation 2]: [Modernization details and rationale]
- [Enhancement 1]: [New capabilities added during import]
- [Integration 1]: [Infrastructure integration additions]
```

### Technology and Tool Updates
- **[Original Tool/Technology]** → **[Current Tool/Technology]**: [Reasoning for update]
- **[Legacy Process]** → **[Modern Process]**: [Improvement details]
- **[Old Integration]** → **[Current Integration]**: [Enhanced capability description]

### Enhanced Capabilities Added During Import
1. **[New Capability 1]**: [Capability not in original, added based on current needs]
2. **[Enhanced Process 2]**: [Original process enhanced with modern practices]
3. **[Integration Feature 3]**: [New integration capability with AgileBiz infrastructure]

## Task Analysis Examples - [Original + Enhanced]:

**"[Original example request - modernized]"**
- **Keywords**: `[original]`, `[keywords]`, `[plus]`, `[modern]`, `[additions]`
- **Context**: `core-[agent-name]-principles.md` + `shared-tools/[modern-tool].md`
- **Enhancement**: [How this example was improved from original]

**"[New example showing enhanced capabilities]"**
- **Keywords**: `[enhanced]`, `[modern]`, `[integration]`, `[capabilities]`
- **Context**: `modern-[domain]-procedures.md` + `shared-tools/[integration-tool].md`
- **Innovation**: [New capability not in original agent]

## [Domain] Workflows - [Modernized and Enhanced]

### [Primary Workflow from Original] - [Enhanced Version]
1. **[Original Step 1 - Modernized]**: [Updated with current tools and practices]
2. **[Enhanced Step 2]**: [Improved process with modern capabilities]
3. **[New Step 3 - Added]**: [Additional step for current infrastructure integration]
4. **[Quality Gate - Enhanced]**: [Improved validation with current standards]

### [New Modern Workflow] - [Added During Import]
1. **[Modern Analysis Phase]**: [Current best practices and tools]
2. **[Enhanced Implementation]**: [Modern implementation with AgileBiz integration]
3. **[Advanced Validation]**: [Current quality standards and procedures]
4. **[Integration and Documentation]**: [Modern documentation and integration patterns]

## Migration Notes and Change Log

### Original Agent Analysis
- **Original Purpose**: [What the reference agent was designed to do]
- **Original Capabilities**: [Key capabilities from reference system]
- **Original Architecture**: [How the original agent was structured]
- **Original Dependencies**: [What the original agent depended on]

### Adaptation Decisions
- **Technology Updates**: [Why certain technologies were updated or replaced]
- **Process Enhancements**: [How processes were improved during import]
- **Integration Additions**: [What integrations were added and why]
- **Capability Enhancements**: [How capabilities were enhanced or expanded]

### Import Challenges and Solutions
- **Challenge 1**: [Import challenge encountered] → **Solution**: [How it was resolved]
- **Challenge 2**: [Compatibility issue] → **Solution**: [Adaptation made]
- **Challenge 3**: [Technology gap] → **Solution**: [Modernization approach]

## Integration with AgileBiz Infrastructure - [Enhanced]

### Modern Logging System Integration
- **Enhanced Activity Logging**: Comprehensive logging of all imported and new capabilities
- **Migration Tracking**: Special logging for imported agent usage and performance
- **Performance Monitoring**: Enhanced monitoring with baseline comparison to reference
- **Adaptation Analytics**: Track how adaptations perform compared to original

### Advanced CLAUDE.md Documentation
- **Import Documentation**: Clear documentation of import source and adaptations
- **Enhanced Capability Description**: Comprehensive description including modernizations
- **Usage Guidance**: Modern usage patterns and best practices
- **Migration Information**: Information about differences from original reference

### Quality Standards - [Enhanced from Original]
- **[Original Quality Standard - Enhanced]**: [How original standard was improved]
- **[New Quality Standard]**: [New standard not in original, added during import]
- **[Integration Quality]**: [Quality standards for modern infrastructure integration]
- **[Performance Quality]**: [Enhanced performance standards with current tools]

## Success Criteria - [Original + Enhanced]

### Functional Migration Success
- ✅ [All original capabilities successfully imported and functional]
- ✅ [Adaptations work correctly with current infrastructure]
- ✅ [Enhanced capabilities provide additional value]
- ✅ [Integration with shared tools functions properly]

### Enhancement Success
- ✅ [Modern infrastructure integration complete and functional]
- ✅ [Logging system integration works correctly]
- ✅ [CLAUDE.md documentation complete and accurate]
- ✅ [Performance meets or exceeds original agent capabilities]

### Strategic Value
- ✅ [Imported agent provides value in current context]
- ✅ [Modernizations enable future scalability and enhancement]
- ✅ [Integration enables coordination with other current agents]
- ✅ [Knowledge preservation successful with modern accessibility]

## Token Usage Optimization - [Modern Patterns]

### Import Optimization Strategy
- **Shared Tool Migration**: Convert original duplicate content to shared tools
- **Modern Context Patterns**: Use current efficient context loading patterns
- **Integration Efficiency**: Leverage existing infrastructure for token optimization
- **Adaptive Loading**: Smart context loading based on request analysis

### Performance Comparison
- **Original Estimated Usage**: [Estimate of tokens original agent would have used]
- **Current Optimized Usage**: [Actual token usage with modern optimization]
- **Efficiency Gains**: [Token savings from modernization and shared tools]
- **Performance Metrics**: [Response time and quality improvements]

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)

## Reference Import Template Usage Instructions

### For Agent-Admin Import Operations:
1. **Reference Analysis**: Thoroughly analyze original agent before starting import
2. **Adaptation Planning**: Plan all necessary adaptations and modernizations
3. **Enhancement Opportunities**: Identify opportunities to enhance capabilities
4. **Integration Strategy**: Plan integration with current infrastructure
5. **Quality Validation**: Establish validation criteria for successful import

### Import Process Guidelines:
1. **Preserve Value**: Maintain all valuable capabilities from original agent
2. **Modernize Architecture**: Update to current infrastructure patterns
3. **Enhance Integration**: Add modern integration capabilities
4. **Improve Quality**: Apply current quality standards and practices
5. **Document Changes**: Comprehensive documentation of all adaptations

### Template Placeholders to Replace:
- `[Imported Agent Name]` → Name of agent being imported
- `[Original Agent File]` → Source file name in reference system
- `[Current Date]` → Date of import operation
- `[Adaptation descriptions]` → Specific adaptations made during import
- `[Enhancement details]` → New capabilities and improvements added
- All workflow and capability descriptions → Updated with modern practices