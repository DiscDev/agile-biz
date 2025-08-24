#!/bin/bash

# AgileAiAgents Enhanced Statusline for Claude Code
# Version 2.0 - Full feature implementation

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AAA_ROOT="$PROJECT_ROOT/agile-ai-agents"

# Parse input JSON from Claude Code
INPUT_JSON="${1:-$(cat)}"

# Extract current working directory from input
CURRENT_DIR=$(echo "$INPUT_JSON" | grep -o '"currentWorkingDirectory":"[^"]*"' | cut -d'"' -f4)
MODEL=$(echo "$INPUT_JSON" | grep -o '"model":"[^"]*"' | cut -d'"' -f4)

# Configuration files
CONFIG_FILE="$AAA_ROOT/CLAUDE-config.md"
STATE_FILE="$AAA_ROOT/project-state/current-state.json"
SPRINT_DIR="$AAA_ROOT/project-documents/orchestration/sprints/current"
HOOK_STATUS_DIR="$PROJECT_ROOT/.claude/hooks/status"
DASHBOARD_STATUS="$AAA_ROOT/project-state/dashboard-status.json"
LEARNING_STATUS="$AAA_ROOT/community-learnings/status.json"

# Cache file for performance
CACHE_FILE="$PROJECT_ROOT/.claude/hooks/.statusline-cache"
CACHE_AGE=2  # seconds

# Default configuration
VERBOSITY="normal"
STATUSLINE_ENABLED="true"
STATUSLINE_MODE="adaptive"
SHOW_HEALTH="true"
SHOW_MILESTONE="true"
SHOW_AGENTS="true"
SHOW_COST="true"
SHOW_DASHBOARD="true"
SHOW_HOOKS="false"
SHOW_TOKENS="false"
MAX_WIDTH=120

# Alert thresholds
ACTION_URGENCY=10
COST_WARNING=5
TOKEN_WARNING=80
STALL_DETECTION=15

# Colors (ANSI codes)
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
BLUE="\033[34m"
CYAN="\033[36m"
MAGENTA="\033[35m"
BOLD="\033[1m"
DIM="\033[2m"
RESET="\033[0m"

# Icons
ICON_GOOD="🟢"
ICON_WARNING="🟡"
ICON_ERROR="🔴"
ICON_INFO="🔵"
ICON_WAITING="⏸️"
ICON_COMPLETE="✅"
ICON_ALERT="⚠️"
ICON_LINK="↗"
ICON_PROGRESS="🔄"
ICON_LEARNING="💡"
ICON_HOOK="🪝"
ICON_RECOVERY="🔧"

# Check cache validity
check_cache() {
    if [[ -f "$CACHE_FILE" ]]; then
        local cache_age=$(($(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0)))
        if [[ $cache_age -lt $CACHE_AGE ]]; then
            cat "$CACHE_FILE"
            exit 0
        fi
    fi
}

# Read configuration from CLAUDE-config.md
read_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        # Extract verbosity level
        VERBOSITY=$(grep -A5 "^verbosity:" "$CONFIG_FILE" 2>/dev/null | grep "level:" | sed 's/.*"\(.*\)".*/\1/' | head -1)
        
        # Extract statusline configuration if it exists
        if grep -q "^statusline:" "$CONFIG_FILE" 2>/dev/null; then
            STATUSLINE_ENABLED=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "enabled:" | awk '{print $2}' | head -1)
            STATUSLINE_MODE=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "mode:" | sed 's/.*"\(.*\)".*/\1/' | head -1)
            SHOW_HEALTH=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "show_health:" | awk '{print $2}' | head -1)
            SHOW_MILESTONE=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "show_milestone:" | awk '{print $2}' | head -1)
            SHOW_AGENTS=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "show_agents:" | awk '{print $2}' | head -1)
            SHOW_COST=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "show_cost:" | awk '{print $2}' | head -1)
            SHOW_DASHBOARD=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "show_dashboard:" | awk '{print $2}' | head -1)
            SHOW_HOOKS=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "show_hooks:" | awk '{print $2}' | head -1)
            SHOW_TOKENS=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "show_tokens:" | awk '{print $2}' | head -1)
            
            # Read thresholds
            ACTION_URGENCY=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "action_urgency:" | awk '{print $2}' | head -1)
            COST_WARNING=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "cost_warning:" | awk '{print $2}' | head -1)
            TOKEN_WARNING=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "token_warning:" | awk '{print $2}' | head -1)
            STALL_DETECTION=$(grep -A30 "^statusline:" "$CONFIG_FILE" | grep "stall_detection:" | awk '{print $2}' | head -1)
        fi
    fi
    
    # Set defaults if not found
    VERBOSITY=${VERBOSITY:-"normal"}
    STATUSLINE_ENABLED=${STATUSLINE_ENABLED:-"true"}
    STATUSLINE_MODE=${STATUSLINE_MODE:-"adaptive"}
    ACTION_URGENCY=${ACTION_URGENCY:-10}
    COST_WARNING=${COST_WARNING:-5}
    TOKEN_WARNING=${TOKEN_WARNING:-80}
    STALL_DETECTION=${STALL_DETECTION:-15}
}

