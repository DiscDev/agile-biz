#!/bin/bash
# .claude/commands/import-documents.sh
# Import existing documents into registry after upgrade

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGILE_DIR="$PROJECT_ROOT/agile-ai-agents"

echo "🔍 Document Import Tool - AgileAiAgents v6.2.0"
echo "============================================="
echo ""
echo "This command imports existing documents into the Document Router registry"
echo "Use after upgrading AgileAiAgents or copying project-documents folder"
echo ""

# Check if Document Lifecycle Manager exists
if [ ! -f "$AGILE_DIR/machine-data/document-lifecycle-manager.js" ]; then
    echo "❌ Error: Document Lifecycle Manager not found"
    echo "   Please ensure AgileAiAgents v6.2.0+ is properly installed"
    exit 1
fi

echo "📂 Scanning project-documents folder..."
echo ""

# Run the import
cd "$AGILE_DIR" && node machine-data/document-lifecycle-manager.js import

echo ""
echo "💡 Next steps:"
echo "   • Run /validate-documents to check document health"
echo "   • Run /consolidate-folders to review folder suggestions"
echo "   • Documents are now tracked for freshness and routing"

# Update status
echo ""
echo "✅ Import process complete"

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)