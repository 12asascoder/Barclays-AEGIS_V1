"""
AEGIS Demo Data Seed Script
Populates the database with realistic AML/SAR demo data so the
Intelligence, Dashboard, and other pages have data to display.
Run from the backend/ directory:
  python3 seed_demo_data.py
"""
import os
import sys
import json
from datetime import datetime, timedelta
import random

# Make sure env is loaded
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import (
    Base, User, Customer, Account, Transaction, Case, SARReport,
    CQIScore, TypologyDetection, AuditLog, RoleEnum, CaseStatus
)
from app.core.security import hash_password

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/aegis")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

print("🌱 Seeding AEGIS demo data...")

# ── 1. Users ──────────────────────────────────────────────────────────────────
def seed_users():
    users_data = [
        {"username": "admin",    "email": "admin@aegis.io",    "full_name": "System Administrator", "password": "admin123",   "role": RoleEnum.admin},
        {"username": "analyst1", "email": "analyst1@aegis.io", "full_name": "Sarah Mitchell",       "password": "analyst123", "role": RoleEnum.analyst},
        {"username": "analyst2", "email": "analyst2@aegis.io", "full_name": "James Okafor",         "password": "analyst123", "role": RoleEnum.analyst},
        {"username": "auditor1", "email": "auditor1@aegis.io", "full_name": "Priya Sharma",         "password": "auditor123", "role": RoleEnum.auditor},
    ]
    users = {}
    for ud in users_data:
        existing = db.query(User).filter(User.username == ud["username"]).first()
        if not existing:
            u = User(
                username=ud["username"], email=ud["email"],
                full_name=ud["full_name"], hashed_password=hash_password(ud["password"]),
                role=ud["role"], is_active=True
            )
            db.add(u)
            db.flush()
            users[ud["username"]] = u
            print(f"  ✓ User: {ud['username']} ({ud['role']})")
        else:
            users[ud["username"]] = existing
    db.commit()
    return users

# ── 2. Customers ──────────────────────────────────────────────────────────────
def seed_customers():
    customers_data = [
        {"customer_id": "CUST-001", "name": "Nexus Trading LLC",         "risk_rating": 5},
        {"customer_id": "CUST-002", "name": "Alvarez Import & Export",   "risk_rating": 4},
        {"customer_id": "CUST-003", "name": "Meridian Holdings Group",   "risk_rating": 5},
        {"customer_id": "CUST-004", "name": "GreenField Ventures",       "risk_rating": 3},
        {"customer_id": "CUST-005", "name": "Petrov & Associates",       "risk_rating": 5},
        {"customer_id": "CUST-006", "name": "BlueSky Payments Ltd",      "risk_rating": 4},
        {"customer_id": "CUST-007", "name": "Shanghai Bridge Capital",   "risk_rating": 5},
        {"customer_id": "CUST-008", "name": "Atlantic Resources Corp",   "risk_rating": 2},
    ]
    customers = {}
    for cd in customers_data:
        existing = db.query(Customer).filter(Customer.customer_id == cd["customer_id"]).first()
        if not existing:
            c = Customer(**cd)
            db.add(c)
            db.flush()
            customers[cd["customer_id"]] = c
            print(f"  ✓ Customer: {cd['name']}")
        else:
            customers[cd["customer_id"]] = existing
    db.commit()
    return customers

# ── 3. Accounts & Transactions ────────────────────────────────────────────────
def seed_accounts_and_txns(customers):
    accounts = {}
    for i, (cid, cust) in enumerate(customers.items()):
        acc_id = f"ACC-{1000 + i}"
        existing = db.query(Account).filter(Account.account_id == acc_id).first()
        if not existing:
            acc = Account(
                account_id=acc_id, customer_id=cust.id,
                account_type=random.choice(["checking", "savings", "business"]),
                balance=random.uniform(5000, 500000)
            )
            db.add(acc)
            db.flush()
            accounts[cid] = acc

            # Add transactions
            for j in range(random.randint(8, 20)):
                txn = Transaction(
                    txn_id=f"TXN-{acc_id}-{j:03d}",
                    amount=random.uniform(500, 95000),
                    txn_type=random.choice(["wire_transfer", "cash_deposit", "ach", "check"]),
                    account_id=acc.id,
                    timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 90))
                )
                db.add(txn)
        else:
            accounts[cid] = existing
    db.commit()
    print(f"  ✓ Accounts & transactions seeded")
    return accounts

