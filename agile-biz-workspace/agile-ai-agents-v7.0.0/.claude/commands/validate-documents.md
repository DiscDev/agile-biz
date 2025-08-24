#!/bin/bash
# .claude/commands/validate-documents.sh
# Check document organization and freshness

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGILE_DIR="$PROJECT_ROOT/agile-ai-agents"

echo "🏥 Document Health Check - AgileAiAgents v6.2.0"
echo "==============================================="
echo ""
echo "This command validates document organization, freshness, and completeness"
echo ""

# Check if Document Lifecycle Manager exists
if [ ! -f "$AGILE_DIR/machine-data/document-lifecycle-manager.js" ]; then
    echo "❌ Error: Document Lifecycle Manager not found"
    echo "   Please ensure AgileAiAgents v6.2.0+ is properly installed"
    exit 1
fi

echo "🔍 Analyzing document health..."
echo "================================"
echo ""

# Run the validation
cd "$AGILE_DIR" && node machine-data/document-lifecycle-manager.js validate

echo ""
echo "📋 Health Check Legend:"
echo "   • ✅ Healthy: Document is fresh, complete, and correctly located"
echo "   • ⚠️  Warning: Document needs attention (stale, incomplete, or misplaced)"
echo "   • ❌ Error: Critical issue (missing dependencies or file not found)"
echo ""

echo "💡 Recommendations:"
echo "   • Update stale documents to maintain accuracy"
echo "   • Complete documents with TODO markers"
echo "   • Consider reorganizing misplaced documents"
echo "   • Review documents with missing dependencies"

echo ""
echo "✅ Health check complete"

**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)