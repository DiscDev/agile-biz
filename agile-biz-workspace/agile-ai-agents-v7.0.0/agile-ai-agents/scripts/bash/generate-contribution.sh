#!/bin/bash

# Generate Community Contribution Files
# This script generates contribution files from the current project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🎯 AgileAiAgents Community Contribution Generator"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Run the contribution generator
echo "📊 Analyzing project data..."
echo "📝 Generating contribution files..."
echo ""

cd "$PROJECT_ROOT"

# Try the full Node.js generator first
if node machine-data/community-contribution-generator.js 2>/dev/null; then
    echo ""
    echo "✅ Contribution files generated successfully!"
    echo ""
    echo "📋 Please review the generated files and:"
    echo "   1. Add any missing project description"
    echo "   2. Fill in learnings specific to your project"
    echo "   3. Remove any sensitive information"
    echo "   4. Verify all auto-populated data is correct"
    echo ""
    echo "When ready, run: npm run submit-contribution"
else
    echo ""
    echo "⚠️  Full generator failed, falling back to simple template generator..."
    echo ""
    
    # Fall back to simple template-based generator
    bash "$SCRIPT_DIR/generate-contribution-simple.sh"
fi