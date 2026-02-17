from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from .. import schemas, models
from ..db.session import get_db
from ..core import security
from sqlalchemy.orm import Session
from ..schemas import UserCreate, Token, UserRead
from datetime import datetime

router = APIRouter()


@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # check existing
    existing = db.query(models.User).filter((models.User.username == user_in.username) | (models.User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = models.User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=security.hash_password(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create user")
    
    # Audit log the registration
    audit = models.AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        entity_type="User",
        entity_id=str(user.id),
        metadata=f"username={user.username}, role={user.role.value}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses 'username' and 'password' fields
    user = db.query(models.User).filter(
        (models.User.username == form_data.username) | (models.User.email == form_data.username)
    ).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")
    
    token = security.create_access_token({
        "user_id": user.id,
        "username": user.username,
        "role": user.role.value
    })
    
    # Audit log the login
    audit = models.AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="User",
        entity_id=str(user.id),
        metadata=f"username={user.username}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    
    return {"access_token": token, "token_type": "bearer"}