# ── 4. Cases ──────────────────────────────────────────────────────────────────
def seed_cases(customers, users):
    admin = users.get("admin")
    analyst = users.get("analyst1")

    cases_data = [
        {"case_ref": "CASE-2024-001", "title": "Suspicious Structuring Activity - Nexus Trading",         "customer": "CUST-001", "status": CaseStatus.closed},
        {"case_ref": "CASE-2024-002", "title": "Rapid Fund Layering via Offshore Entities",               "customer": "CUST-002", "status": CaseStatus.closed},
        {"case_ref": "CASE-2024-003", "title": "Cryptocurrency Mule Network - Meridian Holdings",         "customer": "CUST-003", "status": CaseStatus.in_review},
        {"case_ref": "CASE-2024-004", "title": "High-Risk Geographic Transfer Pattern",                   "customer": "CUST-005", "status": CaseStatus.closed},
        {"case_ref": "CASE-2024-005", "title": "Velocity Anomaly - BlueSky Payments",                     "customer": "CUST-006", "status": CaseStatus.closed},
        {"case_ref": "CASE-2024-006", "title": "Income Mismatch - Shanghai Bridge Capital",               "customer": "CUST-007", "status": CaseStatus.escalated},
        {"case_ref": "CASE-2024-007", "title": "Repeat Suspicious Filings - Alvarez Import & Export",    "customer": "CUST-002", "status": CaseStatus.closed},
        {"case_ref": "CASE-2024-008", "title": "Darknet Asset Conversion - Petrov & Associates",         "customer": "CUST-005", "status": CaseStatus.in_review},
        {"case_ref": "CASE-2024-009", "title": "Stablecoin Layering - Nexus Trading",                    "customer": "CUST-001", "status": CaseStatus.open},
        {"case_ref": "CASE-2024-010", "title": "NFT Wash Trading Scheme Detection",                       "customer": "CUST-003", "status": CaseStatus.open},
    ]
    cases = {}
    for cd in cases_data:
        existing = db.query(Case).filter(Case.case_ref == cd["case_ref"]).first()
        if not existing:
            cust = customers.get(cd["customer"])
            case = Case(
                case_ref=cd["case_ref"], title=cd["title"],
                customer_id=cust.id if cust else None,
                assigned_to=analyst.id,
                status=cd["status"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(2, 25)),
                description=f"Automated alert triggered for {cd['title']}. Under investigation per standard AML protocol."
            )
            db.add(case)
            db.flush()
            cases[cd["case_ref"]] = case
            print(f"  ✓ Case: {cd['case_ref']}")
        else:
            cases[cd["case_ref"]] = existing
    db.commit()
    return cases

# ── 5. SAR Reports ────────────────────────────────────────────────────────────
NARRATIVES = [
    "Subject entity Nexus Trading LLC executed 14 structured cash deposits below $10,000 threshold over a 30-day period, totalling $127,800. Pattern is consistent with known structuring typology designed to evade BSA reporting requirements. Account profile does not support legitimate business rationale for cash-intensive operations.",

    "Alvarez Import & Export initiated a complex series of wire transfers across 6 jurisdictions (Panama, BVI, Singapore, UAE, Cyprus, Cayman Islands) within 72 hours. Total layered amount: $2.3M. Beneficial ownership is obscured through shell company chain. No corresponding import/export activity identified.",

    "Meridian Holdings Group account received $450,000 in cryptocurrency converted from multiple Bitcoin wallets associated with darknet marketplace activity. Funds subsequently split across 12 sub-accounts. High-confidence mule network pattern detected. Blockchain analytics confirm mixer/tumbler usage.",

    "Subject account received 8 consecutive wire transfers from high-risk jurisdictions flagged on FATF grey list, totalling $890,000 over 45 days. Stated occupation as 'consultant' is inconsistent with income profile. Geographic risk score: 94/100.",

    "BlueSky Payments Ltd executed 247 micro-transactions averaging $380 each within a 5-day period — a 1,200% velocity increase over baseline. Pattern consistent with rapid funds cycling to obscure trail. No business activity on record to support transaction volume.",

    "Shanghai Bridge Capital customer declared annual income of $85,000; however, account received $1.4M in inbound wire transfers in Q3. Significant income mismatch raises concerns of undisclosed beneficial ownership or third-party funds placement.",

    "Petrov & Associates second SAR filing within 6 months. Previous SAR (CASE-2024-004) also involved high-risk geographic transfers. Repeat suspicious activity indicates potential systematic money laundering operation. Escalated to senior compliance review.",

    "Customer account exhibits stablecoin conversion patterns consistent with emerging DeFi-based layering typologies. $330,000 USDC converted from anonymous wallet, then distributed across 5 fiat off-ramps. Pattern matches FinCEN advisory FIN-2023-A001 on virtual asset laundering.",

    "NFT marketplace transactions identified as potential wash trading scheme. Same beneficial owner appears on both sides of 23 high-value NFT trades totalling $780,000. Artificial price inflation followed by rapid liquidation into fiat.",

    "Subject engaged in layered smurfing operation. Network of 8 associated accounts each depositing $9,500 cash simultaneously across different branch locations. Coordinated activity strongly suggests pre-arranged structuring ring.",
]

