#!/bin/bash

# Verification script for multi-LLM implementation
echo "🔍 Verifying Multi-LLM Implementation"
echo "======================================"
echo ""

# Get the script directory and parent directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AAA_DIR="$(dirname "$SCRIPT_DIR")"

# Check core files
echo "Checking core modules..."
files=(
    "machine-data/service-detector.js"
    "machine-data/llm-router.js"
    "machine-data/fallback-manager.js"
    "machine-data/routing-optimizer.js"
    "machine-data/deep-research-integration.js"
    "machine-data/zen-mcp-integration.js"
    "machine-data/external-api-integration.js"
    "machine-data/routing-messages.js"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$AAA_DIR/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
        missing=$((missing + 1))
    fi
done

echo ""
echo "Checking commands..."
commands=(
    ".claude/commands/configure-models.md"
    ".claude/commands/model-status.md"
    ".claude/commands/research-boost.md"
)

for cmd in "${commands[@]}"; do
    if [ -f "$AAA_DIR/$cmd" ]; then
        echo "✅ $cmd"
    else
        echo "❌ $cmd missing"
        missing=$((missing + 1))
    fi
done

echo ""
echo "Checking documentation..."
docs=(
    "project-documents/system/multi-llm-setup-guide.md"
    "project-documents/system/multi-llm-api-reference.md"
    "project-documents/system/multi-llm-implementation-summary.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$AAA_DIR/$doc" ]; then
        echo "✅ $doc"
    else
        echo "❌ $doc missing"
        missing=$((missing + 1))
    fi
done

echo ""
echo "Checking tests..."
if [ -f "$AAA_DIR/machine-data/tests/test-multi-llm-complete.js" ]; then
    echo "✅ Test suite present"
    echo "Running basic test..."
    cd "$AAA_DIR" && node machine-data/tests/test-service-detector.js 2>&1 | grep -q "Service detection working correctly" && echo "✅ Service detection test passed" || echo "⚠️ Service detection test failed"
else
    echo "❌ Test suite missing"
    missing=$((missing + 1))
fi

echo ""
echo "======================================"
if [ $missing -eq 0 ]; then
    echo "✅ All files verified successfully!"
    echo ""
    echo "Multi-LLM implementation is ready to use."
    echo ""
    echo "Quick Start:"
    echo "1. Set API keys: export GOOGLE_AI_API_KEY='your-key'"
    echo "2. Configure: /configure-models --auto"
    echo "3. Check status: /model-status"
    echo "4. Use boost: /research-boost"
else
    echo "⚠️ $missing files missing"
    echo "Some components may not be fully installed."
fi

echo ""
echo "**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)"