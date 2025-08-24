# Agent Logging System Transition Plan

## Executive Summary
Transition from current hook-based agent logging to a shared tool approach with conditional context loading. This will enable complete agent spawn tracking (user + internal) while maintaining token efficiency in production.

## Current System Analysis

### ✅ What Works
- **UserPromptSubmit Hook**: Captures user-initiated agent spawns perfectly
- **Structured JSON Logging**: Clean, parseable log format
- **JavaScript Functions**: Robust logging infrastructure in `logging-functions.js`
- **Configuration System**: `logging-config.json` enable/disable functionality

### ❌ Current Limitations
- **Missing Internal Spawns**: Hook system doesn't capture Claude Code internal agent usage (Task tool)
- **Hook Dependency**: Relies on Claude Code hook system behavior
- **Incomplete Coverage**: Only ~50% of agent spawns logged (user-initiated only)

## Proposed Architecture

### 🎯 Core Concept: Conditional Context Loading
1. **Minimal Check**: Every agent checks `isLoggingEnabled()` first (~50 tokens)
2. **Conditional Load**: Only load full logging context when debugging active
3. **Complete Coverage**: All agents (user + internal) participate in logging
4. **Token Efficient**: Zero overhead in production, full visibility in debug mode

### 📁 File Structure
```
.claude/agents/
├── shared-tools/
│   └── agent-spawn-logging.md          # Full logging context (~1000 tokens)
├── logs/
│   ├── agents.json                     # Structured log data
│   ├── logging-config.json             # Enable/disable config
│   ├── error.log                       # NEW: Logging errors
│   └── hook-debug.log                  # REMOVE: No longer needed
├── scripts/
│   └── logging/
│       └── logging-functions.js        # Keep existing functions
└── hooks/
    └── agent-logger.sh                 # REMOVE: No longer needed
```

## Implementation Plan

### Phase 1: Create Shared Tool
**File**: `.claude/agents/shared-tools/agent-spawn-logging.md`

**Content Structure**:
```markdown
---
title: Agent Spawn Logging
type: shared-tool
token_count: ~1000
keywords: [logging, debug, spawn, tracking]
agents: [developer, devops]
---

# Agent Spawn Logging - Shared Tool

## Logging Check (First Action)
1. **MANDATORY**: Check `isLoggingEnabled()` before any operations
2. **If Disabled**: Continue normal agent operations
3. **If Enabled**: Execute full logging sequence

## Logging Functions
[Complete logging function definitions]
[Parent-child agent tracking]
[Sub-agent coordination]
[Error handling to error.log]

## Usage Examples
[Developer agent example]
[DevOps agent example]
[Sub-agent spawning example]
```

### Phase 2: Update Agent Contexts
**Files**: `developer.md`, `devops.md`

**Add to Context Loading Logic**:
```markdown
### Context Loading Logic:
1. **Always Load**: `agent-tools/{agentType}/core-principles.md`
2. **Logging Check**: `if (isLoggingEnabled()) { load shared-tools/agent-spawn-logging.md }`
3. **Conditional Logging**: Execute logging if enabled
4. **Task-Specific Contexts**: Load based on keywords
```

**Update Router Keywords**:
```markdown
#### Shared Tools (Multi-Agent) 
- **log-agent-spawn** → `shared-tools/agent-spawn-logging.md`
```

### Phase 3: Remove Hook System
**Actions**:
1. **Delete**: `.claude/hooks/agent-logger.sh`
2. **Update**: `.claude/settings.json` - remove all hook configurations
3. **Delete**: `.claude/agents/logs/hook-debug.log`
4. **Clean**: Remove hook debugging code

### Phase 4: Error Logging Infrastructure
**File**: `.claude/agents/logs/error.log`

**Purpose**:
- Missing shared tool errors
- Logging function failures
- Configuration issues
- Agent compliance problems

**Format**:
```
2025-08-24T13:45:00.000Z [ERROR] Agent developer_123: Failed to load agent-spawn-logging.md
2025-08-24T13:45:01.000Z [ERROR] Logging function error: Cannot write to agents.json
2025-08-24T13:45:02.000Z [WARN] Agent devops_456: Logging disabled, skipping spawn log
```

### Phase 5: JavaScript Functions Enhancement
**File**: `.claude/agents/scripts/logging/logging-functions.js`

**Enhancements**:
1. **Error Logging**: All errors go to `error.log`
2. **Agent Source Tracking**: Distinguish user vs internal spawns
3. **Missing Tool Handling**: Graceful degradation if shared tool missing
4. **Configuration Validation**: Validate logging config format

## Migration Strategy

### Step 1: Preparation
- [ ] Create `agent-spawn-logging.md` shared tool
- [ ] Add error logging infrastructure
- [ ] Test logging functions with error handling

### Step 2: Agent Updates
- [ ] Update `developer.md` with conditional logging context
- [ ] Update `devops.md` with conditional logging context  
- [ ] Test agent behavior with logging enabled/disabled

### Step 3: Hook System Removal
- [ ] Remove hook configurations from `settings.json`
- [ ] Delete `agent-logger.sh` hook script
- [ ] Clean up debug files

### Step 4: Validation
- [ ] Test user-initiated agent spawns
- [ ] Test internal agent spawns (Task tool usage)
- [ ] Test logging enable/disable functionality
- [ ] Test error handling scenarios

## Expected Outcomes

### ✅ Benefits
- **Complete Coverage**: All agent spawns logged (user + internal)
- **Token Efficient**: ~50 tokens overhead when disabled, ~1000 when enabled
- **Simple Control**: Single config toggle for all logging
- **Error Resilience**: Graceful handling of logging failures
- **Clean Architecture**: No dependency on hook system behavior

### 📊 Performance Impact
- **Production Mode** (logging disabled): ~50 tokens per agent
- **Debug Mode** (logging enabled): ~1000 tokens per agent
- **Net Gain**: Complete agent visibility when needed, minimal overhead when not

### 🎯 Success Criteria
1. **Completeness**: Both user and internal agent spawns logged
2. **Efficiency**: Minimal token usage in production mode
3. **Reliability**: Logging errors don't block agent operations
4. **Simplicity**: Single config toggle controls entire system
5. **Maintainability**: Self-contained shared tool approach

## Risk Assessment

### Low Risk
- **Existing Functions**: Reusing proven `logging-functions.js`
- **Configuration**: Keeping existing `logging-config.json` format
- **JSON Structure**: Maintaining current log format

### Medium Risk
- **Agent Compliance**: Relies on agents following logging instructions
- **Context Loading**: Conditional loading must work reliably

### Mitigation Strategies
- **Error Logging**: All failures logged to `error.log` for debugging
- **Graceful Degradation**: Missing shared tool doesn't break agents
- **Testing Plan**: Comprehensive validation of all scenarios

## Timeline Estimate
- **Phase 1-2**: 1-2 hours (shared tool + agent updates)
- **Phase 3**: 30 minutes (hook removal)  
- **Phase 4-5**: 1 hour (error logging + testing)
- **Total**: 3-4 hours implementation + testing

## Approval Required
This plan requires approval before implementation. Key decision points:
1. **Architecture Approval**: Conditional context loading approach
2. **File Changes**: Hook system removal and shared tool creation
3. **Error Handling**: Error logging to dedicated file
4. **Migration Strategy**: Step-by-step transition plan

---

**Ready for Review**: Please approve this plan before implementation begins.