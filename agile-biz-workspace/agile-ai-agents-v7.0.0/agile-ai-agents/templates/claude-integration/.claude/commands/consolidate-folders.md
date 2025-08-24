#!/bin/bash
# .claude/commands/consolidate-folders.sh
# Review and apply folder consolidation suggestions

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGILE_DIR="$PROJECT_ROOT/agile-ai-agents"

echo "📁 Folder Consolidation Manager - AgileAiAgents v6.2.0"
echo "======================================================"
echo ""
echo "This command reviews folder consolidation opportunities to reduce complexity"
echo ""

# Check if Folder Creation Manager exists
if [ ! -f "$AGILE_DIR/machine-data/folder-creation-manager.js" ]; then
    echo "❌ Error: Folder Creation Manager not found"
    echo "   Please ensure AgileAiAgents v6.2.0+ is properly installed"
    exit 1
fi

echo "🔍 Analyzing folder structure..."
echo "================================"
echo ""

# Run the consolidation review
cd "$AGILE_DIR" && node machine-data/folder-creation-manager.js consolidate

echo ""
echo "📋 Consolidation Benefits:"
echo "   • Reduces folder sprawl and complexity"
echo "   • Improves document discoverability"
echo "   • Streamlines project organization"
echo "   • Enhances routing accuracy"
echo ""

echo "💡 How to Apply Suggestions:"
echo "   1. Review the suggestions above"
echo "   2. Manually move documents to consolidated folders"
echo "   3. Delete empty folders after consolidation"
echo "   4. Run /validate-documents to verify organization"
echo ""

echo "📊 To view statistics:"
echo "   Run: cd agile-ai-agents && node machine-data/folder-creation-manager.js stats"
echo ""

echo "✅ Consolidation review complete"

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)