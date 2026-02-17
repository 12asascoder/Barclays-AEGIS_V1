#!/usr/bin/env python3
"""
Database management script for AEGIS backend
Usage:
  python manage.py migrate        # Run pending migrations
  python manage.py migrate:down   # Rollback last migration
  python manage.py seed           # Seed sample data
"""
import sys
import os
from subprocess import call

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))


def migrate():
    """Run alembic upgrade head"""
    return call(["alembic", "upgrade", "head"])


def migrate_down():
    """Rollback one migration"""
    return call(["alembic", "downgrade", "-1"])


def seed():
    """Seed sample data"""
    from app.db.session import get_session
    from app.models import User, Customer, Account, Transaction, Case
    from app.core.security import hash_password
    from datetime import datetime, timezone
    from sqlalchemy import select

    db = get_session()

    # Create admin user
    stmt = select(User).where(User.username == "admin")
    if not db.scalar(stmt):
        admin = User(
            username="admin",
            email="admin@aegis.local",
            full_name="System Administrator",
            hashed_password=hash_password("admin123"),
            role="admin",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(admin)
        print("Created admin user")
    else:
        admin = db.scalar(stmt)
        print("Admin user already exists")

    # Create analyst user
    stmt = select(User).where(User.username == "analyst1")
    if not db.scalar(stmt):
        analyst = User(
            username="analyst1",
            email="analyst1@aegis.local",
            full_name="Jane Analyst",
            hashed_password=hash_password("analyst123"),
            role="analyst",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(analyst)
        print("Created analyst user")
    else:
        analyst = db.scalar(stmt)
        print("Analyst user already exists")

    # Create sample customer
    stmt = select(Customer).where(Customer.customer_id == "CUST-001")
    if not db.scalar(stmt):
        customer = Customer(
            customer_id="CUST-001",
            name="Acme Corporation",
            risk_rating=4,
            kyc="High-risk customer with complex structure",
            created_at=datetime.now(timezone.utc)
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        print("Created sample customer")
    else:
        customer = db.scalar(stmt)
        print("Customer already exists")

    # Create sample account
    stmt = select(Account).where(Account.account_id == "ACC-001-001")
    if not db.scalar(stmt):
        account = Account(
            account_id="ACC-001-001",
            customer_id=customer.id,
            account_type="business_checking",
            balance=250000.00,
            created_at=datetime.now(timezone.utc)
        )
        db.add(account)
        db.commit()
        db.refresh(account)
        print("Created sample account")
    else:
        account = db.scalar(stmt)
        print("Account already exists")

    # Create sample transactions
    # Check if transactions exist for this account
    stmt = select(Transaction).where(Transaction.account_id == account.id)
    if not db.scalar(stmt):
        transactions = [
            Transaction(
                txn_id=f"TXN-{i:05d}",
                amount=9500.00,
                txn_type="wire_out",
                account_id=account.id,
                timestamp=datetime.now(timezone.utc),
                metadata={"pattern": "Structured transaction pattern"}
            )
            for i in range(1, 6)
        ]
        db.add_all(transactions)
        print("Created sample transactions")
    else:
        print("Transactions already exist")

    # Create sample case
    stmt = select(Case).where(Case.case_ref == "CASE-2026-001")
    if not db.scalar(stmt):
        case = Case(
            case_ref="CASE-2026-001",
            title="Suspicious Structuring Activity - Acme Corp",
            description="Multiple transactions just below reporting threshold detected",
            customer_id=customer.id,
            assigned_to=analyst.id,
            status="assigned",
            created_at=datetime.now(timezone.utc)
        )
        db.add(case)
        print("Created sample case")
    else:
        print("Case already exists")

    db.commit()
    print("✅ Sample data seeded successfully")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "migrate":
        sys.exit(migrate())
    elif cmd == "migrate:down":
        sys.exit(migrate_down())
    elif cmd == "seed":
        sys.exit(seed())
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
        sys.exit(1)
