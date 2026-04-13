"""No-op audit service stub.

The original mh-sales-forecasting project persisted user and role actions to an
audit_log table. For the ethicLine skeleton we keep the call signatures so that
auth/users/roles endpoints remain untouched, but writes are dropped. Wire up a
real backing store in a later session if needed.
"""
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession


class _NoOpAuditService:
    async def log_user_action(
        self,
        db: AsyncSession,
        *,
        actor_id: Any,
        action: str,
        target: Any = None,
        details: dict | None = None,
    ) -> None:
        return None

    async def log_role_action(
        self,
        db: AsyncSession,
        *,
        actor_id: Any,
        action: str,
        target: Any = None,
        details: dict | None = None,
    ) -> None:
        return None


audit_service = _NoOpAuditService()
