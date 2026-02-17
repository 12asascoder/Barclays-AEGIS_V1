#!/bin/bash
# AEGIS Automated Setup Script
# This script sets up the entire AEGIS system from scratch

set -e  # Exit on error

echo "🚀 AEGIS Setup Script"
echo "===================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker Desktop."
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi
print_success "Docker is running"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 not found. Please install Python 3.11+"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2 | cut -d '.' -f 1,2)
print_success "Python $PYTHON_VERSION found"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION found"

echo ""
print_info "All prerequisites met!"
echo ""

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Project root: $PROJECT_ROOT"
echo ""

# Step 1: Environment setup
echo "📝 Step 1: Setting up environment..."
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        print_success "Created .env file"
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_info ".env already exists"
fi
echo ""

# Step 2: Backend setup
echo "🐍 Step 2: Setting up backend..."
cd "$PROJECT_ROOT/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
print_info "Installing Python dependencies (this may take a few minutes)..."
pip3 install --quiet --upgrade pip
pip3 install --quiet -r requirements.txt
print_success "Backend dependencies installed"
echo ""

# Step 3: Start Docker services
echo "🐳 Step 3: Starting Docker services..."
cd "$PROJECT_ROOT/docker"

print_info "Starting PostgreSQL and ChromaDB..."
docker compose up -d db chroma

# Wait for services to be ready
print_info "Waiting for services to initialize (15 seconds)..."
sleep 15

# Check if services are running
if docker ps | grep -q "postgres"; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start"
    exit 1
fi

if docker ps | grep -q "chroma"; then
    print_success "ChromaDB is running"
else
    print_error "ChromaDB failed to start"
    exit 1
fi
echo ""

# Step 4: Initialize database
echo "💾 Step 4: Initializing database..."
cd "$PROJECT_ROOT/backend"
source venv/bin/activate

print_info "Running database migrations..."
python3 manage.py migrate
print_success "Database schema created"

print_info "Seeding sample data..."
python3 manage.py seed
print_success "Sample data created"

echo ""
print_success "Admin user: admin / admin123"
print_success "Analyst user: analyst1 / analyst123"
echo ""

# Step 5: Frontend setup
echo "⚛️  Step 5: Setting up frontend..."
cd "$PROJECT_ROOT/frontend"

print_info "Installing frontend dependencies (this may take a few minutes)..."
npm install --quiet
print_success "Frontend dependencies installed"
echo ""

# Final summary
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend API:"
echo "   cd $PROJECT_ROOT/backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. In a NEW terminal, start the frontend:"
echo "   cd $PROJECT_ROOT/frontend"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "4. Login with:"
echo "   - Admin: admin / admin123"
echo "   - Analyst: analyst1 / analyst123"
echo ""
print_success "AEGIS is ready to go! 🚀"
