"""link onboarding applications to converted customers

Revision ID: 0004_onboarding_customer_link
Revises: 0003_onboarding
Create Date: 2026-08-16
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004_onboarding_customer_link"
down_revision: Union[str, None] = "0003_onboarding"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "onboarding_applications",
        sa.Column("customer_id", sa.String(length=64), nullable=True),
    )
    op.create_index(
        op.f("ix_onboarding_applications_customer_id"), "onboarding_applications", ["customer_id"], unique=False
    )
    op.create_foreign_key(
        op.f("fk_onboarding_applications_customer_id_customers"),
        "onboarding_applications",
        "customers",
        ["customer_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        op.f("fk_onboarding_applications_customer_id_customers"), "onboarding_applications", type_="foreignkey"
    )
    op.drop_index(op.f("ix_onboarding_applications_customer_id"), table_name="onboarding_applications")
    op.drop_column("onboarding_applications", "customer_id")
