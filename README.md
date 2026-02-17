# AEGIS - Adaptive Enterprise Governance & Intelligence System

## Overview

AEGIS is an **enterprise-grade, regulator-defensible AI platform** for SAR (Suspicious Activity Report) generation, risk analysis, regulatory simulation, and cross-case intelligence designed for financial institutions to meet AML/KYC compliance requirements.

> **🎉 ALL 7 CAPABILITY DOMAINS FULLY IMPLEMENTED!** See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for complete implementation details.

### What Makes AEGIS Different

**Most hackathon projects generate SAR narratives. AEGIS evaluates and strengthens SAR defensibility BEFORE filing.**

AEGIS transforms SAR compliance from manual documentation into **measured, explainable, intelligence-driven regulatory excellence**.

### The Differentiator: Regulatory Simulation Engine 🎓

AEGIS simulates how regulators would evaluate each SAR, identifying weaknesses such as:
- Missing evidence citations
- Weak reasoning
- Incomplete timelines
- Insufficient subject identification

**Output:**
- Defensibility score (0-1) and grade (A+ to F)
- Regulatory readiness status
- Gap analysis with severity levels
- Actionable improvement recommendations
- Revision effort estimates

**Result:** Banks can confidently deploy AEGIS knowing that SAR quality is measured, validated, and continuously improved BEFORE regulatory submission.

### Complete Feature Set (All 7 Domains)

✅ **1. Data Ingestion & Case Intelligence Layer**
- Customer profiles, accounts, transactions
- Case management with assignments
- Automatic relationship mapping

✅ **2. Risk Analysis & Typology Detection Engine**
- 6 detection patterns: structuring, layering, velocity, income mismatch, geographic risk, counterparty risk
- ML-based pattern clustering
- Risk scoring with severity classification
- Evidence-based recommendations

✅ **3. AI-Powered SAR Narrative Generation**
- LangChain + RAG pipeline
- ChromaDB vector search
- OpenAI GPT-4 integration
- Regulatory-compliant language

✅ **4. Audit, Explainability, and Governance Layer**
- Comprehensive audit trail
- AI invocation logging
- RBAC enforcement (analyst/admin/auditor)
- Request-level access capture

✅ **5. Compliance Quality Index (CQI) Engine - ENHANCED**
- Evidence coverage, completeness, confidence, traceability
- **NEW**: Integrated regulatory defensibility scoring
- 60% traditional metrics + 40% simulation results
- Holistic SAR quality assessment

✅ **6. Cross-Case Intelligence & Typology Drift Detection**
- Pattern clustering across all SARs
- Typology drift detection (30-day comparison)
- Emerging threat identification (crypto, NFT, DeFi, synthetic identity)
- Network risk analysis (repeat offenders)
- Temporal trend analysis
- Executive recommendations

✅ **7. Regulatory Simulation Engine** ⭐ THE DIFFERENTIATOR
- Simulates regulatory review BEFORE filing
- 6-requirement checklist (subject ID, activity description, transaction details, timeline, evidence, reasoning)
- Defensibility scoring and grading
- Gap analysis with severity
- Actionable improvement recommendations
- Revision effort estimates

## Architecture

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + Recharts
- **Backend**: FastAPI + Python 3.11+ + SQLAlchemy 2.0+
- **Database**: PostgreSQL 15
- **Vector Store**: ChromaDB 0.4.1+
- **AI**: LangChain 0.0.300+ + OpenAI GPT-4
- **ML**: scikit-learn 1.2+ (KMeans, TF-IDF)
- **Auth**: JWT (python-jose) + bcrypt

See [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) for detailed system architecture.

## Quick Start

### Prerequisites

- Docker Desktop (running)
- Python 3.11+
- Node.js 18+
- OpenAI API Key

### Automated Setup (Recommended) 🚀

```bash
# One command to set up everything
cd aegis
./setup.sh
```

This script will:
- Check prerequisites (Docker, Python, Node.js)
- Create Python virtual environment
- Install all dependencies (backend + frontend)
- Start Docker services (PostgreSQL, ChromaDB)
- Run database migrations
- Seed sample data

### Start Services

```bash
./start.sh
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Stop Services

```bash
./stop.sh
```

### Manual Setup

If you prefer manual setup, see [QUICKSTART.md](./QUICKSTART.md).

## API Endpoints

### Core Endpoints
- `POST /api/auth/login` - JWT authentication
- `POST /api/sar/generate` - Generate SAR with AI
- `GET /api/sar/{id}` - Get SAR details

### Advanced Risk Analysis (NEW)
- `GET /api/risk/analyze/{case_id}` - Comprehensive risk analysis (6 patterns)
- `POST /api/risk/sar/{sar_id}/simulate` - **THE DIFFERENTIATOR** - Regulatory simulation
- `GET /api/risk/sar/{sar_id}/readiness` - Quick filing readiness check
- `GET /api/risk/intelligence/cross-case` - Cross-case intelligence report
- `GET /api/risk/dashboard/risk-summary` - Dashboard metrics

See [API_TESTING.md](./API_TESTING.md) for complete endpoint documentation with examples.

## Documentation

- [START_HERE.md](./START_HERE.md) - New user guide
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Complete implementation details
- [API_TESTING.md](./API_TESTING.md) - API testing guide
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) - Architecture and file structure
- [FIXES.md](./FIXES.md) - Error resolutions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- ChromaDB (port 8000)
- Backend API (port 8000)

### 3. Initialize Database

```bash
# In a new terminal
cd backend

