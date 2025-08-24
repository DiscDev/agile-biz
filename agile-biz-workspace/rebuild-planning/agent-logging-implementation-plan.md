---
title: "Agent Logging Implementation Plan"
type: "documentation"
category: "rebuild-planning"
token_count: 1832
---

# Agent Logging Implementation Plan

## Overview
Implement simple agent logging system to track agent spawning, context loading, and token usage. This will provide visibility into agent behavior and context efficiency without complexity.

## Goals
- Track which agents and sub-agents get spawned
- Log what context files each agent loads
- Record token usage per file and total per agent
- Capture keyword detection and context loading decisions
- Maintain chronological sequence of all agent activities

## Implementation Approach

### **Single File Logging**
- **Location**: `.claude/agents/logs/agents.json`
- **Format**: Flat sequential array of events
- **Structure**: Simple append-only JSON file
- **Rationale**: Keep all agent-related files within `.claude/agents` structure

### **Token Count Strategy**
- Add `<!-- TOKEN_COUNT: XXXX -->` header to every context file
- Logging tool reads this header instead of calculating tokens
- No runtime token estimation needed

### **Simple Event Types**
1. **agent_spawn** - When primary agent starts
2. **sub_agent_spawn** - When sub-agent is created
3. **context_loading** - When agent loads context files

## JSON Structure Design

### **Event Schema**
```json
[
  {
    "timestamp": "2024-01-01T10:30:15.123Z",
    "event_type": "agent_spawn",
    "agent_id": "developer_001", 
    "agent_type": "developer",
    "spawned_by": null,
    "spawn_reason": "user_request",
    "user_request": "Fix authentication bug in login component"
  },
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
  },
  {
    "timestamp": "2024-01-01T10:32:45.678Z",
    "event_type": "sub_agent_spawn",
    "agent_id": "devops_001",
    "agent_type": "devops", 
    "spawned_by": "developer_001",
    "spawn_reason": "authentication_infrastructure_needed"
  }
]
```

### **Simple Reason Types**
- `"always_loaded"` - Core principles, always included
- `"keyword_match"` - Loaded due to keyword detection
- `"fallback_mode"` - Loaded when no specific keywords match

## Implementation Tasks

### **Phase 1: Infrastructure Setup**

#### **1.1 Create Logging Infrastructure**
- **Shared Tool**: `.claude/agents/shared-tools/agent-logging.md`
  - Agent-specific usage sections for Developer, DevOps, Testing, etc.
  - References to logging functions and configuration
- **Core Functions**: `.claude/agents/scripts/logging-functions.md`
  - Core logging functions and utilities
  - JSON schema documentation
- **Configuration**: `.claude/agents/logs/logging-config.json`
  - Enable/disable logging
  - Log level and file settings

#### **1.2 Create Log Directory Structure**
```
.claude/agents/
├── logs/
│   └── agents.json (initially empty array: [])
└── scripts/
    └── (for future logging utilities)
```

#### **1.3 Add Token Count Headers**
Update existing context files with token count headers:
- All shared-tools files
- All agent-specific context files
- Use format: `<!-- TOKEN_COUNT: XXXX -->`

### **Phase 2: Shared Tool Implementation**

#### **2.1 Core Logging Functions**
```markdown
## Core Logging Functions

**Location**: `.claude/agents/scripts/logging-functions.md`

### logAgentSpawn(agentType, spawnedBy, spawnReason, userRequest)
Records when an agent or sub-agent is created.

### logContextLoading(agentId, keywordsDetected, contextsLoaded)
Records which context files an agent loads with token counts.

### generateAgentId(agentType)
Creates unique agent ID with timestamp.

### readTokenCount(filepath)
Reads TOKEN_COUNT header from context file.

### isLoggingEnabled()
Checks if logging is enabled via configuration.
```

#### **2.2 JSON File Management**
- Simple append-only operations (no reading required)
- Handle file creation if doesn't exist
- Handle concurrent access (simple file locking)
- No context loading of existing log data

### **Phase 3: Agent Integration**

#### **3.1 Update Existing Agents**
- **Developer Agent**: Add logging shared tool to keyword map
- **DevOps Agent**: Add logging shared tool to keyword map
- Both agents call logging functions during operation

#### **3.2 Context Router Enhancement**
Update context routers to:
- Call `logAgentSpawn()` when agent starts
- Call `logContextLoading()` after loading contexts
- Pass detected keywords and loading decisions

### **Phase 4: Testing and Validation**

#### **4.1 Test Scenarios**
- Single agent with simple context loading
- Multi-agent spawn scenario
- Keyword detection and context loading
- Sub-agent spawning and coordination

#### **4.2 Log Validation**
- Verify JSON structure correctness
- Check token count accuracy
- Validate chronological ordering
- Test concurrent agent logging

## File Changes Required

### **New Files**
1. `.claude/agents/shared-tools/agent-logging.md`
2. `.claude/agents/scripts/logging-functions.md`
3. `.claude/agents/logs/agents.json`
4. `.claude/agents/logs/logging-config.json`

### **Modified Files**
**Add TOKEN_COUNT headers to:**
- `.claude/agents/shared-tools/context7-mcp-integration.md`
- `.claude/agents/shared-tools/github-mcp-integration.md`
- `.claude/agents/shared-tools/docker-containerization.md`
- `.claude/agents/shared-tools/git-version-control.md`
- `.claude/agents/shared-tools/supabase-mcp-integration.md`
- `.claude/agents/shared-tools/aws-infrastructure.md`
- `.claude/agents/developer/core-principles.md`
- `.claude/agents/developer/code-quality-standards.md`
- `.claude/agents/developer/frontend-frameworks.md`
- `.claude/agents/developer/backend-development.md`
- `.claude/agents/devops/core-principles.md`
- `.claude/agents/devops/infrastructure-management.md`
- `.claude/agents/devops/container-orchestration.md`
- `.claude/agents/devops/cicd-pipeline-management.md`
- `.claude/agents/devops/monitoring-observability.md`
- `.claude/agents/devops/security-compliance.md`

