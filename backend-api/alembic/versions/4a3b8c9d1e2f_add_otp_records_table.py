"""add otp_records table

Revision ID: 4a3b8c9d1e2f
Revises: 22770a2b5cac
Create Date: 2026-07-28 04:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a3b8c9d1e2f'
down_revision: Union[str, Sequence[str], None] = '22770a2b5cac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'otp_records',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('otp_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('failed_attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_otp_records_phone_number', 'otp_records', ['phone_number'], unique=False)
    op.create_index('ix_otp_records_phone_is_used', 'otp_records', ['phone_number', 'is_used'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_otp_records_phone_is_used', table_name='otp_records')
    op.drop_index('ix_otp_records_phone_number', table_name='otp_records')
    op.drop_table('otp_records')
