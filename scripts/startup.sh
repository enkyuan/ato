#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"
WEB_DIR="$PROJECT_ROOT/apps/web"
DOCKER_DIR="$PROJECT_ROOT/docker"

# Default options
START_DOCKER=false
START_WEB=true

# Parse command line arguments
show_help() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    Ato Development Environment Start   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start               Start development servers (default)"
    echo "  docker:start        Start Docker containers (postgres, redis, api)"
    echo "  docker:stop         Stop Docker containers"
    echo "  docker:restart      Restart Docker containers"
    echo "  docker:down         Stop and remove Docker containers"
    echo "  docker:logs         Show Docker container logs"
    echo "  docker:ps           Show Docker container status"
    echo ""
    echo "Options (for start command):"
    echo "  -d, --docker        Start Docker services (PostgreSQL, Redis & API)"
    echo "  -w, --web-only      Start only the Web app"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      Start Web (Docker must be running)"
    echo "  $0 -d                   Start Docker (all services) and Web"
    echo "  $0 docker:start         Start only Docker containers"
    echo "  $0 docker:stop          Stop Docker containers"
    echo "  $0 docker:restart       Restart Docker containers"
    echo "  $0 docker:down          Stop and remove containers & volumes"
    echo "  $0 docker:logs          Follow Docker logs"
    echo ""
    exit 0
}

# Docker management functions
docker_start() {
    echo -e "${GREEN}🐳 Starting Docker services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
    
    # Check for port conflicts
    check_port_conflicts
    
    docker-compose up -d
    echo -e "${YELLOW}  Waiting for services to be healthy...${NC}"
    sleep 5
    
    if docker-compose ps | grep -q "healthy\|Up"; then
        echo -e "${GREEN}  ✓ Docker services are running${NC}\n"
        docker-compose ps
    else
        echo -e "${RED}  ⚠️  Docker services may not be healthy${NC}\n"
        docker-compose ps
    fi
}

docker_stop() {
    echo -e "${YELLOW}🛑 Stopping Docker services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    docker-compose stop
    echo -e "${GREEN}  ✓ Docker services stopped${NC}"
}

docker_restart() {
    echo -e "${BLUE}🔄 Restarting Docker services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    docker-compose restart
    echo -e "${YELLOW}  Waiting for services to be healthy...${NC}"
    sleep 5
    docker-compose ps
    echo -e "${GREEN}  ✓ Docker services restarted${NC}"
}

docker_down() {
    echo -e "${RED}🗑️  Stopping and removing Docker containers...${NC}"
    cd "$DOCKER_DIR" || exit 1
    
    read -r -p "$(echo -e "${YELLOW}This will remove containers and volumes. Continue? (y/N): ${NC}")" CONFIRM
    
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
        docker-compose down -v
        echo -e "${GREEN}  ✓ Docker containers and volumes removed${NC}"
    else
        echo -e "${BLUE}  ✓ Cancelled${NC}"
    fi
}

docker_logs() {
    echo -e "${BLUE}📋 Docker container logs (Ctrl+C to exit)...${NC}\n"
    cd "$DOCKER_DIR" || exit 1
    docker-compose logs -f
}

docker_ps() {
    echo -e "${BLUE}📊 Docker container status:${NC}\n"
    cd "$DOCKER_DIR" || exit 1
    docker-compose ps
}

check_port_conflicts() {
    local has_conflicts=false
    
    if lsof -i :5432 > /dev/null 2>&1; then
        echo -e "${YELLOW}  ⚠️  Port 5432 (PostgreSQL) is already in use${NC}"
        lsof -i :5432 | tail -n +2 | awk '{print "     " $1 " (PID: " $2 ")"}'
        has_conflicts=true
    fi
    
    if lsof -i :6379 > /dev/null 2>&1; then
        echo -e "${YELLOW}  ⚠️  Port 6379 (Redis) is already in use${NC}"
        lsof -i :6379 | tail -n +2 | awk '{print "     " $1 " (PID: " $2 ")"}'
        has_conflicts=true
    fi
    
    if [ "$has_conflicts" = true ]; then
        echo -e "\n${YELLOW}Options:${NC}"
        echo -e "  1) Kill conflicting processes and continue"
        echo -e "  2) Cancel"
        read -r -p "$(echo -e "\n${BLUE}Choose an option (1-2): ${NC}")" CHOICE
        
        case $CHOICE in
            1)
                echo -e "${YELLOW}  Stopping conflicting processes...${NC}"
                lsof -t -i :5432 | xargs -r kill 2>/dev/null && echo -e "${BLUE}    ✓ Stopped process on port 5432${NC}"
                lsof -t -i :6379 | xargs -r kill 2>/dev/null && echo -e "${BLUE}    ✓ Stopped process on port 6379${NC}"
                sleep 2
                ;;
            2)
                echo -e "${RED}  ✗ Cancelled${NC}"
                exit 1
                ;;
            *)
                echo -e "${RED}  ✗ Invalid option. Cancelled.${NC}"
                exit 1
                ;;
        esac
    fi
}

