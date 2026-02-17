from fastapi import APIRouter

from . import auth, cases, sar, audit, dashboard, admin, risk

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(cases.router, prefix="/cases", tags=["cases"])
router.include_router(sar.router, prefix="/sar", tags=["sar"])
router.include_router(audit.router, prefix="/audit", tags=["audit"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
router.include_router(risk.router, prefix="/risk", tags=["risk"])
