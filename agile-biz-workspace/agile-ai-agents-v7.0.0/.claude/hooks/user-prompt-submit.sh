#!/bin/bash

# Claude Code Hook: User Prompt Submit
# Triggered when the user submits a prompt

# Get the prompt from Claude Code
USER_PROMPT="$1"

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
export USER_PROMPT="$USER_PROMPT"
export HOOK_CONTEXT="user-prompt-submit"
export AGILE_AI_AGENTS_ROOT="$AGILE_ROOT"
export EXECUTION_CONTEXT="$EXECUTION_CONTEXT"

# Log the event (without exposing the full prompt)
echo "[AgileAiAgents Hook] User prompt submitted (context: $EXECUTION_CONTEXT)"

# Check for AgileAiAgents commands
if [[ "$USER_PROMPT" =~ ^/[a-zA-Z-]+ ]]; then
    node "$AGILE_ROOT/hooks/handlers/command/command-validator.js"
fi

# Update agent context if needed
node "$AGILE_ROOT/hooks/handlers/context/agent-context-updater.js"

# Notify the hook manager
node "$AGILE_ROOT/hooks/hook-manager.js" execute "user-prompt-submit" "{\"context\":\"$EXECUTION_CONTEXT\"}"