"""add onboarding_applications table

Revision ID: 0003_onboarding
Revises: 0002_auth
Create Date: 2026-08-16
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_onboarding"
down_revision: Union[str, None] = "0002_auth"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "onboarding_applications",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("reference", sa.String(length=32), nullable=False),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("applicant_first_name", sa.String(length=128), nullable=False),
        sa.Column("applicant_last_name", sa.String(length=128), nullable=False),
        sa.Column("applicant_email", sa.String(length=255), nullable=False),
        sa.Column("applicant_phone", sa.String(length=64), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("consent", sa.Boolean(), nullable=False),
        sa.Column("consent_at", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("review_notes", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"], ["products.id"], name=op.f("fk_onboarding_applications_product_id_products")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_onboarding_applications")),
        sa.UniqueConstraint("reference", name=op.f("uq_onboarding_applications_reference")),
    )
    op.create_index(
        op.f("ix_onboarding_applications_reference"), "onboarding_applications", ["reference"], unique=False
    )
    op.create_index(
        op.f("ix_onboarding_applications_product_id"), "onboarding_applications", ["product_id"], unique=False
    )
    op.create_index(
        op.f("ix_onboarding_applications_applicant_email"),
        "onboarding_applications",
        ["applicant_email"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_onboarding_applications_applicant_email"), table_name="onboarding_applications")
    op.drop_index(op.f("ix_onboarding_applications_product_id"), table_name="onboarding_applications")
    op.drop_index(op.f("ix_onboarding_applications_reference"), table_name="onboarding_applications")
    op.drop_table("onboarding_applications")
