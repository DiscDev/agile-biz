#!/bin/bash

# Claude Code Hook: On File Create
# Triggered when a new file is created in the workspace

# Get the file path from Claude Code
FILE_PATH="$1"

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
export FILE_PATH="$FILE_PATH"
export HOOK_CONTEXT="on-file-create"
export AGILE_AI_AGENTS_ROOT="$AGILE_ROOT"
export EXECUTION_CONTEXT="$EXECUTION_CONTEXT"

# Log the event with context
echo "[AgileAiAgents Hook] File created: $FILE_PATH (context: $EXECUTION_CONTEXT)"

# Execute MD to JSON sync if it's an MD file
if [[ "$FILE_PATH" == *.md ]]; then
    node "$AGILE_ROOT/hooks/handlers/md-json/md-to-json-sync.js"
fi

# Execute structure validation for new files
node "$AGILE_ROOT/hooks/handlers/validation/structure-validation.js"

# Notify the hook manager
node "$AGILE_ROOT/hooks/hook-manager.js" execute "on-file-create" "{\"filePath\":\"$FILE_PATH\"}"