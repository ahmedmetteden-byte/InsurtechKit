"""add notifications table

Revision ID: 0006_notifications
Revises: 0005_onboarding_documents
Create Date: 2026-08-16
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0006_notifications"
down_revision: Union[str, None] = "0005_onboarding_documents"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("channel", sa.String(length=16), nullable=False),
        sa.Column("recipient", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("template_key", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("related_type", sa.String(length=64), nullable=False),
        sa.Column("related_id", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_notifications")),
    )
    op.create_index(op.f("ix_notifications_related_type"), "notifications", ["related_type"], unique=False)
    op.create_index(op.f("ix_notifications_related_id"), "notifications", ["related_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notifications_related_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_related_type"), table_name="notifications")
    op.drop_table("notifications")
