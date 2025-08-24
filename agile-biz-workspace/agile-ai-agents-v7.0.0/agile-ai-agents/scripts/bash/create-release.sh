#!/bin/bash

# Create Release Package for AgileAiAgents
# This script updates version numbers and creates a ZIP file ready for GitHub releases

set -e  # Exit on error

echo "🚀 Creating AgileAiAgents Release Package..."

# Set up directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Function to update version in a file
update_version() {
    local file=$1
    local old_version=$2
    local new_version=$3
    
    if [ -f "$file" ]; then
        # Use sed to replace version
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/$old_version/$new_version/g" "$file"
        else
            # Linux
            sed -i "s/$old_version/$new_version/g" "$file"
        fi
        echo "✅ Updated version in $(basename $file)"
    else
        echo "⚠️  File not found: $file"
    fi
}

# Get current version from VERSION.json (only the first occurrence)
CURRENT_VERSION=$(grep -o '"version": "[^"]*' "$PROJECT_ROOT/VERSION.json" | head -1 | grep -o '[^"]*$' 2>/dev/null || echo "3.2.0")

# If version argument provided, use it; otherwise analyze and suggest
if [ -n "$1" ]; then
    VERSION="$1"
else
    echo "Current version: $CURRENT_VERSION"
    echo ""
    
    # Run version analyzer if available
    if [ -f "$SCRIPT_DIR/analyze-version-bump.js" ] && command -v node >/dev/null 2>&1; then
        echo "🔍 Analyzing changes to suggest version bump..."
        echo ""
        
        # Run analyzer and capture output
        ANALYZER_OUTPUT=$(node "$SCRIPT_DIR/analyze-version-bump.js" 2>&1 || true)
        echo "$ANALYZER_OUTPUT" | grep -v "version-only"
        
        # Extract suggested version
        SUGGESTED_VERSION=$(echo "$ANALYZER_OUTPUT" | grep "Suggested version:" | awk '{print $3}')
        
        if [ -n "$SUGGESTED_VERSION" ]; then
            echo ""
            read -p "Accept suggested version $SUGGESTED_VERSION? (Y/n): " ACCEPT
            if [[ -z "$ACCEPT" || "$ACCEPT" =~ ^[Yy] ]]; then
                VERSION=$SUGGESTED_VERSION
            else
                read -p "Enter new version: " VERSION
                if [ -z "$VERSION" ]; then
                    VERSION=$CURRENT_VERSION
                fi
            fi
        else
            read -p "Enter new version (or press Enter to keep $CURRENT_VERSION): " VERSION
            if [ -z "$VERSION" ]; then
                VERSION=$CURRENT_VERSION
            fi
        fi
    else
        # Fallback to manual entry
        read -p "Enter new version (or press Enter to keep $CURRENT_VERSION): " VERSION
        if [ -z "$VERSION" ]; then
            VERSION=$CURRENT_VERSION
        fi
    fi
fi

