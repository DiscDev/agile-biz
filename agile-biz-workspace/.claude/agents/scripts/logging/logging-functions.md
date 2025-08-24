---
title: "Agent Logging Functions"
type: "script"
category: "logging"
token_count: 1650
---

# Agent Logging Functions

## Overview
Core logging functions for Claude Code agent activity tracking. These functions provide simple, efficient logging without impacting agent performance.

## Core Functions

### isLoggingEnabled()
Checks if logging is enabled via configuration.

**Returns**: `boolean` - true if logging is enabled
**Usage**: Always call this before any logging operations

```javascript
if (isLoggingEnabled()) {
  logAgentSpawn(agentType, spawnedBy, reason, userRequest);
}
```

### logAgentSpawn(agentType, spawnedBy, spawnReason, userRequest)
Records when a primary agent is created.

**Parameters**:
- `agentType` (string): Type of agent ("developer", "devops", "testing", etc.)
- `spawnedBy` (string|null): Who spawned this agent ("claude_code", "user_direct", null)
- `spawnReason` (string): Why agent was spawned ("user_request", "task_delegation")
- `userRequest` (string): Original user request text

**Example**:
```javascript
logAgentSpawn("developer", "claude_code", "user_request", "Fix authentication bug in login component");
```

### logSubAgentSpawn(agentType, spawnedBy, spawnReason)
Records when a sub-agent is created by another agent.

**Parameters**:
- `agentType` (string): Type of sub-agent being spawned
- `spawnedBy` (string): Agent ID that spawned this sub-agent ("developer_001", "devops_002")
- `spawnReason` (string): Reason for sub-agent spawn

**Example**:
```javascript
logSubAgentSpawn("devops", "developer_001", "authentication_infrastructure_needed");
```

### logContextLoading(agentId, keywordsDetected, contextsLoaded)
Records which context files an agent loads with token counts.

**Parameters**:
- `agentId` (string): Unique agent identifier
- `keywordsDetected` (array): Keywords that triggered context loading
- `contextsLoaded` (array): Context files loaded with details

**Context Object Structure**:
```javascript
{
  "file": "core-principles.md",
  "tokens": 245,
  "reason": "always_loaded",
  "keywords": ["authentication", "bug"] // optional, only for keyword_match
}
```

**Example**:
```javascript
logContextLoading("developer_001", ["authentication", "bug", "component"], [
  {
    "file": "core-principles.md",
    "tokens": 245,
    "reason": "always_loaded"
  },
  {
    "file": "shared-tools/github-mcp-integration.md",
    "tokens": 1234,
    "reason": "keyword_match",
    "keywords": ["bug"]
  }
]);
```

### generateAgentId(agentType)
Creates unique agent ID with timestamp.

**Parameters**:
- `agentType` (string): Type of agent

**Returns**: `string` - Unique agent ID (format: "agenttype_YYYYMMDD_HHMMSS_nnn")

**Example**:
```javascript
const agentId = generateAgentId("developer");
// Returns: "developer_20240101_103015_001"
```

### readTokenCount(filepath)
Reads token_count from YAML frontmatter in context file.

**Parameters**:
- `filepath` (string): Path to context markdown file

**Returns**: `number` - Token count from YAML frontmatter

**Example**:
```javascript
const tokens = readTokenCount("shared-tools/docker-containerization.md");
// Returns: 1479 (from YAML frontmatter: token_count: 1479)
```

**Implementation**:
```javascript
function readTokenCount(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  
  // Parse YAML frontmatter
  const yamlMatch = content.match(/^---\n(.*?)\n---/s);
  if (yamlMatch) {
    const yaml = require('js-yaml').load(yamlMatch[1]);
    return yaml.token_count || 0;
  }
  
  // Fallback: try to find HTML comment format for backwards compatibility
  const htmlMatch = content.match(/<!-- TOKEN_COUNT: (\d+) -->/);
  if (htmlMatch) {
    return parseInt(htmlMatch[1], 10);
  }
  
  return 0;
}
```

## JSON Schema

