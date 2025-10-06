#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Ato Development Environment${NC}\n"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing pnpm...${NC}"
    npm install -g pnpm
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${YELLOW}⚠️  Go not found. Please install Go 1.23 or higher.${NC}"
    exit 1
fi

# Start API in background
echo -e "${GREEN}📦 Starting API server...${NC}"
cd api
go run main.go &
API_PID=$!
cd ..

# Wait a moment for API to start
sleep 2

# Start Web app
echo -e "${GREEN}🌐 Starting Web app...${NC}"
cd web
pnpm dev &
WEB_PID=$!
cd ..

echo -e "\n${GREEN}✅ Development environment is running!${NC}"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Backend:${NC}  http://localhost:8080"
echo -e "${BLUE}API Health:${NC} http://localhost:8080/health"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT TERM

# Wait for both processes
wait