# Only update files if version changed
if [ "$VERSION" != "$CURRENT_VERSION" ]; then
    echo "📝 Updating version from $CURRENT_VERSION to $VERSION..."
    
    # Update VERSION.json (handled separately due to JSON structure)
    echo "📄 Updating VERSION.json..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$VERSION\"/g" "$PROJECT_ROOT/VERSION.json"
        sed -i '' "s/\"releaseTag\": \"v$CURRENT_VERSION\"/\"releaseTag\": \"v$VERSION\"/g" "$PROJECT_ROOT/VERSION.json"
    else
        sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$VERSION\"/g" "$PROJECT_ROOT/VERSION.json"
        sed -i "s/\"releaseTag\": \"v$CURRENT_VERSION\"/\"releaseTag\": \"v$VERSION\"/g" "$PROJECT_ROOT/VERSION.json"
    fi
    
    # Update package.json files
    update_version "$PROJECT_ROOT/package.json" "\"version\": \"$CURRENT_VERSION\"" "\"version\": \"$VERSION\""
    update_version "$PROJECT_ROOT/project-dashboard/package.json" "\"version\": \"$CURRENT_VERSION\"" "\"version\": \"$VERSION\""
    
    # Update machine-data package.json (if version matches)
    if grep -q "\"version\": \"$CURRENT_VERSION\"" "$PROJECT_ROOT/machine-data/package.json" 2>/dev/null; then
        update_version "$PROJECT_ROOT/machine-data/package.json" "\"version\": \"$CURRENT_VERSION\"" "\"version\": \"$VERSION\""
    fi
    
    # Update README.md
    echo "📄 Updating README.md..."
    update_version "$PROJECT_ROOT/README.md" "# AgileAiAgents v$CURRENT_VERSION" "# AgileAiAgents v$VERSION"
    update_version "$PROJECT_ROOT/README.md" "Version $CURRENT_VERSION" "Version $VERSION"
    update_version "$PROJECT_ROOT/README.md" "v$CURRENT_VERSION" "v$VERSION"
    update_version "$PROJECT_ROOT/README.md" "agile-ai-agents-v$CURRENT_VERSION" "agile-ai-agents-v$VERSION"
    
    # Update CLAUDE.md version references
    echo "📄 Updating CLAUDE.md..."
    update_version "$PROJECT_ROOT/CLAUDE.md" "v$CURRENT_VERSION" "v$VERSION"
    update_version "$PROJECT_ROOT/CLAUDE.md" "agile-ai-agents-v$CURRENT_VERSION" "agile-ai-agents-v$VERSION"
    
    # Update dashboard HTML files (if they have hardcoded versions)
    if grep -q ">v$CURRENT_VERSION<" "$PROJECT_ROOT/project-dashboard/public/index.html" 2>/dev/null; then
        echo "📄 Updating dashboard HTML..."
        update_version "$PROJECT_ROOT/project-dashboard/public/index.html" ">v$CURRENT_VERSION<" ">v$VERSION<"
    fi
    
    # Update any documentation with version references
    echo "📄 Updating documentation version references..."
    for doc in "$PROJECT_ROOT"/aaa-documents/*.md; do
        if [ -f "$doc" ] && grep -q "v$CURRENT_VERSION" "$doc" 2>/dev/null; then
            update_version "$doc" "v$CURRENT_VERSION" "v$VERSION"
        fi
    done
    
    # Add new version section to CHANGELOG.md
    echo "📄 Adding new version section to CHANGELOG.md..."
    CURRENT_DATE=$(date +%Y-%m-%d)
    if ! grep -q "## $VERSION - $CURRENT_DATE" "$PROJECT_ROOT/CHANGELOG.md"; then
        # Create temporary file with new version section
        echo -e "## $VERSION - $CURRENT_DATE\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n### Removed\n- \n\n" > /tmp/changelog_new_section.tmp
        
        # Insert after the [Unreleased] section
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' '/## \[Unreleased\]/r /tmp/changelog_new_section.tmp' "$PROJECT_ROOT/CHANGELOG.md"
        else
            sed -i '/## \[Unreleased\]/r /tmp/changelog_new_section.tmp' "$PROJECT_ROOT/CHANGELOG.md"
        fi
        rm /tmp/changelog_new_section.tmp
        echo "✅ Added new version section to CHANGELOG.md"
    fi
    
    echo "✅ Version updated to $VERSION"
    echo ""
    echo "📝 Version updated in:"
    echo "   - VERSION.json"
    echo "   - package.json (root)"
    echo "   - project-dashboard/package.json"
    [ -f "$PROJECT_ROOT/machine-data/package.json" ] && echo "   - machine-data/package.json"
    echo "   - README.md"
    echo "   - CLAUDE.md"
    echo "   - CHANGELOG.md"
    [ -f "$PROJECT_ROOT/project-dashboard/public/index.html" ] && grep -q ">v$VERSION<" "$PROJECT_ROOT/project-dashboard/public/index.html" && echo "   - Dashboard HTML"
    echo "   - Documentation files (if applicable)"
    echo ""
else
    echo "📦 Using existing version: $VERSION"
fi
RELEASE_NAME="agile-ai-agents-v${VERSION}"
TEMP_DIR="/tmp/${RELEASE_NAME}"

echo "📦 Creating release package for version: $VERSION"

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy CLAUDE.md from template
echo "📄 Copying workspace CLAUDE.md..."
cp "$PROJECT_ROOT/templates/CLAUDE-workspace-template.md" "$TEMP_DIR/CLAUDE.md"

# Create agile-ai-agents directory in temp
mkdir -p "$TEMP_DIR/agile-ai-agents"

# Create release notes directly in release-notes folder
echo "📝 Creating release notes templates..."
RELEASE_NOTES_DIR="$PROJECT_ROOT/release-notes"
mkdir -p "$RELEASE_NOTES_DIR"

# Create release notes templates if they don't exist
if [ ! -f "$RELEASE_NOTES_DIR/RELEASE-NOTES-v${VERSION}.md" ]; then
  echo "📄 Creating RELEASE-NOTES-v${VERSION}.md template in release-notes folder..."
  cat > "$RELEASE_NOTES_DIR/RELEASE-NOTES-v${VERSION}.md" << EOF
# Release Notes - v${VERSION}

**Release Date**: $(date +%Y-%m-%d)  
**Release Name**: [Add release name]

## Overview

[Add release overview]

## Major Features

[Add major features]

## Quick Start

1. Extract the release package
2. Run setup script
3. Check system health: \`node scripts/validate-system-health.js\`
4. Start dashboard: \`npm run dashboard\`

## Important Changes

[Add important changes]

## Documentation Updates

[Add documentation updates]

## For Upgraders

[Add upgrade instructions]

---

For detailed changes, see CHANGELOG.md
For questions or issues: https://github.com/DiscDev/agile-ai-agents/issues
EOF
  echo "✅ Created RELEASE-NOTES-v${VERSION}.md template"
fi

if [ ! -f "$RELEASE_NOTES_DIR/GITHUB-RELEASE-NOTES-v${VERSION}.md" ]; then
  echo "📄 Creating GITHUB-RELEASE-NOTES-v${VERSION}.md template in release-notes folder..."
  cat > "$RELEASE_NOTES_DIR/GITHUB-RELEASE-NOTES-v${VERSION}.md" << EOF
# AgileAiAgents v${VERSION} - [Release Name]

## Release Summary

[Add release summary]

## Key Highlights

[Add key highlights]

## What's New

[Copy from CHANGELOG.md]

## Installation

1. Download \`agile-ai-agents-v${VERSION}.zip\`
2. Extract to your workspace:
   \`\`\`bash
   unzip agile-ai-agents-v${VERSION}.zip -d ~/workspace/
   cd ~/workspace/agile-ai-agents
   \`\`\`
3. Run setup:
   \`\`\`bash
   ./scripts/bash/setup.sh  # Unix/macOS
   .\scripts\windows\setup.bat  # Windows
   \`\`\`

## Documentation

[Add relevant documentation links]

## Contributors

Thanks to all contributors who helped shape this release through the Community Learnings System!

---

**Full Changelog**: https://github.com/DiscDev/agile-ai-agents/compare/v${CURRENT_VERSION}...v${VERSION}
EOF
  echo "✅ Created GITHUB-RELEASE-NOTES-v${VERSION}.md template"
fi

# Move any release notes from root to release-notes folder
if [ -f "$PROJECT_ROOT/RELEASE-NOTES-v${VERSION}.md" ]; then
  mv "$PROJECT_ROOT/RELEASE-NOTES-v${VERSION}.md" "$RELEASE_NOTES_DIR/"
  echo "✅ Moved RELEASE-NOTES-v${VERSION}.md to release-notes folder"
fi
if [ -f "$PROJECT_ROOT/GITHUB-RELEASE-NOTES-v${VERSION}.md" ]; then
  mv "$PROJECT_ROOT/GITHUB-RELEASE-NOTES-v${VERSION}.md" "$RELEASE_NOTES_DIR/"
  echo "✅ Moved GITHUB-RELEASE-NOTES-v${VERSION}.md to release-notes folder"
fi

# Copy all files except git-related and temp files
echo "📁 Copying AgileAiAgents system files..."
cd "$PROJECT_ROOT"
rsync -av \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='node_modules' \
  --exclude='*.log' \
  --exclude='diagnostic-report.json' \
  --exclude='.env' \
  --exclude='templates/CLAUDE-workspace-template.md' \
  --exclude='project-documents/*' \
  --exclude='community-learnings/*' \
  --exclude='.github' \
  --exclude='RELEASE-NOTES-v*.md' \
  --exclude='GITHUB-RELEASE-NOTES-v*.md' \
  --exclude='agile-ai-agents-v*.zip' \
  --exclude='machine-data/conversion-reports/*' \
  --exclude='machine-data/project-documents-json/streams/*' \
  --exclude='machine-data/test-output/*' \
  --exclude='machine-data/broadcast-log.json' \
  --exclude='machine-data/implementation-tracking.json' \
  --exclude='machine-data/learning-capture-points.json' \
  --exclude='machine-data/captured-learnings.json' \
  --exclude='machine-data/stakeholder-interactions.json' \
  --exclude='machine-data/learning-dashboard.json' \
  --exclude='machine-data/self-improvements.json' \
  --exclude='machine-data/learning-analysis-workflow.json' \
  --exclude='machine-data/community-learning-data.json' \
  --exclude='machine-data/privacy-scan-log.json' \
  --exclude='machine-data/project-progress.json' \
  --exclude='machine-data/repository-evolution-tracking.json' \
  --exclude='machine-data/repository-learning-data.json' \
  --exclude='machine-data/repository-metrics.json' \
  --exclude='machine-data/version-history.json' \
  --exclude='machine-data/implementation-metrics.json' \
  --exclude='machine-data/improvement-proposals.json' \
  --exclude='machine-data/learning-network.json' \
  --exclude='hooks/logs/*' \
  --exclude='project-state/*' \
  ./ "$TEMP_DIR/agile-ai-agents/"

# Copy clean slate project structure from templates
echo "📂 Copying clean slate project structure..."

# Copy the entire clean slate structure with all READMEs and system files
if [ -d "$PROJECT_ROOT/templates/clean-slate/project-documents" ]; then
  echo "✅ Using clean slate template structure"
  cp -r "$PROJECT_ROOT/templates/clean-slate/project-documents" "$TEMP_DIR/agile-ai-agents/"
  
  # Update timestamps in the JSON files (only if they exist)
  CURRENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  BACKLOG_FILE="$TEMP_DIR/agile-ai-agents/project-documents/orchestration/product-backlog/backlog-state.json"
  VELOCITY_FILE="$TEMP_DIR/agile-ai-agents/project-documents/orchestration/product-backlog/velocity-metrics.json"
  
  if [ -f "$BACKLOG_FILE" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$BACKLOG_FILE"
    else
      sed -i "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$BACKLOG_FILE"
    fi
  fi
  
  if [ -f "$VELOCITY_FILE" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$VELOCITY_FILE"
    else
      sed -i "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$VELOCITY_FILE"
    fi
  fi
else
  echo "⚠️  Clean slate template not found, falling back to manual creation"
  # Keep the old manual creation as fallback
  # Orchestration category
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/orchestration/sprints"
  
  # Business Strategy category
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/existing-project"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/research"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/marketing"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/finance"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/market-validation"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/customer-success"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/monetization"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/analysis"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/business-strategy/investment"
  
  # Implementation category
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/requirements"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/security"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/llm-analysis"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/api-analysis"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/mcp-analysis"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/project-planning"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/environment"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/design"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/implementation"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/testing"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/implementation/documentation"
  
  # Operations category
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/deployment"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/launch"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/analytics"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/monitoring"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/optimization"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/seo"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/crm-marketing"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/media-buying"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-documents/operations/social-media"
fi

# Copy velocity profiles
mkdir -p "$TEMP_DIR/agile-ai-agents/templates/release-templates/product-backlog"
cp "$PROJECT_ROOT/templates/release-templates/product-backlog/velocity-profiles.json" \
   "$TEMP_DIR/agile-ai-agents/templates/release-templates/product-backlog/"

echo "✅ Clean slate project structure created"

# Copy clean slate project-state from templates
echo "📂 Copying clean slate project-state..."

if [ -d "$PROJECT_ROOT/templates/clean-slate/project-state" ]; then
  echo "✅ Using clean slate project-state template"
  cp -r "$PROJECT_ROOT/templates/clean-slate/project-state" "$TEMP_DIR/agile-ai-agents/"
  
  # Update timestamps in the JSON files (only if they exist)
  CURRENT_STATE_FILE="$TEMP_DIR/agile-ai-agents/project-state/current-state.json"
  DECISIONS_FILE="$TEMP_DIR/agile-ai-agents/project-state/decisions/decisions-log.json"
  
  if [ -f "$CURRENT_STATE_FILE" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$CURRENT_STATE_FILE"
    else
      sed -i "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$CURRENT_STATE_FILE"
    fi
  fi
  
  if [ -f "$DECISIONS_FILE" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$DECISIONS_FILE"
    else
      sed -i "s/TEMPLATE_TIMESTAMP/$CURRENT_TIMESTAMP/g" "$DECISIONS_FILE"
    fi
  fi
else
  echo "⚠️  Clean slate project-state template not found, creating empty structure"
  # Fallback to create empty directories
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-state/checkpoints"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-state/session-history"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-state/decisions"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-state/learnings"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-state/verification-cache"
  mkdir -p "$TEMP_DIR/agile-ai-agents/project-state/learning-workflow"
fi

echo "✅ Clean slate project-state created"

# Copy clean slate community-learnings from templates
echo "📂 Copying clean slate community-learnings..."

if [ -d "$PROJECT_ROOT/templates/clean-slate/community-learnings" ]; then
  echo "✅ Using clean slate community-learnings template"
  cp -r "$PROJECT_ROOT/templates/clean-slate/community-learnings" "$TEMP_DIR/agile-ai-agents/"
else
  echo "⚠️  Clean slate community-learnings template not found, creating empty structure"
  # Fallback to create minimal structure
  mkdir -p "$TEMP_DIR/agile-ai-agents/community-learnings/contributions/examples"
  mkdir -p "$TEMP_DIR/agile-ai-agents/community-learnings/analysis"
  mkdir -p "$TEMP_DIR/agile-ai-agents/community-learnings/archive"
  mkdir -p "$TEMP_DIR/agile-ai-agents/community-learnings/implementation"
  mkdir -p "$TEMP_DIR/agile-ai-agents/community-learnings/CONTRIBUTING"
  
  # Copy essential files if available
  if [ -f "$PROJECT_ROOT/community-learnings/README.md" ]; then
    cp "$PROJECT_ROOT/community-learnings/README.md" "$TEMP_DIR/agile-ai-agents/community-learnings/"
  fi
  if [ -f "$PROJECT_ROOT/community-learnings/SECURITY-GUIDELINES.md" ]; then
    cp "$PROJECT_ROOT/community-learnings/SECURITY-GUIDELINES.md" "$TEMP_DIR/agile-ai-agents/community-learnings/"
  fi
fi

echo "✅ Clean slate community-learnings created"

# Set up Claude Code integration at parent level
echo "🤖 Setting up Claude Code integration..."
mkdir -p "$TEMP_DIR/.claude"

# Copy agents to parent level
if [ -d "$PROJECT_ROOT/templates/claude-integration/.claude/agents" ]; then
  cp -r "$PROJECT_ROOT/templates/claude-integration/.claude/agents" "$TEMP_DIR/.claude/"
  echo "✅ Copied Claude agents"
fi

# Copy commands to parent level
if [ -d "$PROJECT_ROOT/templates/claude-integration/.claude/commands" ]; then
  cp -r "$PROJECT_ROOT/templates/claude-integration/.claude/commands" "$TEMP_DIR/.claude/"
  echo "✅ Copied Claude commands"
fi

# Copy commands.json and generate-commands-json.js
if [ -f "$PROJECT_ROOT/templates/claude-integration/.claude/commands.json" ]; then
  cp "$PROJECT_ROOT/templates/claude-integration/.claude/commands.json" "$TEMP_DIR/.claude/"
  echo "✅ Copied commands.json"
fi
if [ -f "$PROJECT_ROOT/templates/claude-integration/.claude/generate-commands-json.js" ]; then
  cp "$PROJECT_ROOT/templates/claude-integration/.claude/generate-commands-json.js" "$TEMP_DIR/.claude/"
  echo "✅ Copied generate-commands-json.js"
fi

# Copy hooks to parent level
if [ -d "$PROJECT_ROOT/templates/claude-integration/.claude/hooks" ]; then
  cp -r "$PROJECT_ROOT/templates/claude-integration/.claude/hooks" "$TEMP_DIR/.claude/"
  # Ensure hooks are executable
  chmod +x "$TEMP_DIR/.claude/hooks"/*.sh 2>/dev/null || true
  echo "✅ Copied Claude hooks"
fi

# Copy README-RELEASE.md as README.md
if [ -f "$PROJECT_ROOT/templates/claude-integration/.claude/README-RELEASE.md" ]; then
  cp "$PROJECT_ROOT/templates/claude-integration/.claude/README-RELEASE.md" "$TEMP_DIR/.claude/README.md"
  echo "✅ Copied Claude README"
fi

# Copy settings templates (keep {{USER_PATH}} placeholders - setup scripts will replace them)
if [ -f "$PROJECT_ROOT/templates/claude-integration/.claude/settings.json.template" ]; then
  cp "$PROJECT_ROOT/templates/claude-integration/.claude/settings.json.template" "$TEMP_DIR/.claude/settings.json"
  echo "✅ Copied Claude settings.json (with {{USER_PATH}} placeholders)"
fi

# Copy settings.local.json template
if [ -f "$PROJECT_ROOT/templates/claude-integration/.claude/settings.local.json.template" ]; then
  cp "$PROJECT_ROOT/templates/claude-integration/.claude/settings.local.json.template" "$TEMP_DIR/.claude/settings.local.json"
  echo "✅ Created Claude settings.local.json"
fi

# Create .gitignore for .claude at parent level
cat > "$TEMP_DIR/.claude/.gitignore" << 'EOF'
settings.local.json
*.log
*.bak
EOF

echo "✅ Claude Code integration set up at parent level"

# Create .gitignore.template
echo "📝 Creating .gitignore.template..."
cat > "$TEMP_DIR/.gitignore.template" << 'EOF'
# AgileAiAgents - User Workspace .gitignore
# Copy this to .gitignore in your workspace root

# OS Files
.DS_Store
**/.DS_Store
Thumbs.db

