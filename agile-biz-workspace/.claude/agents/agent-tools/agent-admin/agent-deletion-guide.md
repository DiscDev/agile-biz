---
title: Agent Deletion Guide
type: agent-context
token_count: 892
keywords: [delete, remove, cleanup, obsolete, agent-admin]
agents: [agent-admin]
---

# Agent Deletion Guide - Comprehensive Agent Removal

## 🔒 CRITICAL: Self-Protection Protocol

### AGENT-ADMIN CANNOT DELETE ITSELF
**BEFORE any deletion operation, MUST execute this check:**

```javascript
// MANDATORY self-protection check (case-insensitive)
if (agentName.toLowerCase() === 'agent-admin') {
    const errorMsg = 'CRITICAL ERROR: agent-admin is system-critical and cannot be deleted';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
}
```

### Protected Agents List
- **agent-admin**: System-critical, NEVER deletable
- Future system agents can be added to this protected list

### Error Response Template
When deletion of agent-admin is attempted:
```
❌ DELETION REJECTED

Agent: agent-admin
Status: SYSTEM-CRITICAL - CANNOT BE DELETED
Reason: agent-admin is required for all agent management operations

This protection cannot be overridden or bypassed under any circumstances.

To delete other agents, specify a different agent name.
```

## Agent Deletion Process

### Phase 1: Pre-Deletion Validation
1. **Self-Protection Check**: Verify agent is not agent-admin
2. **Agent Existence**: Confirm agent file exists in `.claude/agents/`
3. **Dependency Check**: Verify no other agents depend on this agent
4. **Backup Creation**: Create backup before any deletion operations

### Phase 2: Systematic Cleanup
1. **Agent File Removal**: Delete main agent configuration file
2. **Context Files**: Remove all agent-specific context files
3. **Hook Updates**: Remove agent patterns from detection hooks
4. **CLAUDE.md Updates**: Remove agent documentation
5. **Logging Cleanup**: Remove agent references from logging configuration

### Phase 3: Validation & Confirmation
1. **File System Check**: Verify all files have been removed
2. **Hook Validation**: Ensure hook files remain syntactically valid
3. **Documentation Check**: Confirm CLAUDE.md is properly updated
4. **Integration Test**: Verify remaining agents still function correctly

## Deletion Implementation Script

### Using AgentLifecycleManager
```javascript
const manager = new AgentLifecycleManager();

try {
    // This will automatically include self-protection check
    await manager.deleteAgent(agentName);
    console.log(`✅ Agent ${agentName} deleted successfully`);
} catch (error) {
    if (error.message.includes('system-critical')) {
        console.error('❌ Cannot delete system-critical agent');
    } else {
        console.error(`❌ Deletion failed: ${error.message}`);
    }
}
```

### Manual Deletion Checklist
If using manual deletion process:

#### Pre-Deletion (MANDATORY)
- [ ] Execute self-protection check for agent-admin
- [ ] Verify agent exists and is not system-critical
- [ ] Create backup of current agent configuration
- [ ] Document deletion reason and date

#### File Removal
- [ ] Delete `.claude/agents/[agent-name].md`
- [ ] Delete `.claude/agents/agent-tools/[agent-name]/` directory
- [ ] Remove agent references from `.claude/hooks/agent-detection-hook.sh`
- [ ] Remove agent references from `.claude/hooks/task-completion-hook.sh`

#### Documentation Updates
- [ ] Remove agent entry from CLAUDE.md
- [ ] Update agent count in documentation
- [ ] Remove agent from usage examples if applicable

#### Validation
- [ ] Test hook files syntax: `bash -n .claude/hooks/agent-detection-hook.sh`
- [ ] Test hook files syntax: `bash -n .claude/hooks/task-completion-hook.sh`
- [ ] Verify CLAUDE.md formatting is correct
- [ ] Test remaining agents still spawn correctly

## Error Scenarios & Recovery

### Agent-Admin Self-Deletion Attempt
**Error**: "CRITICAL ERROR: agent-admin is system-critical and cannot be deleted"
**Recovery**: No action needed - this is expected behavior
**Solution**: Delete different agent or create replacement management system

### Hook File Corruption
**Error**: Syntax errors in hook files after deletion
**Recovery**: 
1. Restore hook files from backup
2. Manually remove agent references
3. Validate syntax before final commit

### CLAUDE.md Corruption
**Error**: Malformed CLAUDE.md after agent removal
**Recovery**:
1. Restore CLAUDE.md from backup
2. Manually remove agent documentation
3. Verify markdown formatting

### Incomplete Deletion
**Error**: Agent files partially removed
**Recovery**:
1. Use cleanup script to remove remaining files
2. Manually verify all references are removed
3. Test agent spawning to ensure clean state

## Safety Guidelines

### Before Deletion
1. **Document Purpose**: Record why agent is being deleted
2. **Check Dependencies**: Ensure no other agents reference this agent
3. **Backup Everything**: Create complete backup of agent and references
4. **Test Environment**: Never delete agents in production without testing

### During Deletion
1. **Follow Sequence**: Complete deletion phases in order
2. **Validate Each Step**: Check each operation completed successfully
3. **Monitor Logs**: Watch for errors during deletion process
4. **Stop on Errors**: Do not continue if any step fails

### After Deletion
1. **Comprehensive Test**: Verify all remaining agents work correctly
2. **Documentation**: Update any process documentation that referenced deleted agent
3. **Clean Backups**: Archive deletion backups in organized manner
4. **Report Success**: Confirm deletion completed successfully

---

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)