---
title: Agent Spawn Logging
type: shared-tool
token_count: 1247
keywords: [logging, debug, spawn, tracking, monitor, agent]
agents: [developer, devops]
---

# Agent Spawn Logging - Shared Tool

## Overview
Comprehensive agent spawn logging system that tracks all agent activities (user-initiated and internal spawns) with conditional context loading for debugging purposes.

## Logging Check (First Action - Always Execute)

**MANDATORY FIRST STEP**: Every agent must check if logging is enabled before proceeding:

```javascript
// Check if logging is enabled (minimal overhead)
const loggingEnabled = await checkLoggingStatus();
if (loggingEnabled) {
    // Execute full logging sequence
    await logAgentSpawn();
}
// Continue with normal agent operations
```

### Core Logging Functions

#### 1. Check Logging Status
```bash
# Use existing JavaScript function
node .claude/agents/scripts/logging/logging-functions.js check-config
```

#### 2. Log Agent Spawn
```bash
# Log agent spawn with full context
node .claude/agents/scripts/logging/logging-functions.js full-log "{agentType}" "{requestData}"
```

#### 3. Error Handling
```bash
# All logging errors go to error.log
echo "$(date -Iseconds) [ERROR] Agent {agentId}: {errorMessage}" >> .claude/agents/logs/error.log
```

## CRITICAL: Agent Execution Requirements

### MANDATORY LOGGING EXECUTION
When an agent loads this shared tool (logging enabled), it MUST execute the following:

```bash
# REQUIRED: Execute immediately after loading this context
node .claude/agents/scripts/logging/logging-functions.js full-log "{agentType}" "{userRequest}"
```

**Arguments**:
- `{agentType}`: "developer" or "devops" 
- `{userRequest}`: Complete user request (may be JSON string from hook)

**Error Handling**: If logging fails, agent MUST continue normal operation (logging should not block agent tasks)

## Agent Implementation Pattern

### For All Agents (Developer, DevOps, etc.)

#### Step 1: Logging Status Check (Always - ~10 tokens)
```markdown
## Agent Startup Sequence
1. **Check Logging**: `isLoggingEnabled()` - minimal function call
2. **Conditional Load**: If enabled → load this shared tool context
3. **Execute Logging**: If enabled → log spawn, context, parent relationships
4. **Continue**: Proceed with agent-specific tasks
```

#### Step 2: Full Logging Execution (When Enabled - ~50 tokens)
```markdown
## Logging Execution
1. **Generate Agent ID**: Create unique identifier for this spawn
2. **Log Spawn Event**: Record agent type, spawn reason, parent agent
3. **Log Context Loading**: Track which contexts loaded and why
4. **Track Relationships**: Parent-child agent coordination
```

## Logging Data Structure

### Agent Spawn Event
```json
{
  "timestamp": "2025-08-24T13:45:00.000Z",
  "event_type": "agent_spawn",
  "agent_id": "developer_20250824134500_123",
  "agent_type": "developer",
  "spawned_by": "claude_code",
  "spawn_reason": "user_request|internal_task|sub_agent",
  "parent_agent_id": "parent_id_if_sub_agent",
  "session_info": {
    "session_id": "session_uuid",
    "working_directory": "/workspace/path",
    "hook_event": "UserPromptSubmit|TaskExecution"
  },
  "user_request": {
    "prompt": "original_user_request",
    "raw_input": "complete_request_data"
  }
}
```

### Context Loading Event
```json
{
  "timestamp": "2025-08-24T13:45:00.100Z",
  "event_type": "context_loading",
  "agent_id": "developer_20250824134500_123",
  "keywords_detected": ["react", "component", "create"],
  "contexts_loaded": [
    {
      "file": "developer.md",
      "tokens": 816,
      "reason": "agent_definition"
    },
    {
      "file": "core-principles.md", 
      "tokens": 666,
      "reason": "always_loaded"
    },
    {
      "file": "development-workflows.md",
      "tokens": 1842,
      "reason": "keyword_match",
      "keywords": ["create"]
    }
  ],
  "total_tokens": 3324
}
```

