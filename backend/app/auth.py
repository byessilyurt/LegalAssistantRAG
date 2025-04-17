import os
import json
from typing import Optional, List, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Auth0 Configuration
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]

# JWT token security scheme
security = HTTPBearer()

class VerifyTokenError(Exception):
    """Exception raised when token verification fails"""
    pass

# User model for decoded JWT token information
class User(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

# Function to get the JWKS (JSON Web Key Set) from Auth0
async def get_jwks():
    import httpx
    url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Function to verify the JWT token
async def verify_token(token: str) -> Dict:
    try:
        jwks = await get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        
        # Find the matching key in the JWKS
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise VerifyTokenError("Unable to find appropriate key")
        
        # Verify the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        
        return payload
    
    except jwt.ExpiredSignatureError:
        raise VerifyTokenError("Token is expired")
    except jwt.JWTClaimsError:
        raise VerifyTokenError("Incorrect claims: check audience and issuer")
    except Exception as e:
        raise VerifyTokenError(f"Unable to parse authentication token: {str(e)}")

# Dependency to get the current user from the token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = await verify_token(token)
        
        # Extract user information from the token
        user_id = payload.get("sub", "")
        user = User(
            id=user_id,
            email=payload.get("email", ""),
            name=payload.get("name", ""),
            picture=payload.get("picture", "")
        )
        
        return user
    
    except VerifyTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

# Optional dependency for endpoints that can work with or without authentication
async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None 