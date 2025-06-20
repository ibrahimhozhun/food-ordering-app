from fastapi import Response
from datetime import datetime, timedelta
from server.config import ACCESS_TOKEN_EXPIRE_DAYS


def set_auth_cookie(response: Response, token: str) -> None:
    """Set the authentication cookie with the JWT token."""
    expires = datetime.now() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,  # Prevents JavaScript access
        secure=True,    # Only sent over HTTPS
        samesite="none",  # Protects against CSRF
        expires=expires.timestamp(),
        path="/"        # Cookie is valid for all paths
    )


def delete_auth_cookie(response: Response) -> None:
    """Delete the authentication cookie."""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="none",
        path="/"
    )