## Sub-Agent Coordination

### Parent Agent Responsibilities
When spawning sub-agents:
```markdown
1. **Log Sub-Agent Creation**: Record sub-agent spawn with parent relationship
2. **Pass Context**: Include parent agent ID in spawn data
3. **Track Results**: Log sub-agent completion and results
```

### Sub-Agent Responsibilities  
```markdown
1. **Log Own Spawn**: Include parent_agent_id in spawn data
2. **Report Back**: Log completion status to parent
3. **Error Handling**: Any failures logged to error.log
```

## Error Handling

### Missing Shared Tool
```bash
# If this file is missing, log error and continue gracefully
echo "$(date -Iseconds) [ERROR] Agent {agent_id}: agent-spawn-logging.md not found" >> .claude/agents/logs/error.log
```

### Logging Function Failures
```bash
# If logging functions fail, don't block agent execution
echo "$(date -Iseconds) [ERROR] Agent {agent_id}: Logging function failed - {error}" >> .claude/agents/logs/error.log
```

### Configuration Issues
```bash
# If logging config is invalid or missing
echo "$(date -Iseconds) [WARN] Agent {agent_id}: Invalid logging config, defaulting to enabled" >> .claude/agents/logs/error.log
```

## Usage Examples

### Developer Agent Example
```markdown
## Developer Agent Startup
1. Check: `isLoggingEnabled()` → true
2. Load: This shared-tools/agent-spawn-logging.md context
3. Execute: `logAgentSpawn('developer', 'user_request', 'Create React component')`
4. Continue: Load task-specific contexts and begin development
```

### DevOps Agent Example  
```markdown
## DevOps Agent Startup
1. Check: `isLoggingEnabled()` → true
2. Load: This shared-tools/agent-spawn-logging.md context  
3. Execute: `logAgentSpawn('devops', 'internal_task', 'Deploy application')`
4. Continue: Load infrastructure contexts and begin deployment
```

### Sub-Agent Example
```markdown
## Sub-Agent Spawn (Internal)
Parent: developer_20250824134500_123
1. Check: `isLoggingEnabled()` → true
2. Load: This shared-tools/agent-spawn-logging.md context
3. Execute: `logSubAgentSpawn('devops', 'developer_20250824134500_123', 'Infrastructure setup')`
4. Continue: Execute delegated task
```

## Performance Impact

### Production Mode (Logging Disabled)
- **Check Cost**: ~10 tokens for `isLoggingEnabled()` call
- **Context Load**: None (shared tool not loaded)
- **Execution**: Zero overhead
- **Total Impact**: ~10 tokens per agent spawn

### Debug Mode (Logging Enabled)
- **Check Cost**: ~10 tokens for `isLoggingEnabled()` call
- **Context Load**: ~1247 tokens (this shared tool)
- **Execution**: ~50 tokens for logging functions
- **Total Impact**: ~1307 tokens per agent spawn

## Integration Instructions

### For Agent Contexts (developer.md, devops.md)
Agents automatically load this shared tool when logging is enabled via:

```markdown
### Context Loading Logic:
1. **FIRST: Logging Check**: `isLoggingEnabled()` - if true → ALWAYS load `shared-tools/agent-spawn-logging.md` and execute logging
2. **Always Load**: `agent-tools/{agentType}/core-principles.md`
3. **Task-Specific**: Load contexts based on keywords
```

## Success Criteria

### Complete Coverage
- ✅ User-initiated agent spawns logged
- ✅ Internal agent spawns (Task tool) logged
- ✅ Sub-agent spawns with parent relationships
- ✅ Context loading decisions tracked

### Token Efficiency
- ✅ Minimal overhead when logging disabled (~10 tokens)
- ✅ Full visibility when logging enabled (~1307 tokens)
- ✅ Clear on/off toggle via configuration

### Error Resilience
- ✅ Missing shared tool doesn't break agents
- ✅ Logging failures don't block execution
- ✅ All errors captured in error.log for debugging

---

**This shared tool provides complete agent spawn logging with conditional context loading for optimal debugging and production efficiency.**