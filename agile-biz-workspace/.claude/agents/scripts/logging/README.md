# Logging System for Claude Code Agents

## Overview
This logging system tracks agent spawning and context loading for Claude Code agents in the AgileBiz workspace.

## Files

### Core Components
- **logging-functions.js** - Main logging functionality with basic-log and full-log commands
- **agent-wrapper.js** - Wrapper script for agent spawning with automatic logging
- **auto-logger.js** - Automatic logging integration for agent spawning
- **test-logging.js** - Test suite to verify logging system functionality

### Configuration
- **logging-config.json** - Controls whether logging is enabled/disabled (located in `.claude/agents/settings/`)

### Documentation
- **logging-functions.md** - Detailed documentation of logging functions and usage

## Usage

### Manual Logging
```bash
# Basic logging
node .claude/agents/scripts/logging/logging-functions.js basic-log [agent-type] "[request]"

# Full logging with context
node .claude/agents/scripts/logging/logging-functions.js full-log [agent-type] "[request]"
```

### Agent Wrapper
```bash
# Spawn agent with automatic logging
node .claude/agents/scripts/logging/agent-wrapper.js [agent-type] "[request]"
```

### Testing
```bash
# Run test suite
node .claude/agents/scripts/logging/test-logging.js
```

## Log Output
- Logs are stored in `.claude/agents/logs/agents.json`
- Error logs are stored in `.claude/agents/logs/error.log`
- Logs contain:
  - Timestamp
  - Event type (agent_spawn, context_loading)
  - Agent ID (unique identifier)
  - Agent type (developer, devops, etc.)
  - User request
  - Contexts loaded (with token counts)

## Configuration
The logging system can be enabled/disabled via `.claude/agents/settings/logging-config.json`:
```json
{
  "enabled": false,
  "logFile": ".claude/agents/logs/agents.json",
  "errorFile": ".claude/agents/logs/error.log"
}
```

## Test Results
The test suite validates:
- All logging scripts exist
- Logging functions work correctly
- Log file structure is valid
- No duplicate or backup files remain
- System handles disabled state gracefully

Latest test results are saved to `test-results.json` after each run.

**AgileBiz™** - Created by Phillip Darren Brown (https://github.com/DiscDev)