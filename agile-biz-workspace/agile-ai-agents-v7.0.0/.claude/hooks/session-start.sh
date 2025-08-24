#!/bin/bash

# Claude Code Hook: Session Start
# Initializes the AgileAiAgents hook system when a new session begins

# Dynamically detect the project root from script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Set environment
export CLAUDE_PROJECT_DIR="$PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Detect execution context
if [ -d "$PROJECT_ROOT/agile-ai-agents" ]; then
    # Running from parent directory (workspace mode)
    AGILE_ROOT="$PROJECT_ROOT/agile-ai-agents"
    EXECUTION_CONTEXT="workspace"
else
    # Running from repository
    AGILE_ROOT="$PROJECT_ROOT"
    EXECUTION_CONTEXT="repository"
fi

# Export environment for the hook handlers
export HOOK_CONTEXT="session-start"
export AGILE_AI_AGENTS_ROOT="$AGILE_ROOT"
export EXECUTION_CONTEXT="$EXECUTION_CONTEXT"

echo "[AgileAiAgents Hook] Session starting (context: $EXECUTION_CONTEXT)"

# Initialize the hook manager
echo "[AgileAiAgents Hook] Initializing hook system..."
if [ -f "$AGILE_ROOT/hooks/hook-manager.js" ]; then
    node "$AGILE_ROOT/hooks/hook-manager.js" init
fi

# Start file watchers for MD->JSON conversion
echo "[AgileAiAgents Hook] Starting file watchers..."
if [ -f "$AGILE_ROOT/hooks/handlers/md-json/md-to-json-sync.js" ]; then
    node "$AGILE_ROOT/hooks/handlers/md-json/md-to-json-sync.js" --start-watchers &
fi

# Load project state
echo "[AgileAiAgents Hook] Loading project state..."
if [ -f "$AGILE_ROOT/hooks/handlers/state/session-tracker.js" ]; then
    node "$AGILE_ROOT/hooks/handlers/state/session-tracker.js" start
fi

# Update dashboard status
echo "[AgileAiAgents Hook] Updating dashboard status..."
if [ -f "$AGILE_ROOT/hooks/handlers/dashboard/dashboard-event-notifier.js" ]; then
    node "$AGILE_ROOT/hooks/handlers/dashboard/dashboard-event-notifier.js" session-start
fi

echo "[AgileAiAgents Hook] Session initialization complete"