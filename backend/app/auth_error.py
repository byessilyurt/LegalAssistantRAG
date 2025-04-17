from fastapi import Request, status
from fastapi.responses import JSONResponse

# Auth0 specific error codes
class AuthError:
    """Auth0 Error handling"""
    
    @staticmethod
    async def token_expired(request: Request, exc: Exception):
        """Handle expired token error"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "token_expired",
                "message": "Token has expired",
                "detail": str(exc)
            }
        )
    
    @staticmethod
    async def invalid_claims(request: Request, exc: Exception):
        """Handle invalid claims error"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "invalid_claims",
                "message": "Invalid token claims",
                "detail": str(exc)
            }
        )
    
    @staticmethod
    async def invalid_signature(request: Request, exc: Exception):
        """Handle invalid signature error"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "invalid_signature",
                "message": "Invalid token signature",
                "detail": str(exc)
            }
        )
    
    @staticmethod
    async def invalid_token(request: Request, exc: Exception):
        """Handle general invalid token error"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "invalid_token",
                "message": "Invalid authentication token",
                "detail": str(exc)
            }
        )
    
    @staticmethod
    async def unauthorized(request: Request, exc: Exception):
        """Handle unauthorized error"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "unauthorized",
                "message": "Authentication required",
                "detail": str(exc)
            }
        )
        
    @staticmethod
    async def forbidden(request: Request, exc: Exception):
        """Handle forbidden error"""
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "error": "forbidden",
                "message": "Access forbidden",
                "detail": str(exc)
            }
        ) 