**Update main agent files:**
- `.claude/agents/developer.md` (add TOKEN_COUNT header)
- `.claude/agents/devops.md` (add TOKEN_COUNT header)

**Update context routers:**
- `.claude/agents/developer.md` (add logging integration)
- `.claude/agents/devops.md` (add logging integration)

## Expected Benefits

### **Immediate Value**
- **Agent Visibility**: See exactly which agents handle requests
- **Context Efficiency**: Track token usage per agent and context
- **Sequential Flow**: Understand agent spawning and coordination
- **Keyword Validation**: Verify context router keyword matching works

### **Analytics Opportunities**
- **Context Usage Patterns**: Which contexts are most/least used
- **Agent Efficiency**: Token usage vs task complexity
- **Shared Tool ROI**: Token savings from shared architecture
- **Agent Coordination**: How multi-agent sessions work

### **Debugging Capabilities**
- **Context Loading Issues**: See why certain contexts load/don't load
- **Agent Selection**: Verify correct agent handles requests
- **Performance Analysis**: Identify context loading bottlenecks
- **Architecture Validation**: Confirm shared tools architecture works

## Success Criteria

### **Functional Requirements**
- ✅ Single agents log spawning and context loading
- ✅ Sub-agents log spawning with parent agent reference  
- ✅ All context files have accurate token counts
- ✅ Keywords trigger expected context loading
- ✅ JSON file maintains chronological order

### **Quality Requirements**
- ✅ No performance impact on agent responses
- ✅ Clean, readable JSON structure
- ✅ Accurate token counting
- ✅ Reliable file handling (no corruption)
- ✅ Agent logging works independently (no dependencies)

### **Usability Requirements**
- ✅ Easy to read agents.json file
- ✅ Clear event types and structure
- ✅ Simple analysis with standard JSON tools
- ✅ Minimal agent integration complexity

## Spawned By Options

The `spawned_by` field can have the following values:

### **Primary Agent Spawning**
- `"claude_code"` - Claude Code system spawns primary agent based on user request
- `"user_direct"` - User directly invokes specific agent (if supported)
- `null` - Unknown or system-initiated spawn

### **Sub-Agent Spawning**  
- `"developer_001"` - Developer agent spawns sub-agent
- `"devops_002"` - DevOps agent spawns sub-agent
- `"scrum_master_001"` - Scrum Master agent spawns developer/testing agents
- `"testing_001"` - Testing agent spawns specialized testing sub-agents
- `"dba_001"` - DBA agent spawns database-specific sub-agents

### **Cross-Agent Coordination**
- `"api_001"` - API agent spawns DevOps for deployment
- `"security_001"` - Security agent spawns DevOps for security config
- `"project_manager_001"` - PM agent spawns Developer/DevOps for implementation

## Agent Logging Configuration

### **Logging Control**
**Location**: `.claude/agents/logs/logging-config.json`

```json
{
  "logging_enabled": true,
  "log_level": "standard",
  "log_file": ".claude/agents/logs/agents.json",
  "max_file_size_mb": 50,
  "auto_rotate": false
}
```

### **Configuration Options**
- `"logging_enabled"`: `true`/`false` - Master on/off switch
- `"log_level"`: `"minimal"`, `"standard"`, `"detailed"`
- `"log_file"`: Path to log file
- `"max_file_size_mb"`: File size limit before manual rotation needed
- `"auto_rotate"`: Future enhancement for automatic log rotation

### **Runtime Control**
Agents check `isLoggingEnabled()` before any logging operations:
```
if (isLoggingEnabled()) {
  logAgentSpawn(agentType, spawnedBy, reason, userRequest);
}
```

## Risks and Mitigations

### **Performance Risk**
- **Risk**: Logging slows down agent responses
- **Mitigation**: Simple append operations, logging enabled check first, no file reading

### **File Corruption Risk**
- **Risk**: Concurrent agents corrupt agents.json
- **Mitigation**: Simple file locking, atomic writes

### **Token Count Accuracy Risk**
- **Risk**: Token count headers become outdated
- **Mitigation**: Include token count updates in context file changes

### **Storage Growth Risk**
- **Risk**: agents.json grows too large over time
- **Mitigation**: 50MB size limit in config, manual rotation when needed, logging can be disabled

### **Context Loading Risk**
- **Risk**: Agent reads large log file increasing token usage
- **Mitigation**: Agents never read existing log data, only append new events

## Future Enhancements (Not in Scope)

- Log file rotation and archival
- Real-time log analysis dashboard
- Agent performance optimization recommendations
- Advanced analytics and reporting
- Integration with monitoring systems

## Implementation Timeline

### **Phase 1**: Infrastructure (Day 1)
- Create shared tool and log structure
- Add token count headers to all context files

### **Phase 2**: Core Implementation (Day 2) 
- Implement logging functions in shared tool
- Create basic file management

### **Phase 3**: Agent Integration (Day 3)
- Update Developer and DevOps agents
- Test logging functionality

### **Phase 4**: Validation (Day 4)
- Run test scenarios
- Validate log output
- Document usage

**Total Estimated Time**: 4 days

## Approval Required

This plan implements simple, effective agent logging with:
- ✅ Flat sequential JSON structure 
- ✅ Simple context loading reasons
- ✅ Token count headers (no runtime calculation)
- ✅ Single file approach for chronological visibility
- ✅ Minimal complexity and agent integration

Ready for implementation approval.