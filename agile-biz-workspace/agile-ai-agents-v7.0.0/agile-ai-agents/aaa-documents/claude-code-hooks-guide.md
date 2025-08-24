# Claude Code Hooks and Automation Guide for AgileAiAgents

## Overview

Claude Code's hooks system allows you to automate workflows, enforce policies, and integrate AgileAiAgents operations with your development environment. This guide provides practical hook configurations specifically designed for AgileAiAgents projects.

## Understanding Hooks

### What are Hooks?

Hooks are automated scripts that execute at specific points during Claude Code operations:
- **Before** tools are used (validation, preparation)
- **After** tools complete (logging, notifications)
- **When** users submit prompts (routing, context enhancement)
- **During** specific events (errors, completions)

### Hook Events

| Event | Trigger | Common Use Cases |
|-------|---------|------------------|
| `PreToolUse` | Before any tool executes | Validation, security checks |
| `PostToolUse` | After tool success | Logging, state updates |
| `UserPromptSubmit` | Before processing prompt | Command routing, context injection |
| `Notification` | System notifications | Alerts, integrations |
| `Stop` | Claude Code finishes | Checkpoints, cleanup |
| `SubagentStop` | Subagent completes | Multi-agent coordination |

## Hook Configuration

### Configuration Files

Hooks are configured in JSON settings files:

```
~/.claude/settings.json          # User-level hooks (all projects)
.claude/settings.json            # Project hooks (team-shared)
.claude/settings.local.json      # Local overrides (personal)
```

### Basic Hook Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "filter": "file-pattern",
        "hooks": [
          {
            "type": "command",
            "command": "path/to/script.sh",
            "timeout": 30000,
            "blocking": true
          }
        ]
      }
    ]
  }
}
```

## AgileAiAgents-Specific Hooks

### 1. Sprint Management Hooks

#### Prevent Code Changes Without Active Sprint

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "filter": "**/*.{js,ts,py,java}",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/check-sprint-active.sh",
            "blocking": true,
            "description": "Ensure sprint is active before code changes"
          }
        ]
      }
    ]
  }
}
```

**Script: `.claude/hooks/check-sprint-active.sh`**
```bash
#!/bin/bash
# Check if active sprint exists
SPRINT_STATE=$(cat agile-ai-agents/project-state/current-state.json | jq -r '.current_sprint.status')

if [ "$SPRINT_STATE" != "active" ]; then
  echo "❌ No active sprint. Start a sprint first with /start-sprint"
  exit 2  # Blocking error
fi

echo "✅ Sprint active, proceeding with changes"
exit 0
```

#### Auto-Update Sprint Tracking

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "filter": "**/*.{js,ts,py}",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/update-sprint-tracking.sh",
            "blocking": false
          }
        ]
      }
    ]
  }
}
```

### 2. Document Management Hooks

#### Automatic JSON Conversion

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|MultiEdit",
        "filter": "project-documents/**/*.md",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/convert-to-json.sh",
            "timeout": 10000,
            "description": "Convert new MD documents to JSON"
          }
        ]
      }
    ]
  }
}
```

**Script: `.claude/hooks/convert-to-json.sh`**
```bash
#!/bin/bash
# Get the file that was created/modified
FILE_PATH="$CLAUDE_HOOK_TOOL_RESULT_PATH"

if [[ $FILE_PATH == *.md ]]; then
  # Trigger JSON conversion
  node agile-ai-agents/machine-data/document-json-generator.js "$FILE_PATH"
  echo "📄 Converted to JSON for optimal token usage"
fi
```

#### Document Registry Update

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "filter": "project-documents/**/sprint-*/**.md",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/update-document-registry.sh"
          }
        ]
      }
    ]
  }
}
```

### 3. Cost Management Hooks

#### Cost Alert Hook

```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/check-session-cost.sh",
            "interval": 7200000,
            "description": "Alert every 2 hours if cost exceeds limit"
          }
        ]
      }
    ]
  }
}
```

**Script: `.claude/hooks/check-session-cost.sh`**
```bash
#!/bin/bash
# Get current session cost
COST_OUTPUT=$(claude --no-input -p "/cost" 2>/dev/null)
CURRENT_COST=$(echo "$COST_OUTPUT" | grep "Total cost:" | awk '{print $3}' | tr -d '$')

# Check against limit
DAILY_LIMIT=10.00

