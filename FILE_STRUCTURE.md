# AEGIS - Complete File Structure

```
aegis/
├── 📄 START_HERE.md           ⭐ READ THIS FIRST!
├── 📄 QUICKSTART.md            Step-by-step beginner guide
├── 📄 FIXES.md                 All errors fixed (detailed)
├── 📄 README.md                Complete documentation
├── 📄 ARCHITECTURE.md          System design
├── 📄 DEPLOYMENT.md            Production deployment
│
├── 🔧 setup.sh                 ⭐ ONE-COMMAND SETUP
├── 🚀 start.sh                 Start backend + frontend
├── 🛑 stop.sh                  Stop all services
│
├── 📁 backend/                 FastAPI Backend
│   ├── app/
│   │   ├── api/                API endpoints
│   │   │   ├── auth.py         Authentication (JWT)
│   │   │   ├── cases.py        Case management
│   │   │   ├── sar.py          SAR generation
│   │   │   ├── audit.py        Audit logs
│   │   │   ├── dashboard.py   Metrics
│   │   │   └── admin.py        User management
│   │   │
│   │   ├── services/           Business logic
│   │   │   ├── ai_service.py           RAG pipeline
│   │   │   ├── langchain_service.py    LLM wrapper
│   │   │   ├── chroma_client.py        Vector DB
│   │   │   ├── cqi_service.py          Quality scoring
│   │   │   └── typology_service.py     Pattern detection
│   │   │
│   │   ├── core/               Configuration
│   │   │   ├── config.py       Settings (FIXED ✅)
│   │   │   ├── security.py     JWT & password hashing
│   │   │   └── deps.py         Dependencies
│   │   │
│   │   ├── db/                 Database
│   │   │   ├── session.py      SQLAlchemy session
│   │   │   └── base.py         Declarative base
│   │   │
│   │   ├── middleware/         Middleware
│   │   │   └── audit_middleware.py
│   │   │
│   │   ├── models.py           SQLAlchemy models (FIXED ✅)
│   │   ├── schemas.py          Pydantic schemas
│   │   └── main.py             FastAPI app
│   │
│   ├── alembic/                Database migrations
│   │   ├── versions/
│   │   │   └── 001_initial_migration.py (FIXED ✅)
│   │   ├── env.py
│   │   └── alembic.ini
│   │
│   ├── tests/                  Unit tests
│   │   ├── test_cqi_service.py
│   │   └── test_typology_service.py
│   │
│   ├── requirements.txt        Dependencies (FIXED ✅)
│   ├── manage.py               DB management CLI
│   └── Dockerfile
│
├── 📁 frontend/                Next.js 14 Frontend
│   ├── app/                    App Router pages
│   │   ├── layout.tsx          Root layout
│   │   ├── page.tsx            Home page
│   │   ├── login/page.tsx      Login form
│   │   ├── dashboard/page.tsx  Executive dashboard
│   │   ├── cases/page.tsx      Case management
│   │   ├── sar/page.tsx        SAR reports
│   │   ├── audit/page.tsx      Audit logs
│   │   └── admin/page.tsx      Admin panel
│   │
│   ├── components/             React components
│   │   └── ProtectedRoute.tsx  Auth guard
│   │
│   ├── lib/                    Utilities
│   │   ├── api.ts              Axios API client
│   │   └── AuthContext.tsx     Auth state
│   │
│   ├── styles/
│   │   └── globals.css         Global styles
│   │
│   ├── package.json            Dependencies (FIXED ✅)
│   ├── tsconfig.json           TypeScript config
│   ├── tailwind.config.js      TailwindCSS config
│   └── next.config.js          Next.js config
│
├── 📁 docker/                  Docker setup
│   └── docker-compose.yml      Services (PostgreSQL, ChromaDB)
│
├── 📁 database/                DB scripts
│   └── init.sql                (Future)
│
├── 📁 vector_store/            Vector DB
│   └── seed_templates.py       ChromaDB seeding
│
├── .env.example                Environment template
└── .env                        Environment vars (create from .example)
```

## Key Files Explained

