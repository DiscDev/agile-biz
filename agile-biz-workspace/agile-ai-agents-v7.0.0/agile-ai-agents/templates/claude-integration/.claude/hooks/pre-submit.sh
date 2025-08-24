#!/bin/bash

# Claude Code Hook: Pre-Submit
# Triggered before a user prompt is submitted to Claude

# Get the prompt from Claude Code
USER_PROMPT="$1"

# Export environment for the hook
export USER_PROMPT="$USER_PROMPT"
export HOOK_CONTEXT="pre-submit"
export AGILE_AI_AGENTS_ROOT="${AGILE_AI_AGENTS_ROOT:-$(dirname $(dirname $(dirname "$0")))}"

# Check for AgileAiAgents commands
if [[ "$USER_PROMPT" == /* ]]; then
    # It's a command, validate it
    node "$AGILE_AI_AGENTS_ROOT/hooks/handlers/command/command-validator.js"
fi

# Check for active agent context
if [ -f "$AGILE_AI_AGENTS_ROOT/project-state/current-state.json" ]; then
    # Update agent context
    node "$AGILE_AI_AGENTS_ROOT/hooks/handlers/context/agent-context-updater.js"
fi

# Perform security scan
node "$AGILE_AI_AGENTS_ROOT/hooks/handlers/security/input-security-scan.js"

# Notify the hook manager
node "$AGILE_AI_AGENTS_ROOT/hooks/hook-manager.js" execute "pre-submit" "{\"prompt\":\"$USER_PROMPT\"}"