if (( $(echo "$CURRENT_COST > $DAILY_LIMIT" | bc -l) )); then
  echo "⚠️ COST ALERT: Session cost ($CURRENT_COST) exceeds daily limit ($DAILY_LIMIT)"
  echo "Consider using /compact or wrapping up for the day"
fi
```

#### Auto-Compact on High Usage

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/auto-compact-check.sh",
            "description": "Auto-compact when context is high"
          }
        ]
      }
    ]
  }
}
```

### 4. State Management Hooks

#### Auto-Checkpoint on Phase Changes

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "filter": "**/current-state.json",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/phase-change-checkpoint.sh"
          }
        ]
      }
    ]
  }
}
```

#### Session End Reminder

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/session-end-reminder.sh",
            "description": "Remind to checkpoint if changes were made"
          }
        ]
      }
    ]
  }
}
```

**Script: `.claude/hooks/session-end-reminder.sh`**
```bash
#!/bin/bash
# Check if files were modified this session
MODIFIED_COUNT=$(git status --porcelain | wc -l)

if [ $MODIFIED_COUNT -gt 0 ]; then
  echo "💾 Reminder: You have $MODIFIED_COUNT uncommitted changes"
  echo "Consider running: /checkpoint \"Session summary\""
fi
```

### 5. Command Routing Hooks

#### AgileAiAgents Command Enhancement

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/enhance-commands.sh",
            "timeout": 2000
          }
        ]
      }
    ]
  }
}
```

**Script: `.claude/hooks/enhance-commands.sh`**
```bash
#!/bin/bash
USER_PROMPT="$CLAUDE_HOOK_USER_PROMPT"

# Add context to specific commands
case "$USER_PROMPT" in
  "/start-sprint"*)
    # Add current date to sprint commands
    echo "$USER_PROMPT --date $(date +%Y-%m-%d)"
    ;;
  "/checkpoint"*)
    # Add file count to checkpoint
    FILE_COUNT=$(git status --porcelain | wc -l)
    echo "$USER_PROMPT [$FILE_COUNT files modified]"
    ;;
  *)
    # Pass through unchanged
    echo "$USER_PROMPT"
    ;;
esac
```

### 6. Research Cache Hooks

#### Cache Research Results

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "filter": "project-documents/business-strategy/research/*.md",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/cache-research.sh",
            "description": "Cache expensive research for reuse"
          }
        ]
      }
    ]
  }
}
```

### 7. Testing Automation Hooks

#### Auto-Run Tests After Code Changes

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "filter": "src/**/*.{js,ts}",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/auto-test.sh",
            "blocking": false,
            "timeout": 60000
          }
        ]
      }
    ]
  }
}
```

**Script: `.claude/hooks/auto-test.sh`**
```bash
#!/bin/bash
# Get changed file
CHANGED_FILE="$CLAUDE_HOOK_TOOL_RESULT_PATH"

# Find corresponding test file
TEST_FILE=$(echo "$CHANGED_FILE" | sed 's/src/tests/' | sed 's/\.js$/.test.js/')

if [ -f "$TEST_FILE" ]; then
  echo "🧪 Running tests for $CHANGED_FILE"
  npm test -- "$TEST_FILE" --silent
fi
```

## Advanced Hook Patterns

### 1. Multi-Stage Hooks

Chain hooks for complex workflows:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "filter": "**/*.md",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/stage1-validate.sh"
          },
          {
            "type": "command",
            "command": ".claude/hooks/stage2-convert.sh"
          },
          {
            "type": "command",
            "command": ".claude/hooks/stage3-notify.sh"
          }
        ]
      }
    ]
  }
}
```

### 2. Conditional Hooks

Execute based on conditions:

```bash
#!/bin/bash
# Only run on main branch
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ]; then
  # Execute production validations
  ./validate-production.sh
fi
```

### 3. Communication Between Hooks

Use environment variables or files:

```bash
# Hook 1: Write to shared state
echo "VALIDATION_PASSED=true" > /tmp/claude-hook-state

# Hook 2: Read shared state
source /tmp/claude-hook-state
if [ "$VALIDATION_PASSED" = "true" ]; then
  # Proceed with next stage
fi
```

### 4. JSON Output for Advanced Control

Return JSON to modify Claude's behavior:

```bash
#!/bin/bash
# Return JSON to add context
cat << EOF
{
  "additionalContext": "Sprint deadline is in 3 days",
  "suggestedActions": [
    "Focus on critical path items",
    "Defer nice-to-have features"
  ]
}
EOF
```

