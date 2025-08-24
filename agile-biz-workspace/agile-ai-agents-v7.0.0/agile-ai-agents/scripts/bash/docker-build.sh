#!/bin/bash

# AgileAiAgents Docker Build Script
# Builds Docker images for development and production

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🐳 AgileAiAgents Docker Build${NC}"
echo "=============================="
echo ""

# Parse arguments
BUILD_TARGET=${1:-production}
NO_CACHE=${2:-false}

# Validate build target
if [[ "$BUILD_TARGET" != "production" && "$BUILD_TARGET" != "development" ]]; then
    echo -e "${RED}Error: Invalid build target. Use 'production' or 'development'${NC}"
    exit 1
fi

echo -e "${YELLOW}Building for: $BUILD_TARGET${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Copying from .env_example${NC}"
    cp .env_example .env
fi

# Build arguments
BUILD_ARGS=""
if [ "$NO_CACHE" = "nocache" ]; then
    BUILD_ARGS="--no-cache"
    echo -e "${YELLOW}Building without cache${NC}"
fi

# Build the image
echo -e "${GREEN}Building Docker image...${NC}"
docker build $BUILD_ARGS \
    --target $BUILD_TARGET \
    -t agileaiagents/dashboard:$BUILD_TARGET \
    -t agileaiagents/dashboard:latest \
    .

# Tag with version if production
if [ "$BUILD_TARGET" = "production" ]; then
    VERSION=$(grep '"version"' project-dashboard/package.json | sed 's/.*"version": "\(.*\)".*/\1/')
    docker tag agileaiagents/dashboard:production agileaiagents/dashboard:$VERSION
    echo -e "${GREEN}Tagged as version: $VERSION${NC}"
fi

# Show image info
echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
docker images agileaiagents/dashboard
echo ""

# Provide next steps
echo "Next steps:"
if [ "$BUILD_TARGET" = "production" ]; then
    echo "  - Run production: docker-compose up -d"
    echo "  - Run with nginx: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
else
    echo "  - Run development: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up"
fi
echo "  - View logs: docker-compose logs -f dashboard"
echo "  - Stop: docker-compose down"