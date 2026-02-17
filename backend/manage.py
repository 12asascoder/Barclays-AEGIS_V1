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
    from datetime import datetime
    
    db = get_session()
    
    # Create admin user
    admin = User(
        username="admin",
        email="admin@aegis.local",
        full_name="System Administrator",
        hashed_password=hash_password("admin123"),
        role="admin",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(admin)
    
    # Create analyst user
    analyst = User(
        username="analyst1",
        email="analyst1@aegis.local",
        full_name="Jane Analyst",
        hashed_password=hash_password("analyst123"),
        role="analyst",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(analyst)
    
    # Create sample customer
    customer = Customer(
        customer_id="CUST-001",
        name="Acme Corporation",
        risk_rating=4,
        kyc="High-risk customer with complex structure",
        created_at=datetime.utcnow()
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    
    # Create sample account
    account = Account(
        account_id="ACC-001-001",
        customer_id=customer.id,
        account_type="business_checking",
        balance=250000.00,
        created_at=datetime.utcnow()
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    
    # Create sample transactions
    transactions = [
        Transaction(txn_id=f"TXN-{i:05d}", amount=9500.00, txn_type="wire_out", account_id=account.id, timestamp=datetime.utcnow(), metadata="Structured transaction pattern")
        for i in range(1, 6)
    ]
    for t in transactions:
        db.add(t)
    
    # Create sample case
    case = Case(
        case_ref="CASE-2026-001",
        title="Suspicious Structuring Activity - Acme Corp",
        description="Multiple transactions just below reporting threshold detected",
        customer_id=customer.id,
        assigned_to=analyst.id,
        status="assigned",
        created_at=datetime.utcnow()
    )
    db.add(case)
    
    db.commit()
    db.remove()
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
