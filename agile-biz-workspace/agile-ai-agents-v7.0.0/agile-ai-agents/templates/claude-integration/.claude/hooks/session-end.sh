#!/bin/bash

# Claude Code Hook: Session End
# Cleans up the AgileAiAgents hook system when a session ends

# Detect execution context
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/../../agile-ai-agents" ]; then
    # Running from parent directory (workspace mode)
    AGILE_ROOT="$(cd "$SCRIPT_DIR/../../agile-ai-agents" && pwd)"
    EXECUTION_CONTEXT="workspace"
elif [ -d "$CLAUDE_PROJECT_DIR/agile-ai-agents" ]; then
    # Alternative workspace detection
    AGILE_ROOT="$CLAUDE_PROJECT_DIR/agile-ai-agents"
    EXECUTION_CONTEXT="workspace"
else
    # Running from repository
    AGILE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
    EXECUTION_CONTEXT="repository"
fi

echo "[AgileAiAgents Hook] Session ending (context: $EXECUTION_CONTEXT)"

# Save session state
echo "[AgileAiAgents Hook] Saving session state..."
node "$AGILE_ROOT/hooks/handlers/state/session-tracker.js" session-end

# Stop file watchers
echo "[AgileAiAgents Hook] Stopping file watchers..."
pkill -f "md-to-json-sync.js --start-watchers" 2>/dev/null || true

# Create session checkpoint
echo "[AgileAiAgents Hook] Creating session checkpoint..."
node "$AGILE_ROOT/hooks/handlers/state/state-backup.js" session-end

# Update dashboard status
echo "[AgileAiAgents Hook] Updating dashboard status..."
node "$AGILE_ROOT/hooks/handlers/dashboard/dashboard-event-notifier.js" session-end

echo "[AgileAiAgents Hook] Session cleanup complete"