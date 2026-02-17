from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .db.base import Base


class RoleEnum(str, enum.Enum):
    analyst = "analyst"
    admin = "admin"
    auditor = "auditor"


class CaseStatus(str, enum.Enum):
    open = "open"
    assigned = "assigned"
    in_review = "in_review"
    closed = "closed"
    escalated = "escalated"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(512), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.analyst)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cases = relationship("Case", back_populates="assigned_to_user")
    ai_invocations = relationship("AIInvocation", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(256), nullable=False)
    risk_rating = Column(Integer, default=3)
    kyc = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="customer")
    cases = relationship("Case", back_populates="customer")


class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(String(100), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    account_type = Column(String(50), nullable=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    txn_id = Column(String(150), unique=True, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    txn_type = Column(String(50), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(Text, nullable=True)  # Renamed from 'metadata' to avoid SQLAlchemy reserved word

    account = relationship("Account", back_populates="transactions")


class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_ref = Column(String(150), unique=True, nullable=False, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(CaseStatus), default=CaseStatus.open)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="cases")
    assigned_to_user = relationship("User", back_populates="cases")
    sar = relationship("SARReport", back_populates="case", uselist=False)


class SARReport(Base):
    __tablename__ = "sar_reports"
    id = Column(Integer, primary_key=True, index=True)
    sar_ref = Column(String(150), unique=True, nullable=False, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    narrative = Column(Text, nullable=True)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="sar")
    cqi = relationship("CQIScore", back_populates="sar", uselist=False)


class CQIScore(Base):
    __tablename__ = "cqi_scores"
    id = Column(Integer, primary_key=True, index=True)
    sar_id = Column(Integer, ForeignKey("sar_reports.id"), nullable=False, unique=True)
    evidence_coverage = Column(Float, default=0.0)
    completeness = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    traceability = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    sar = relationship("SARReport", back_populates="cqi")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(200), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String(100), nullable=True)
    meta_data = Column(Text, nullable=True)  # Renamed from 'metadata' (SQLAlchemy reserved word)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


class TypologyDetection(Base):
    __tablename__ = "typology_detections"
    id = Column(Integer, primary_key=True, index=True)
    sar_id = Column(Integer, ForeignKey("sar_reports.id"), nullable=True)
    detection_type = Column(String(100), nullable=False)
    score = Column(Float, default=0.0)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIInvocation(Base):
    __tablename__ = "ai_invocations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sar_id = Column(Integer, ForeignKey("sar_reports.id"), nullable=True)
    prompt = Column(Text, nullable=True)
    response = Column(Text, nullable=True)
    model = Column(String(100), nullable=True)
    tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ai_invocations")
