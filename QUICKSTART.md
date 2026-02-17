# AEGIS Quick Start Guide

## Pre-Flight Checklist

Before starting, ensure:

1. **Docker Desktop is running** ✅
   - Open Docker Desktop application
   - Wait for the whale icon to show "Docker is running"

2. **Python 3.11+ installed** ✅
   ```bash
   python3 --version  # Should show 3.11 or higher
   ```

3. **Node.js 18+ installed** ✅
   ```bash
   node --version  # Should show v18 or higher
   ```

## Step-by-Step Setup

### 1. Environment Setup

```bash
# Navigate to project root
cd /Users/arnav/Code/AEGIS/aegis

# Copy environment file
cp .env.example .env

# (Optional) Edit .env to add OpenAI API key
# nano .env
```

### 2. Install Backend Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip3 install -r requirements.txt
```

**Expected Output**: All packages install successfully without errors.

### 3. Start Docker Services

```bash
cd ../docker

# Start PostgreSQL and ChromaDB
docker compose up -d db chroma
```

**Expected Output**:
```
✔ Container docker-db-1     Started
✔ Container docker-chroma-1 Started
```

Wait 10 seconds for services to initialize.

### 4. Initialize Database

```bash
cd ../backend

# Run migrations (creates tables)
python3 manage.py migrate

# Seed sample data (creates users and test case)
python3 manage.py seed
```

**Expected Output**:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 001, initial migration
Database initialized successfully!
Admin user: admin / admin123
Analyst user: analyst1 / analyst123
```

### 5. Start Backend API

```bash
# In backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

**Test**: Open http://localhost:8000/docs in browser → Should see Swagger UI

### 6. Install Frontend Dependencies

```bash
# Open NEW terminal
cd /Users/arnav/Code/AEGIS/aegis/frontend

# Install packages
npm install
```

**Expected Output**: All packages install successfully (ignore peer dependency warnings).

### 7. Start Frontend

```bash
# In frontend directory
npm run dev
```

**Expected Output**:
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
```

### 8. Login & Test

1. **Open**: http://localhost:3000
2. **Login with**:
   - Username: `admin`
   - Password: `admin123`
3. **Expected**: Redirected to dashboard with metrics

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"
**Solution**: Start Docker Desktop application first.

### Issue: "command not found: python"
**Solution**: Use `python3` instead of `python`.

### Issue: "ModuleNotFoundError: No module named 'pydantic_settings'"
**Solution**: Run `pip3 install -r requirements.txt` in backend directory.

### Issue: "Port 8000 already in use"
**Solution**: 
```bash
# Find process using port
lsof -ti:8000 | xargs kill -9
```

### Issue: "Frontend can't connect to API"
**Solution**: Ensure backend is running on port 8000 first.

## Quick Verification Commands

```bash
# Check if Docker containers are running
docker ps

# Should see: postgres, chroma

# Check backend health
curl http://localhost:8000/healthz

# Should return: {"status":"ok"}

# Check database connection
psql postgresql://postgres:postgres@localhost:5432/aegis -c "SELECT COUNT(*) FROM users;"

# Should return: count = 2 (admin + analyst)
```

## Next Steps

After successful setup:

1. **Explore API**: http://localhost:8000/docs
2. **View Dashboard**: http://localhost:3000/dashboard
3. **Generate SAR**: Navigate to Cases → Click a case → Generate SAR
4. **View Audit Logs**: Login as admin → Audit page

## Common Workflows

### Generate a SAR Report

1. Login as `analyst1` / `analyst123`
2. Go to **Cases** page
3. Click on existing case
4. Click **Generate SAR**
5. View generated narrative with CQI score

### View Audit Trail

1. Login as `admin` / `admin123`
2. Navigate to **Audit** page
3. See all user actions logged

### Create New Case

1. Login as analyst or admin
2. Go to **Cases** page
3. Click **Create Case** (future: form UI)
4. Use API: POST http://localhost:8000/api/cases

## Development Mode

### Backend with auto-reload
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend with hot-reload
```bash
cd frontend
npm run dev
```

### Run tests
```bash
cd backend
pytest tests/ -v
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

## Support

- **API Docs**: http://localhost:8000/docs
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Full README**: [README.md](./README.md)
