#!/bin/bash

# Deferred Items Reminder Hook
# Checks for overdue deferred improvements

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DEFERRED_FILE="$PROJECT_DIR/agile-ai-agents/project-state/improvements/deferred-improvements.json"

if [ -f "$DEFERRED_FILE" ]; then
    # Check for overdue items
    CURRENT_DATE=$(date +%Y-%m-%d)
    
    # Extract revisit dates and check if any are overdue
    OVERDUE_COUNT=$(grep -o '"revisit_date":"[^"]*"' "$DEFERRED_FILE" | cut -d'"' -f4 | while read date; do
        if [[ "$date" < "$CURRENT_DATE" ]]; then
            echo "1"
        fi
    done | wc -l | tr -d ' ')
    
    if [ "$OVERDUE_COUNT" -gt 0 ]; then
        echo "⚠️ REMINDER: $OVERDUE_COUNT deferred improvements need review"
        echo "Run: /existing-project-workflow --show-deferred"
    fi
fi