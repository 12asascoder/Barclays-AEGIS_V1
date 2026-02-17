from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Role(str, Enum):
    analyst = "analyst"
    admin = "admin"
    auditor = "auditor"


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    full_name: Optional[str]
    password: str = Field(..., min_length=8)
    role: Optional[Role] = Role.analyst


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[Role] = None


class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str]
    role: Role
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


# Case schemas
class CaseCreate(BaseModel):
    case_ref: str
    title: str
    description: Optional[str]
    customer_id: Optional[int]


class CaseRead(BaseModel):
    id: int
    case_ref: str
    title: str
    description: Optional[str]
    status: str
    customer_id: Optional[int]
    assigned_to: Optional[int]
    created_at: datetime

    class Config:
        orm_mode = True


# SAR schemas
class SARGenerateRequest(BaseModel):
    case_id: int


class SARRead(BaseModel):
    id: int
    sar_ref: str
    case_id: int
    created_by: int
    narrative: Optional[str]
    approved: bool
    created_at: datetime

    class Config:
        orm_mode = True


# Audit
class AuditLogRead(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    entity_type: Optional[str]
    entity_id: Optional[str]
    meta_data: Optional[str]  # Renamed from 'metadata' (SQLAlchemy reserved word)
    timestamp: datetime

    class Config:
        orm_mode = True


# Dashboard metrics
class DashboardMetrics(BaseModel):
    sar_volume: int
    average_cqi: float
    typology_counts: dict
    risk_score_trend: list

