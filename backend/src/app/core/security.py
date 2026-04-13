import base64
import io
import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
import pyotp
import qrcode
from jose import JWTError, jwt

from app.core.config import settings


# --- Password ---


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# --- JWT ---


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_temp_token(user_id: str) -> str:
    """Short-lived token for 2FA verification flow."""
    return create_access_token(
        data={"sub": user_id, "type": "temp_2fa"},
        expires_delta=timedelta(minutes=settings.TEMP_TOKEN_EXPIRE_MINUTES),
    )


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises JWTError on failure."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def decode_temp_token(token: str) -> str:
    """Decode a temp 2FA token and return the user_id. Raises ValueError on invalid."""
    try:
        payload = decode_token(token)
    except JWTError as e:
        raise ValueError("Invalid or expired temporary token") from e
    if payload.get("type") != "temp_2fa":
        raise ValueError("Invalid token type")
    user_id = payload.get("sub")
    if not user_id:
        raise ValueError("Invalid token payload")
    return user_id


# --- TOTP (2FA) ---


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def generate_totp_uri(secret: str, email: str) -> str:
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=settings.APP_NAME)


def generate_qr_code_base64(uri: str) -> str:
    """Generate a QR code as base64-encoded PNG."""
    img = qrcode.make(uri)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


# --- Recovery Codes ---


def generate_recovery_codes(count: int = 8) -> list[str]:
    """Generate human-readable recovery codes (format: XXXX-XXXX)."""
    codes = []
    for _ in range(count):
        part1 = secrets.token_hex(2).upper()
        part2 = secrets.token_hex(2).upper()
        codes.append(f"{part1}-{part2}")
    return codes


def hash_recovery_code(code: str) -> str:
    normalized = code.upper().replace("-", "")
    return bcrypt.hashpw(normalized.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_recovery_code(code: str, hashed: str) -> bool:
    normalized = code.upper().replace("-", "")
    return bcrypt.checkpw(normalized.encode("utf-8"), hashed.encode("utf-8"))
