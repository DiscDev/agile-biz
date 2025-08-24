# AgileAiAgents Statusline Testing Guide

## Overview
This guide provides comprehensive testing procedures for the AgileAiAgents statusline system to ensure proper functionality across all scenarios.

## Test Setup

### Prerequisites
- AgileAiAgents v4.8.0+ installed
- Claude Code with statusline configured
- Bash, jq, and curl available
- Write access to project directories

### Test Environment Setup
```bash
# Backup current state
cp agile-ai-agents/project-state/current-state.json \
   agile-ai-agents/project-state/backup-state.json

# Create test directories
mkdir -p agile-ai-agents/project-documents/orchestration/sprints/current
mkdir -p .claude/hooks/status
```

## Core Functionality Tests

### 1. Basic Display Test
```bash
# Test with minimal state
echo '{"currentWorkingDirectory":"'$(pwd)'","model":"claude-opus-4-1"}' | \
  .claude/hooks/statusline-enhanced.sh
```
Expected: Shows basic status or "No active project"

### 2. Priority System Tests

#### Stakeholder Action (Highest Priority)
```json
{
  "stakeholder_action": {
    "needed": "Create GitHub repository",
    "urgency_minutes": 5
  }
}
```
Expected Output:
```
⚠️ ACTION NEEDED | Create GitHub repository | 5m until blocked | See above ⬆️
```

#### Phase Stall Detection
Set `last_update` to >15 minutes ago:
```json
{
  "workflow_state": {
    "last_update": "2025-01-14T08:00:00Z"
  }
}
```
Expected: `🔴 PHASE STALLED | [phase] | >15m inactive`

#### Critical Alerts
```json
{
  "sprint": {
    "blockers": ["issue1", "issue2", "issue3"]
  },
  "session": {
    "tokens_used": 92000,
    "token_limit": 100000
  }
}
```
Expected: `🔴 ALERT | 3 blockers | Token 92% | Check dashboard ↗`

### 3. Verbosity Mode Tests

#### Quiet Mode
Set in CLAUDE-config.md:
```yaml
verbosity:
  level: "quiet"
```
Expected: Minimal display like `Sprint 1 | 3/5`

#### Verbose Mode
```yaml
verbosity:
  level: "verbose"
```
Expected: Detailed display with all enabled components

#### Debug Mode
```yaml
verbosity:
  level: "debug"
```
Expected: Internal states like `W:new-project P:Sprint 1 A:3/parallel`

### 4. Workflow-Specific Tests

#### New Project Workflow
```json
{
  "workflow_state": {
    "active_workflow": "new-project",
    "workflow_phase": "Sprint 1 CI/CD Setup",
    "discovery": {
      "sections_completed": ["overview", "technical", "user-stories"]
    }
  }
}
```
Expected: `🔄 Sprint 1 CI/CD | Step 3/5`

#### Existing Project Workflow
```json
{
  "workflow_state": {
    "active_workflow": "existing-project",
    "workflow_phase": "Analysis Phase",
    "analysis": {
      "progress": 67
    }
  }
}
```
Expected: `🔵 Analyzing | 67%`

### 5. Sub-Agent Coordination Tests

#### Parallel Execution
```json
{
  "agents": {
    "active": [
      {"name": "DevOps"},
      {"name": "Coder"},
      {"name": "Testing"}
    ]
  }
}
```
Expected: `3 agents (60% faster)` or `DevOps+Coder+Testing`

#### Agent Conflicts
```json
{
  "agents": {
    "conflicts": [{"type": "file", "resource": "config.json"}]
  }
}
```
Expected: Alert mode with `1 agent conflicts`

### 6. Performance Tests

#### Cache Functionality
```bash
# First call creates cache
time .claude/hooks/statusline-enhanced.sh

# Second call should be faster (uses cache)
time .claude/hooks/statusline-enhanced.sh

# Cache expires after 2 seconds
sleep 3
time .claude/hooks/statusline-enhanced.sh
```

#### Large State Files
Create a state file >100KB and test response time.
Expected: <300ms response time

### 7. Error Handling Tests

#### Missing State File
```bash
rm agile-ai-agents/project-state/current-state.json
.claude/hooks/statusline-enhanced.sh
```
Expected: Graceful fallback, shows "No active project"

