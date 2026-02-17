"""Initial migration - create all tables

Revision ID: 001
Revises: 
Create Date: 2026-02-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('full_name', sa.String(length=200), nullable=True),
        sa.Column('email', sa.String(length=200), nullable=False),
        sa.Column('hashed_password', sa.String(length=512), nullable=False),
        sa.Column('role', sa.Enum('analyst', 'admin', 'auditor', name='roleenum'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create customers table
    op.create_table(
        'customers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('risk_rating', sa.Integer(), nullable=True),
        sa.Column('kyc', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_customers_customer_id'), 'customers', ['customer_id'], unique=True)
    op.create_index(op.f('ix_customers_id'), 'customers', ['id'], unique=False)

    # Create accounts table
    op.create_table(
        'accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.String(length=100), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('account_type', sa.String(length=50), nullable=True),
        sa.Column('balance', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_accounts_account_id'), 'accounts', ['account_id'], unique=True)
    op.create_index(op.f('ix_accounts_id'), 'accounts', ['id'], unique=False)

    # Create transactions table
    op.create_table(
        'transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('txn_id', sa.String(length=150), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('txn_type', sa.String(length=50), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('meta_data', sa.Text(), nullable=True),  # Renamed from 'metadata'
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
    op.create_index(op.f('ix_transactions_txn_id'), 'transactions', ['txn_id'], unique=True)

    # Create cases table
    op.create_table(
        'cases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('case_ref', sa.String(length=150), nullable=False),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('assigned_to', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('open', 'assigned', 'in_review', 'closed', 'escalated', name='casestatus'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cases_case_ref'), 'cases', ['case_ref'], unique=True)
    op.create_index(op.f('ix_cases_id'), 'cases', ['id'], unique=False)

    # Create sar_reports table
    op.create_table(
        'sar_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sar_ref', sa.String(length=150), nullable=False),
        sa.Column('case_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('narrative', sa.Text(), nullable=True),
        sa.Column('approved', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sar_reports_id'), 'sar_reports', ['id'], unique=False)
    op.create_index(op.f('ix_sar_reports_sar_ref'), 'sar_reports', ['sar_ref'], unique=True)

    # Create cqi_scores table
    op.create_table(
        'cqi_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sar_id', sa.Integer(), nullable=False),
        sa.Column('evidence_coverage', sa.Float(), nullable=True),
        sa.Column('completeness', sa.Float(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('traceability', sa.Float(), nullable=True),
        sa.Column('overall_score', sa.Float(), nullable=True),
        sa.Column('calculated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['sar_id'], ['sar_reports.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sar_id')
    )
    op.create_index(op.f('ix_cqi_scores_id'), 'cqi_scores', ['id'], unique=False)

    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=200), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=True),
        sa.Column('entity_id', sa.String(length=100), nullable=True),
        sa.Column('metadata', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)

    # Create typology_detections table
    op.create_table(
        'typology_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sar_id', sa.Integer(), nullable=True),
        sa.Column('detection_type', sa.String(length=100), nullable=False),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['sar_id'], ['sar_reports.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_typology_detections_id'), 'typology_detections', ['id'], unique=False)

    # Create ai_invocations table
    op.create_table(
        'ai_invocations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('sar_id', sa.Integer(), nullable=True),
        sa.Column('prompt', sa.Text(), nullable=True),
        sa.Column('response', sa.Text(), nullable=True),
        sa.Column('model', sa.String(length=100), nullable=True),
        sa.Column('tokens', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['sar_id'], ['sar_reports.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_invocations_id'), 'ai_invocations', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_invocations_id'), table_name='ai_invocations')
    op.drop_table('ai_invocations')
    op.drop_index(op.f('ix_typology_detections_id'), table_name='typology_detections')
    op.drop_table('typology_detections')
    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_table('audit_logs')
    op.drop_index(op.f('ix_cqi_scores_id'), table_name='cqi_scores')
    op.drop_table('cqi_scores')
    op.drop_index(op.f('ix_sar_reports_sar_ref'), table_name='sar_reports')
    op.drop_index(op.f('ix_sar_reports_id'), table_name='sar_reports')
    op.drop_table('sar_reports')
    op.drop_index(op.f('ix_cases_id'), table_name='cases')
    op.drop_index(op.f('ix_cases_case_ref'), table_name='cases')
    op.drop_table('cases')
    op.drop_index(op.f('ix_transactions_txn_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_table('transactions')
    op.drop_index(op.f('ix_accounts_id'), table_name='accounts')
    op.drop_index(op.f('ix_accounts_account_id'), table_name='accounts')
    op.drop_table('accounts')
    op.drop_index(op.f('ix_customers_id'), table_name='customers')
    op.drop_index(op.f('ix_customers_customer_id'), table_name='customers')
    op.drop_table('customers')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
