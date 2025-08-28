#!/bin/bash

# Agent Context File Validation Script
# Ensures all referenced context files actually exist

set -e

echo "🔍 Validating Agent Context File References"
echo "=========================================="

# Configuration
WORKSPACE_DIR="/Users/phillipbrown/No-iCloud-Folder/AgileBiz/agile-biz-workspace"
AGENTS_DIR="$WORKSPACE_DIR/.claude/agents"
AGENT_TOOLS_DIR="$AGENTS_DIR/agent-tools"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation function
validate_agent_contexts() {
    local agent_file="$1"
    local agent_name=$(basename "$agent_file" .md)
    local missing_files=()
    local found_references=0
    
    echo -e "\n${YELLOW}Validating: $agent_name${NC}"
    
    # Skip shared-tools directory
    if [ "$agent_name" = "shared-tools" ]; then
        return 0
    fi
    
    # Extract all agent-tools references from the agent file
    while IFS= read -r line; do
        if [[ $line =~ agent-tools/$agent_name/([a-zA-Z0-9-]+\.md) ]]; then
            local referenced_file="${BASH_REMATCH[1]}"
            local full_path="$AGENT_TOOLS_DIR/$agent_name/$referenced_file"
            found_references=$((found_references + 1))
            
            if [ -f "$full_path" ]; then
                echo -e "  ${GREEN}✅ $referenced_file${NC}"
            else
                echo -e "  ${RED}❌ $referenced_file (MISSING)${NC}"
                missing_files+=("$referenced_file")
            fi
        fi
    done < "$agent_file"
    
    # Report results for this agent
    if [ $found_references -eq 0 ]; then
        echo -e "  ${YELLOW}ℹ️ No context file references found${NC}"
    elif [ ${#missing_files[@]} -eq 0 ]; then
        echo -e "  ${GREEN}✅ All $found_references context files exist${NC}"
    else
        echo -e "  ${RED}❌ ${#missing_files[@]} of $found_references context files missing${NC}"
        return 1
    fi
    
    return 0
}

# Main validation loop
main() {
    local total_agents=0
    local valid_agents=0
    local invalid_agents=0
    
    echo "Scanning agents in: $AGENTS_DIR"
    echo
    
    for agent_file in "$AGENTS_DIR"/*.md; do
        if [ -f "$agent_file" ]; then
            total_agents=$((total_agents + 1))
            
            if validate_agent_contexts "$agent_file"; then
                valid_agents=$((valid_agents + 1))
            else
                invalid_agents=$((invalid_agents + 1))
            fi
        fi
    done
    
    # Summary
    echo
    echo "=========================================="
    echo "📊 Validation Summary:"
    echo "  Total Agents: $total_agents"
    echo -e "  ${GREEN}Valid: $valid_agents${NC}"
    if [ $invalid_agents -gt 0 ]; then
        echo -e "  ${RED}Invalid: $invalid_agents${NC}"
        echo
        echo -e "${RED}⚠️ Found agents with missing context files!${NC}"
        echo "This indicates the agent-admin context file creation process needs attention."
        return 1
    else
        echo -e "  ${RED}Invalid: $invalid_agents${NC}"
        echo
        echo -e "${GREEN}🎉 All agents have valid context file references!${NC}"
        return 0
    fi
}

# Execute validation
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi