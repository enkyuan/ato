#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Ato Development Environment Setup    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"
WEB_DIR="$PROJECT_ROOT/apps/web"
DOCKER_DIR="$PROJECT_ROOT/docker"

# Check if running from correct directory
if [ ! -d "$API_DIR" ] || [ ! -d "$WEB_DIR" ]; then
    echo -e "${RED}❌ Error: Could not find apps/api/ or apps/web/ directories${NC}"
    echo -e "${YELLOW}Please run this script from the project root or scripts directory${NC}"
    exit 1
fi

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Prompt for API port
echo -e "${YELLOW}📝 Configuration${NC}"
read -r -p "$(echo -e "${BLUE}Enter API port (default: 8080): ${NC}")" API_PORT
API_PORT=${API_PORT:-8080}

# Validate port number
if ! [[ "$API_PORT" =~ ^[0-9]+$ ]] || [ "$API_PORT" -lt 1024 ] || [ "$API_PORT" -gt 65535 ]; then
    echo -e "${YELLOW}⚠️  Invalid port number. Using default: 8080${NC}"
    API_PORT=8080
fi

read -r -p "$(echo -e "${BLUE}Enter web port (default: 3000): ${NC}")" WEB_PORT
WEB_PORT=${WEB_PORT:-3000}

# Validate port number
if ! [[ "$WEB_PORT" =~ ^[0-9]+$ ]] || [ "$WEB_PORT" -lt 1024 ] || [ "$WEB_PORT" -gt 65535 ]; then
    echo -e "${YELLOW}⚠️  Invalid port number. Using default: 3000${NC}"
    WEB_PORT=3000
fi

read -r -s -p "$(echo -e "${BLUE}Enter PostgreSQL password (default: postgres): ${NC}")" DB_PASSWORD
echo
DB_PASSWORD=${DB_PASSWORD:-postgres}

read -r -s -p "$(echo -e "${BLUE}Enter Redis password (default: redis): ${NC}")" REDIS_PASSWORD
echo
REDIS_PASSWORD=${REDIS_PASSWORD:-redis}

# Generate JWT secret if not provided
JWT_SECRET=$(generate_secret)

echo -e "\n${GREEN}📦 Creating environment files...${NC}\n"

# Create API .env file
echo -e "${BLUE}Creating $API_DIR/.env${NC}"
cat > "$API_DIR/.env" << EOF
# API Configuration
PORT=$API_PORT

# Database Configuration
DATABASE_URL=postgres://admin:$DB_PASSWORD@localhost:5432/ato?sslmode=disable

# Redis Configuration
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379/0

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=168h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:$WEB_PORT,http://127.0.0.1:$WEB_PORT,http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:$WEB_PORT
EOF

# Create Web .env file
echo -e "${BLUE}Creating $WEB_DIR/.env${NC}"
cat > "$WEB_DIR/.env" << EOF
# API Configuration
VITE_API_URL=http://localhost:$API_PORT/api/v1
EOF

echo -e "\n${GREEN}✅ Environment files created successfully!${NC}\n"

# Display configuration summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Configuration Summary          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo -e "${YELLOW}API Port:${NC}         $API_PORT"
echo -e "${YELLOW}Web Port:${NC}         $WEB_PORT"
echo -e "${YELLOW}Database:${NC}         postgres://admin:***@localhost:5432/ato"
echo -e "${YELLOW}Redis:${NC}            redis://:***@redis:6379/0"
echo -e "${YELLOW}JWT Secret:${NC}       Generated (32 chars)"
echo -e ""

# Ask if user wants to start Docker services
read -r -p "$(echo -e "${BLUE}Do you want to start Docker services now? (y/N): ${NC}")" START_DOCKER

if [[ "$START_DOCKER" =~ ^[Yy]$ ]]; then
    echo -e "\n${GREEN}🐳 Starting Docker services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    
    # Update docker-compose.yml with the password
    if [ -f "docker-compose.yml" ]; then
        # Create a backup
        cp docker-compose.yml docker-compose.yml.bak
        
        # Update the password in docker-compose.yml
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/POSTGRES_PASSWORD: .*/POSTGRES_PASSWORD: $DB_PASSWORD/" docker-compose.yml
            sed -i '' "s/redis-server --requirepass .* --maxmemory/redis-server --requirepass $REDIS_PASSWORD --maxmemory/" docker-compose.yml
        else
            # Linux
            sed -i "s/POSTGRES_PASSWORD: .*/POSTGRES_PASSWORD: $DB_PASSWORD/" docker-compose.yml
            sed -i "s/redis-server --requirepass .* --maxmemory/redis-server --requirepass $REDIS_PASSWORD --maxmemory/" docker-compose.yml
        fi
    fi
    
    docker-compose up -d
    
    echo -e "\n${GREEN}✅ Docker services started!${NC}"
else
    echo -e "\n${YELLOW}⏩ Skipping Docker services. You can start them later with:${NC}"
    echo -e "   cd docker && docker-compose up -d"
fi

# Ask if user wants to install dependencies
read -r -p "$(echo -e "\n${BLUE}Do you want to install dependencies? (y/N): ${NC}")" INSTALL_DEPS

if [[ "$INSTALL_DEPS" =~ ^[Yy]$ ]]; then
    echo -e "\n${GREEN}📦 Installing dependencies...${NC}\n"
    
    # Install API dependencies
    echo -e "${BLUE}Installing API dependencies...${NC}"
    cd "$API_DIR" || exit 1
    go mod download
    go mod tidy
    
    # Install Web dependencies
    echo -e "${BLUE}Installing Web dependencies...${NC}"
    cd "$WEB_DIR" || exit 1
    
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}⚠️  pnpm not found. Installing pnpm...${NC}"
        npm install -g pnpm
    fi
    
    pnpm install
    
    echo -e "\n${GREEN}✅ Dependencies installed!${NC}"
else
    echo -e "\n${YELLOW}⏩ Skipping dependency installation. You can install them later with:${NC}"
    echo -e "   cd $API_DIR && go mod download"
    echo -e "   cd $WEB_DIR && pnpm install"
fi

echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             Setup Complete!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Start development servers: ${BLUE}./scripts/startup.sh${NC}"
echo -e "  2. Or start services individually:"
echo -e "     - Docker: ${BLUE}cd docker && docker-compose up -d${NC}"
echo -e "     - API:    ${BLUE}cd apps/api && make dev${NC}"
echo -e "     - Web:    ${BLUE}cd apps/web && pnpm dev${NC}"
echo -e ""