# Install Python dependencies first
pip3 install -r requirements.txt

# Run migrations
python3 manage.py migrate

# Seed sample data
python3 manage.py seed
```

This creates tables and seeds sample data:
- Admin user: `admin` / `admin123`
- Analyst user: `analyst1` / `analyst123`
- Sample case and transactions

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:3000

### Automated Start/Stop 🎯

After initial setup, use these scripts:

```bash
# Start everything (backend + frontend)
./start.sh

# Stop everything
./stop.sh
```

The `start.sh` script:
- Checks Docker is running
- Starts Docker services if needed
- Starts backend API on port 8000
- Starts frontend on port 3000
- Runs both in background

### 5. Login

Navigate to http://localhost:3000/login

**Demo Credentials**:
- Admin: `admin` / `admin123`
- Analyst: `analyst1` / `analyst123`

## Project Structure

```
aegis/
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # Config, security, dependencies
│   │   ├── db/           # Database session & base
│   │   ├── services/     # Business logic (AI, CQI, typology)
│   │   ├── middleware/   # Audit middleware
│   │   ├── models.py     # SQLAlchemy models
│   │   ├── schemas.py    # Pydantic schemas
│   │   └── main.py       # FastAPI app
│   ├── alembic/          # Database migrations
│   ├── tests/            # Unit tests
│   ├── manage.py         # Management script
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile
│
├── frontend/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # API client, Auth context
│   ├── styles/           # Global CSS
│   ├── package.json
│   └── tsconfig.json
│
├── database/             # DB-related scripts
├── vector_store/         # ChromaDB seeding
├── docker/               # Docker Compose config
├── ARCHITECTURE.md       # System architecture
└── README.md
```

## Development

### Backend Development

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# On Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Run dev server (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
python3 manage.py migrate

# Seed data
python3 manage.py seed
```

**API Documentation**: http://localhost:8000/docs (Swagger UI)

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Management

```bash
cd backend

# Activate virtual environment first
source venv/bin/activate

# Run migrations
python3 manage.py migrate

# Rollback migration
python3 manage.py migrate:down

# Seed sample data
python3 manage.py seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (OAuth2 Password Flow)

### Cases
- `GET /api/cases` - List cases
- `POST /api/cases` - Create case
- `GET /api/cases/{id}` - Get case

### SAR Reports
- `POST /api/sar/generate` - Generate SAR (triggers AI pipeline)
- `GET /api/sar` - List SARs
- `GET /api/sar/{id}` - Get SAR
- `POST /api/sar/{id}/approve` - Approve SAR

### Dashboard
- `GET /api/dashboard/metrics` - Executive metrics

### Audit
- `GET /api/audit` - Audit logs (auditor role)

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users/{id}/deactivate` - Deactivate user

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/aegis

# Vector Store
CHROMA_API_URL=http://chroma:8000

# Auth
JWT_SECRET=changeme-secret-in-prod
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI
OPENAI_API_KEY=sk-...

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### AI Model Configuration

The system supports multiple LLM backends:

1. **OpenAI** (default): Set `OPENAI_API_KEY`
2. **Llama / Self-hosted**: Modify `langchain_service.py` to use local endpoint
3. **Stub mode**: Leave `OPENAI_API_KEY` empty (deterministic responses)

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Test Coverage

```bash
pytest tests/ --cov=app --cov-report=html
```

## Deployment

### Production Checklist

- [ ] Rotate `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Use managed PostgreSQL
- [ ] Configure CORS for production domain
- [ ] Set up monitoring (logs, metrics)
- [ ] Configure backups
- [ ] Review audit log retention policy
- [ ] Scale backend horizontally
- [ ] Use CDN for frontend
- [ ] Set up CI/CD pipeline

### Docker Production

```bash
# Build images
docker build -t aegis-backend:latest ./backend
docker build -t aegis-frontend:latest ./frontend

# Deploy with production compose
docker compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

See `kubernetes/` directory for manifest examples (future).

## User Roles

### Analyst
- View assigned cases
- Create cases
- Generate SARs
- Review and edit SARs
- View dashboard

### Admin
- All Analyst permissions
- View all cases and SARs
- User management
- System configuration
- Approve SARs

### Auditor
- Read-only access to audit logs
- View SARs and cases
- Dashboard metrics

## Security

- **Authentication**: JWT with bcrypt password hashing
- **Authorization**: Role-based access control (RBAC)
- **Audit**: Comprehensive action logging
- **Data Protection**: SQLAlchemy ORM prevents SQL injection
- **CORS**: Configured for known origins
- **Secrets**: Environment variables (never commit .env)

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run migrations: `python manage.py migrate`

### Frontend can't connect to API
- Verify backend is running on port 8000
- Check CORS settings in backend config
- Ensure API_BASE in frontend matches backend URL

### ChromaDB connection fails
- Verify ChromaDB service is running
- Check CHROMA_API_URL in .env
- Service falls back to local templates if unavailable

### AI generation returns stub
- Verify OPENAI_API_KEY is set
- Check API key has sufficient credits
- Review logs for LangChain errors

## Support & Contributing

For issues, feature requests, or contributions:
- Open GitHub issues
- Submit pull requests
- Review ARCHITECTURE.md for system design

## License

Proprietary - Enterprise use only

## Credits

Built with:
- FastAPI, SQLAlchemy, LangChain, ChromaDB
- Next.js, React, TailwindCSS, Recharts
- PostgreSQL, Docker

