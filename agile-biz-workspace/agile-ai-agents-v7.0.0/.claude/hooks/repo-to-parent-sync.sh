#!/bin/bash

# Claude Code Hook: Repository to Parent Sync
# Automatically syncs changes from repository to parent directory

# Get the file path that changed
FILE_PATH="$1"

# Only run in repository context
if [ "$EXECUTION_CONTEXT" = "repository" ] && [ -d "../../.claude" ]; then
    # Check if it's a Claude agent or hook file
    if [[ "$FILE_PATH" == *".claude/agents/"* ]] || [[ "$FILE_PATH" == *".claude/hooks/"* ]]; then
        # Extract relative path from .claude directory
        RELATIVE_PATH="${FILE_PATH#*/.claude/}"
        
        # Create parent directory if needed
        PARENT_DIR="../../.claude/$(dirname "$RELATIVE_PATH")"
        mkdir -p "$PARENT_DIR"
        
        # Sync the file to parent
        cp "$FILE_PATH" "../../.claude/$RELATIVE_PATH"
        
        echo "[Auto-Sync] Synced to parent: .claude/$RELATIVE_PATH"
        
        # If it's a hook script, ensure it's executable
        if [[ "$FILE_PATH" == *.sh ]]; then
            chmod +x "../../.claude/$RELATIVE_PATH"
        fi
    fi
fi