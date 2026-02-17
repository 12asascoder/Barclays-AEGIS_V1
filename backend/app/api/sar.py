from fastapi import APIRouter, Depends, HTTPException
from ..core.deps import get_current_user
from ..db.session import get_db
from sqlalchemy.orm import Session
from ..services.ai_service import generate_sar
from ..services.cqi_service import calculate_cqi
from ..services.typology_service import detect_typologies
from .. import models
from ..schemas import SARGenerateRequest, SARRead

router = APIRouter()


@router.post("/generate", response_model=SARRead)
def generate(payload: SARGenerateRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        sar = generate_sar(db, payload.case_id, user.id)
        # compute CQI
        cqi = calculate_cqi(db, sar.id)
        # detect typologies
        t = detect_typologies(db, sar.id)
        return sar
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{sar_id}", response_model=SARRead)
def get_sar(sar_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    sar = db.query(models.SARReport).filter(models.SARReport.id == sar_id).first()
    if not sar:
        raise HTTPException(status_code=404, detail="SAR not found")
    return sar


@router.post("/{sar_id}/approve")
def approve_sar(sar_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    sar = db.query(models.SARReport).filter(models.SARReport.id == sar_id).first()
    if not sar:
        raise HTTPException(status_code=404, detail="SAR not found")
    sar.approved = True
    db.add(sar)
    db.commit()
    db.refresh(sar)
    
    # Audit log the approval
    from datetime import datetime
    audit = models.AuditLog(
        user_id=user.id,
        action="SAR_APPROVED",
        entity_type="SARReport",
        entity_id=str(sar.id),
        metadata=f"sar_ref={sar.sar_ref}, approved_by={user.username}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return {"ok": True}


@router.get("/", response_model=list[SARRead])
def list_sars(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role.value == 'admin':
        sars = db.query(models.SARReport).all()
    else:
        sars = db.query(models.SARReport).filter(models.SARReport.created_by == user.id).all()
    return sars
