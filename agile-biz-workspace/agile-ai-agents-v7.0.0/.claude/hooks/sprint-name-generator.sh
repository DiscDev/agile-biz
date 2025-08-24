#!/bin/bash

# Sprint Name Generator Hook
# Generates correct sprint folder names with current date

# Get current date in YYYY-MM-DD format
CURRENT_DATE=$(date +%Y-%m-%d)

# Get feature name from argument or prompt
FEATURE_NAME="${1:-feature-name}"

# Sanitize feature name
SANITIZED_FEATURE=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Generate sprint name
SPRINT_NAME="sprint-${CURRENT_DATE}-${SANITIZED_FEATURE}"

# Output the sprint name
echo "$SPRINT_NAME"

# Also save to a temporary file for other scripts to use
echo "$SPRINT_NAME" > /tmp/last-sprint-name.txt

exit 0