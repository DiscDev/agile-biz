#!/bin/bash

# Simple Community Contribution Generator
# This script generates contribution files manually when the JS generator has issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTRIBUTIONS_DIR="$PROJECT_ROOT/community-learnings/contributions"

echo "🎯 AgileAiAgents Simple Contribution Generator"
echo "=============================================="
echo ""

# Create contributions directory if it doesn't exist
mkdir -p "$CONTRIBUTIONS_DIR"

# Generate timestamp-based contribution ID
TIMESTAMP=$(date +%Y-%m-%d)
RANDOM_NUM=$((RANDOM % 900 + 100))  # Generate random number between 100-999
CONTRIBUTION_ID="$TIMESTAMP-manual-$RANDOM_NUM"
CONTRIBUTION_PATH="$CONTRIBUTIONS_DIR/$CONTRIBUTION_ID"

echo "📁 Creating contribution directory: $CONTRIBUTION_ID"
mkdir -p "$CONTRIBUTION_PATH"

# Copy templates
TEMPLATES_DIR="$PROJECT_ROOT/community-learnings/CONTRIBUTING"

echo "📝 Copying templates..."

# Copy project summary template
if [ -f "$TEMPLATES_DIR/project-summary.md" ]; then
  cp "$TEMPLATES_DIR/project-summary.md" "$CONTRIBUTION_PATH/project-summary.md"
  echo "✅ Project summary template copied"
else
  echo "❌ Project summary template not found at $TEMPLATES_DIR/project-summary.md"
  exit 1
fi

# Copy learnings template
if [ -f "$TEMPLATES_DIR/learnings.md" ]; then
  cp "$TEMPLATES_DIR/learnings.md" "$CONTRIBUTION_PATH/learnings.md"
  echo "✅ Learnings template copied"
else
  echo "❌ Learnings template not found at $TEMPLATES_DIR/learnings.md"
  exit 1
fi

# Add basic project info to project summary
echo ""
echo "📊 Adding basic project information..."

# Update the project summary with current date and contribution ID
sed -i.bak "s/\[Date\]/$(date +%Y-%m-%d)/g" "$CONTRIBUTION_PATH/project-summary.md" 2>/dev/null || \
sed -i.bak "s/\\[Date\\]/$(date +%Y-%m-%d)/g" "$CONTRIBUTION_PATH/project-summary.md"

sed -i.bak "s/\[Contribution ID\]/CL-$CONTRIBUTION_ID/g" "$CONTRIBUTION_PATH/project-summary.md" 2>/dev/null || \
sed -i.bak "s/\\[Contribution ID\\]/CL-$CONTRIBUTION_ID/g" "$CONTRIBUTION_PATH/project-summary.md"

# Clean up backup files
rm -f "$CONTRIBUTION_PATH"/*.bak

echo ""
echo "✅ Contribution files generated successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit $CONTRIBUTION_PATH/project-summary.md"
echo "   2. Fill in project details, technology stack, and metrics"
echo "   3. Edit $CONTRIBUTION_PATH/learnings.md"
echo "   4. Add your specific learnings and insights"
echo "   5. Remove any sensitive information"
echo "   6. When ready, the files can be shared with the AgileAiAgents community"
echo ""
echo "📍 Contribution directory: $CONTRIBUTION_PATH"
echo ""
echo "💡 Tip: You can run the full generator later with:"
echo "   node machine-data/community-contribution-generator.js"