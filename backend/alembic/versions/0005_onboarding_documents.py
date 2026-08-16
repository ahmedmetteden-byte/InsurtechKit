"""add onboarding_documents table

Revision ID: 0005_onboarding_documents
Revises: 0004_onboarding_customer_link
Create Date: 2026-08-16
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_onboarding_documents"
down_revision: Union[str, None] = "0004_onboarding_customer_link"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "onboarding_documents",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("application_id", sa.String(length=64), nullable=False),
        sa.Column("document_type", sa.String(length=32), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=128), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("storage_path", sa.String(length=512), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["application_id"],
            ["onboarding_applications.id"],
            name=op.f("fk_onboarding_documents_application_id_onboarding_applications"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_onboarding_documents")),
    )
    op.create_index(
        op.f("ix_onboarding_documents_application_id"), "onboarding_documents", ["application_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_onboarding_documents_application_id"), table_name="onboarding_documents")
    op.drop_table("onboarding_documents")
