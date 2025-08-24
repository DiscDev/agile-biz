#!/bin/bash

# AgileAiAgents - Change User Path Script
# Updates the hook paths in .claude/settings.json when the installation is moved

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║     AgileAiAgents Path Update Utility         ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Determine where we are
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Check if we're in workspace mode or repository mode
CLAUDE_DIR=""
if [ -d "$PROJECT_ROOT/../.claude" ]; then
    # Workspace mode
    CLAUDE_DIR="$PROJECT_ROOT/../.claude"
    ACTUAL_ROOT="$(cd "$PROJECT_ROOT/.." && pwd)"
    print_info "Running in workspace mode"
elif [ -d "$PROJECT_ROOT/.claude" ]; then
    # Repository mode
    CLAUDE_DIR="$PROJECT_ROOT/.claude"
    ACTUAL_ROOT="$PROJECT_ROOT"
    print_info "Running in repository mode"
else
    print_error ".claude folder not found"
    echo "Please ensure you're running this from the AgileAiAgents installation directory"
    exit 1
fi

# Check if settings.json exists
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
if [ ! -f "$SETTINGS_FILE" ]; then
    print_error "settings.json not found at: $SETTINGS_FILE"
    
    # Check if template exists
    TEMPLATE_FILE="$CLAUDE_DIR/settings.template.json"
    if [ -f "$TEMPLATE_FILE" ]; then
        print_info "Found settings.template.json. Creating settings.json..."
        
        # Create settings.json from template
        sed "s|{{USER_PATH}}|$ACTUAL_ROOT|g" "$TEMPLATE_FILE" > "$SETTINGS_FILE"
        
        if [ $? -eq 0 ]; then
            print_success "Created settings.json with paths configured for: $ACTUAL_ROOT"
        else
            print_error "Failed to create settings.json"
            exit 1
        fi
    else
        print_error "Neither settings.json nor settings.template.json found"
        exit 1
    fi
else
    # Update existing settings.json
    print_info "Current installation path: $ACTUAL_ROOT"
    
    # Create backup
    BACKUP_FILE="$SETTINGS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$SETTINGS_FILE" "$BACKUP_FILE"
    print_success "Created backup: $BACKUP_FILE"
    
    # Update all hook paths
    print_info "Updating hook paths..."
    
    # Use a temporary file for the update
    TEMP_FILE="$SETTINGS_FILE.tmp"
    
    # Read the current settings.json and extract the old path
    OLD_PATH=$(grep -o '"command": "[^"]*/.claude/hooks/' "$SETTINGS_FILE" | head -1 | sed 's|"command": "||' | sed 's|/.claude/hooks/||')
    
    if [ -n "$OLD_PATH" ]; then
        print_info "Old path: $OLD_PATH"
        print_info "New path: $ACTUAL_ROOT"
        
        # Replace all occurrences of the old path with the new path
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed "s|$OLD_PATH|$ACTUAL_ROOT|g" "$SETTINGS_FILE" > "$TEMP_FILE"
        else
            # Linux
            sed "s|$OLD_PATH|$ACTUAL_ROOT|g" "$SETTINGS_FILE" > "$TEMP_FILE"
        fi
        
        # Move the temp file to the actual settings file
        mv "$TEMP_FILE" "$SETTINGS_FILE"
        
        print_success "Updated all hook paths to: $ACTUAL_ROOT"
    else
        print_warning "Could not detect old path. You may need to update settings.json manually"
    fi
fi

# Verify the update
echo -e "\n${BLUE}Verifying configuration...${NC}"

# Check if hooks exist
HOOK_COUNT=0
MISSING_HOOKS=0

for hook in session-start.sh on-file-create.sh on-file-change.sh pre-command-validation.sh user-prompt-submit.sh; do
    if [ -f "$CLAUDE_DIR/hooks/$hook" ]; then
        ((HOOK_COUNT++))
    else
        ((MISSING_HOOKS++))
        print_warning "Hook not found: $hook"
    fi
done

if [ $HOOK_COUNT -gt 0 ]; then
    print_success "Found $HOOK_COUNT hook scripts"
fi

if [ $MISSING_HOOKS -gt 0 ]; then
    print_warning "$MISSING_HOOKS hook scripts are missing"
fi

# Show sample of updated paths
echo -e "\n${BLUE}Sample of configured paths:${NC}"
grep -m 2 '"command":' "$SETTINGS_FILE" | sed 's/^/  /'

echo -e "\n${GREEN}✅ Path update complete!${NC}"
echo ""
echo "Your AgileAiAgents hooks are now configured for:"
echo "  $ACTUAL_ROOT"
echo ""
echo "If you move the installation again, run this script to update the paths."