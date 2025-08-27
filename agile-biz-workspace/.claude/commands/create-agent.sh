#!/bin/bash

# Create Agent Command
# Wrapper script for agent creation with hook integration
# Usage: ./create-agent.sh <agent-name>
#
# AgileBiz™ - Created by Phillip Darren Brown (https://github.com/DiscDev)

AGENT_NAME=$1
SCRIPTS_DIR="$(dirname "$0")/../scripts"

if [ -z "$AGENT_NAME" ]; then
    echo "Usage: $0 <agent-name>"
    echo "Example: $0 testing-agent"
    exit 1
fi

echo "🚀 Creating agent: $AGENT_NAME"
echo "This command will:"
echo "  1. Create agent file in .claude/agents/"
echo "  2. Update hook files for detection"
echo "  3. Update CLAUDE.md documentation"
echo "  4. Validate all changes"
echo ""

# Use the lifecycle manager to create agent
node "$SCRIPTS_DIR/agent-lifecycle-manager.js" create "$AGENT_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Agent $AGENT_NAME created successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Please restart Claude Code for the new agent to be recognized"
    echo ""
else
    echo "❌ Failed to create agent $AGENT_NAME"
    exit 1
fi