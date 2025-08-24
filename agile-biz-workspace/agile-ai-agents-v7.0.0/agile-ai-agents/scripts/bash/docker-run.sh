#!/bin/bash

# AgileAiAgents Docker Run Script
# Easy commands for running Docker containers

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
COMMAND=${1:-help}
ENVIRONMENT=${2:-production}

# Functions
show_help() {
    echo -e "${BLUE}AgileAiAgents Docker Runner${NC}"
    echo "=========================="
    echo ""
    echo "Usage: ./docker-run.sh [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  start       - Start containers"
    echo "  stop        - Stop containers"
    echo "  restart     - Restart containers"
    echo "  logs        - View logs"
    echo "  status      - Show container status"
    echo "  shell       - Open shell in dashboard container"
    echo "  clean       - Stop and remove containers"
    echo "  build       - Build images"
    echo "  help        - Show this help"
    echo ""
    echo "Environments:"
    echo "  production  - Production mode (default)"
    echo "  development - Development mode with hot reload"
    echo "  prod-nginx  - Production with Nginx proxy"
    echo ""
    echo "Examples:"
    echo "  ./docker-run.sh start"
    echo "  ./docker-run.sh start development"
    echo "  ./docker-run.sh logs"
    echo "  ./docker-run.sh shell"
}

# Check Docker and Docker Compose
check_requirements() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not installed${NC}"
        exit 1
    fi
}

# Set compose files based on environment
set_compose_files() {
    case $ENVIRONMENT in
        development)
            COMPOSE_FILES="-f scripts/docker/docker-compose.yml -f scripts/docker/docker-compose.dev.yml"
            ;;
        prod-nginx)
            COMPOSE_FILES="-f scripts/docker/docker-compose.yml -f scripts/docker/docker-compose.prod.yml"
            ;;
        production)
            COMPOSE_FILES="-f scripts/docker/docker-compose.yml"
            ;;
        *)
            echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Execute commands
case $COMMAND in
    start)
        check_requirements
        set_compose_files
        echo -e "${GREEN}Starting AgileAiAgents ($ENVIRONMENT)...${NC}"
        
        # Check if .env exists
        if [ ! -f .env ]; then
            echo -e "${YELLOW}Creating .env from template...${NC}"
            cp .env_example .env
            echo -e "${YELLOW}Please edit .env with your credentials${NC}"
        fi
        
        # Start containers
        docker-compose $COMPOSE_FILES up -d
        
        echo -e "${GREEN}✅ Started successfully!${NC}"
        echo ""
        
        # Wait for health check
        echo "Waiting for dashboard to be ready..."
        sleep 5
        
        # Show access info
        PORT=${DASHBOARD_PORT:-3001}
        echo -e "${GREEN}Dashboard is running!${NC}"
        echo "  - URL: http://localhost:$PORT"
        echo "  - Health: http://localhost:$PORT/api/health"
        echo "  - Logs: docker-compose logs -f dashboard"
        ;;
        
    stop)
        check_requirements
        set_compose_files
        echo -e "${YELLOW}Stopping AgileAiAgents...${NC}"
        docker-compose $COMPOSE_FILES stop
        echo -e "${GREEN}✅ Stopped${NC}"
        ;;
        
    restart)
        check_requirements
        set_compose_files
        echo -e "${YELLOW}Restarting AgileAiAgents...${NC}"
        docker-compose $COMPOSE_FILES restart
        echo -e "${GREEN}✅ Restarted${NC}"
        ;;
        
    logs)
        check_requirements
        set_compose_files
        docker-compose $COMPOSE_FILES logs -f --tail=100 dashboard
        ;;
        
    status)
        check_requirements
        set_compose_files
        echo -e "${BLUE}Container Status:${NC}"
        docker-compose $COMPOSE_FILES ps
        echo ""
        echo -e "${BLUE}Health Check:${NC}"
        curl -s http://localhost:${DASHBOARD_PORT:-3001}/api/health | jq '.' 2>/dev/null || echo "Dashboard not accessible"
        ;;
        
    shell)
        check_requirements
        set_compose_files
        echo -e "${YELLOW}Opening shell in dashboard container...${NC}"
        docker-compose $COMPOSE_FILES exec dashboard /bin/sh
        ;;
        
    clean)
        check_requirements
        echo -e "${RED}This will stop and remove all containers and volumes!${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            echo -e "${GREEN}✅ Cleaned up${NC}"
        fi
        ;;
        
    build)
        check_requirements
        echo -e "${GREEN}Building images...${NC}"
        ./docker-build.sh $ENVIRONMENT
        ;;
        
    help|*)
        show_help
        ;;
esac