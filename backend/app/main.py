from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import router as api_router
from .db import base, session
from .middleware.audit_middleware import AuditMiddleware

app = FastAPI(title="AEGIS - Adaptive Enterprise Governance & Intelligence System")

# CORS (allow from frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit middleware to capture request-level access for compliance
app.add_middleware(AuditMiddleware)

# include main API router
app.include_router(api_router, prefix="/api")


@app.get("/healthz")
def health():
    return {"status": "ok"}


# Initialize DB metadata (simple create_all for dev)
@app.on_event("startup")
def on_startup():
    engine = session.get_engine()
    base.Base.metadata.create_all(bind=engine)
