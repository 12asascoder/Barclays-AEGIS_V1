from fastapi import APIRouter, Depends, HTTPException
from ..core.deps import require_role, get_current_user
from ..db.session import get_db
from .. import models
from ..schemas import UserRead
from typing import List
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/users", response_model=List[UserRead])
def list_users(db: Session = Depends(get_db), current=Depends(require_role('admin'))):
    users = db.query(models.User).all()
    return users


@router.post("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, db: Session = Depends(get_db), current=Depends(require_role('admin'))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    user.is_active = False
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"ok": True}
