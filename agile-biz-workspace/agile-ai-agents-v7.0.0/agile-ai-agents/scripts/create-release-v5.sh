#!/bin/bash

# AgileAiAgents v5.0.0 Release Package Creator
# Creates a complete release package for distribution

echo "================================================"
echo "AgileAiAgents v5.0.0 Release Package Creator"
echo "================================================"
echo ""

# Set version
VERSION="5.0.0"
RELEASE_NAME="agile-ai-agents-v${VERSION}"
RELEASE_DIR="releases/${RELEASE_NAME}"

# Create release directory
echo "📁 Creating release directory..."
mkdir -p "${RELEASE_DIR}"

# Copy core system files
echo "📋 Copying core system files..."
cp -r ai-agents "${RELEASE_DIR}/"
cp -r machine-data "${RELEASE_DIR}/"
cp -r hooks "${RELEASE_DIR}/"
cp -r templates "${RELEASE_DIR}/"
cp -r aaa-documents "${RELEASE_DIR}/"
cp -r project-documents "${RELEASE_DIR}/"

# Copy configuration files
echo "⚙️ Copying configuration files..."
cp VERSION.json "${RELEASE_DIR}/"
cp CHANGELOG.md "${RELEASE_DIR}/"
cp README.md "${RELEASE_DIR}/" 2>/dev/null || echo "  ⚠️ README.md not found"
cp CLAUDE.md "${RELEASE_DIR}/"
cp CLAUDE-*.md "${RELEASE_DIR}/" 2>/dev/null || echo "  ⚠️ Some CLAUDE files not found"
cp package.json "${RELEASE_DIR}/" 2>/dev/null || echo "  ⚠️ package.json not found"

# Copy scripts
echo "🔧 Copying scripts..."
mkdir -p "${RELEASE_DIR}/scripts"
cp -r scripts/* "${RELEASE_DIR}/scripts/" 2>/dev/null || echo "  ⚠️ Some scripts not found"

# Copy tests
echo "🧪 Copying test suite..."
mkdir -p "${RELEASE_DIR}/tests"
cp -r tests/* "${RELEASE_DIR}/tests/" 2>/dev/null || echo "  ⚠️ Some tests not found"

# Create installation script
echo "📝 Creating installation script..."
cat > "${RELEASE_DIR}/install.sh" << 'EOF'
#!/bin/bash

echo "Installing AgileAiAgents v5.0.0..."
echo ""

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ -z "$NODE_VERSION" ]; then
    echo "❌ Node.js is not installed. Please install Node.js >= 16.0.0"
    exit 1
fi

echo "✅ Node.js detected: $NODE_VERSION"

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Initialize hooks
echo "🔗 Initializing hooks..."
if [ -d "hooks" ]; then
    node hooks/init.js 2>/dev/null || echo "  ⚠️ Hook initialization skipped"
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p logs
mkdir -p project-state
mkdir -p project-state/backups

# Set permissions
echo "🔐 Setting permissions..."
chmod +x scripts/*.sh 2>/dev/null
chmod +x install.sh

echo ""
echo "✅ Installation complete!"
echo ""
echo "Quick Start:"
echo "  1. Run: /quickstart"
echo "  2. Choose your workflow:"
echo "     - /new-project-workflow (for new projects)"
echo "     - /existing-project-workflow (for existing codebases)"
echo "  3. Follow the interactive Stakeholder Interview"
echo ""
echo "For help: /aaa-help"
echo "Dashboard: npm run dashboard (http://localhost:3001)"
echo ""
EOF

chmod +x "${RELEASE_DIR}/install.sh"

# Copy release notes
echo "📄 Adding release notes..."
cp "releases/v5.0.0-release-notes.md" "${RELEASE_DIR}/RELEASE-NOTES.md"

# Copy migration guide
echo "📚 Adding migration guide..."
cp "aaa-documents/migration-guide-v5.md" "${RELEASE_DIR}/MIGRATION-GUIDE.md"

# Create version file
echo "🏷️ Creating version file..."
echo "${VERSION}" > "${RELEASE_DIR}/VERSION"

# Create manifest
echo "📋 Creating manifest..."
cat > "${RELEASE_DIR}/MANIFEST.json" << EOF
{
  "version": "${VERSION}",
  "releaseName": "Stakeholder Interview Agent & Workflow Enhancement",
  "releaseDate": "2025-08-11",
  "type": "major",
  "agents": 38,
  "features": [
    "Stakeholder Interview Agent",
    "Two-Stage Workflow System",
    "Parallel Execution (60% faster)",
    "Auto-Save with Backups",
    "Error Recovery System",
    "Custom Slash Commands",
    "Phase Selection Menu"
  ],
  "requirements": {
    "node": ">=16.0.0",
    "claudeCode": "latest"
  },
  "files": {
    "core": ["ai-agents", "machine-data", "hooks", "templates"],
    "docs": ["aaa-documents", "project-documents"],
    "config": ["VERSION.json", "CHANGELOG.md", "CLAUDE.md"],
    "scripts": ["install.sh", "scripts/"]
  }
}
EOF

# Create archive
echo "📦 Creating release archive..."
cd releases
tar -czf "${RELEASE_NAME}.tar.gz" "${RELEASE_NAME}"
zip -r "${RELEASE_NAME}.zip" "${RELEASE_NAME}" -q

# Create checksums
echo "🔐 Creating checksums..."
if command -v sha256sum &> /dev/null; then
    sha256sum "${RELEASE_NAME}.tar.gz" > "${RELEASE_NAME}.tar.gz.sha256"
    sha256sum "${RELEASE_NAME}.zip" > "${RELEASE_NAME}.zip.sha256"
elif command -v shasum &> /dev/null; then
    shasum -a 256 "${RELEASE_NAME}.tar.gz" > "${RELEASE_NAME}.tar.gz.sha256"
    shasum -a 256 "${RELEASE_NAME}.zip" > "${RELEASE_NAME}.zip.sha256"
fi

cd ..

# Summary
echo ""
echo "================================================"
echo "✅ Release Package Created Successfully!"
echo "================================================"
echo ""
echo "📦 Package Location:"
echo "  Directory: ${RELEASE_DIR}/"
echo "  Archive (tar.gz): releases/${RELEASE_NAME}.tar.gz"
echo "  Archive (zip): releases/${RELEASE_NAME}.zip"
echo ""
echo "📋 Package Contents:"
echo "  - 38 AI Agents"
echo "  - Complete hooks system"
echo "  - Templates for clean slate projects"
echo "  - Full documentation"
echo "  - Test suite"
echo "  - Installation script"
echo ""
echo "🚀 Next Steps:"
echo "  1. Test installation in clean environment"
echo "  2. Upload to GitHub releases"
echo "  3. Update repository README"
echo "  4. Announce to community"
echo ""
echo "Version: ${VERSION}"
echo "Release: Stakeholder Interview Agent & Workflow Enhancement"
echo "Date: $(date +%Y-%m-%d)"
echo ""