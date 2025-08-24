# AgileAiAgents Statusline Configuration Guide

## Overview
The AgileAiAgents statusline provides real-time visibility into project status, workflow progress, agent coordination, and system health directly in Claude Code's interface.

## How It Works

The statusline appears at the bottom of your Claude Code interface and updates automatically as you work. It reads from multiple AgileAiAgents system files to provide a comprehensive view of your project status.

### Information Sources
- `CLAUDE-config.md` - Configuration settings
- `project-state/current-state.json` - Active workflow and progress
- `project-documents/orchestration/sprints/current/` - Sprint information
- `.claude/hooks/status/` - Hook system status
- `project-state/dashboard-status.json` - Dashboard connection

## Display Modes

### 1. Normal Operations
Shows standard project progress and agent activity:
```
🟢 Sprint 1 CI/CD | 3 agents working | Step 4/7 (57%) | Auto-save ✓ | $2.34 | Dashboard ↗
```

### 2. Stakeholder Action Required
Prioritizes urgent actions that need human intervention:
```
⚠️ ACTION NEEDED | Create GitHub repo "project-name" | 5 mins until blocked | See above ⬆️
```

### 3. System Alert
Highlights critical issues requiring attention:
```
🔴 BLOCKED | 2 agents timeout | Token limit 85% | Recovery in progress | Check dashboard
```

## Configuration

### Enable/Disable Statusline
Edit `.claude/settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": "/path/to/.claude/hooks/statusline.sh",
    "padding": 0
  }
}
```
Remove the `statusLine` section to disable.

### Configuration Options
Edit the statusline section in `CLAUDE-config.md`:

```yaml
statusline:
  enabled: true                  # Master switch
  mode: "adaptive"               # static | adaptive | alert-priority
  update_frequency: 500          # milliseconds (min 300)
  
  display:
    show_health: true           # Health indicator
    show_milestone: true        # Last milestone
    show_agents: true           # Agent status
    show_cost: true             # Session cost
    show_dashboard: true        # Dashboard link
    show_hooks: false           # Hook details (verbose only)
    show_tokens: false          # Token count (debug only)
    max_width: 120              # Character limit
```

## Verbosity Levels

The statusline adapts based on your verbosity setting in `CLAUDE-config.md`:

### Quiet Mode
Minimal information for focused work:
```
Sprint 1 | 3/5
```

### Normal Mode (Default)
Balanced information display:
```
🟢 Sprint 1 | 3/5 stories | 2 agents | $2.34 | Dashboard ↗
```

### Verbose Mode
Detailed information including metrics:
```
🟢 ✓ Research Done | Sprint 1 Day 2 | 3/5 stories | 2 agents (60% faster) | $2.34 (23k tokens) | Dashboard ↗
```

### Debug Mode
Everything including internal states:
```
🟢 ✓ Research Done | Sprint 1 Day 2 | 3/5 stories | DevOps+Coder+Testing (parallel 60%) | $2.34 (23,456/100k tokens) | Hooks: 47 active (15ms) | Dashboard: connected | Health: good
```

## Status Indicators

### Health Icons
- 🟢 **Green** - Healthy, no issues
- 🟡 **Yellow** - Warning, 1-2 blockers
- 🔴 **Red** - Critical, 3+ blockers or major issues

### Progress Indicators
- `3/5` - Numeric progress (completed/total)
- `57%` - Percentage completion
- `Step 4/7` - Current step in process

### Efficiency Metrics
- `45% faster` - 2 agents working in parallel
- `60% faster` - 3 agents working in parallel
- `70% faster` - 4 agents working in parallel
- `75% faster` - 5 agents working in parallel

### Special Indicators
- ✓ - Completed milestone
- ⚠️ - Action required
- ↗ - External link available
- ⬆️ - See information above in conversation

## Alert Thresholds

The statusline will automatically switch to alert mode when:

### Cost Thresholds
- **Warning** at $5 per session
- **Alert** at $10 per session
- **Critical** at $50 per session

### Token Usage
- **Warning** at 80% of limit
- **Alert** at 90% of limit
- **Critical** at 95% of limit

