#!/bin/bash
# AEGIS Start Script
# Starts backend and frontend in separate processes

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

echo "🚀 Starting AEGIS..."
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if services are running
cd "$PROJECT_ROOT/docker"
if ! docker ps | grep -q "postgres"; then
    print_info "Starting Docker services..."
    docker compose up -d
    sleep 10
    print_success "Docker services started"
fi

# Start backend in background
print_info "Starting backend API..."
cd "$PROJECT_ROOT/backend"

if [ ! -d "venv" ]; then
    print_error "Virtual environment not found. Run ./setup.sh first."
    exit 1
fi

source venv/bin/activate

# Kill existing process if any
if lsof -ti:3002 &> /dev/null; then
    print_info "Killing existing backend process..."
    lsof -ti:3002 | xargs kill -9
fi

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 3002 &
BACKEND_PID=$!
print_success "Backend started (PID: $BACKEND_PID) on http://localhost:3002"

# Start frontend in background
print_info "Starting frontend..."
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    print_error "Frontend dependencies not installed. Run ./setup.sh first."
    kill $BACKEND_PID
    exit 1
fi

# Kill existing process if any
if lsof -ti:3000 &> /dev/null; then
    print_info "Killing existing frontend process..."
    lsof -ti:3000 | xargs kill -9
fi

# Start frontend
npm run dev &
FRONTEND_PID=$!
print_success "Frontend started (PID: $FRONTEND_PID) on http://localhost:3000"

echo ""
print_success "AEGIS is running!"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Docs: http://localhost:3002/docs"
echo "   - Health:   http://localhost:3002/healthz"
echo ""
echo "👤 Demo credentials:"
echo "   - Admin:    admin / admin123"
echo "   - Analyst:  analyst1 / analyst123"
echo ""
echo "🛑 To stop AEGIS:"
echo "   Press Ctrl+C or run: ./stop.sh"
echo ""

# Wait for Ctrl+C
trap "echo ''; print_info 'Stopping AEGIS...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

# Keep script running
wait
