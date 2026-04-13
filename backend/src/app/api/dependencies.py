from typing import Annotated
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.engine import get_db as _get_db
from app.models.user import User
from app.crud.crud_users import crud_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=True)


async def get_db():
    async for session in _get_db():
        yield session


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: str | None = payload.get("sub")
        token_type: str | None = payload.get("type")
        if user_id is None or token_type == "temp_2fa":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await crud_user.get_with_roles(db, uuid.UUID(user_id))
    if user is None or not user.is_active:
        raise credentials_exception
    return user


# Type aliases for cleaner endpoint signatures
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
