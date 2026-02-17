from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..schemas import CaseCreate, CaseRead
from ..core.deps import get_current_user, require_role
from ..db.session import get_db
from .. import models
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[CaseRead])
def list_cases(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # simple RBAC: analysts see assigned or open, admins see all
    if user.role.value == "admin":
        cases = db.query(models.Case).all()
    else:
        cases = db.query(models.Case).filter((models.Case.assigned_to == user.id) | (models.Case.status == "open")).all()
    return cases


@router.post("/", response_model=CaseRead)
def create_case(payload: CaseCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    case = models.Case(
        case_ref=payload.case_ref,
        title=payload.title,
        description=payload.description,
        customer_id=payload.customer_id,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/{case_id}", response_model=CaseRead)
def get_case(case_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case