# Read project state with enhanced workflow detection
read_project_state() {
    local workflow=""
    local phase=""
    local progress=""
    local health="good"
    local milestone=""
    local blockers=0
    local phase_stalled="false"
    local last_update=""
    
    if [[ -f "$STATE_FILE" ]]; then
        # Extract workflow information
        workflow=$(jq -r '.workflow_state.active_workflow // ""' "$STATE_FILE" 2>/dev/null)
        phase=$(jq -r '.workflow_state.workflow_phase // ""' "$STATE_FILE" 2>/dev/null)
        
        # Check for phase stall
        last_update=$(jq -r '.workflow_state.last_update // ""' "$STATE_FILE" 2>/dev/null)
        if [[ -n "$last_update" && "$last_update" != "null" ]]; then
            local update_age=$(( ($(date +%s) - $(date -d "$last_update" +%s 2>/dev/null || echo 0)) / 60 ))
            if [[ $update_age -gt $STALL_DETECTION ]]; then
                phase_stalled="true"
            fi
        fi
        
        # Extract progress based on workflow type
        case "$workflow" in
            "new-project")
                local sections_completed=$(jq -r '.workflow_state.discovery.sections_completed | length' "$STATE_FILE" 2>/dev/null)
                local total_sections=5
                if [[ "$sections_completed" != "null" && "$sections_completed" -gt 0 ]]; then
                    progress="$sections_completed/$total_sections"
                fi
                ;;
            "existing-project")
                local analysis_progress=$(jq -r '.workflow_state.analysis.progress // 0' "$STATE_FILE" 2>/dev/null)
                if [[ "$analysis_progress" != "null" && "$analysis_progress" -gt 0 ]]; then
                    progress="${analysis_progress}%"
                fi
                ;;
        esac
        
        # Extract last milestone
        milestone=$(jq -r '.milestones[-1].description // ""' "$STATE_FILE" 2>/dev/null | head -c 30)
        
        # Check for blockers
        blockers=$(jq -r '.sprint.blockers | length' "$STATE_FILE" 2>/dev/null)
        if [[ "$blockers" == "null" ]]; then
            blockers=0
        fi
        
        # Check for validation gate failures
        local validation_failures=$(jq -r '.validation.failures | length' "$STATE_FILE" 2>/dev/null)
        if [[ "$validation_failures" != "null" && "$validation_failures" -gt 0 ]]; then
            blockers=$((blockers + validation_failures))
        fi
        
        # Determine health
        if [[ "$phase_stalled" == "true" ]]; then
            health="critical"
        elif [[ $blockers -gt 2 ]]; then
            health="critical"
        elif [[ $blockers -gt 0 ]]; then
            health="warning"
        else
            health="good"
        fi
    fi
    
    echo "$workflow|$phase|$progress|$health|$milestone|$blockers|$phase_stalled"
}