### Agent Spawn Event
```json
{
  "timestamp": "2024-01-01T10:30:15.123Z",
  "event_type": "agent_spawn",
  "agent_id": "developer_001",
  "agent_type": "developer",
  "spawned_by": "claude_code",
  "spawn_reason": "user_request",
  "user_request": "Fix authentication bug in login component"
}
```

### Sub-Agent Spawn Event
```json
{
  "timestamp": "2024-01-01T10:32:45.678Z",
  "event_type": "sub_agent_spawn",
  "agent_id": "devops_001",
  "agent_type": "devops",
  "spawned_by": "developer_001",
  "spawn_reason": "authentication_infrastructure_needed"
}
```

### Context Loading Event
```json
{
  "timestamp": "2024-01-01T10:30:15.145Z",
  "event_type": "context_loading",
  "agent_id": "developer_001",
  "keywords_detected": ["authentication", "bug", "component"],
  "contexts_loaded": [
    {
      "file": "core-principles.md",
      "tokens": 245,
      "reason": "always_loaded"
    },
    {
      "file": "shared-tools/github-mcp-integration.md",
      "tokens": 1234,
      "reason": "keyword_match",
      "keywords": ["bug"]
    }
  ],
  "total_tokens": 3046
}
```

## Loading Reasons

### Simple Reason Types
- `"always_loaded"` - Core principles, always included
- `"keyword_match"` - Loaded due to keyword detection  
- `"fallback_mode"` - Loaded when no specific keywords match

## Spawned By Options

### Primary Agent Spawning
- `"claude_code"` - Claude Code system spawns primary agent
- `"user_direct"` - User directly invokes specific agent
- `null` - Unknown or system-initiated spawn

### Sub-Agent Spawning
- `"developer_001"` - Developer agent spawns sub-agent
- `"devops_002"` - DevOps agent spawns sub-agent
- `"scrum_master_001"` - Scrum Master agent spawns developer/testing agents
- `"testing_001"` - Testing agent spawns specialized testing sub-agents
- `"dba_001"` - DBA agent spawns database-specific sub-agents

## File Operations

### Configuration Reading
```javascript
// Read logging configuration
const config = JSON.parse(readFile(".claude/agents/logs/logging-config.json"));
const loggingEnabled = config.logging_enabled;
```

### Log Writing (Append Only)
```javascript
// Append event to log file (never read existing content)
const event = {
  "timestamp": new Date().toISOString(),
  "event_type": "agent_spawn",
  // ... event data
};

appendToFile(".claude/agents/logs/agents.json", JSON.stringify(event) + ",\n");
```

## Performance Guidelines

### Minimal Overhead
- Always check `isLoggingEnabled()` first
- Use simple append operations (no file reading)
- Minimal processing, direct JSON serialization
- No complex calculations or analysis

### Error Handling
- Logging failures should not stop agent execution
- Graceful fallback if log file is unavailable
- Simple retry mechanism for file locking conflicts

### File Management
- Single append-only file for simplicity
- No automatic rotation in initial implementation
- Manual intervention when file reaches size limit

## Usage Examples

### Basic Agent Logging
```javascript
// Agent startup
if (isLoggingEnabled()) {
  const agentId = generateAgentId("developer");
  logAgentSpawn("developer", "claude_code", "user_request", userRequest);
  
  // Context loading
  const contexts = [
    {
      "file": "core-principles.md",
      "tokens": readTokenCount("developer/core-principles.md"),
      "reason": "always_loaded"
    }
  ];
  
  logContextLoading(agentId, detectedKeywords, contexts);
}
```

### Sub-Agent Coordination
```javascript
// Parent agent spawning sub-agent
if (isLoggingEnabled()) {
  const subAgentId = generateAgentId("devops");
  logSubAgentSpawn("devops", parentAgentId, "infrastructure_deployment");
}
```

## Universal Guidelines

*These functions follow the Universal Agent Guidelines in CLAUDE.md*

**CRITICAL**: All logging operations MUST be non-blocking and should never impact agent response performance.