#!/bin/bash

# Claude Code Hook: Pre-Command Validation
# Triggered before executing bash commands

# Get the command from Claude Code
COMMAND="$1"

# Detect execution context
if [ -d "$CLAUDE_PROJECT_DIR/agile-ai-agents" ]; then
    # Running from parent directory (workspace mode)
    AGILE_ROOT="$CLAUDE_PROJECT_DIR/agile-ai-agents"
    EXECUTION_CONTEXT="workspace"
else
    # Running from repository
    AGILE_ROOT="$(dirname $(dirname $(dirname "$0")))"
    EXECUTION_CONTEXT="repository"
fi

# Export environment for the hook
export COMMAND="$COMMAND"
export HOOK_CONTEXT="pre-command-validation"
export AGILE_AI_AGENTS_ROOT="$AGILE_ROOT"
export EXECUTION_CONTEXT="$EXECUTION_CONTEXT"

# Log the event (sanitized)
echo "[AgileAiAgents Hook] Pre-command validation (context: $EXECUTION_CONTEXT)"

# Security scan for the command
node "$AGILE_ROOT/hooks/handlers/security/input-security-scan.js"

# Notify the hook manager
node "$AGILE_ROOT/hooks/hook-manager.js" execute "pre-command-validation" "{\"context\":\"$EXECUTION_CONTEXT\"}"