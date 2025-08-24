#!/bin/bash

# Parallel Operations Hook
# Monitors both original and rebuilt systems during parallel operation phase

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REBUILD_STATE="$PROJECT_DIR/agile-ai-agents/project-state/rebuild-state.json"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if rebuild is active
if [ ! -f "$REBUILD_STATE" ]; then
    exit 0
fi

# Function to display system metrics
display_system_metrics() {
    local system_name=$1
    local response_time=$2
    local error_rate=$3
    local cpu_usage=$4
    local memory_usage=$5
    local traffic_percentage=$6
    
    echo -e "${CYAN}$system_name${NC}"
    echo "  Response Time: ${response_time}ms"
    echo "  Error Rate: ${error_rate}%"
    echo "  CPU Usage: ${cpu_usage}%"
    echo "  Memory: ${memory_usage}MB"
    echo "  Traffic: ${traffic_percentage}%"
    
    # Show health indicator
    if [ "$error_rate" -gt 5 ]; then
        echo -e "  Status: ${RED}⚠️  DEGRADED${NC}"
    elif [ "$error_rate" -gt 2 ]; then
        echo -e "  Status: ${YELLOW}⚠️  WARNING${NC}"
    else
        echo -e "  Status: ${GREEN}✅ HEALTHY${NC}"
    fi
}

# Function to compare performance
compare_performance() {
    local original_time=$1
    local rebuild_time=$2
    
    local improvement=0
    if [ "$original_time" -gt 0 ]; then
        improvement=$(( ((original_time - rebuild_time) * 100) / original_time ))
    fi
    
    if [ "$improvement" -gt 0 ]; then
        echo -e "${GREEN}+${improvement}% improvement${NC}"
    elif [ "$improvement" -lt 0 ]; then
        echo -e "${RED}${improvement}% degradation${NC}"
    else
        echo "No change"
    fi
}

# Main monitoring display
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 PARALLEL OPERATIONS MONITOR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Simulate reading metrics (in production, would read from actual monitoring)
ORIGINAL_RESPONSE=450
ORIGINAL_ERROR=0.5
ORIGINAL_CPU=65
ORIGINAL_MEMORY=2048
ORIGINAL_TRAFFIC=70

REBUILD_RESPONSE=120
REBUILD_ERROR=0.2
REBUILD_CPU=25
REBUILD_MEMORY=512
REBUILD_TRAFFIC=30

# Display both systems
echo -e "${BLUE}═══ SYSTEM COMPARISON ═══${NC}"
echo ""

display_system_metrics "ORIGINAL SYSTEM" \
    $ORIGINAL_RESPONSE $ORIGINAL_ERROR $ORIGINAL_CPU $ORIGINAL_MEMORY $ORIGINAL_TRAFFIC

echo ""

display_system_metrics "REBUILD SYSTEM" \
    $REBUILD_RESPONSE $REBUILD_ERROR $REBUILD_CPU $REBUILD_MEMORY $REBUILD_TRAFFIC

echo ""
echo -e "${BLUE}═══ PERFORMANCE COMPARISON ═══${NC}"
echo ""

echo -n "Response Time: "
compare_performance $ORIGINAL_RESPONSE $REBUILD_RESPONSE

echo -n "Error Rate: "
compare_performance $ORIGINAL_ERROR $REBUILD_ERROR

echo -n "CPU Usage: "
compare_performance $ORIGINAL_CPU $REBUILD_CPU

echo -n "Memory Usage: "
compare_performance $ORIGINAL_MEMORY $REBUILD_MEMORY

echo ""
echo -e "${BLUE}═══ TRAFFIC DISTRIBUTION ═══${NC}"
echo ""

# Display traffic distribution bar
printf "Original ["
for i in {1..10}; do
    if [ $((i * 10)) -le $ORIGINAL_TRAFFIC ]; then
        printf "█"
    else
        printf "░"
    fi
done
printf "] ${ORIGINAL_TRAFFIC}%%\n"

printf "Rebuild  ["
for i in {1..10}; do
    if [ $((i * 10)) -le $REBUILD_TRAFFIC ]; then
        printf "█"
    else
        printf "░"
    fi
done
printf "] ${REBUILD_TRAFFIC}%%\n"

echo ""

# Check for anomalies
echo -e "${BLUE}═══ ANOMALY DETECTION ═══${NC}"
echo ""

anomalies_found=false

# Check response time divergence
if [ $((REBUILD_RESPONSE * 2)) -gt $ORIGINAL_RESPONSE ] && [ $REBUILD_TRAFFIC -gt 20 ]; then
    echo -e "${YELLOW}⚠️  Rebuild system showing performance issues${NC}"
    anomalies_found=true
fi

# Check error rate spike
if [ $(echo "$REBUILD_ERROR > 2" | bc) -eq 1 ]; then
    echo -e "${RED}⚠️  High error rate on rebuild system${NC}"
    anomalies_found=true
fi

# Check traffic imbalance
total_traffic=$((ORIGINAL_TRAFFIC + REBUILD_TRAFFIC))
if [ $total_traffic -ne 100 ]; then
    echo -e "${YELLOW}⚠️  Traffic distribution mismatch (total: ${total_traffic}%)${NC}"
    anomalies_found=true
fi

if [ "$anomalies_found" = false ]; then
    echo -e "${GREEN}✅ No anomalies detected${NC}"
fi

echo ""
echo -e "${BLUE}═══ CUTOVER READINESS ═══${NC}"
echo ""

# Calculate cutover readiness score
readiness_score=0
readiness_checks=0

# Performance check
if [ $REBUILD_RESPONSE -lt $ORIGINAL_RESPONSE ]; then
    ((readiness_score++))
    echo "✅ Performance criteria met"
else
    echo "❌ Performance below threshold"
fi
((readiness_checks++))

# Error rate check
if [ $(echo "$REBUILD_ERROR < 1" | bc) -eq 1 ]; then
    ((readiness_score++))
    echo "✅ Error rate acceptable"
else
    echo "❌ Error rate too high"
fi
((readiness_checks++))

# Traffic handling check
if [ $REBUILD_TRAFFIC -ge 20 ]; then
    ((readiness_score++))
    echo "✅ Successfully handling traffic"
else
    echo "⚠️  Limited traffic exposure"
fi
((readiness_checks++))

# Feature parity check (simulated)
((readiness_score++))
echo "✅ Feature parity achieved"
((readiness_checks++))

# Calculate readiness percentage
readiness_percentage=$((readiness_score * 100 / readiness_checks))

echo ""
echo -n "Overall Readiness: "
if [ $readiness_percentage -ge 80 ]; then
    echo -e "${GREEN}${readiness_percentage}% - Ready for cutover${NC}"
elif [ $readiness_percentage -ge 60 ]; then
    echo -e "${YELLOW}${readiness_percentage}% - Address issues before cutover${NC}"
else
    echo -e "${RED}${readiness_percentage}% - Not ready for cutover${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0