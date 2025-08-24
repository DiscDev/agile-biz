#!/bin/bash

# Submit Community Contribution
# This script helps submit contribution to AgileAiAgents repository

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTRIBUTIONS_PATH="$PROJECT_ROOT/community-learnings/contributions"

echo "🚀 AgileAiAgents Contribution Submission"
echo "========================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) is not installed."
    echo ""
    echo "To submit your contribution:"
    echo "1. Fork the AgileAiAgents repository on GitHub"
    echo "2. Copy your contribution folder to the forked repo"
    echo "3. Create a pull request manually"
    echo ""
    echo "Or install GitHub CLI: https://cli.github.com/"
    exit 0
fi

# Find the most recent contribution
LATEST_CONTRIBUTION=$(ls -td "$CONTRIBUTIONS_PATH"/*/ 2>/dev/null | grep -v "example" | head -n1)

if [ -z "$LATEST_CONTRIBUTION" ]; then
    echo "❌ No contributions found to submit."
    echo ""
    echo "Run 'npm run generate-contribution' first to create contribution files."
    exit 1
fi

CONTRIBUTION_NAME=$(basename "$LATEST_CONTRIBUTION")

echo "📁 Preparing to submit: $CONTRIBUTION_NAME"
echo ""

# Check if user is authenticated with GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub:"
    gh auth login
fi

# Get the main AgileAiAgents repo info
UPSTREAM_REPO="your-org/agile-ai-agents"  # Update this with actual repo

echo "📋 Submission checklist:"
echo "   ✓ Reviewed all content for sensitive data"
echo "   ✓ Filled in all learning sections"
echo "   ✓ Verified auto-populated data"
echo "   ✓ Anonymized company info (if desired)"
echo ""

read -p "Ready to submit? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Submission cancelled."
    exit 0
fi

echo ""
echo "🔄 Creating pull request..."

# Create PR title and body
PR_TITLE="Community Learning: $CONTRIBUTION_NAME"
PR_BODY="## Community Learning Contribution

### Project Type
$(grep "Project Type" "$LATEST_CONTRIBUTION/project-summary.md" | cut -d':' -f2 | xargs)

### Key Learnings
- Performance improvements documented
- Agent-specific learnings included
- Team coordination patterns identified
- Repository evolution tracked

### Checklist
- [ ] No sensitive data included
- [ ] All sections completed
- [ ] Metrics verified
- [ ] Ready for analysis

---

Thank you for contributing to AgileAiAgents! Your learnings help improve the system for everyone."

# Open browser to create PR
echo "📝 Opening browser to create pull request..."
echo ""
echo "PR Title: $PR_TITLE"
echo ""
echo "Please:"
echo "1. Fork the AgileAiAgents repository (if not already done)"
echo "2. Copy this contribution folder:"
echo "   $LATEST_CONTRIBUTION"
echo "3. Create a pull request with the above title"
echo "4. Paste the following description:"
echo ""
echo "---"
echo "$PR_BODY"
echo "---"
echo ""

# Try to open GitHub in browser
if command -v open &> /dev/null; then
    open "https://github.com/$UPSTREAM_REPO/compare"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://github.com/$UPSTREAM_REPO/compare"
fi

echo ""
echo "✅ Contribution ready for submission!"
echo ""
echo "Thank you for contributing to AgileAiAgents! 🎉"