# Read sprint information with enhanced metrics
read_sprint_info() {
    local sprint_name=""
    local sprint_day=""
    local stories_complete=0
    local stories_total=0
    local velocity=""
    local burndown=""
    
    if [[ -d "$SPRINT_DIR" ]]; then
        # Find the latest sprint file
        local latest_sprint=$(ls -t "$SPRINT_DIR"/*.md 2>/dev/null | head -1)
        if [[ -f "$latest_sprint" ]]; then
            sprint_name=$(basename "$latest_sprint" .md)
            
            # Extract sprint day from filename or content
            sprint_day=$(echo "$sprint_name" | grep -oE "day-[0-9]+" | grep -oE "[0-9]+")
            
            # Extract sprint progress from file
            stories_complete=$(grep -c "✅" "$latest_sprint" 2>/dev/null || echo 0)
            stories_total=$(grep -c "^- \[" "$latest_sprint" 2>/dev/null || echo 0)
            
            # Calculate velocity if available
            if [[ $stories_total -gt 0 && -n "$sprint_day" && "$sprint_day" -gt 0 ]]; then
                velocity=$(echo "scale=1; $stories_complete / $sprint_day" | bc 2>/dev/null || echo "")
            fi
        fi
    fi
    
    echo "$sprint_name|$stories_complete|$stories_total|$sprint_day|$velocity"
}

# Read sub-agent status with enhanced coordination info
read_subagent_status() {
    local active_agents=0
    local mode="idle"
    local efficiency=""
    local agent_names=""
    local conflicts=0
    
    if [[ -f "$STATE_FILE" ]]; then
        active_agents=$(jq -r '.agents.active | length' "$STATE_FILE" 2>/dev/null)
        if [[ "$active_agents" == "null" ]]; then
            active_agents=0
        fi
        
        # Get agent names for verbose mode
        if [[ "$VERBOSITY" == "verbose" || "$VERBOSITY" == "debug" ]]; then
            agent_names=$(jq -r '.agents.active[].name' "$STATE_FILE" 2>/dev/null | xargs | sed 's/ /+/g')
        fi
        
        # Check for conflicts
        conflicts=$(jq -r '.agents.conflicts | length' "$STATE_FILE" 2>/dev/null)
        if [[ "$conflicts" == "null" ]]; then
            conflicts=0
        fi
        
        if [[ $active_agents -gt 1 ]]; then
            mode="parallel"
            # Calculate efficiency based on agent count
            case $active_agents in
                2) efficiency="45% faster" ;;
                3) efficiency="60% faster" ;;
                4) efficiency="70% faster" ;;
                5) efficiency="75% faster" ;;
                *) efficiency="optimized" ;;
            esac
        elif [[ $active_agents -eq 1 ]]; then
            mode="sequential"
        fi
    fi
    
    echo "$active_agents|$mode|$efficiency|$agent_names|$conflicts"
}

# Read hook system status
read_hook_status() {
    local active_hooks=0
    local hook_profile="standard"
    local avg_execution=0
    local failed_hooks=0
    
    if [[ -d "$HOOK_STATUS_DIR" ]]; then
        # Count active hook status files
        active_hooks=$(ls "$HOOK_STATUS_DIR"/*.active 2>/dev/null | wc -l | xargs)
        
        # Check for failed hooks
        failed_hooks=$(ls "$HOOK_STATUS_DIR"/*.failed 2>/dev/null | wc -l | xargs)
    fi
    
    # Read hook profile from config
    if [[ -f "$CONFIG_FILE" ]]; then
        hook_profile=$(grep -A5 "^hooks:" "$CONFIG_FILE" | grep "profile:" | sed 's/.*"\(.*\)".*/\1/' | head -1)
    fi
    
    echo "$active_hooks|$hook_profile|$avg_execution|$failed_hooks"
}

# Read community learning status
read_learning_status() {
    local pending_contributions=0
    local patterns_detected=0
    local confidence=""
    local last_contribution=""
    
    if [[ -f "$LEARNING_STATUS" ]]; then
        pending_contributions=$(jq -r '.pending | length' "$LEARNING_STATUS" 2>/dev/null)
        patterns_detected=$(jq -r '.patterns_detected | length' "$LEARNING_STATUS" 2>/dev/null)
        confidence=$(jq -r '.average_confidence // 0' "$LEARNING_STATUS" 2>/dev/null)
        last_contribution=$(jq -r '.last_contribution // ""' "$LEARNING_STATUS" 2>/dev/null)
        
        # Handle null values
        [[ "$pending_contributions" == "null" ]] && pending_contributions=0
        [[ "$patterns_detected" == "null" ]] && patterns_detected=0
        [[ "$confidence" == "null" ]] && confidence=0
    fi
    
    echo "$pending_contributions|$patterns_detected|$confidence|$last_contribution"
}

# Check for recovery status
check_recovery_status() {
    local recovery_active="false"
    local recovery_type=""
    local recovery_progress=""
    
    if [[ -f "$STATE_FILE" ]]; then
        recovery_active=$(jq -r '.recovery.active // false' "$STATE_FILE" 2>/dev/null)
        recovery_type=$(jq -r '.recovery.type // ""' "$STATE_FILE" 2>/dev/null)
        recovery_progress=$(jq -r '.recovery.progress // ""' "$STATE_FILE" 2>/dev/null)
    fi
    
    echo "$recovery_active|$recovery_type|$recovery_progress"
}

# Format workflow-specific display
format_workflow_display() {
    local workflow="$1"
    local phase="$2"
    local progress="$3"
    local display=""
    
    case "$workflow" in
        "new-project")
            case "$phase" in
                *"Discovery"*|*"Interview"*)
                    display="${ICON_INFO} Discovery"
                    [[ -n "$progress" ]] && display="$display | Section $progress"
                    ;;
                *"Research"*)
                    display="${ICON_INFO} Research"
                    [[ -n "$progress" ]] && display="$display | $progress docs"
                    ;;
                *"Sprint 1"*|*"CI/CD"*)
                    display="${ICON_PROGRESS} Sprint 1 CI/CD"
                    [[ -n "$progress" ]] && display="$display | Step $progress"
                    ;;
                *)
                    display="$phase"
                    [[ -n "$progress" ]] && display="$display | $progress"
                    ;;
            esac
            ;;
        "existing-project")
            case "$phase" in
                *"Analysis"*)
                    display="${ICON_INFO} Analyzing"
                    [[ -n "$progress" ]] && display="$display | $progress"
                    ;;
                *"Migration"*)
                    display="${ICON_WARNING} Migration"
                    [[ -n "$progress" ]] && display="$display | $progress"
                    ;;
                *"Enhancement"*)
                    display="${ICON_GOOD} Enhancements"
                    [[ -n "$progress" ]] && display="$display | $progress"
                    ;;
                *)
                    display="$phase"
                    [[ -n "$progress" ]] && display="$display | $progress"
                    ;;
            esac
            ;;
        *)
            display="$phase"
            [[ -n "$progress" ]] && display="$display | $progress"
            ;;
    esac
    
    echo "$display"
}