### 🎯 Start Here
- **START_HERE.md** - Your entry point, read this first!
- **setup.sh** - Run this to set up everything automatically
- **start.sh** - Run this to start AEGIS
- **stop.sh** - Run this to stop AEGIS

### 📚 Documentation
- **QUICKSTART.md** - Step-by-step setup guide
- **FIXES.md** - Explains all errors that were fixed
- **README.md** - Complete project documentation
- **ARCHITECTURE.md** - System design and data flows
- **DEPLOYMENT.md** - Production deployment guide

### ✅ Fixed Files
These files had errors that are now fixed:
- `backend/app/models.py` - SQLAlchemy models
- `backend/app/core/config.py` - Pydantic settings
- `backend/requirements.txt` - Python packages
- `backend/alembic/versions/001_initial_migration.py` - DB migration
- `frontend/package.json` - Node packages

### 🔥 Core Backend Files

**API Endpoints** (`backend/app/api/`):
- `auth.py` - Register, login (JWT authentication)
- `cases.py` - Create, list, get cases
- `sar.py` - Generate SAR, approve, list reports
- `audit.py` - View audit logs (auditor role)
- `dashboard.py` - Metrics for dashboard
- `admin.py` - User management

**Services** (`backend/app/services/`):
- `ai_service.py` - Main SAR generation orchestrator
- `langchain_service.py` - LLM wrapper (OpenAI/Llama)
- `chroma_client.py` - Vector database client
- `cqi_service.py` - Quality score calculator
- `typology_service.py` - Money laundering pattern detection

**Models** (`backend/app/models.py`):
- User, Customer, Account, Transaction
- Case, SARReport, CQIScore
- AuditLog, TypologyDetection, AIInvocation

### ⚛️ Core Frontend Files

**Pages** (`frontend/app/`):
- `login/page.tsx` - Login form with JWT auth
- `dashboard/page.tsx` - Executive metrics & charts
- `cases/page.tsx` - Case management interface
- `sar/page.tsx` - SAR reports with approval
- `audit/page.tsx` - Audit log viewer
- `admin/page.tsx` - User management

**Auth** (`frontend/lib/`):
- `AuthContext.tsx` - React context for auth state
- `api.ts` - Axios client with JWT interceptor
- `ProtectedRoute.tsx` - Route guard component

### 🐳 Infrastructure

**Docker** (`docker/docker-compose.yml`):
- PostgreSQL 15 (database)
- ChromaDB (vector store)
- Backend API (port 8000)

**Database** (`backend/alembic/`):
- Migrations manage schema changes
- `001_initial_migration.py` creates all tables

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 + TypeScript | Web UI |
| API | FastAPI + Python 3.11+ | Backend REST API |
| Database | PostgreSQL 15 | Relational data |
| Vector DB | ChromaDB | Embeddings for RAG |
| AI | LangChain + OpenAI | LLM orchestration |
| Auth | JWT + bcrypt | Authentication |
| ORM | SQLAlchemy 2.0 | Database models |
| Migrations | Alembic | Schema management |
| Styling | TailwindCSS | UI styling |
| Charts | Recharts | Data visualization |
| Container | Docker + Compose | Orchestration |

## File Counts

- **Backend**: 25+ Python files
- **Frontend**: 15+ TypeScript/React files
- **Docker**: 1 compose file
- **Docs**: 6 markdown files
- **Scripts**: 3 shell scripts
- **Total Lines**: ~8,000+ LOC

## What Each Layer Does

### 🎨 Frontend (Next.js)
- User interface
- Authentication state
- API calls to backend
- Charts and visualizations
- Protected routes

### 🚀 Backend (FastAPI)
- REST API endpoints
- JWT authentication
- Database operations
- AI/ML processing
- Audit logging

### 💾 Database (PostgreSQL)
- User data
- Cases and transactions
- SAR reports
- Audit logs
- CQI scores

### 🧠 Vector DB (ChromaDB)
- SAR templates
- Semantic search
- RAG context retrieval

### 🤖 AI Layer (LangChain)
- LLM orchestration
- Prompt engineering
- RAG pipeline
- Narrative generation

## Ready to Start?

See **START_HERE.md** for the complete guide! 🚀
