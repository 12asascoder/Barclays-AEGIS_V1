from fastapi import APIRouter, Depends
from ..core.deps import get_current_user, require_role
from ..db.session import get_db
from .. import models
from ..schemas import AuditLogRead
from typing import List
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[AuditLogRead])
def list_audit(db: Session = Depends(get_db), user=Depends(require_role('auditor'))):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(500).all()
    return logs
