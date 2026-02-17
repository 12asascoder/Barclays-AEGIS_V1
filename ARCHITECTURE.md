# AEGIS System Architecture

## Overview

AEGIS (Adaptive Enterprise Governance & Intelligence System) is an enterprise-grade AI-powered platform for SAR generation, compliance quality assurance, and governance intelligence.

## Architecture Layers

### 1. Presentation Layer (Frontend)
- **Technology**: Next.js 14 + TypeScript + TailwindCSS
- **Components**:
  - Authentication (JWT-based)
  - Dashboard (executive metrics)
  - Case Management UI
  - SAR Generation & Review
  - Audit Viewer
  - Admin Panel

### 2. Application Layer (Backend API)
- **Technology**: FastAPI + Python 3.11+
- **Components**:
  - REST API endpoints
  - JWT authentication & authorization
  - Role-based access control (Analyst, Admin, Auditor)
  - Request/response validation (Pydantic)
  - Audit middleware

### 3. Business Logic Layer (Services)
- **AI Service**: SAR generation orchestration
- **LangChain Service**: LLM integration with structured prompts
- **ChromaDB Client**: Vector search for templates
- **CQI Service**: Compliance Quality Index calculation
- **Typology Service**: ML-based typology detection
- **LLM Service**: Pluggable LLM wrapper (OpenAI/Llama)

### 4. Data Layer
- **PostgreSQL**: Relational data storage
  - Users, Customers, Accounts, Transactions
  - Cases, SAR Reports, CQI Scores
  - Audit Logs, AI Invocations, Typology Detections
- **ChromaDB**: Vector database
  - Template embeddings
  - Knowledge base
  - RAG pipeline support

## Data Flow

### SAR Generation Flow
```
1. Analyst creates Case → Assigns to self
2. Analyst clicks "Generate SAR"
3. Backend:
   a. Fetch Case + Customer + Transactions
   b. Query ChromaDB for relevant templates (RAG)
   c. Build structured prompt with context
   d. Call LangChain → LLM (OpenAI/Llama)
   e. Store generated SAR narrative
   f. Calculate CQI score
   g. Detect typologies
   h. Log AI invocation + audit trail
4. Analyst reviews SAR, edits if needed
5. Analyst/Admin approves SAR
6. System logs approval event
```

### Authentication Flow
```
1. User submits username + password
2. Backend verifies credentials
3. Generate JWT with user_id, role, username
4. Return token to frontend
5. Frontend stores token (localStorage)
6. All API calls include Authorization: Bearer <token>
7. Backend middleware validates token + role
```

### Audit Trail
All critical actions are logged:
- User registration/login
- SAR generation
- SAR approval
- AI invocations
- Data access
- Admin actions

## Security

### Authentication & Authorization
- JWT with configurable expiration
- Password hashing (bcrypt)
- Role-based access control
- Token validation on every request

### Data Protection
- SQL injection prevention (SQLAlchemy ORM + parameterized queries)
- CORS configured for frontend origin
- Environment-based secrets (.env)
- Production: HTTPS required, rotate secrets

### Audit & Compliance
- Comprehensive audit logging
- User action traceability
- AI invocation logging
- Timestamps on all events

## Scalability

### Horizontal Scaling
- Stateless API (scale backend pods)
- Database connection pooling
- ChromaDB can be deployed separately

### Vertical Optimization
- SQLAlchemy lazy loading
- ChromaDB vector index
- API response pagination (future)

### Caching (Future)
- Redis for session storage
- Template cache
- Metrics cache

## Deployment Architecture

### Development
```
Docker Compose:
  - db (PostgreSQL)
  - chroma (ChromaDB server)
  - backend (FastAPI)
  - frontend (Next.js dev server)
```

### Production
```
Kubernetes/Cloud:
  - Load Balancer → Ingress
  - Frontend (CDN + SSR pods)
  - Backend (multiple replicas)
  - PostgreSQL (managed service)
  - ChromaDB (dedicated instance)
  - Redis (session cache)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 | React framework with App Router |
| UI | TailwindCSS | Utility-first CSS |
| State | React Context | Auth state management |
| HTTP | Axios | API client |
| Charts | Recharts | Data visualization |
| Backend | FastAPI | High-performance Python API |
| ORM | SQLAlchemy | Database abstraction |
| Validation | Pydantic | Request/response schemas |
| Auth | python-jose | JWT handling |
| Password | passlib | bcrypt hashing |
| Database | PostgreSQL | Relational data store |
| Vector DB | ChromaDB | Embeddings & RAG |
| AI | LangChain | LLM orchestration |
| LLM | OpenAI / Llama | Text generation |
| ML | scikit-learn | Typology detection |
| Migrations | Alembic | Schema versioning |
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Local dev orchestration |

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (OAuth2 flow)

### Cases
- `GET /api/cases` - List cases (filtered by role)
- `POST /api/cases` - Create case
- `GET /api/cases/{id}` - Get case details

### SAR
- `POST /api/sar/generate` - Generate SAR
- `GET /api/sar` - List SARs
- `GET /api/sar/{id}` - Get SAR details
- `POST /api/sar/{id}/approve` - Approve SAR

### Dashboard
- `GET /api/dashboard/metrics` - Executive metrics

### Audit
- `GET /api/audit` - List audit logs (auditor only)

### Admin
- `GET /api/admin/users` - List users
- `POST /api/admin/users/{id}/deactivate` - Deactivate user

## Database Schema

### Core Entities
- **User**: Authentication & authorization
- **Customer**: KYC data & risk rating
- **Account**: Financial accounts
- **Transaction**: Financial transactions
- **Case**: Investigation cases
- **SARReport**: Generated SAR narratives
- **CQIScore**: Quality metrics
- **AuditLog**: Compliance audit trail
- **TypologyDetection**: ML typology results
- **AIInvocation**: LLM call tracking

## Configuration

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:port/db
CHROMA_API_URL=http://chroma:8000
JWT_SECRET=<secret>
OPENAI_API_KEY=<key>
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

## Monitoring & Observability (Future)

- **Logging**: Structured JSON logs (loguru)
- **Metrics**: Prometheus exporters
- **Tracing**: OpenTelemetry
- **Alerts**: Critical error notifications
- **Dashboards**: Grafana

## Future Enhancements

1. **Real-time Collaboration**: WebSocket for multi-user case editing
2. **Advanced Analytics**: Time-series analysis, anomaly detection
3. **Document Attachment**: File upload for case evidence
4. **Workflow Engine**: Configurable approval workflows
5. **Export**: PDF/CSV export of SARs
6. **Integration**: Third-party AML tools
7. **Advanced RAG**: Fine-tuned embeddings, reranking
8. **Multi-tenancy**: Org-level data isolation
