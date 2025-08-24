#!/bin/bash

# AgileAiAgents Quick Diagnostic Script
# This script runs diagnostics from the project root

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 AgileAiAgents Quick Diagnostics${NC}"
echo "=================================="
echo ""

# Change to dashboard directory
cd project-dashboard

# Run the diagnostic tool
node diagnostics.js

# Return to original directory
cd ..

echo ""
echo -e "${GREEN}Diagnostics complete!${NC}"
echo ""
echo "Additional diagnostic commands:"
echo "  - Check dashboard health: curl http://localhost:3001/api/health"
echo "  - View health dashboard: open http://localhost:3001/health.html"
echo "  - Run from dashboard dir: cd project-dashboard && npm run diagnose"