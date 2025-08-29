#!/bin/bash

# Task Completion Hook for PostToolUse
# Captures when Task tool completes and logs agent spawn retroactively

# Configuration
LOGGING_CONFIG=".claude/configs/logging-config.json"
LOGGING_SCRIPT=".claude/scripts/agents/logging/logging-functions.js"
HOOK_LOG=".claude/logs/hooks/hook-debug.log"

# Function to check if logging is enabled
check_logging_enabled() {
    if [ ! -f "$LOGGING_CONFIG" ]; then
        return 1
    fi
    
    local enabled=$(jq -r '.logging_enabled // false' "$LOGGING_CONFIG" 2>/dev/null)
    [ "$enabled" = "true" ]
}

# Function to extract agent type from tool parameters
extract_agent_type() {
    local params="$1"
    
    # Try to extract subagent_type from JSON
    local agent_type=$(echo "$params" | jq -r '.subagent_type // empty' 2>/dev/null)
    
    if [ -n "$agent_type" ]; then
        echo "$agent_type"
        return 0
    fi
    
    # Fallback to text pattern matching
    if echo "$params" | grep -i "developer" > /dev/null; then
        echo "developer"
    elif echo "$params" | grep -i "devops" > /dev/null; then
        echo "devops"
    elif echo "$params" | grep -i "agent-admin" > /dev/null; then
        echo "agent-admin"
    elif echo "$params" | grep -i "finance" > /dev/null; then
        echo "finance"
    else
        echo "unknown"
    fi
}

# Function to extract user prompt from tool parameters
extract_prompt() {
    local params="$1"
    
    # Try to extract prompt from JSON
    local prompt=$(echo "$params" | jq -r '.prompt // empty' 2>/dev/null)
    
    if [ -n "$prompt" ]; then
        echo "$prompt"
    else
        # Fallback to extracting from text
        echo "$params" | head -c 200
    fi
}

# Function to trigger logging
trigger_logging() {
    local agent_type="$1"
    local user_prompt="$2"
    
    # Only log for known agent types (skip unknown)
    if [ "$agent_type" = "unknown" ] || [ -z "$agent_type" ]; then
        echo "$(date -Iseconds) [HOOK] Unknown agent type: $agent_type - skipping" >> "$HOOK_LOG"
        return 0
    fi
    
    # Execute logging in background
    (
        cd "$(dirname "$0")/../.." || exit 1
        node "$LOGGING_SCRIPT" full-log "$agent_type" "$user_prompt" 2>/dev/null
        echo "$(date -Iseconds) [HOOK] Logged $agent_type agent spawn retroactively" >> "$HOOK_LOG"
    ) &
}

# Main execution
main() {
    echo "$(date -Iseconds) [HOOK] PostToolUse Task hook triggered" >> "$HOOK_LOG"
    
    # Check if logging is enabled
    if ! check_logging_enabled; then
        echo "$(date -Iseconds) [HOOK] Logging disabled - skipping" >> "$HOOK_LOG"
        exit 0
    fi
    
    # Get tool parameters from environment
    local tool_params=""
    if [ -n "$TOOL_PARAMS" ]; then
        tool_params="$TOOL_PARAMS"
    elif [ -n "$TOOL_RESULT" ]; then
        tool_params="$TOOL_RESULT"
    else
        tool_params="$*"
    fi
    
    # Log the parameters for debugging
    echo "$(date -Iseconds) [HOOK] Task completed - analyzing params: $(echo "$tool_params" | head -c 100)..." >> "$HOOK_LOG"
    
    # Extract agent information
    local agent_type=$(extract_agent_type "$tool_params")
    local user_prompt=$(extract_prompt "$tool_params")
    
    if [ -n "$agent_type" ] && [ "$agent_type" != "unknown" ]; then
        echo "$(date -Iseconds) [HOOK] Detected $agent_type agent completion" >> "$HOOK_LOG"
        trigger_logging "$agent_type" "$user_prompt"
    else
        echo "$(date -Iseconds) [HOOK] No agent type detected in Task completion" >> "$HOOK_LOG"
    fi
}

# Execute main function
main "$@"