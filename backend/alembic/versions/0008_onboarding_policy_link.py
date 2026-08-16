"""link onboarding applications to issued policies

Revision ID: 0008_onboarding_policy_link
Revises: 0007_payments
Create Date: 2026-08-17
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0008_onboarding_policy_link"
down_revision: Union[str, None] = "0007_payments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "onboarding_applications",
        sa.Column("policy_id", sa.String(length=64), nullable=True),
    )
    op.create_index(
        op.f("ix_onboarding_applications_policy_id"), "onboarding_applications", ["policy_id"], unique=False
    )
    op.create_foreign_key(
        op.f("fk_onboarding_applications_policy_id_policies"),
        "onboarding_applications",
        "policies",
        ["policy_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        op.f("fk_onboarding_applications_policy_id_policies"), "onboarding_applications", type_="foreignkey"
    )
    op.drop_index(op.f("ix_onboarding_applications_policy_id"), table_name="onboarding_applications")
    op.drop_column("onboarding_applications", "policy_id")
