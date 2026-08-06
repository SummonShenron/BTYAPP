import logging
import os
import jwt
from dotenv import load_dotenv
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient

load_dotenv()

security = HTTPBearer(auto_error=False)
logger = logging.getLogger("BTY Logger")

# Clerk JWKS endpoint (replace with your Clerk frontend API domain)
# Example: "https://your-app.clerk.accounts.dev/.well-known/jwks.json"
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "https://<your-clerk-domain>/.well-known/jwks.json")

DEFAULT_ADMIN_EMAILS = [
    "jackharper0517@outlook.com",
    "jackharper0517@gmail.com",
    "madspear9@gmail.com",
]

# Fallback ID observed in production logs to prevent lockout if ADMIN_USER_IDS is missing.
# Prefer setting ADMIN_USER_IDS in the deployment environment.
DEFAULT_ADMIN_USER_IDS = ["user_3HTW1PdzsTodTAbiyDSf9hLewTQ"]


def _parse_csv_env(env_name: str, fallback_values: list[str]) -> list[str]:
    raw_value = os.getenv(env_name, "")
    if not raw_value.strip():
        return fallback_values
    return [value.strip() for value in raw_value.split(",") if value.strip()]


ADMIN_EMAILS = [email.lower() for email in _parse_csv_env("ADMIN_EMAILS", DEFAULT_ADMIN_EMAILS)]
ADMIN_USER_IDS = _parse_csv_env("ADMIN_USER_IDS", DEFAULT_ADMIN_USER_IDS)


def _extract_user_email(user: dict) -> str | None:
    """Pull a usable email address from common Clerk JWT claim shapes."""
    email = user.get("email")
    if isinstance(email, str) and email:
        return email

    primary_email = user.get("primary_email_address")
    if isinstance(primary_email, str) and primary_email:
        return primary_email

    if isinstance(primary_email, dict):
        nested_email = primary_email.get("email_address") or primary_email.get("email")
        if isinstance(nested_email, str) and nested_email:
            return nested_email

    email_addresses = user.get("email_addresses")
    if isinstance(email_addresses, list):
        for address in email_addresses:
            if isinstance(address, str) and address:
                return address
            if isinstance(address, dict):
                candidate = address.get("email_address") or address.get("email")
                if isinstance(candidate, str) and candidate:
                    return candidate

    return None

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Returns user payload if logged in, or None if browsing as guest."""
    if not credentials:
        return None
    try:
        # Securely verify token signature using Clerk's JWKS
        jwks_client = PyJWKClient(CLERK_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(credentials.credentials)
        
        payload = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload
    except Exception as e:
        return None

async def get_current_client(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Requires valid login."""
    user = await get_optional_user(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please sign in to access this resource."
        )
    return user

async def verify_admin(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Ensures the authenticated user is an authorized admin via email or Clerk user ID allowlist."""
    user = await get_current_client(credentials)
    
    # Extract email from Clerk JWT payload (handles different claim formats)
    user_email = _extract_user_email(user)
    user_id = user.get("sub")
    normalized_email = user_email.lower() if isinstance(user_email, str) else None
    
    # Log the resolved identity so admin access failures are easier to debug.
    # Avoid logging the full token payload.
    logger.info("verify_admin resolved email=%s user_id=%s", normalized_email, user_id)
    
    # Check against the strict admin allowlists
    if normalized_email not in ADMIN_EMAILS and user_id not in ADMIN_USER_IDS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
        
    return user