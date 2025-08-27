#!/bin/bash

# Agent Detection Hook for UserPromptSubmit
# Analyzes user input to detect agent spawning requests and triggers logging

# Configuration
LOGGING_CONFIG=".claude/agents/logs/logging-config.json"
LOGGING_SCRIPT=".claude/agents/scripts/logging/logging-functions.js"
HOOK_LOG=".claude/agents/logs/hook-debug.log"

# Function to check if logging is enabled
check_logging_enabled() {
    if [ ! -f "$LOGGING_CONFIG" ]; then
        return 1
    fi
    
    local enabled=$(jq -r '.logging_enabled // false' "$LOGGING_CONFIG" 2>/dev/null)
    [ "$enabled" = "true" ]
}

# Function to detect agent spawning patterns
detect_agent_spawn() {
    local input="$1"
    local agent_type=""
    
    # Convert to lowercase for pattern matching
    local lower_input=$(echo "$input" | tr '[:upper:]' '[:lower:]')
    
    # Detect developer agent patterns
    if echo "$lower_input" | grep -E "(developer agent|dev agent|have.*developer|create.*app|implement|build|code|frontend|backend|react|node|javascript|typescript|html|css)" > /dev/null; then
        agent_type="developer"
    fi
    
    # Detect devops agent patterns
    if echo "$lower_input" | grep -E "(devops agent|deploy|infrastructure|docker|kubernetes|aws|ci/cd|pipeline|container|terraform)" > /dev/null; then
        agent_type="devops"
    fi
    
    # Detect agent-admin patterns
    if echo "$lower_input" | grep -E "(agent.admin|agent admin|create.*agent|delete.*agent|edit.*agent|new.*agent|import.*agent|agent.*management|manage.*agent)" > /dev/null; then
        agent_type="agent-admin"
    fi
    
    # Detect finance agent patterns
    if echo "$lower_input" | grep -E "(finance|financial|budget|investment|portfolio|accounting|tax.*planning|financial.*analysis|financial.*planning)" > /dev/null; then
        agent_type="finance"
    fi
    
    # Detect lonely-hearts-club-band patterns
    if echo "$lower_input" | grep -E "(lonely.hearts|lonely hearts|music.*agent|compose|songwriting|band|music.*theory|audio.*production)" > /dev/null; then
        agent_type="lonely-hearts-club-band"
    fi
    
    # Generic agent spawning patterns
    if echo "$lower_input" | grep -E "(agent|spawn|task tool)" > /dev/null && [ -z "$agent_type" ]; then
        agent_type="unknown"
    fi
    
    echo "$agent_type"
}

# Function to trigger logging
trigger_logging() {
    local agent_type="$1"
    local user_input="$2"
    
    # Only log for known agent types (skip unknown)
    if [ "$agent_type" = "unknown" ] || [ -z "$agent_type" ]; then
        return 0
    fi
    
    # Execute logging in background to avoid blocking
    (
        cd "$(dirname "$0")/../.." || exit 1
        node "$LOGGING_SCRIPT" full-log "$agent_type" "$user_input" 2>/dev/null
    ) &
    
    echo "$(date -Iseconds) [HOOK] Triggered logging for $agent_type agent" >> "$HOOK_LOG"
}

# Main execution
main() {
    # Log hook execution
    echo "$(date -Iseconds) [HOOK] UserPromptSubmit triggered" >> "$HOOK_LOG"
    
    # Check if logging is enabled
    if ! check_logging_enabled; then
        echo "$(date -Iseconds) [HOOK] Logging disabled - skipping" >> "$HOOK_LOG"
        exit 0
    fi
    
    # Get user input from environment or stdin
    local user_input=""
    if [ -n "$USER_INPUT" ]; then
        user_input="$USER_INPUT"
    elif [ -n "$PROMPT" ]; then
        user_input="$PROMPT"
    else
        # Try to read from stdin if available
        if [ -t 0 ]; then
            user_input="$*"
        else
            user_input=$(cat 2>/dev/null || echo "")
        fi
    fi
    
    # Log the input for debugging
    echo "$(date -Iseconds) [HOOK] Analyzing input: $(echo "$user_input" | head -c 100)..." >> "$HOOK_LOG"
    
    # Detect agent spawning
    local agent_type=$(detect_agent_spawn "$user_input")
    
    if [ -n "$agent_type" ] && [ "$agent_type" != "unknown" ]; then
        echo "$(date -Iseconds) [HOOK] Detected $agent_type agent spawn request" >> "$HOOK_LOG"
        trigger_logging "$agent_type" "$user_input"
    else
        echo "$(date -Iseconds) [HOOK] No agent spawn detected" >> "$HOOK_LOG"
    fi
}

# Execute main function
main "$@"