#### Malformed JSON
```bash
echo '{"invalid json' > agile-ai-agents/project-state/current-state.json
.claude/hooks/statusline-enhanced.sh
```
Expected: Handles gracefully, shows basic status

#### Permission Issues
```bash
chmod 000 agile-ai-agents/project-state/current-state.json
.claude/hooks/statusline-enhanced.sh
chmod 644 agile-ai-agents/project-state/current-state.json
```
Expected: Shows minimal status without crashing

### 8. Integration Tests

#### Dashboard Connection
```bash
# Start dashboard
npm run dashboard &

# Test statusline
.claude/hooks/statusline-enhanced.sh
```
Expected: Shows `Dashboard ↗` when online

#### Hook System Integration
```bash
# Create active hook files
touch .claude/hooks/status/test.active
.claude/hooks/statusline-enhanced.sh
```
Expected: Hook count reflected in verbose/debug mode

#### Community Learning
```json
{
  "pending": ["pattern1", "pattern2"],
  "patterns_detected": ["async", "error-boundary"],
  "average_confidence": 85
}
```
Save to `community-learnings/status.json`
Expected: `💡 Learning opportunity | 2 patterns | Contribute? ↗`

## Edge Cases

### 1. Extremely Long Phases
Test with phase names >50 characters
Expected: Truncated with "..."

### 2. Negative Values
Test with negative costs, tokens, progress
Expected: Treated as 0 or ignored

### 3. Future Timestamps
Test with future `last_update` times
Expected: No stall detection triggered

### 4. Concurrent Modifications
Modify state file while statusline is reading
Expected: No corruption, uses last valid state

### 5. Unicode and Special Characters
Test with emoji and special chars in state
Expected: Proper display without breaking

## Automated Test Suite

### Running the Full Test Suite
```bash
./test-statusline.sh
```

### Test Coverage Areas
- [x] Priority system (P1-P5)
- [x] All verbosity modes
- [x] Workflow-specific displays
- [x] Alert conditions
- [x] Recovery status
- [x] Learning opportunities
- [x] Performance/caching
- [x] Error handling
- [ ] Dashboard integration
- [ ] Live agent coordination
- [ ] Real sprint tracking
- [ ] MCP server status

## Performance Benchmarks

### Expected Response Times
- Cold start: <500ms
- Cached: <50ms
- Large state: <300ms
- Error recovery: <200ms

### Resource Usage
- Memory: <10MB
- CPU: <5% average
- Disk I/O: Minimal (cached)

## Troubleshooting Common Issues

### Issue: Statusline Shows Old Information
**Solution**: Clear cache
```bash
rm .claude/hooks/.statusline-cache
```

### Issue: Colors Not Displaying
**Solution**: Check terminal ANSI support
```bash
echo -e "\033[32mGreen\033[0m \033[33mYellow\033[0m \033[31mRed\033[0m"
```

### Issue: Statusline Too Wide/Narrow
**Solution**: Adjust max_width in CLAUDE-config.md
```yaml
statusline:
  display:
    max_width: 100  # Adjust as needed
```

### Issue: Dashboard Link Not Showing
**Solution**: Check dashboard status file
```bash
cat agile-ai-agents/project-state/dashboard-status.json
curl -s http://localhost:3001/health
```

### Issue: Performance Degradation
**Solution**: Check for large files
```bash
du -h agile-ai-agents/project-state/*.json
find .claude/hooks/status -type f | wc -l
```

## Validation Checklist

Before considering the statusline ready for production:

- [ ] All priority levels display correctly
- [ ] Verbosity modes work as expected
- [ ] Cache improves performance
- [ ] Error handling is robust
- [ ] Colors display properly
- [ ] Width constraints respected
- [ ] Special characters handled
- [ ] Performance meets benchmarks
- [ ] Integration points functional
- [ ] Documentation complete

## Continuous Testing

### Monitor in Development
```bash
# Watch statusline output
watch -n 1 '.claude/hooks/statusline-enhanced.sh'
```

### Log Output for Analysis
```bash
# Create log file
.claude/hooks/statusline-enhanced.sh >> statusline.log 2>&1
```

### Performance Monitoring
```bash
# Track execution time
for i in {1..100}; do
  time .claude/hooks/statusline-enhanced.sh > /dev/null
done | grep real
```

---

**Created**: 2025-01-14  
**Version**: 1.0.0  
**Component**: AgileAiAgents Statusline Testing