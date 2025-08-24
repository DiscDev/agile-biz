#!/bin/bash
# .claude/commands/document-map.sh
# View current document organization and routing statistics

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGILE_DIR="$PROJECT_ROOT/agile-ai-agents"

echo "🗺️  Document Organization Map - AgileAiAgents v6.2.0"
echo "===================================================="
echo ""

# Check if Document Router exists
if [ ! -f "$AGILE_DIR/machine-data/document-router.js" ]; then
    echo "❌ Error: Document Router not found"
    echo "   Please ensure AgileAiAgents v6.2.0+ is properly installed"
    exit 1
fi

echo "📊 Document Routing Statistics"
echo "=============================="
cd "$AGILE_DIR" && node machine-data/document-router.js stats
echo ""

echo "📂 Current Document Organization"
echo "================================"
cd "$AGILE_DIR" && node machine-data/document-lifecycle-manager.js stats
echo ""

echo "🔀 Routing Performance"
echo "======================"
echo "• Tier 1 (Known Documents): Fastest (<10ms)"
echo "• Tier 2 (Pattern Matching): Fast (<20ms)"
echo "• Tier 3 (AI Analysis): Moderate (<40ms)"
echo "• Tier 4 (Dynamic Creation): Slower (<100ms)"
echo ""

echo "📁 Folder Creation Activity"
echo "==========================="
cd "$AGILE_DIR" && node machine-data/folder-creation-manager.js stats
echo ""

echo "💡 Quick Actions:"
echo "   • /import-documents - Import existing documents"
echo "   • /validate-documents - Check document health"
echo "   • /consolidate-folders - Review folder consolidation"
echo ""

echo "✅ Document map generated"

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)