# Main statusline formatting with all features
format_statusline() {
    # Read all data sources
    local state_info=$(read_project_state)
    local workflow=$(echo "$state_info" | cut -d'|' -f1)
    local phase=$(echo "$state_info" | cut -d'|' -f2)
    local progress=$(echo "$state_info" | cut -d'|' -f3)
    local health=$(echo "$state_info" | cut -d'|' -f4)
    local milestone=$(echo "$state_info" | cut -d'|' -f5)
    local blockers=$(echo "$state_info" | cut -d'|' -f6)
    local phase_stalled=$(echo "$state_info" | cut -d'|' -f7)
    
    local sprint_info=$(read_sprint_info)
    local sprint_name=$(echo "$sprint_info" | cut -d'|' -f1)
    local stories_complete=$(echo "$sprint_info" | cut -d'|' -f2)
    local stories_total=$(echo "$sprint_info" | cut -d'|' -f3)
    local sprint_day=$(echo "$sprint_info" | cut -d'|' -f4)
    local velocity=$(echo "$sprint_info" | cut -d'|' -f5)
    
    local agent_info=$(read_subagent_status)
    local active_agents=$(echo "$agent_info" | cut -d'|' -f1)
    local agent_mode=$(echo "$agent_info" | cut -d'|' -f2)
    local efficiency=$(echo "$agent_info" | cut -d'|' -f3)
    local agent_names=$(echo "$agent_info" | cut -d'|' -f4)
    local conflicts=$(echo "$agent_info" | cut -d'|' -f5)
    
    local cost_info=$(read_cost_info)
    local session_cost=$(echo "$cost_info" | cut -d'|' -f1)
    local token_usage=$(echo "$cost_info" | cut -d'|' -f2)
    local token_percent=$(echo "$cost_info" | cut -d'|' -f3)
    
    local hook_info=$(read_hook_status)
    local active_hooks=$(echo "$hook_info" | cut -d'|' -f1)
    local hook_profile=$(echo "$hook_info" | cut -d'|' -f2)
    local failed_hooks=$(echo "$hook_info" | cut -d'|' -f4)
    
    local learning_info=$(read_learning_status)
    local pending_contributions=$(echo "$learning_info" | cut -d'|' -f1)
    local patterns_detected=$(echo "$learning_info" | cut -d'|' -f2)
    
    local recovery_info=$(check_recovery_status)
    local recovery_active=$(echo "$recovery_info" | cut -d'|' -f1)
    local recovery_type=$(echo "$recovery_info" | cut -d'|' -f2)
    
    local action_info=$(check_stakeholder_actions)
    local dashboard_info=$(check_dashboard)
    
    # Build statusline based on current state and verbosity
    local statusline=""
    
    # Determine icon based on health
    local health_icon="$ICON_GOOD"
    if [[ "$health" == "warning" ]]; then
        health_icon="$ICON_WARNING"
    elif [[ "$health" == "critical" ]]; then
        health_icon="$ICON_ERROR"
    fi
    
    # Priority 1: Check if stakeholder action is needed (highest priority)
    if [[ -n "$action_info" ]]; then
        local action=$(echo "$action_info" | cut -d'|' -f1)
        local urgency=$(echo "$action_info" | cut -d'|' -f2)
        statusline="${YELLOW}${ICON_ALERT} ACTION NEEDED${RESET} | $action"
        if [[ -n "$urgency" ]]; then
            statusline="$statusline | ${BOLD}$urgency until blocked${RESET} | See above ⬆️"
        fi
        echo "$statusline" | tee "$CACHE_FILE"
        return
    fi
    
    # Priority 2: Check for phase stalls
    if [[ "$phase_stalled" == "true" ]]; then
        statusline="${RED}${ICON_ERROR} PHASE STALLED${RESET} | $phase | ${BOLD}>${STALL_DETECTION}m inactive${RESET}"
        if [[ "$recovery_active" == "true" ]]; then
            statusline="$statusline | ${ICON_RECOVERY} Recovery: $recovery_type"
        fi
        echo "$statusline" | tee "$CACHE_FILE"
        return
    fi
    
    # Priority 3: Check for critical alerts
    if [[ $blockers -gt 2 || $token_percent -gt 85 || $failed_hooks -gt 0 || $conflicts -gt 0 ]]; then
        statusline="${RED}${ICON_ERROR} ALERT${RESET}"
        [[ $blockers -gt 0 ]] && statusline="$statusline | $blockers blockers"
        [[ $token_percent -gt 85 ]] && statusline="$statusline | Token ${token_percent}%"
        [[ $failed_hooks -gt 0 ]] && statusline="$statusline | $failed_hooks hooks failed"
        [[ $conflicts -gt 0 ]] && statusline="$statusline | $conflicts agent conflicts"
        [[ "$recovery_active" == "true" ]] && statusline="$statusline | Recovery active"
        echo "$statusline | Check dashboard $ICON_LINK" | tee "$CACHE_FILE"
        return
    fi
    
    # Priority 4: Check for learning opportunities
    if [[ $pending_contributions -gt 0 || $patterns_detected -gt 2 ]]; then
        if [[ "$VERBOSITY" != "quiet" ]]; then
            statusline="${ICON_LEARNING} Learning opportunity"
            [[ $patterns_detected -gt 0 ]] && statusline="$statusline | $patterns_detected patterns"
            [[ $pending_contributions -gt 0 ]] && statusline="$statusline | Contribute? $ICON_LINK"
        fi
    fi
    
    # Normal statusline based on verbosity
    case "$VERBOSITY" in
        quiet)
            # Minimal display
            if [[ -n "$sprint_name" ]]; then
                statusline="Sprint | $stories_complete/$stories_total"
            elif [[ -n "$phase" ]]; then
                statusline="$phase"
                [[ -n "$progress" ]] && statusline="$statusline | $progress"
            else
                statusline="No active project"
            fi
            ;;
            
        verbose)
            # Detailed display
            statusline="$health_icon"
            [[ -n "$milestone" && "$SHOW_MILESTONE" == "true" ]] && statusline="$statusline ✓ $milestone |"
            
            if [[ -n "$workflow" && -n "$phase" ]]; then
                local workflow_display=$(format_workflow_display "$workflow" "$phase" "$progress")
                statusline="$statusline $workflow_display"
            elif [[ -n "$sprint_name" ]]; then
                statusline="$statusline $sprint_name"
                [[ -n "$sprint_day" ]] && statusline="$statusline Day $sprint_day"
                [[ $stories_total -gt 0 ]] && statusline="$statusline | $stories_complete/$stories_total stories"
                [[ -n "$velocity" ]] && statusline="$statusline (${velocity}s/day)"
            fi
            
            if [[ $active_agents -gt 0 && "$SHOW_AGENTS" == "true" ]]; then
                if [[ -n "$agent_names" ]]; then
                    statusline="$statusline | $agent_names"
                else
                    statusline="$statusline | $active_agents agents"
                fi
                [[ -n "$efficiency" ]] && statusline="$statusline ($efficiency)"
            fi
            
            if [[ "$SHOW_HOOKS" == "true" || "$VERBOSITY" == "debug" ]]; then
                statusline="$statusline | ${ICON_HOOK} $active_hooks hooks ($hook_profile)"
                [[ $failed_hooks -gt 0 ]] && statusline="$statusline ${RED}!${RESET}"
            fi
            
            if [[ "$SHOW_COST" == "true" ]]; then
                statusline="$statusline | \$$session_cost"
                if [[ "$SHOW_TOKENS" == "true" || "$VERBOSITY" == "debug" ]]; then
                    statusline="$statusline (${token_usage} tokens ${token_percent}%)"
                fi
            fi
            
            if [[ "$SHOW_DASHBOARD" == "true" ]]; then
                local dash_status=$(echo "$dashboard_info" | cut -d'|' -f1)
                if [[ "$dash_status" == "online" ]]; then
                    statusline="$statusline | Dashboard $ICON_LINK"
                fi
            fi
            
            [[ $blockers -gt 0 ]] && statusline="$statusline | ${YELLOW}$blockers blockers${RESET}"
            ;;
            
        debug)
            # Everything including internal states
            statusline="$health_icon [$health]"
            statusline="$statusline | W:$workflow P:$phase"
            [[ -n "$progress" ]] && statusline="$statusline ($progress)"
            statusline="$statusline | A:${active_agents}/$agent_mode"
            [[ -n "$efficiency" ]] && statusline="$statusline $efficiency"
            statusline="$statusline | H:$active_hooks/$hook_profile"
            [[ $failed_hooks -gt 0 ]] && statusline="$statusline F:$failed_hooks"
            statusline="$statusline | C:\$$session_cost"
            statusline="$statusline T:${token_usage}/${token_percent}%"
            statusline="$statusline | L:$pending_contributions/$patterns_detected"
            [[ "$recovery_active" == "true" ]] && statusline="$statusline | R:$recovery_type"
            ;;
            
        *)  # normal (default)
            # Standard display
            statusline="$health_icon"
            
            if [[ -n "$workflow" && -n "$phase" ]]; then
                local workflow_display=$(format_workflow_display "$workflow" "$phase" "$progress")
                statusline="$statusline $workflow_display"
            elif [[ -n "$sprint_name" ]]; then
                statusline="$statusline $sprint_name"
                [[ $stories_total -gt 0 ]] && statusline="$statusline | $stories_complete/$stories_total stories"
            elif [[ -n "$phase" ]]; then
                statusline="$statusline $phase"
                [[ -n "$progress" ]] && statusline="$statusline | $progress"
            fi
            
            if [[ $active_agents -gt 0 && "$SHOW_AGENTS" == "true" ]]; then
                statusline="$statusline | $active_agents agents"
                [[ -n "$efficiency" ]] && statusline="$statusline ($efficiency)"
            fi
            
            [[ "$SHOW_COST" == "true" ]] && statusline="$statusline | \$$session_cost"
            
            if [[ "$SHOW_DASHBOARD" == "true" ]]; then
                local dash_status=$(echo "$dashboard_info" | cut -d'|' -f1)
                [[ "$dash_status" == "online" ]] && statusline="$statusline | Dashboard $ICON_LINK"
            fi
            
            [[ $blockers -gt 0 ]] && statusline="$statusline | ${YELLOW}$blockers blockers${RESET}"
            ;;
    esac
    
    # Truncate if too long
    if [[ ${#statusline} -gt $MAX_WIDTH ]]; then
        statusline="${statusline:0:$((MAX_WIDTH-3))}..."
    fi
    
    echo "$statusline" | tee "$CACHE_FILE"
}

# Read cost and token information
read_cost_info() {
    local session_cost="0.00"
    local token_usage=0
    local token_limit=100000
    local token_percent=0
    
    if [[ -f "$STATE_FILE" ]]; then
        session_cost=$(jq -r '.session.cost // "0.00"' "$STATE_FILE" 2>/dev/null)
        token_usage=$(jq -r '.session.tokens_used // 0' "$STATE_FILE" 2>/dev/null)
        token_limit=$(jq -r '.session.token_limit // 100000' "$STATE_FILE" 2>/dev/null)
        
        if [[ $token_limit -gt 0 ]]; then
            token_percent=$((token_usage * 100 / token_limit))
        fi
        
        # Format token usage for display
        if [[ $token_usage -gt 1000 ]]; then
            token_usage="$(echo "scale=1; $token_usage / 1000" | bc 2>/dev/null || echo $token_usage)k"
        fi
    fi
    
    echo "$session_cost|$token_usage|$token_percent"
}

# Check for stakeholder actions needed
check_stakeholder_actions() {
    local action_needed=""
    local urgency=""
    
    if [[ -f "$STATE_FILE" ]]; then
        action_needed=$(jq -r '.stakeholder_action.needed // ""' "$STATE_FILE" 2>/dev/null)
        urgency=$(jq -r '.stakeholder_action.urgency_minutes // ""' "$STATE_FILE" 2>/dev/null)
        
        if [[ -n "$action_needed" && "$action_needed" != "null" ]]; then
            if [[ -n "$urgency" && "$urgency" != "null" ]]; then
                echo "$action_needed|${urgency}m"
            else
                echo "$action_needed|"
            fi
        fi
    fi
}

# Check dashboard status
check_dashboard() {
    local dashboard_status="offline"
    local dashboard_url="http://localhost:3001"
    
    if [[ -f "$DASHBOARD_STATUS" ]]; then
        dashboard_status=$(jq -r '.status // "offline"' "$DASHBOARD_STATUS" 2>/dev/null)
    fi
    
    # Quick check if dashboard is running (with timeout)
    if timeout 0.5 curl -s -o /dev/null -w "%{http_code}" "$dashboard_url" 2>/dev/null | grep -q "200"; then
        dashboard_status="online"
    fi
    
    echo "$dashboard_status|$dashboard_url"
}

# Main execution
main() {
    # Check cache first for performance
    check_cache
    
    # Read configuration
    read_config
    
    if [[ "$STATUSLINE_ENABLED" != "true" ]]; then
        # Return empty line if disabled
        echo ""
        exit 0
    fi
    
    # Generate and output the statusline
    format_statusline
}

# Run main function
main