#!/bin/bash
# run-all-tests.sh
# Master test runner for all Claude Code workflow tests

set -e  # Exit on any error

# Test Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="/Users/phillipbrown/No-iCloud-Folder/AgileBiz/agile-biz-workspace"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Claude Code Workflow Test Suite${NC}"
echo "===================================="
echo -e "Testing workspace: ${YELLOW}$TEST_DIR${NC}"
echo

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Function to run a test script
run_test() {
    local test_name="$1"
    local test_script="$2"
    local description="$3"
    
    echo -e "${MAGENTA}🧪 Running: $test_name${NC}"
    echo -e "${YELLOW}Description: $description${NC}"
    echo "----------------------------------------"
    
    if [[ -f "$test_script" ]]; then
        if bash "$test_script"; then
            echo -e "${GREEN}✅ $test_name PASSED${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ $test_name FAILED${NC}"
            ((TESTS_FAILED++))
            FAILED_TESTS+=("$test_name")
        fi
    else
        echo -e "${RED}❌ Test script not found: $test_script${NC}"
        ((TESTS_FAILED++))
        FAILED_TESTS+=("$test_name (script missing)")
    fi
    
    echo
    echo "----------------------------------------"
    echo
}

# Main test execution
main() {
    echo -e "${BLUE}🚀 Starting Test Suite Execution...${NC}"
    echo
    
    # Test 1: Create-Agent Comprehensive Tests
    run_test \
        "Create-Agent Comprehensive" \
        "$SCRIPT_DIR/create-agent-tests.sh" \
        "Tests the complete agent creation workflow with conversational interface and infrastructure"
    
    # Test 2: Delete-Agent Tests
    run_test \
        "Delete-Agent Tests" \
        "$SCRIPT_DIR/delete-agent-tests.sh" \
        "Tests the agent deletion workflow with safety measures and cleanup"
    
    # Summary
    echo -e "${BLUE}📊 TEST SUITE SUMMARY${NC}"
    echo "===================================="
    echo -e "Total Tests Run: ${YELLOW}$((TESTS_PASSED + TESTS_FAILED))${NC}"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
        echo -e "${GREEN}✅ Claude Code workflow infrastructure is ready for production use!${NC}"
        echo
        echo -e "${BLUE}Available Workflows:${NC}"
        echo "• /create-agent - Interactive agent creation"
        echo "• /delete-agent - Safe agent deletion with confirmations"
        echo
        echo -e "${BLUE}Key Features Tested:${NC}"
        echo "✅ Command structure and registration"
        echo "✅ JSON configuration validation"
        echo "✅ Agent-admin integration"
        echo "✅ Safety and confirmation flows" 
        echo "✅ State management patterns"
        echo "✅ File system integration"
        echo "✅ Error handling scenarios"
        echo "✅ End-to-end workflow validation"
        echo
    else
        echo -e "${RED}❌ SOME TESTS FAILED${NC}"
        echo -e "${RED}Failed tests:${NC}"
        for failed_test in "${FAILED_TESTS[@]}"; do
            echo -e "  • ${RED}$failed_test${NC}"
        done
        echo
        echo -e "${YELLOW}Please review the failed tests and fix any issues before proceeding.${NC}"
        exit 1
    fi
}

# Individual test runner function
run_individual() {
    local test_name="$1"
    
    case "$test_name" in
        "create-agent"|"create")
            run_test \
                "Create-Agent Comprehensive" \
                "$SCRIPT_DIR/create-agent-tests.sh" \
                "Tests the complete agent creation workflow with conversational interface and infrastructure"
            ;;
        "delete-agent"|"delete")
            run_test \
                "Delete-Agent Tests" \
                "$SCRIPT_DIR/delete-agent-tests.sh" \
                "Tests the agent deletion workflow with safety measures and cleanup"
            ;;
        *)
            echo -e "${RED}❌ Unknown test: $test_name${NC}"
            echo
            echo -e "${YELLOW}Available tests:${NC}"
            echo "• create-agent (or 'create')"
            echo "• delete-agent (or 'delete')"
            echo
            echo -e "${BLUE}Usage:${NC}"
            echo "$0 [test-name]"
            echo "$0  # Run all tests"
            exit 1
            ;;
    esac
}

# Command line handling
if [[ $# -eq 0 ]]; then
    # No arguments - run all tests
    main
elif [[ $# -eq 1 ]]; then
    # One argument - run individual test
    run_individual "$1"
else
    echo -e "${RED}❌ Too many arguments${NC}"
    echo -e "${BLUE}Usage:${NC}"
    echo "$0          # Run all tests"
    echo "$0 [test]   # Run specific test"
    exit 1
fi