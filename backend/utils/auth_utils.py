import os
import jwt
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient

security = HTTPBearer(auto_error=False)

# Clerk JWKS endpoint (replace with your Clerk frontend API domain)
# Example: "https://your-app.clerk.accounts.dev/.well-known/jwks.json"
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "https://<your-clerk-domain>/.well-known/jwks.json")

# Explicit admin email allowlist
ADMIN_EMAILS = ["jackharper0517@outlook.com", "jackharper0517@gmail.com", "madspear9@gmail.com"]

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
    """Ensures the authenticated user is an authorized admin via email allowlist."""
    user = await get_current_client(credentials)
    
    # Extract email from Clerk JWT payload (handles different claim formats)
    user_email = user.get("email") or user.get("primary_email_address") or user.get("sub")
    
    # Check against the strict admin allowlist
    if user_email not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
        
    return user