## Hook Development Best Practices

### 1. Performance Considerations

```bash
#!/bin/bash
# Set timeout for long operations
timeout 30s expensive-operation || {
  echo "Operation timed out, continuing anyway"
  exit 0  # Non-blocking
}
```

### 2. Error Handling

```bash
#!/bin/bash
set -euo pipefail  # Exit on error

# Trap errors
trap 'echo "Hook failed but continuing"; exit 0' ERR

# Your hook logic here
```

### 3. Logging

```bash
#!/bin/bash
LOG_FILE="~/.claude/hooks.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Hook started: $0"
# Hook logic
log "Hook completed successfully"
```

### 4. Security

```bash
#!/bin/bash
# Validate inputs
FILE_PATH="$1"

# Sanitize path
if [[ ! "$FILE_PATH" =~ ^[a-zA-Z0-9/_.-]+$ ]]; then
  echo "Invalid file path"
  exit 1
fi

# Check path is within project
if [[ ! "$FILE_PATH" =~ ^agile-ai-agents/ ]]; then
  echo "File outside project directory"
  exit 1
fi
```

## Testing Hooks

### 1. Test Individual Hooks

```bash
# Set test environment variables
export CLAUDE_HOOK_TOOL_NAME="Edit"
export CLAUDE_HOOK_TOOL_RESULT_PATH="test.js"

# Run hook directly
./.claude/hooks/my-hook.sh
```

### 2. Debug Mode

```json
{
  "hooks": {
    "debug": true,  // Enable verbose logging
    "PreToolUse": [...]
  }
}
```

### 3. Dry Run Mode

```bash
#!/bin/bash
# Check for dry run
if [ "$CLAUDE_HOOK_DRY_RUN" = "true" ]; then
  echo "DRY RUN: Would execute action"
  exit 0
fi

# Actual execution
```

## Common Hook Recipes

### Recipe 1: Enforce Coding Standards

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "filter": "**/*.{js,ts}",
        "hooks": [
          {
            "type": "command",
            "command": "npx eslint --fix $CLAUDE_HOOK_TOOL_INPUT_PATH"
          }
        ]
      }
    ]
  }
}
```

### Recipe 2: Git Auto-Commit

```bash
#!/bin/bash
# Auto-commit documentation changes
if [[ "$CLAUDE_HOOK_TOOL_RESULT_PATH" =~ \.md$ ]]; then
  git add "$CLAUDE_HOOK_TOOL_RESULT_PATH"
  git commit -m "docs: Update $(basename $CLAUDE_HOOK_TOOL_RESULT_PATH)" || true
fi
```

### Recipe 3: Slack Notifications

```bash
#!/bin/bash
# Notify team of major changes
if [[ "$CLAUDE_HOOK_TOOL_NAME" == "Write" ]]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"New file created: $CLAUDE_HOOK_TOOL_RESULT_PATH\"}" \
    "$SLACK_WEBHOOK_URL"
fi
```

### Recipe 4: Backup Before Major Changes

```bash
#!/bin/bash
# Backup before large edits
if [[ "$CLAUDE_HOOK_TOOL_NAME" == "MultiEdit" ]]; then
  cp -r agile-ai-agents /tmp/backup-$(date +%s)
  echo "📦 Backup created before major changes"
fi
```

## Troubleshooting Hooks

### Hook Not Firing

1. Check hook configuration syntax
2. Verify file permissions (`chmod +x hook.sh`)
3. Check matcher patterns
4. Enable debug mode
5. Check Claude Code logs

### Hook Blocking Operations

1. Ensure non-critical hooks use `blocking: false`
2. Add timeouts to prevent hanging
3. Use `exit 0` for non-blocking failures
4. Check for infinite loops

### Performance Issues

1. Profile hook execution time
2. Move expensive operations to background
3. Use caching where possible
4. Limit hook frequency with debouncing

## Summary

Claude Code hooks provide powerful automation capabilities for AgileAiAgents projects:

1. **Sprint Management** - Enforce agile practices automatically
2. **Document Processing** - Automatic JSON conversion and registry updates
3. **Cost Control** - Proactive monitoring and alerts
4. **State Management** - Automatic checkpoints and reminders
5. **Quality Assurance** - Automated testing and validation
6. **Team Integration** - Notifications and collaboration

By implementing appropriate hooks, you can create a more efficient, consistent, and automated development workflow that enhances the AgileAiAgents experience while reducing manual overhead.