### Time-Based
- **Phase stall** after 15 minutes of inactivity
- **Agent timeout** after 5 minutes no response
- **Action urgency** countdown when blocking

## Workflow-Specific Displays

### New Project Workflow

**Discovery Phase:**
```
🔵 Discovery | Section 2/5: Technical | Awaiting approval
```

**Research Phase:**
```
🔵 Research (Medium) | 28/48 docs | Market Analysis | 2.5hrs elapsed
```

**Sprint Phase:**
```
🟢 Sprint 1 CI/CD | Step 4/7: GitHub Actions | 3 agents working
```

### Existing Project Workflow

**Analysis Phase:**
```
🔵 Analyzing | 1,234 files scanned | 78% complete
```

**Migration Phase:**
```
🟡 Migration | Zero-downtime mode | Rollback ready | Step 3/5
```

**Enhancement Phase:**
```
🟢 Enhancements | 4/10 improvements | All tests passing
```

## Customization

### Change Colors
Edit the colors section in `CLAUDE-config.md`:
```yaml
colors:
  health_good: "green"
  health_warning: "yellow"
  health_critical: "red"
  action_needed: "bold_yellow"
  milestone: "dim_white"
  progress: "cyan"
  sub_agents: "blue"
  cost: "magenta"
```

### Adjust Auto-Mode Switching
```yaml
auto_mode_switches:
  alert_on_error: true        # Auto-switch to alert mode
  verbose_on_action: true     # Expand for actions
  quiet_during_research: true # Minimize during long ops
```

### Configure Abbreviations
```yaml
abbreviations:
  use_icons: true             # Use emoji icons
  shorten_agent_names: true   # DevOps → DO
  compress_progress: true     # 3/5 → 60%
```

## Troubleshooting

### Statusline Not Appearing
1. Check `.claude/settings.json` has statusLine configured
2. Verify `statusline.sh` is executable: `chmod +x .claude/hooks/statusline.sh`
3. Check `CLAUDE-config.md` has `statusline.enabled: true`

### Incorrect Information
1. Verify `project-state/current-state.json` exists and is valid JSON
2. Check file permissions on state files
3. Ensure AgileAiAgents hooks are running

### Performance Issues
1. Increase `update_frequency` in config (e.g., 1000ms)
2. Disable unnecessary display options
3. Use quiet mode during intensive operations

### Testing Statusline
Test with mock data:
```bash
echo '{"currentWorkingDirectory":"$(pwd)","model":"claude-opus-4-1"}' | .claude/hooks/statusline.sh
```

## Examples by Scenario

### Sprint Development
```
🟢 Sprint 2 Day 1 | User Auth Story | 2/8 complete | 3 agents | $4.56
```

### CI/CD Setup (Sprint 1)
```
🟡 Sprint 1 CI/CD | GitHub Actions setup | ACTION: Add secrets | 3m ⚠️
```

### Long Research Phase
```
🔵 Research Phase | 124/194 docs | 4 agents parallel | 3.5hrs | $12.34
```

### Multiple Issues
```
🔴 ALERT | 3 blockers | Agent timeout | Token 87% | Recovery active
```

### Project Complete
```
🟢 Project Complete | 5 sprints done | 47 stories delivered | Archive ready
```

## Best Practices

1. **Keep it Readable** - Don't overload with information
2. **Prioritize Actions** - Always show what needs human attention
3. **Use Color Wisely** - Reserve red for critical issues only
4. **Update Frequency** - Balance freshness with performance
5. **Context Matters** - Show different info during different phases

## Integration with Commands

The statusline works seamlessly with AgileAiAgents commands:
- `/aaa-status` - Full status details
- `/aaa-config` - View/modify statusline settings
- `/sprint-status` - Detailed sprint information
- `/checkpoint` - Save current state

## Version Compatibility

- **AgileAiAgents**: v4.8.0+
- **Claude Code**: Latest version
- **Requirements**: Bash, jq, curl

---

**Created**: 2025-01-14  
**Version**: 1.0.0  
**Component**: AgileAiAgents Statusline System