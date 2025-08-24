#!/bin/bash

# AgileAiAgents Multi-LLM Setup Script
# Quick setup for multi-model support

echo "🚀 AgileAiAgents Multi-LLM Setup"
echo "================================="
echo ""

# Check if Claude API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ ANTHROPIC_API_KEY not found!"
    echo "   Claude is required for AgileAiAgents to function."
    echo ""
    echo "   Please set your Claude API key:"
    echo "   export ANTHROPIC_API_KEY='your-api-key'"
    exit 1
fi

echo "✅ Claude API configured"

# Function to check and report API key status
check_api_key() {
    local key_name=$1
    local service_name=$2
    local benefit=$3
    
    if [ -n "${!key_name}" ]; then
        echo "✅ $service_name configured - $benefit"
        return 0
    else
        echo "⚪ $service_name not configured (optional) - $benefit"
        return 1
    fi
}

# Check optional services
echo ""
echo "Optional Services:"
check_api_key "GOOGLE_AI_API_KEY" "Gemini" "40% cost reduction"
check_api_key "PERPLEXITY_API_KEY" "Perplexity" "Deep research with citations"
check_api_key "OPENAI_API_KEY" "OpenAI" "Additional fallback"
check_api_key "TAVILY_API_KEY" "Tavily" "Enhanced search"

# Check Zen MCP
echo ""
if [ "$ZEN_MCP_ENABLED" = "true" ]; then
    echo "✅ Zen MCP enabled - 75% cost reduction"
else
    echo "⚪ Zen MCP not enabled (optional) - Maximum performance"
fi

# Get the script directory and parent directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AAA_DIR="$(dirname "$SCRIPT_DIR")"

# Run service detection
echo ""
echo "Running service detection..."
node "$AAA_DIR/machine-data/service-detector.js"

# Offer to run configuration
echo ""
echo "Setup Options:"
echo "1. Automatic configuration (recommended)"
echo "2. Interactive configuration"
echo "3. Skip configuration"
echo ""
read -p "Select option [1-3]: " option

case $option in
    1)
        echo "Running automatic configuration..."
        echo "/configure-models --auto" | claude
        ;;
    2)
        echo "Starting interactive configuration..."
        echo "/configure-models" | claude
        ;;
    3)
        echo "Skipping configuration."
        ;;
    *)
        echo "Invalid option. Skipping configuration."
        ;;
esac

# Show next steps
echo ""
echo "✅ Multi-LLM setup complete!"
echo ""
echo "Next Steps:"
echo "1. Check status: /model-status"
echo "2. Enable research boost: /research-boost"
echo "3. View dashboard: npm run dashboard"
echo ""
echo "For help, see: $AAA_DIR/project-documents/system/multi-llm-setup-guide.md"
echo ""
echo "**AgileAiAgents™** - Created by Phillip Darren Brown (https://github.com/DiscDev)"