# Check for Docker commands first
if [[ $# -gt 0 ]]; then
    case $1 in
        docker:start)
            docker_start
            exit 0
            ;;
        docker:stop)
            docker_stop
            exit 0
            ;;
        docker:restart)
            docker_restart
            exit 0
            ;;
        docker:down)
            docker_down
            exit 0
            ;;
        docker:logs)
            docker_logs
            exit 0
            ;;
        docker:ps)
            docker_ps
            exit 0
            ;;
        start)
            shift  # Remove 'start' command, continue with options
            ;;
        -h|--help)
            show_help
            ;;
    esac
fi

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--docker)
            START_DOCKER=true
            shift
            ;;
        -w|--web-only)
            START_WEB=true
            START_DOCKER=false
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            ;;
    esac
done

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Starting Ato Development Env      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Check if .env files exist
if [ ! -f "$API_DIR/.env" ] || [ ! -f "$WEB_DIR/.env" ]; then
    echo -e "${RED}❌ Error: .env files not found${NC}"
    echo -e "${YELLOW}Please run setup first: ./scripts/setup.sh${NC}"
    exit 1
fi

# Read configuration from .env files
API_PORT=$(grep "^PORT=" "$API_DIR/.env" | cut -d '=' -f2)
API_PORT=${API_PORT:-8080}

WEB_PORT_LINE=$(grep "^VITE_API_URL=" "$WEB_DIR/.env" | grep -o "localhost:[0-9]*" | cut -d ':' -f2)
if [ -z "$WEB_PORT_LINE" ]; then
    WEB_PORT=3000
else
    # Extract the actual web port from package.json or use default
    WEB_PORT=3000
fi

# PIDs for cleanup
DOCKER_STARTED=false
WEB_PID=""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    
    if [ -n "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null
        echo -e "${BLUE}  ✓ Web server stopped${NC}"
    fi
    
    if [ "$DOCKER_STARTED" = true ]; then
        echo -e "${YELLOW}Docker containers are still running. Stop with:${NC}"
        echo -e "  cd docker && docker-compose down"
    fi
    
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT TERM

# Start Docker services if requested
if [ "$START_DOCKER" = true ]; then
    echo -e "${GREEN}🐳 Starting Docker services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
    
    # Check for port conflicts
    check_port_conflicts
    
    docker-compose up -d
    DOCKER_STARTED=true
    
    echo -e "${YELLOW}  Waiting for services to be healthy...${NC}"
    sleep 5
    
    # Check if services are running
    if docker-compose ps | grep -q "healthy\|Up"; then
        echo -e "${GREEN}  ✓ Docker services are running${NC}\n"
    else
        echo -e "${RED}  ⚠️  Docker services may not be healthy. Check with: docker-compose ps${NC}\n"
    fi
    
    cd "$PROJECT_ROOT" || exit 1
fi

# Check if pnpm is installed (if starting web)
if [ "$START_WEB" = true ] && ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing pnpm...${NC}"
    npm install -g pnpm
fi

# Start Web app
if [ "$START_WEB" = true ]; then
    echo -e "${GREEN}🌐 Starting Web app...${NC}"
    cd "$WEB_DIR" || exit 1
    pnpm dev > /tmp/ato-web.log 2>&1 &
    WEB_PID=$!
    echo -e "${BLUE}  ✓ Web started (PID: $WEB_PID)${NC}"
    cd "$PROJECT_ROOT" || exit 1
fi

echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Development environment is running!  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

if [ "$START_WEB" = true ]; then
    echo -e "${BLUE}Frontend:${NC}    http://localhost:$WEB_PORT"
fi

if [ "$DOCKER_STARTED" = true ]; then
    echo -e "${BLUE}Backend:${NC}     http://localhost:$API_PORT"
    echo -e "${BLUE}API Health:${NC}  http://localhost:$API_PORT/health"
    echo -e "${BLUE}PostgreSQL:${NC}  localhost:5432"
    echo -e "${BLUE}Redis:${NC}       localhost:6379"
fi

echo -e "\n${YELLOW}Logs:${NC}"
if [ "$DOCKER_STARTED" = true ]; then
    echo -e "  Docker: cd docker && docker-compose logs -f"
fi
if [ "$START_WEB" = true ]; then
    echo -e "  Web: tail -f /tmp/ato-web.log"
fi

echo -e "\n${YELLOW}Press Ctrl+C to stop servers${NC}\n"

# Wait for processes
wait
