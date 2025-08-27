#!/bin/bash

# Delete Agent Command
# Wrapper script for agent deletion with hook cleanup
# Usage: ./delete-agent.sh <agent-name>
#
# AgileBiz™ - Created by Phillip Darren Brown (https://github.com/DiscDev)

AGENT_NAME=$1
SCRIPTS_DIR="$(dirname "$0")/../scripts"

if [ -z "$AGENT_NAME" ]; then
    echo "Usage: $0 <agent-name>"
    echo "Example: $0 old-agent"
    exit 1
fi

echo "🗑️ Deleting agent: $AGENT_NAME"
echo "This command will:"
echo "  1. Backup the agent before deletion"
echo "  2. Remove from hook files"
echo "  3. Remove from CLAUDE.md"
echo "  4. Delete agent file and contexts"
echo ""

read -p "Are you sure you want to delete $AGENT_NAME? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Deletion cancelled"
    exit 0
fi

# Use the lifecycle manager to delete agent
node "$SCRIPTS_DIR/agent-lifecycle-manager.js" delete "$AGENT_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Agent $AGENT_NAME deleted successfully!"
    echo ""
else
    echo "❌ Failed to delete agent $AGENT_NAME"
    exit 1
fi