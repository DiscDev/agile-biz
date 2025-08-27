# Hook Management Guide for Agent-Admin

## Purpose
Automatically maintain Claude Code hook files when managing agents to ensure proper logging and detection for all agents.

## Critical Hook Files
- **`.claude/hooks/agent-detection-hook.sh`**: Contains patterns for detecting agent spawn requests
- **`.claude/hooks/task-completion-hook.sh`**: Contains patterns for extracting agent types from tasks

## Hook Management Operations

### When CREATING a New Agent

1. **Update agent-detection-hook.sh**:
   ```bash
   # Add detection pattern block after existing patterns (before line 59)
   # Detect [agent-name] patterns
   if echo "$lower_input" | grep -E "([keywords])" > /dev/null; then
       agent_type="[agent-name]"
   fi
   ```

2. **Update task-completion-hook.sh**:
   ```bash
   # Add extraction pattern after existing patterns (before line 46)
   elif echo "$params" | grep -i "[agent-name]" > /dev/null; then
       echo "[agent-name]"
   ```

### When DELETING an Agent

1. **Remove from agent-detection-hook.sh**:
   - Remove entire detection block for the agent (4-5 lines)
   - Preserve proper spacing and structure

2. **Remove from task-completion-hook.sh**:
   - Remove the elif clause for the agent (2 lines)
   - Maintain proper elif chain structure

### When EDITING an Agent

1. **Update patterns if keywords change**:
   - Find existing pattern block in agent-detection-hook.sh
   - Update the grep pattern with new keywords
   - Ensure consistency with agent definition

2. **Update agent name if changed**:
   - Update agent_type assignment in agent-detection-hook.sh
   - Update echo statement in task-completion-hook.sh

## Implementation Functions

### addAgentToHooks(agentName, keywords)
```javascript
function addAgentToHooks(agentName, keywords) {
    // 1. Read current hook files
    // 2. Parse keywords into grep pattern
    // 3. Insert detection block in agent-detection-hook.sh
    // 4. Insert extraction pattern in task-completion-hook.sh
    // 5. Validate syntax of modified files
    // 6. Write updated files
}
```

### removeAgentFromHooks(agentName)
```javascript
function removeAgentFromHooks(agentName) {
    // 1. Read current hook files
    // 2. Find and remove agent blocks
    // 3. Validate remaining structure
    // 4. Write updated files
}
```

### updateAgentInHooks(agentName, newKeywords)
```javascript
function updateAgentInHooks(agentName, newKeywords) {
    // 1. Read current hook files
    // 2. Find existing agent blocks
    // 3. Update patterns with new keywords
    // 4. Validate syntax
    // 5. Write updated files
}
```

## Pattern Construction Rules

### Keywords to Grep Pattern Conversion
- Single words: `"keyword"` → `"keyword"`
- Multiple words: `"word1", "word2"` → `"(word1|word2)"`
- Phrases: `"multi word"` → `"multi.*word"`
- Complex triggers: Build comprehensive pattern with alternatives

### Example Pattern Building
```yaml
keywords: ["finance", "financial", "budget", "investment"]
```
Becomes:
```bash
"(finance|financial|budget|investment)"
```

```yaml
keywords: ["agent-admin", "create agent", "new agent"]
```
Becomes:
```bash
"(agent.admin|agent admin|create.*agent|new.*agent)"
```

## Validation Requirements

### Pre-Update Validation
- Verify hook files exist
- Check current syntax is valid
- Backup current state for rollback

### Post-Update Validation
- Test bash syntax: `bash -n [hook-file]`
- Verify pattern matching works
- Ensure no duplicate patterns
- Test agent detection with sample inputs

### Error Handling
- If validation fails, rollback to backup
- Log errors to agent management log
- Notify user of hook update failure
- Continue with agent operation (non-blocking)

## Integration Points

### Agent Creation Workflow
1. Create agent file
2. **Add agent to hooks** ← NEW STEP
3. Update CLAUDE.md
4. Validate configuration

### Agent Deletion Workflow
1. Confirm deletion
2. **Remove agent from hooks** ← NEW STEP
3. Delete agent files
4. Update CLAUDE.md

### Agent Edit Workflow
1. Modify agent configuration
2. **Update agent in hooks if keywords changed** ← NEW STEP
3. Update CLAUDE.md
4. Validate changes

## Testing Checklist
- ✅ New agents are detected by hooks
- ✅ Deleted agents no longer trigger detection
- ✅ Modified agent keywords work correctly
- ✅ Hook files remain syntactically valid
- ✅ Logging continues to work for all agents
- ✅ No duplicate patterns created
- ✅ Existing agents remain functional

## Common Patterns Library

### Standard Agent Patterns
```bash
# Technical agents
"(developer|dev agent|implement|code|build)"
"(devops|deploy|infrastructure|docker|kubernetes)"

# Management agents
"(agent.admin|create.*agent|manage.*agent)"
"(project.*manager|pm agent|planning)"

# Creative agents
"(design|designer|ui/ux|creative)"
"(music|compose|songwriting|audio)"

# Business agents
"(finance|financial|budget|accounting)"
"(marketing|sales|customer|crm)"
```

## Hook File Structure Reference

### agent-detection-hook.sh Structure
- Lines 1-25: Setup and initialization
- Lines 26-60: Agent detection patterns
- Lines 61-80: Logging logic
- Lines 81-100: Output and completion

### task-completion-hook.sh Structure  
- Lines 1-30: Setup and parsing
- Lines 31-48: Agent type extraction
- Lines 49-70: Logging and output

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)