# Environment and secrets
.env
.env.local
.env.*.local
*.pem
*.key

# Project documents (private)
agile-ai-agents/project-documents/**/*.md
!agile-ai-agents/project-documents/**/README.md
!agile-ai-agents/project-documents/orchestration/stakeholder-*.md

# Project state (keep structure, ignore content)
agile-ai-agents/project-state/current-state.json
agile-ai-agents/project-state/checkpoints/*.json
agile-ai-agents/project-state/session-history/*.json
agile-ai-agents/project-state/decisions/decisions-log.json
agile-ai-agents/project-state/learnings/*.json
agile-ai-agents/project-state/verification-cache/*
agile-ai-agents/project-state/learning-workflow/*.json
!agile-ai-agents/project-state/**/.gitkeep
!agile-ai-agents/project-state/**/README.md

# Logs
*.log
npm-debug.log*
diagnostic-report.json

# Dependencies
node_modules/
.npm

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build outputs
dist/
build/
*.pid
*.seed
*.pid.lock

# Testing
coverage/
.nyc_output

# Your project code
# Add your project-specific ignores below this line
EOF

# Create release in project root
RELEASE_ZIP="$PROJECT_ROOT/${RELEASE_NAME}.zip"

# Remove old release if exists
rm -f "$RELEASE_ZIP"

# Create ZIP file
echo "📦 Creating ZIP archive..."
cd "/tmp"
zip -r "$RELEASE_ZIP" "$RELEASE_NAME"

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Show file info
echo ""
echo "✅ Release package created successfully!"
echo "📦 File: $RELEASE_ZIP"
echo "📏 Size: $(ls -lh "$RELEASE_ZIP" | awk '{print $5}')"
echo ""
echo "📤 Next steps:"
echo "1. Edit release notes in: release-notes/GITHUB-RELEASE-NOTES-v${VERSION}.md"
echo "2. Upload $RELEASE_ZIP to GitHub releases"
echo "3. Tag as v${VERSION}"
echo "4. Copy content from GITHUB-RELEASE-NOTES-v${VERSION}.md for release description"
echo "5. Publish the release"
echo ""
echo "📝 Release notes location:"
echo "   - GitHub: release-notes/GITHUB-RELEASE-NOTES-v${VERSION}.md"
echo "   - User: release-notes/RELEASE-NOTES-v${VERSION}.md"
echo ""

# Optionally open the releases page
read -p "🌐 Open GitHub releases page? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  open "https://github.com/DiscDev/agile-ai-agents/releases/new"
fi