#!/bin/bash
# create-agent-workflow-tests.sh
# Comprehensive test suite for conversational agent creation workflow

set -e  # Exit on any error

# Test Configuration
TEST_DIR="/Users/phillipbrown/No-iCloud-Folder/AgileBiz/agile-biz-workspace"
CLAUDE_DIR="$TEST_DIR/.claude"
AGENTS_DIR="$CLAUDE_DIR/agents"
COMMANDS_DIR="$CLAUDE_DIR/commands"
CREATE_AGENT_DIR="$COMMANDS_DIR/create-agent"

echo "🧪 Starting Create-Agent Workflow Tests..."

# Test 1: Verify File Structure
test_file_structure() {
    echo "📁 Test 1: Verifying file structure..."
    
    # Check required files exist
    [[ -f "$COMMANDS_DIR/create-agent.md" ]] || { echo "❌ create-agent.md missing"; exit 1; }
    [[ -f "$CREATE_AGENT_DIR/tool-categories.json" ]] || { echo "❌ tool-categories.json missing"; exit 1; }
    [[ -f "$CREATE_AGENT_DIR/conversation-templates.json" ]] || { echo "❌ conversation-templates.json missing"; exit 1; }
    [[ -f "$AGENTS_DIR/agent-tools/agent-admin/conversational-workflow-management.md" ]] || { echo "❌ conversational-workflow-management.md missing"; exit 1; }
    
    echo "✅ All required files present"
}

# Test 2: Validate JSON Structure
test_json_structure() {
    echo "📋 Test 2: Validating JSON structure..."
    
    # Test tool-categories.json
    if ! jq . "$CREATE_AGENT_DIR/tool-categories.json" > /dev/null 2>&1; then
        echo "❌ tool-categories.json is invalid JSON"
        exit 1
    fi
    
    # Test conversation-templates.json
    if ! jq . "$CREATE_AGENT_DIR/conversation-templates.json" > /dev/null 2>&1; then
        echo "❌ conversation-templates.json is invalid JSON"
        exit 1
    fi
    
    # Verify required categories exist
    local categories=$(jq -r 'keys[]' "$CREATE_AGENT_DIR/tool-categories.json")
    for category in "content_creation" "development" "business_analysis" "research"; do
        if ! echo "$categories" | grep -q "^$category$"; then
            echo "❌ Missing category: $category"
            exit 1
        fi
    done
    
    echo "✅ JSON structure valid"
}

# Test 3: Verify Tool Categories Content
test_tool_categories() {
    echo "🔧 Test 3: Verifying tool categories content..."
    
    # Check that each category has required fields
    for category in "content_creation" "development" "business_analysis" "research"; do
        local name=$(jq -r ".$category.name" "$CREATE_AGENT_DIR/tool-categories.json")
        local keywords=$(jq -r ".$category.keywords | length" "$CREATE_AGENT_DIR/tool-categories.json")
        local shared_tools=$(jq -r ".$category.shared_tools | length" "$CREATE_AGENT_DIR/tool-categories.json")
        
        [[ "$name" != "null" ]] || { echo "❌ Category $category missing name"; exit 1; }
        [[ "$keywords" -gt 0 ]] || { echo "❌ Category $category missing keywords"; exit 1; }
        [[ "$shared_tools" -gt 0 ]] || { echo "❌ Category $category missing shared_tools"; exit 1; }
    done
    
    echo "✅ Tool categories content valid"
}

# Test 4: Verify Conversation Templates
test_conversation_templates() {
    echo "💬 Test 4: Verifying conversation templates..."
    
    # Check required prompts exist
    local prompts=$(jq -r '.prompts | keys[]' "$CREATE_AGENT_DIR/conversation-templates.json")
    for prompt in "agent_name" "agent_purpose" "model_selection" "confirmation"; do
        if ! echo "$prompts" | grep -q "^$prompt$"; then
            echo "❌ Missing prompt: $prompt"
            exit 1
        fi
    done
    
    # Check required responses exist
    local responses=$(jq -r '.responses | keys[]' "$CREATE_AGENT_DIR/conversation-templates.json")
    for response in "name_available" "creation_success" "category_detected"; do
        if ! echo "$responses" | grep -q "^$response$"; then
            echo "❌ Missing response: $response"
            exit 1
        fi
    done
    
    echo "✅ Conversation templates valid"
}

# Test 5: Check Agent-Admin Integration
test_agent_admin_integration() {
    echo "🤖 Test 5: Checking agent-admin integration..."
    
    # Verify agent-admin exists
    [[ -f "$AGENTS_DIR/agent-admin.md" ]] || { echo "❌ agent-admin.md missing"; exit 1; }
    
    # Check that conversational workflow context exists
    local workflow_file="$AGENTS_DIR/agent-tools/agent-admin/conversational-workflow-management.md"
    [[ -f "$workflow_file" ]] || { echo "❌ conversational-workflow-management.md missing"; exit 1; }
    
    # Verify it contains key sections
    grep -q "Tool Categories Management" "$workflow_file" || { echo "❌ Missing Tool Categories Management section"; exit 1; }
    grep -q "Conversational Flow Orchestration" "$workflow_file" || { echo "❌ Missing Conversational Flow section"; exit 1; }
    grep -q "Agent Specification Building" "$workflow_file" || { echo "❌ Missing Agent Specification section"; exit 1; }
    
    echo "✅ Agent-admin integration ready"
}

# Test 6: Verify Command Registration
test_command_registration() {
    echo "⚙️ Test 6: Verifying command registration..."
    
    # Check that create-agent.md has proper frontmatter
    if head -n 3 "$COMMANDS_DIR/create-agent.md" | grep -q "description:"; then
        echo "✅ Command properly registered"
    else
        echo "❌ Command missing proper frontmatter"
        exit 1
    fi
}

# Test 7: Check for Old System Cleanup
test_old_system_cleanup() {
    echo "🧹 Test 7: Checking old system cleanup..."
    
    # Verify old Node.js files are removed
    [[ ! -d "$CLAUDE_DIR/scripts/commands/create-agent" ]] || { echo "❌ Old Node.js directory still exists"; exit 1; }
    [[ ! -f "$COMMANDS_DIR/create-agent.sh" ]] || { echo "❌ Old shell script still exists"; exit 1; }
    
    echo "✅ Old system properly cleaned up"
}

# Main test execution
run_all_tests() {
    test_file_structure
    test_json_structure
    test_tool_categories
    test_conversation_templates
    test_agent_admin_integration
    test_command_registration
    test_old_system_cleanup
    
    echo ""
    echo "🎉 All tests passed! Create-Agent Conversational Workflow is ready."
    echo ""
    echo "📋 Summary:"
    echo "• Configuration files created and validated"
    echo "• Tool categories system implemented"
    echo "• Conversation templates configured"
    echo "• Agent-admin integration context added"
    echo "• Command properly registered"
    echo "• Old system cleaned up"
    echo ""
    echo "🚀 To test the workflow:"
    echo "1. Run '/create-agent' in Claude Code"
    echo "2. Provide an agent purpose (e.g., 'help with blog writing')"
    echo "3. Follow the conversational prompts"
    echo "4. The agent-admin will guide you through the process"
}

# Execute tests
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    run_all_tests
fi
