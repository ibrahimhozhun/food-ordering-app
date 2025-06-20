from fastapi import Depends, Cookie, Request
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from sqlmodel import Session, select
from uuid import UUID
import jwt
from .exceptions import invalid_credentials, user_not_found

from server.db.models import Restaurant, Customer
from server.db.schemas import CustomerPublic, RestaurantWithDetail, UserType
from server.config import ACCESS_TOKEN_EXPIRE_DAYS, ALGORITHM, JWT_SECRET
from server.db.session import get_session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Use mapping dictionaries instead of if-else blocks or ternary operators for cleaner role-based logic
model_map = {
    UserType.customer: Customer,
    UserType.restaurant: Restaurant,
}

schema_map = {
    UserType.customer: CustomerPublic,
    UserType.restaurant: RestaurantWithDetail,
}


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: UUID, role: str) -> str:
    expire = datetime.now() + (timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str):
    try:
        # Decode JWT token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        # Get user's id and user's role from token
        user_id: UUID = UUID(payload.get("sub"))
        role: str = payload.get("role")

        if user_id is None or role is None:
            raise invalid_credentials

        return user_id, role
    except InvalidTokenError:
        raise invalid_credentials


async def authenticate_user(
    request: Request,
    token: str | None = Cookie(default=None, alias="access_token"),
    session: Session = Depends(get_session),
) -> Customer | Restaurant:
    if not token:
        raise invalid_credentials

    user_id, role = decode_token(token=token)

    try:
        # Get user from database
        user = session.get(model_map.get(role), user_id)

        if user is None:
            raise invalid_credentials
    except Exception as e:
        print(e)
        raise invalid_credentials

    return user


def get_user_by_email(session: Session, email: str, model: Customer | Restaurant):
    """
    Retrieve a user from the database using their email and model.

    Args:
        session (Session): SQLModel session for database interaction.
        email (str): Email address of the user to retrieve.
        model (Customer | Restaurant): The model to search (e.g., Customer or Restaurant).

    Returns:
        model instance: The found user instance.

    Raises:
        HTTPException: 404 error if no user is found.
    """
    # Execute a SELECT query to retrieve the user with the specified email.
    user = session.exec(select(model).where(model.email == email)).first()

    # Raise a 404 error if the user is not found in the database.
    if not user:
        raise user_not_found

    return user
