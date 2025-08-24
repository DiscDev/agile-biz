#!/bin/bash

# Review Community Contribution Files
# This script opens contribution files for review

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONTRIBUTIONS_PATH="$PROJECT_ROOT/community-learnings/contributions"

echo "📝 AgileAiAgents Contribution Review"
echo "===================================="
echo ""

# Find the most recent contribution
LATEST_CONTRIBUTION=$(ls -td "$CONTRIBUTIONS_PATH"/*/ 2>/dev/null | grep -v "example" | head -n1)

if [ -z "$LATEST_CONTRIBUTION" ]; then
    echo "❌ No contributions found to review."
    echo ""
    echo "Run 'npm run generate-contribution' first to create contribution files."
    exit 1
fi

CONTRIBUTION_NAME=$(basename "$LATEST_CONTRIBUTION")

echo "📁 Found contribution: $CONTRIBUTION_NAME"
echo ""

# Check for privacy scan report
SCAN_REPORT="$LATEST_CONTRIBUTION/privacy-scan-report.json"
if [ -f "$SCAN_REPORT" ]; then
    echo "🔍 Privacy scan report found!"
    echo ""
    # Extract summary using grep and sed
    TOTAL_ISSUES=$(grep -o '"total_issues": [0-9]*' "$SCAN_REPORT" | grep -o '[0-9]*')
    CRITICAL=$(grep -o '"critical": [0-9]*' "$SCAN_REPORT" | grep -o '[0-9]*')
    WARNING=$(grep -o '"warning": [0-9]*' "$SCAN_REPORT" | grep -o '[0-9]*')
    INFO=$(grep -o '"info": [0-9]*' "$SCAN_REPORT" | grep -o '[0-9]*')
    
    if [ "$TOTAL_ISSUES" -gt 0 ]; then
        echo "⚠️  Privacy scan found $TOTAL_ISSUES potential issues:"
        echo "   Critical: $CRITICAL"
        echo "   Warning: $WARNING"
        echo "   Info: $INFO"
        echo ""
        echo "Please review privacy-scan-report.json for details!"
        echo ""
    else
        echo "✅ Privacy scan found no issues!"
        echo ""
    fi
fi

echo "Opening files for review..."
echo ""

# Try to open in default editor
if command -v code &> /dev/null; then
    # VS Code
    if [ -f "$SCAN_REPORT" ] && [ "$TOTAL_ISSUES" -gt 0 ]; then
        code "$LATEST_CONTRIBUTION/project-summary.md" "$LATEST_CONTRIBUTION/learnings.md" "$SCAN_REPORT"
        echo "✅ Opened in VS Code (including privacy scan report)"
    else
        code "$LATEST_CONTRIBUTION/project-summary.md" "$LATEST_CONTRIBUTION/learnings.md"
        echo "✅ Opened in VS Code"
    fi
elif command -v subl &> /dev/null; then
    # Sublime Text
    subl "$LATEST_CONTRIBUTION/project-summary.md" "$LATEST_CONTRIBUTION/learnings.md"
    echo "✅ Opened in Sublime Text"
elif command -v atom &> /dev/null; then
    # Atom
    atom "$LATEST_CONTRIBUTION/project-summary.md" "$LATEST_CONTRIBUTION/learnings.md"
    echo "✅ Opened in Atom"
elif command -v nano &> /dev/null; then
    # Nano (terminal)
    echo "Opening in nano. Edit project-summary.md first, then learnings.md"
    echo "Press Ctrl+X to exit and save each file."
    echo ""
    read -p "Press Enter to continue..."
    nano "$LATEST_CONTRIBUTION/project-summary.md"
    nano "$LATEST_CONTRIBUTION/learnings.md"
    echo "✅ Review complete"
else
    # Just show paths
    echo "📄 Please review these files manually:"
    echo "   - $LATEST_CONTRIBUTION/project-summary.md"
    echo "   - $LATEST_CONTRIBUTION/learnings.md"
fi

echo ""
echo "📋 Review checklist:"
echo "   ✓ Project description is complete"
echo "   ✓ All learnings sections have content"
echo "   ✓ No sensitive data (keys, passwords, internal URLs)"
echo "   ✓ Company name is anonymized (if desired)"
echo "   ✓ Metrics and improvements are accurate"
if [ -f "$SCAN_REPORT" ] && [ "$TOTAL_ISSUES" -gt 0 ]; then
    echo "   ✓ Privacy scan issues addressed"
fi
echo ""
echo "📚 See community-learnings/SECURITY-GUIDELINES.md for privacy best practices"
echo ""
echo "When review is complete, run: npm run submit-contribution"