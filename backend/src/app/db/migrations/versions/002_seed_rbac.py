"""Seed RBAC roles, permissions, and admin user.

Revision ID: 002_seed_rbac
Revises: 001_initial
Create Date: 2026-04-13
"""
import uuid
from typing import Sequence, Union

import bcrypt
from alembic import op
from sqlalchemy import text

revision: str = "002_seed_rbac"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # --- Roles ---
    conn.execute(
        text(
            "INSERT INTO roles (key, name, description, created_at) VALUES "
            "('admin', 'Administrator', 'Voller Systemzugriff', NOW()), "
            "('user', 'Benutzer', 'Lesender Standardzugriff', NOW())"
        )
    )

    # --- Permissions (minimaler Start-Satz für ethicLine) ---
    permissions = [
        ("dashboard:read", "dashboard", "Dashboard einsehen"),
        ("users:manage:read", "users", "Benutzer einsehen"),
        ("users:manage:write", "users", "Benutzer anlegen und bearbeiten"),
        ("roles:manage:read", "roles", "Rollen einsehen"),
        ("roles:manage:write", "roles", "Rollen anlegen und bearbeiten"),
        ("settings:system:read", "settings", "Systemeinstellungen einsehen"),
        ("settings:system:write", "settings", "Systemeinstellungen ändern"),
    ]

    for name, category, description in permissions:
        conn.execute(
            text("INSERT INTO permissions (name, category, description) VALUES (:name, :cat, :desc)"),
            {"name": name, "cat": category, "desc": description},
        )

    # admin bekommt alle Permissions
    conn.execute(
        text(
            "INSERT INTO role_permissions (role_id, permission_id) "
            "SELECT r.id, p.id FROM roles r CROSS JOIN permissions p "
            "WHERE r.key = 'admin'"
        )
    )

    # user bekommt nur dashboard:read
    conn.execute(
        text(
            "INSERT INTO role_permissions (role_id, permission_id) "
            "SELECT r.id, p.id FROM roles r, permissions p "
            "WHERE r.key = 'user' AND p.name = 'dashboard:read'"
        )
    )

    # --- Admin User ---
    hashed = bcrypt.hashpw(b"AmarokLove997", bcrypt.gensalt()).decode("utf-8")
    admin_id = str(uuid.uuid4())

    conn.execute(
        text(
            "INSERT INTO users "
            "(id, email, hashed_password, full_name, status, is_active, totp_enabled, created_at, updated_at) "
            "VALUES (:id, :email, :pw, :name, 'active', true, false, NOW(), NOW())"
        ),
        {
            "id": admin_id,
            "email": "marcel.bosse@compleneo.de",
            "pw": hashed,
            "name": "Marcel Bosse",
        },
    )

    conn.execute(
        text("INSERT INTO user_roles (user_id, role_id) SELECT :uid, id FROM roles WHERE key = 'admin'"),
        {"uid": admin_id},
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(text("DELETE FROM user_roles"))
    conn.execute(text("DELETE FROM role_permissions"))
    conn.execute(text("DELETE FROM recovery_codes"))
    conn.execute(text("DELETE FROM users"))
    conn.execute(text("DELETE FROM permissions"))
    conn.execute(text("DELETE FROM roles"))
