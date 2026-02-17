#!/bin/bash
# AEGIS Stop Script
# Stops all AEGIS services

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

echo "🛑 Stopping AEGIS..."
echo ""

# Stop backend (port 8000)
if lsof -ti:8000 &> /dev/null; then
    print_info "Stopping backend..."
    lsof -ti:8000 | xargs kill -9
    print_success "Backend stopped"
else
    print_info "Backend not running"
fi

# Stop frontend (port 3000)
if lsof -ti:3000 &> /dev/null; then
    print_info "Stopping frontend..."
    lsof -ti:3000 | xargs kill -9
    print_success "Frontend stopped"
else
    print_info "Frontend not running"
fi

# Stop Docker services (optional)
read -p "Stop Docker services (PostgreSQL, ChromaDB)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$PROJECT_ROOT/docker"
    docker compose down
    print_success "Docker services stopped"
fi

echo ""
print_success "AEGIS stopped!"
