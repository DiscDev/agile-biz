# AgileAiAgents Hook System

## Overview

The AgileAiAgents Hook System provides automated workflows triggered by Claude Code events. This enables real-time synchronization, validation, and monitoring without manual intervention.

## Quick Start

### 1. Enable Hooks in Claude Code

Copy the provided settings to your Claude Code configuration:

```bash
cp .claude/settings.json ~/.config/claude/settings.json
```

### 2. Choose a Hook Profile

The system includes three pre-configured profiles:

- **minimal**: Essential hooks only (MD→JSON sync, security)
- **standard**: Recommended configuration (includes validation, sprint tracking)
- **advanced**: All hooks enabled (includes monitoring, context tracking)

Set your profile in `hooks/config/hook-config.json`:

```json
{
  "profile": "standard"
}
```

### 3. Test Your Hooks

```bash
# Test all hooks
node hooks/test-hooks.js test

# Test specific hook
node hooks/test-hooks.js test md-json-sync

# Performance test
node hooks/test-hooks.js perf md-json-sync 100
```

## Available Hooks

### Phase 1: MD to JSON Auto-Sync (Implemented)

#### `md-json-sync`
- **Trigger**: File create/change
- **Purpose**: Automatically converts MD files to JSON format
- **Benefits**: 80-90% token reduction for agent operations

#### `json-cleanup`
- **Trigger**: File delete
- **Purpose**: Removes orphaned JSON files when MD files are deleted
- **Benefits**: Maintains clean file structure

### Phase 2: Sprint Management (Planned)

#### `sprint-tracking`
- **Trigger**: Sprint document changes
- **Purpose**: Updates sprint metrics and progress
- **Benefits**: Real-time sprint visibility

#### `pulse-generator`
- **Trigger**: Significant sprint events
- **Purpose**: Creates AI-native pulse updates
- **Benefits**: Event-driven updates instead of time-based

### Phase 3: State Management (Planned)

#### `state-backup`
- **Trigger**: State file changes + time interval
- **Purpose**: Creates periodic state backups
- **Benefits**: Recovery from any point in time

#### `session-tracker`
- **Trigger**: Session start/end
- **Purpose**: Tracks work sessions
- **Benefits**: Continuity across Claude Code sessions

## Hook Configuration

### Global Settings

Edit `hooks/config/hook-config.json`:

```json
{
  "enabled": true,
  "profile": "standard",
  "performance": {
    "timeout": 5000,
    "warningThreshold": 1000,
    "maxRetries": 3
  }
}
```

### Agent-Specific Settings

Configure hooks per agent:

```json
{
  "agentSpecific": {
    "coder_agent": {
      "enabled": true,
      "hooks": ["structure-validation", "format-on-save"]
    }
  }
}
```

## Performance Monitoring

The system automatically tracks hook performance:

```bash
# View performance report
node hooks/hook-manager.js report

# Reset performance metrics
node hooks/hook-manager.js reset-metrics
```

### Performance Thresholds

- **Excellent**: < 100ms
- **Good**: 100-500ms
- **Fair**: 500-1000ms
- **Poor**: 1000-5000ms
- **Critical**: > 5000ms (hook may be disabled)

## Troubleshooting

### Hooks Not Executing

1. Check Claude Code settings:
   ```bash
   cat ~/.config/claude/settings.json
   ```

2. Verify hook scripts are executable:
   ```bash
   ls -la .claude/hooks/
   ```

3. Check hook manager logs:
   ```bash
   tail -f logs/hooks.log
   ```

### Performance Issues

1. Check performance metrics:
   ```bash
   cat hooks/metrics/performance.json
   ```

2. Disable slow hooks:
   ```json
   {
     "agentSpecific": {
       "slow_agent": {
         "enabled": false
       }
     }
   }
   ```

3. Use minimal profile for better performance

### MD to JSON Sync Issues

1. Verify converter is working:
   ```bash
   node machine-data/scripts/universal-md-to-json-converter.js test
   ```

2. Check sync logs:
   ```bash
   tail -f logs/md-json-sync.log
   ```

3. Manually trigger conversion:
   ```bash
   /convert-all-md-to-json
   ```

## Development

### Creating Custom Hooks

1. Create handler in `hooks/handlers/[category]/[hook-name].js`
2. Register in `hooks/registry/hook-registry.json`
3. Add shell script trigger if needed
4. Test with `node hooks/test-hooks.js test [hook-name]`

### Hook Handler Template

```javascript
class MyHookHandler {
  constructor() {
    this.context = this.parseContext();
  }

  parseContext() {
    return {
      filePath: process.env.FILE_PATH,
      activeAgent: process.env.ACTIVE_AGENT,
      timestamp: new Date().toISOString()
    };
  }

  async execute() {
    try {
      // Your hook logic here
      return { status: 'success', result: {} };
    } catch (error) {
      console.error('Hook failed:', error);
      throw error;
    }
  }
}
```

## Security Considerations

- Hooks run with workspace permissions only
- Input sanitization for all user prompts
- Automatic secret detection and blocking
- Audit trail for all hook executions

## Future Enhancements

### Phase 2: Sprint Management
- Automated sprint document creation
- Velocity tracking and forecasting
- Blocker detection and escalation

### Phase 3: State Management
- Intelligent state compression
- Cross-session context preservation
- Automated checkpoint creation

### Phase 4: Agent Coordination
- Agent handoff automation
- Parallel execution optimization
- Workflow state synchronization

### Phase 5: Dashboard Integration
- Real-time hook status display
- Performance metrics visualization
- Hook configuration UI