def seed_sars(cases, users):
    admin = users.get("admin")
    analyst = users.get("analyst1")

    sar_refs = [
        ("SAR-2024-001", "CASE-2024-001"),
        ("SAR-2024-002", "CASE-2024-002"),
        ("SAR-2024-003", "CASE-2024-003"),
        ("SAR-2024-004", "CASE-2024-004"),
        ("SAR-2024-005", "CASE-2024-005"),
        ("SAR-2024-006", "CASE-2024-006"),
        ("SAR-2024-007", "CASE-2024-007"),
        ("SAR-2024-008", "CASE-2024-008"),
        ("SAR-2024-009", "CASE-2024-009"),
        ("SAR-2024-010", "CASE-2024-010"),
    ]

    sars = {}
    for i, (sar_ref, case_ref) in enumerate(sar_refs):
        existing = db.query(SARReport).filter(SARReport.sar_ref == sar_ref).first()
        if not existing:
            case = cases.get(case_ref)
            if not case:
                continue
            sar = SARReport(
                sar_ref=sar_ref,
                case_id=case.id,
                created_by=analyst.id,
                narrative=NARRATIVES[i % len(NARRATIVES)],
                approved=case.status == CaseStatus.closed,
                created_at=case.created_at + timedelta(days=random.randint(0, 3)),
            )
            db.add(sar)
            db.flush()

            # CQI Score
            cqi = CQIScore(
                sar_id=sar.id,
                evidence_coverage=random.uniform(60, 95),
                completeness=random.uniform(65, 98),
                confidence=random.uniform(55, 90),
                traceability=random.uniform(70, 95),
                overall_score=random.uniform(65, 92),
            )
            db.add(cqi)

            sars[sar_ref] = sar
            print(f"  ✓ SAR: {sar_ref}")
        else:
            sars[sar_ref] = existing
    db.commit()
    return sars

# ── 6. Typology Detections ────────────────────────────────────────────────────
def seed_typologies(sars):
    typology_types = [
        "structuring", "layering", "velocity_anomaly",
        "income_mismatch", "geographic_risk", "counterparty_risk"
    ]
    severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    for sar_ref, sar in sars.items():
        existing = db.query(TypologyDetection).filter(TypologyDetection.sar_id == sar.id).first()
        if not existing:
            # Add 1-3 typology detections per SAR
            for _ in range(random.randint(1, 3)):
                det_type = random.choice(typology_types)
                severity = random.choice(severities)
                det = TypologyDetection(
                    sar_id=sar.id,
                    detection_type=det_type,
                    score=random.uniform(0.6, 0.99),
                    details=json.dumps({"severity": severity, "confidence": random.uniform(0.7, 0.99)}),
                    created_at=sar.created_at + timedelta(days=random.randint(0, 5)),
                )
                db.add(det)

    db.commit()
    print(f"  ✓ Typology detections seeded")

# ── Run ───────────────────────────────────────────────────────────────────────
try:
    users = seed_users()
    customers = seed_customers()
    seed_accounts_and_txns(customers)
    cases = seed_cases(customers, users)
    sars = seed_sars(cases, users)
    seed_typologies(sars)

    print("\n✅ Demo data seeded successfully!")
    print(f"   Users: {db.query(User).count()}")
    print(f"   Customers: {db.query(Customer).count()}")
    print(f"   Cases: {db.query(Case).count()}")
    print(f"   SARs: {db.query(SARReport).count()}")
    print(f"   Typology Detections: {db.query(TypologyDetection).count()}")
    print("\n🔑 Login credentials:")
    print("   admin / admin123")
    print("   analyst1 / analyst123")
    print("   auditor1 / auditor123")

except Exception as e:
    db.rollback()
    print(f"\n❌ Error: {e}")
    import traceback; traceback.print_exc()
    sys.exit(1)
finally:
    db.close()
