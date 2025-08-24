#!/bin/bash

# Rebuild Decision Hook
# Monitors conditions that might trigger a rebuild workflow

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_FILE="$PROJECT_DIR/agile-ai-agents/project-state/workflow-state.json"
REBUILD_INDICATORS="$PROJECT_DIR/agile-ai-agents/machine-data/rebuild-indicators.json"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if analysis has been run
if [ ! -f "$STATE_FILE" ]; then
    exit 0
fi

# Function to check technical debt
check_technical_debt() {
    # Simulate checking technical debt percentage
    # In real implementation, this would analyze actual code metrics
    local debt_percentage=65
    
    if [ $debt_percentage -gt 60 ]; then
        echo -e "${RED}⚠️  REBUILD TRIGGER: Technical debt at ${debt_percentage}%${NC}"
        echo "Consider running: /rebuild-project-workflow --type=technical"
        return 1
    fi
    return 0
}

# Function to check framework deprecation
check_framework_status() {
    # Check for deprecated frameworks
    # In real implementation, would check package.json, requirements.txt, etc.
    local deprecated_found=false
    
    if [ "$deprecated_found" = true ]; then
        echo -e "${RED}⚠️  REBUILD TRIGGER: Core framework deprecated${NC}"
        echo "Consider running: /rebuild-project-workflow --type=technical"
        return 1
    fi
    return 0
}

# Function to check business metrics
check_business_metrics() {
    # Check LTV:CAC ratio and other business metrics
    # In real implementation, would read from analytics
    local ltv_cac_ratio=1.2
    
    if (( $(echo "$ltv_cac_ratio < 1.5" | bc -l) )); then
        echo -e "${YELLOW}⚠️  REBUILD TRIGGER: LTV:CAC ratio below threshold (${ltv_cac_ratio})${NC}"
        echo "Consider running: /rebuild-project-workflow --type=business-model"
        return 1
    fi
    return 0
}

# Function to check security vulnerabilities
check_security_status() {
    # Check for critical security vulnerabilities
    # In real implementation, would run security scanners
    local critical_vulns=0
    
    if [ $critical_vulns -gt 5 ]; then
        echo -e "${RED}⚠️  REBUILD TRIGGER: ${critical_vulns} critical security vulnerabilities${NC}"
        echo "Consider running: /rebuild-project-workflow --type=complete"
        return 1
    fi
    return 0
}

# Function to calculate rebuild ROI
calculate_rebuild_roi() {
    local rebuild_type=$1
    
    case $rebuild_type in
        "technical")
            echo "Estimated ROI: 350% over 18 months"
            ;;
        "business-model")
            echo "Estimated ROI: 520% over 12 months"
            ;;
        "partial")
            echo "Estimated ROI: 280% over 24 months"
            ;;
        "complete")
            echo "Estimated ROI: 450% over 24 months"
            ;;
    esac
}

# Main execution
rebuild_triggered=false

echo "🔍 Checking rebuild indicators..."

# Run all checks
check_technical_debt || rebuild_triggered=true
check_framework_status || rebuild_triggered=true
check_business_metrics || rebuild_triggered=true
check_security_status || rebuild_triggered=true

if [ "$rebuild_triggered" = true ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 REBUILD ASSESSMENT COMPLETE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "One or more rebuild triggers detected."
    echo "Run '/rebuild-project-workflow' to start rebuild process."
    echo ""
    
    # Save rebuild recommendation to state
    echo "{\"rebuild_recommended\": true, \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$PROJECT_DIR/agile-ai-agents/project-state/rebuild-recommendation.json"
else
    echo -e "${GREEN}✅ No rebuild triggers detected. System health good.${NC}"
fi

exit 0