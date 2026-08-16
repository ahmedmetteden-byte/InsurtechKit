"""add payments table

Revision ID: 0007_payments
Revises: 0006_notifications
Create Date: 2026-08-17
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007_payments"
down_revision: Union[str, None] = "0006_notifications"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "payments",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("reference", sa.String(length=32), nullable=False),
        sa.Column("related_type", sa.String(length=64), nullable=False),
        sa.Column("related_id", sa.String(length=64), nullable=False),
        sa.Column("customer_id", sa.String(length=64), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False),
        sa.Column("method", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("paid_at", sa.String(length=64), nullable=False),
        sa.Column("receipt_number", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["customer_id"], ["customers.id"], name=op.f("fk_payments_customer_id_customers")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_payments")),
        sa.UniqueConstraint("reference", name=op.f("uq_payments_reference")),
    )
    op.create_index(op.f("ix_payments_reference"), "payments", ["reference"], unique=False)
    op.create_index(op.f("ix_payments_related_type"), "payments", ["related_type"], unique=False)
    op.create_index(op.f("ix_payments_related_id"), "payments", ["related_id"], unique=False)
    op.create_index(op.f("ix_payments_customer_id"), "payments", ["customer_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_payments_customer_id"), table_name="payments")
    op.drop_index(op.f("ix_payments_related_id"), table_name="payments")
    op.drop_index(op.f("ix_payments_related_type"), table_name="payments")
    op.drop_index(op.f("ix_payments_reference"), table_name="payments")
    op.drop_table("payments")
