---
allowed-tools: Read(*), Write(*), Task(subagent_type:project_state_manager_agent)
description: Recover from workflow errors and restore system state
argument-hint: "[error-type] or --auto-detect"
---

# Workflow Recovery

Diagnose and recover from workflow errors, system state corruption, and integration issues.

## Recovery Process

1. **Error Diagnosis**
   - Identify the type of workflow error
   - Analyze system state corruption
   - Check integration connectivity
   - Review error logs and symptoms

2. **Recovery Strategy Selection**
   - Automatic recovery for known issues
   - Manual intervention for complex problems
   - Rollback to last known good state
   - Complete system restoration if needed

3. **State Restoration**
   - Repair corrupted state files
   - Restore missing configurations
   - Fix integration connections
   - Validate system integrity

## Error Types and Recovery

### State File Corruption
**Symptoms**: Invalid JSON, missing state files, corrupt checkpoints
**Recovery**:
- Restore from most recent backup
- Rebuild state from available data
- Reset to clean state if necessary

### Integration Failures
**Symptoms**: AgileAI commands failing, document access errors
**Recovery**:
- Re-establish integration connections
- Repair symbolic links
- Update configuration paths
- Test communication channels

### Command Errors
**Symptoms**: Commands not executing, permission errors
**Recovery**:
- Fix command definitions
- Repair file permissions
- Update command paths
- Reinstall command infrastructure

### Project State Inconsistency
**Symptoms**: Conflicting states, missing decisions, orphaned data
**Recovery**:
- Reconcile state conflicts
- Restore missing decision data
- Clean up orphaned references
- Rebuild consistency checks

## Auto-Detection Mode

When using `--auto-detect`, perform comprehensive system scan:

1. **System Health Check**
   ```
   ✓ Check workflow-state.json validity
   ✓ Verify decision log integrity
   ✓ Test AgileAI integration
   ✓ Validate command accessibility
   ✓ Check file permissions
   ✓ Verify directory structure
   ```

2. **Error Classification**
   - Critical: System cannot function
   - Major: Core features impaired
   - Minor: Some features degraded
   - Warning: Potential future issues

3. **Recovery Prioritization**
   - Fix critical errors first
   - Address major issues
   - Schedule minor repairs
   - Log warnings for monitoring

## Recovery Procedures

### Quick Recovery (Common Issues)
```bash
# State file repair
cp workflow-state.json.backup workflow-state.json

# Permission fixes
chmod 644 project-state/*.json
chmod 755 .claude/commands/

# Integration repair
ln -sf ../agile-ai-agents/project-documents .agile-ai/project-documents
```

### Advanced Recovery
- Rebuild state from scratch
- Migrate from corrupted data
- Manual data entry recovery
- Expert intervention required

## Output Format

```
🚨 WORKFLOW RECOVERY
====================

🔍 Error Detection
  Scan completed: [timestamp]
  Issues found: [X critical, Y major, Z minor]
  
❗ Critical Issues
  • Workflow state corrupted (workflow-state.json)
  • AgileAI integration broken
  
⚠️  Major Issues  
  • Decision log missing entries
  • Commands not accessible
  
📋 Recovery Plan
  1. Restore workflow state from backup
  2. Repair AgileAI integration
  3. Rebuild decision log
  4. Test command functionality

🔧 Recovery Actions
  ✅ Workflow state restored
  ✅ Integration repaired
  ✅ Decision log rebuilt
  ✅ Commands tested successfully

📊 Recovery Summary
  Duration: [X minutes]
  Issues resolved: [8/8]
  Success rate: 100%
  
✅ System recovered successfully!
  
🎯 Next Steps
  1. Run /verify-context to confirm recovery
  2. Create new checkpoint with /checkpoint
  3. Review /aaa-status for system health
  
Recovery complete. System ready for normal operation.
```

## Prevention Measures

After recovery, implement safeguards:
- Enable automatic backups
- Set up integrity monitoring
- Configure error alerting
- Create recovery documentation

## Recovery Logs

Maintain detailed recovery logs:
- Error symptoms and diagnosis
- Recovery actions performed
- Results and validation
- Prevention measures implemented
- Lessons learned

## Expert Mode

For complex recovery scenarios:
- Manual state editing
- Custom recovery scripts
- Data migration tools
- System architecture changes

## Rollback Safety

Always prepare rollback options:
- Create pre-recovery backup
- Document current state
- Test recovery in isolation
- Validate rollback procedures