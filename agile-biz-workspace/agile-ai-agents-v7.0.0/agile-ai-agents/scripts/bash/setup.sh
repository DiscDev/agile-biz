#!/bin/bash

# AgileAiAgents Setup Script
# This script automates the initial setup process for AgileAiAgents

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get version from VERSION.json
VERSION="6.2.0"
if [ -f "VERSION.json" ]; then
    VERSION=$(grep '"version"' VERSION.json | cut -d'"' -f4 || echo "6.2.0")
fi

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║          AgileAiAgents Setup Wizard           ║"
echo "║                 Version $VERSION                 ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get Node.js version
get_node_version() {
    if command_exists node; then
        node -v | cut -d'v' -f2 | cut -d'.' -f1
    else
        echo "0"
    fi
}

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -z "$default" ]; then
        read -p "$prompt: " value
    else
        read -p "$prompt [$default]: " value
        value="${value:-$default}"
    fi
    
    eval "$var_name='$value'"
}

# Function to update .env file
update_env_value() {
    local key="$1"
    local value="$2"
    local file=".env"
    
    if [ -z "$value" ] || [ "$value" == "skip" ]; then
        return
    fi
    
    # Escape special characters for sed
    value=$(echo "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^$key=.*|$key=$value|" "$file"
    else
        # Linux
        sed -i "s|^$key=.*|$key=$value|" "$file"
    fi
}

# Step 1: Check prerequisites
echo -e "\n${BLUE}Step 1: Checking prerequisites...${NC}"

# Check Node.js
NODE_VERSION=$(get_node_version)
if [ "$NODE_VERSION" -ge 16 ]; then
    print_success "Node.js v$(node -v) detected"
else
    print_error "Node.js 16+ required. Current version: $(node -v 2>/dev/null || echo 'Not installed')"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    print_success "npm v$(npm -v) detected"
else
    print_error "npm not found. Please install Node.js which includes npm"
    exit 1
fi

# Check Git (optional but recommended)
if command_exists git; then
    print_success "Git detected"
else
    print_warning "Git not found. Recommended for version control"
fi

# Step 2: Create .env file
echo -e "\n${BLUE}Step 2: Setting up environment configuration...${NC}"

if [ -f ".env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to update it? (y/N): " update_env
    if [[ ! "$update_env" =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env file"
    else
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        print_success "Created backup of existing .env file"
    fi
else
    if [ -f ".env_example" ]; then
        cp .env_example .env
        print_success "Created .env file from template"
    else
        print_error ".env_example not found"
        exit 1
    fi
fi

# Step 3: Configure essential credentials
echo -e "\n${BLUE}Step 3: Configuring essential credentials...${NC}"
echo "Enter your API credentials (or type 'skip' to configure later):"
echo ""

# OpenAI Configuration
print_info "OpenAI Configuration (for LLM capabilities)"
prompt_with_default "OpenAI API Key" "skip" openai_key
update_env_value "OPENAI_API_KEY" "$openai_key"

# Anthropic Configuration
print_info "\nAnthropic Configuration (for Claude integration)"
prompt_with_default "Anthropic API Key" "skip" anthropic_key
update_env_value "ANTHROPIC_API_KEY" "$anthropic_key"

# Dashboard Configuration
print_info "\nDashboard Configuration"
prompt_with_default "Dashboard Port" "3001" dashboard_port
update_env_value "DASHBOARD_PORT" "$dashboard_port"

# Project Configuration
print_info "\nProject Configuration"
read -p "Enter your project name (e.g., 'My Awesome App'): " project_name
if [ -z "$project_name" ]; then
    project_name="My AgileAI Project"
fi

# Create or update project-config.json
cat > project-config.json <<EOF
{
  "projectName": "$project_name",
  "projectDescription": "",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "configuration": {
    "dashboardTheme": "default",
    "autoRefreshInterval": 5000
  }
}
EOF

print_success "Project name set to: $project_name"

# MCP Servers
echo -e "\n${BLUE}MCP Server Configuration (Optional)${NC}"
read -p "Do you want to configure MCP servers now? (y/N): " configure_mcp

if [[ "$configure_mcp" =~ ^[Yy]$ ]]; then
    # Zen MCP (Cost Optimization)
    print_info "\nZen MCP Server (60-80% cost savings)"
    read -p "Enable Zen MCP? (y/N): " enable_zen
    if [[ "$enable_zen" =~ ^[Yy]$ ]]; then
        update_env_value "ZEN_MCP_ENABLED" "true"
        prompt_with_default "Zen MCP API Key" "skip" zen_key
        update_env_value "ZEN_MCP_API_KEY" "$zen_key"
    fi
    
    # GitHub MCP
    print_info "\nGitHub MCP (for Coder & DevOps Agents)"
    read -p "Enable GitHub MCP? (y/N): " enable_github
    if [[ "$enable_github" =~ ^[Yy]$ ]]; then
        update_env_value "GITHUB_MCP_ENABLED" "true"
        prompt_with_default "GitHub Personal Access Token" "skip" github_token
        update_env_value "GITHUB_TOKEN" "$github_token"
    fi
fi

# Step 4: Install dependencies
echo -e "\n${BLUE}Step 4: Installing dependencies...${NC}"

# Install root dependencies first (for machine-data scripts)
if [ -f "package.json" ]; then
    print_info "Installing root dependencies for machine-data scripts..."
    
    # Clear npm cache first to avoid potential issues
    npm cache clean --force 2>/dev/null || true
    
    # Remove node_modules and package-lock if they exist to ensure clean install
    if [ -d "node_modules" ]; then
        print_info "Removing existing node_modules for clean install..."
        rm -rf node_modules
    fi
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
    fi
    
    # Run npm install with error handling
    if npm install --no-audit --no-fund; then
        # Verify fs-extra specifically was installed
        if [ -f "node_modules/fs-extra/package.json" ]; then
            print_success "Root dependencies installed successfully"
        else
            print_warning "fs-extra module not found, attempting to install it specifically..."
            npm install fs-extra --no-audit --no-fund
            if [ -f "node_modules/fs-extra/package.json" ]; then
                print_success "fs-extra installed successfully"
            else
                print_error "Failed to install fs-extra module"
                print_info "Please try running 'npm install' manually in the root directory"
                exit 1
            fi
        fi
    else
        print_error "Failed to install root dependencies"
        print_info "Please try running 'npm install' manually in the root directory"
        exit 1
    fi
else
    print_warning "Root package.json not found, skipping root dependencies"
fi

echo -e "\n${BLUE}Installing dashboard dependencies...${NC}"

if [ -d "project-dashboard" ]; then
    cd project-dashboard
    
    if [ -f "package.json" ]; then
        print_info "Installing Node.js packages (this may take a moment)..."
        
        # Clear npm cache first to avoid potential issues
        npm cache clean --force 2>/dev/null || true
        
        # Remove node_modules and package-lock if they exist to ensure clean install
        if [ -d "node_modules" ]; then
            print_info "Removing existing node_modules for clean install..."
            rm -rf node_modules
        fi
        if [ -f "package-lock.json" ]; then
            rm -f package-lock.json
        fi
        
        # Run npm install with error handling
        if npm install --no-audit --no-fund; then
            # Verify fs-extra specifically was installed
            if [ -f "node_modules/fs-extra/package.json" ]; then
                print_success "Dashboard dependencies installed successfully"
            else
                print_warning "fs-extra module not found, attempting to install it specifically..."
                npm install fs-extra --no-audit --no-fund
                if [ -f "node_modules/fs-extra/package.json" ]; then
                    print_success "fs-extra installed successfully"
                else
                    print_error "Failed to install fs-extra module"
                    print_info "Please try running 'npm install' manually in the project-dashboard directory"
                    exit 1
                fi
            fi
        else
            print_error "Failed to install dashboard dependencies"
            print_info "Please try running 'npm install' manually in the project-dashboard directory"
            exit 1
        fi
    else
        print_error "package.json not found in project-dashboard"
        exit 1
    fi
    
    cd ..
else
    print_error "project-dashboard directory not found"
    exit 1
fi

# Step 5: Create necessary directories
echo -e "\n${BLUE}Step 5: Setting up project structure...${NC}"

# Create project-documents directory with category-based structure
if [ ! -d "project-documents" ]; then
    mkdir -p project-documents
    print_success "Created project-documents directory"
fi

# Clean up old numbered folders if they exist (v3.0.0 migration)
print_info "Checking for old numbered folders..."
old_numbered_folders=(
    "00-orchestration" "01-existing-project-analysis" "02-research" "03-marketing"
    "04-business-documents" "04-finance" "05-market-validation" "06-customer-success"
    "07-monetization" "08-analysis" "09-investment" "10-security" "11-requirements"
    "12-llm-analysis" "13-api-analysis" "14-mcp-analysis" "15-seo" "16-tech-documentation"
    "17-monitoring" "18-project-planning" "19-environment" "20-design" "21-implementation"
    "22-testing" "23-deployment" "24-launch" "25-analytics" "26-optimization"
    "27-email-marketing" "28-media-buying" "29-social-media"
)

folders_removed=0
for old_folder in "${old_numbered_folders[@]}"; do
    if [ -d "project-documents/$old_folder" ]; then
        # Check if folder is empty
        if [ -z "$(ls -A "project-documents/$old_folder")" ]; then
            rm -rf "project-documents/$old_folder"
            ((folders_removed++))
        else
            print_warning "Found non-empty old folder: $old_folder (not removed - manual migration needed)"
        fi
    fi
done

if [ $folders_removed -gt 0 ]; then
    print_success "Removed $folders_removed empty numbered folders"
fi

# Create category-based folders (v3.0.0 structure)
categories=(
    "orchestration"
    "business-strategy"
    "implementation"
    "operations"
)

for category in "${categories[@]}"; do
    if [ ! -d "project-documents/$category" ]; then
        mkdir -p "project-documents/$category"
        print_success "Created $category directory"
    fi
done

# Create sprint directory
if [ ! -d "project-documents/orchestration/sprints" ]; then
    mkdir -p "project-documents/orchestration/sprints"
    print_success "Created sprints directory"
fi

# Create project state directories
if [ ! -d "project-state" ]; then
    mkdir -p project-state/checkpoints
    mkdir -p project-state/session-history
    mkdir -p project-state/decisions
    print_success "Created project-state directories"
    
    # Initialize current-state.json
    CURRENT_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    cat > project-state/current-state.json << EOF
{
  "project_info": {
    "name": "",
    "version": "0.0.1",
    "created_at": "$CURRENT_DATE",
    "last_updated": "$CURRENT_DATE"
  },
  "workflow_state": {
    "active_workflow": null,
    "workflow_phase": null,
    "initiated_by": null,
    "started_at": null
  },
  "current_sprint": null,
  "active_tasks": [],
  "recent_decisions": [],
  "contribution_state": {
    "last_prompt": null,
    "pending_prompt": null,
    "skip_until": null,
    "contribution_history": []
  }
}
EOF
    print_success "Initialized project state"
fi

# Create community learnings directories
if [ ! -d "community-learnings" ]; then
    mkdir -p community-learnings/contributions
    mkdir -p community-learnings/analysis
    mkdir -p community-learnings/implementation
    print_success "Created community-learnings directories"
fi

# Create verification cache directory
if [ ! -d "project-state/verification-cache" ]; then
    mkdir -p project-state/verification-cache
    print_success "Created verification cache directory"
fi

# Check for .claude folder (hidden folder often missed during extraction)
echo -e "\n${BLUE}Step 6: Checking for Claude Code integration...${NC}"

# Determine if we're in workspace or repository mode
CLAUDE_DIR=""
TEMPLATE_CLAUDE_DIR=""

# Check if we're in parent workspace with agile-ai-agents folder
if [ -d "../agile-ai-agents" ] && [ -f "../agile-ai-agents/CLAUDE.md" ]; then
    # We're in parent workspace
    CLAUDE_DIR="../.claude"
    TEMPLATE_CLAUDE_DIR="templates/claude-integration/.claude"
    print_info "Running in workspace mode"
elif [ -f "CLAUDE.md" ]; then
    # We're inside the repository
    CLAUDE_DIR=".claude"
    TEMPLATE_CLAUDE_DIR="templates/claude-integration/.claude"
    print_info "Running in repository mode"
else
    print_warning "Unable to determine execution context"
fi

# Check if .claude directory exists
if [ -n "$CLAUDE_DIR" ]; then
    if [ ! -d "$CLAUDE_DIR" ]; then
        print_warning ".claude folder not found"
        
        # Check if template exists
        if [ -d "$TEMPLATE_CLAUDE_DIR" ]; then
            echo -e "\n${BLUE}Claude Code Integration${NC}"
            echo "AgileAiAgents includes powerful Claude Code integration features:"
            echo "• 40 specialized AI agents for every development phase"
            echo "• 85 custom commands for streamlined workflows"
            echo "• 19 automated hooks for task automation"
            echo "• Real-time statusline showing project health"
            echo "• Automatic state management and recovery"
            echo ""
            read -p "Would you like to enable Claude Code integration? (Y/n): " enable_claude
            
            if [[ ! "$enable_claude" =~ ^[Nn]$ ]]; then
                print_info "Setting up Claude Code integration..."
                
                # Copy the template
                cp -r "$TEMPLATE_CLAUDE_DIR" "$CLAUDE_DIR"
                
                if [ $? -eq 0 ]; then
                    print_success "Created .claude folder with Claude Code integration"
                    
                    # Update settings.json with actual paths if template exists
                    if [ -f "$CLAUDE_DIR/settings.json.template" ]; then
                        print_info "Configuring hook paths for your installation..."
                        
                        # Get the absolute path to the project root
                        PROJECT_ROOT=$(cd "$(dirname "$CLAUDE_DIR")" && pwd)
                        
                        # Replace placeholders in template and create settings.json
                        sed "s|{{USER_PATH}}|$PROJECT_ROOT|g" "$CLAUDE_DIR/settings.json.template" > "$CLAUDE_DIR/settings.json"
                        
                        if [ $? -eq 0 ]; then
                            print_success "Hook paths configured for: $PROJECT_ROOT"
                            
                            # Display available features
                            echo -e "\n${GREEN}✨ Claude Code Features Enabled:${NC}"
                            echo "• Type /aaa-help to see all 85 commands"
                            echo "• Type /quickstart for interactive menu"
                            echo "• Statusline shows real-time project status"
                            echo "• Hooks automate common tasks"
                            echo "• 40 agents available via Task tool"
                            
                            # Note about hidden folders
                            echo -e "\n${YELLOW}Note:${NC} The .claude folder is hidden by default."
                            echo "To view it: Cmd+Shift+. (Mac) or enable 'Show hidden files' (Windows/Linux)"
                        else
                            print_warning "Failed to configure hook paths. You may need to update settings.json manually"
                        fi
                    fi
                else
                    print_error "Failed to create .claude folder"
                    print_info "You may need to manually copy from: $TEMPLATE_CLAUDE_DIR"
                fi
            else
                print_info "Skipping Claude Code integration. You can enable it later by re-running setup."
            fi
        else
            print_error "Template .claude folder not found at: $TEMPLATE_CLAUDE_DIR"
            print_info "Your installation may be incomplete. Please check the release package."
        fi
    else
        print_success ".claude folder detected"
        
        # Check if it has content
        if [ -z "$(ls -A $CLAUDE_DIR 2>/dev/null)" ]; then
            print_warning ".claude folder is empty"
            
            read -p "Would you like to populate it with Claude Code integration? (Y/n): " populate_claude
            
            if [[ ! "$populate_claude" =~ ^[Nn]$ ]]; then
                if [ -d "$TEMPLATE_CLAUDE_DIR" ]; then
                    print_info "Populating .claude folder from template..."
                    cp -r "$TEMPLATE_CLAUDE_DIR"/* "$CLAUDE_DIR/" 2>/dev/null
                    cp -r "$TEMPLATE_CLAUDE_DIR"/.[!.]* "$CLAUDE_DIR/" 2>/dev/null
                    
                    # Configure settings if template exists
                    if [ -f "$CLAUDE_DIR/settings.json.template" ]; then
                        PROJECT_ROOT=$(cd "$(dirname "$CLAUDE_DIR")" && pwd)
                        sed "s|{{USER_PATH}}|$PROJECT_ROOT|g" "$CLAUDE_DIR/settings.json.template" > "$CLAUDE_DIR/settings.json"
                    fi
                    
                    print_success "Populated .claude folder with Claude Code integration"
                fi
            fi
        else
            # Check if settings.json needs updating (either doesn't exist or still has placeholders)
            if [ -f "$CLAUDE_DIR/settings.json" ]; then
                # Check if settings.json still has placeholders
                if grep -q "{{USER_PATH}}" "$CLAUDE_DIR/settings.json"; then
                    print_warning "settings.json still contains placeholders. Updating..."
                    PROJECT_ROOT=$(cd "$(dirname "$CLAUDE_DIR")" && pwd)
                    
                    # Backup the old file
                    cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.backup.$(date +%Y%m%d_%H%M%S)"
                    
                    # Replace placeholders
                    sed "s|{{USER_PATH}}|$PROJECT_ROOT|g" "$CLAUDE_DIR/settings.json" > "$CLAUDE_DIR/settings.json.tmp"
                    mv "$CLAUDE_DIR/settings.json.tmp" "$CLAUDE_DIR/settings.json"
                    
                    print_success "Updated settings.json with correct paths: $PROJECT_ROOT"
                fi
            elif [ -f "$CLAUDE_DIR/settings.json.template" ]; then
                print_info "Configuring Claude Code settings..."
                PROJECT_ROOT=$(cd "$(dirname "$CLAUDE_DIR")" && pwd)
                sed "s|{{USER_PATH}}|$PROJECT_ROOT|g" "$CLAUDE_DIR/settings.json.template" > "$CLAUDE_DIR/settings.json"
                print_success "Claude Code settings configured"
            fi
        fi
    fi
fi

# Step 7: Test dashboard connectivity
echo -e "\n${BLUE}Step 7: Testing dashboard connectivity...${NC}"

# Create a simple test script
cat > test-dashboard.js << 'EOF'
const http = require('http');
const fs = require('fs');

// Read port from .env
const envContent = fs.readFileSync('.env', 'utf8');
const portMatch = envContent.match(/DASHBOARD_PORT=(\d+)/);
const port = portMatch ? portMatch[1] : '3001';

console.log(`Testing connection to dashboard on port ${port}...`);

const options = {
    hostname: 'localhost',
    port: port,
    path: '/',
    method: 'GET',
    timeout: 5000
};

const req = http.request(options, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304) {
        console.log('✅ Dashboard is accessible');
        process.exit(0);
    } else {
        console.log(`⚠️  Dashboard returned status code: ${res.statusCode}`);
        process.exit(1);
    }
});

req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
        console.log('ℹ️  Dashboard is not running (this is normal during setup)');
    } else {
        console.log(`❌ Error testing dashboard: ${error.message}`);
    }
    process.exit(0);
});

req.on('timeout', () => {
    console.log('⚠️  Dashboard connection timeout');
    req.destroy();
    process.exit(1);
});

req.end();
EOF

# Run the test
node test-dashboard.js
rm test-dashboard.js

# Step 8: Setup completion
echo -e "\n${BLUE}Step 8: Setup complete!${NC}"

print_success "AgileAiAgents setup completed successfully!"

echo -e "\n${GREEN}🎉 Next Steps:${NC}"
echo "1. Review and update your .env file with any additional credentials"
echo "2. Start the dashboard: cd project-dashboard && npm start"
echo "3. Access the dashboard at http://localhost:${dashboard_port:-3001}"
echo "4. Read the documentation in README.md and CLAUDE.md"
echo ""
echo -e "${BLUE}📚 New Features:${NC}"
echo "• Command-based workflows: /new-project-workflow, /existing-project-workflow, or /rebuild-project-workflow"
echo "• Auto-save state management: /checkpoint, /status, /continue"
echo "• Community contributions: /milestone, /contribute-now, /contribution-status"
echo "• Category-based folder structure for better organization"
echo ""
echo "Type /aaa-help in Claude Code to see all available commands"

# Check if any critical credentials are missing
echo -e "\n${YELLOW}Configuration Status:${NC}"
if grep -q "your_.*_here\|skip" .env; then
    print_warning "Some credentials are not configured. Update .env before starting."
else
    print_success "All configured credentials are set"
fi

# Offer to start dashboard
echo ""
read -p "Would you like to start the dashboard now? (y/N): " start_dashboard

if [[ "$start_dashboard" =~ ^[Yy]$ ]]; then
    echo -e "\n${BLUE}Starting AgileAiAgents Dashboard...${NC}"
    
    # First ensure root dependencies are present
    if [ ! -f "node_modules/fs-extra/package.json" ]; then
        print_warning "Root dependencies missing. Installing now..."
        npm install --no-audit --no-fund
        if [ ! -f "node_modules/fs-extra/package.json" ]; then
            print_error "Failed to install root dependencies"
            print_info "Please run 'npm install' manually in the root directory"
            exit 1
        fi
    fi
    
    cd project-dashboard
    
    # Check if dashboard node_modules exists
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/express/package.json" ]; then
        print_warning "Dashboard dependencies not found or incomplete. Installing now..."
        
        # Clear cache and reinstall
        npm cache clean --force 2>/dev/null || true
        rm -rf node_modules package-lock.json 2>/dev/null || true
        
        if npm install --no-audit --no-fund; then
            print_success "Dashboard dependencies installed successfully"
        else
            print_error "Failed to install dashboard dependencies"
            print_info "Please run 'npm install' manually in the project-dashboard directory"
            exit 1
        fi
    fi
    
    npm start
fi