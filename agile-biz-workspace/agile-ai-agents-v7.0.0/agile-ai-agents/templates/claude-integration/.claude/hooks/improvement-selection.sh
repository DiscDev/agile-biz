#!/bin/bash

# Improvement Selection Hook
# Triggered during improvement selection phase

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
IMPROVEMENTS_DIR="$PROJECT_DIR/agile-ai-agents/project-state/improvements"

# Check if in improvement selection phase
if [ -f "$PROJECT_DIR/agile-ai-agents/project-state/workflow-states/current-workflow.json" ]; then
    CURRENT_PHASE=$(grep -o '"current_phase":"[^"]*"' "$PROJECT_DIR/agile-ai-agents/project-state/workflow-states/current-workflow.json" | cut -d'"' -f4)
    
    if [ "$CURRENT_PHASE" = "improvement-selection" ]; then
        echo "🎯 Improvement Selection Active"
        
        # Count improvements if selection exists
        if [ -f "$IMPROVEMENTS_DIR/selected-improvements.json" ]; then
            SELECTED=$(grep -c '"id":' "$IMPROVEMENTS_DIR/selected-improvements.json" 2>/dev/null || echo 0)
            echo "Selected: $SELECTED improvements"
        fi
        
        if [ -f "$IMPROVEMENTS_DIR/deferred-improvements.json" ]; then
            DEFERRED=$(grep -c '"id":' "$IMPROVEMENTS_DIR/deferred-improvements.json" 2>/dev/null || echo 0)
            if [ "$DEFERRED" -gt 0 ]; then
                echo "⚠️ Deferred: $DEFERRED improvements"
            fi
        fi
    fi
fi