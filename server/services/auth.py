from server.db.models import Customer, Restaurant
from sqlmodel import Session
from server.db.schemas import (
    SigninData, UserCreate, UserType
)
from server.utils.auth import (
    create_access_token, get_user_by_email,
    hash_password, verify_password,
    model_map, schema_map
)
from server.utils.exceptions import incorrect_email_or_password, validation_error


def signup_user(data: UserCreate, user_role: UserType, session: Session):
    """
    Creates a new user, hashes their password, and stores them in the database.

    Args:
        data: The user creation data, validated by Pydantic.
        user_role: The role of the user, either 'CUSTOMER' or 'RESTAURANT'.
        session: The database session dependency.

    Returns:
        A dictionary containing the access token and the newly created user's public data.
        The access token is intended to be set in an HttpOnly cookie by the calling route.
    """
    # If the user role is 'restaurant', a restaurant_name must be provided.
    # This check ensures that the required field for the Restaurant model is not missing,
    # as failing to include it would raise a database integrity error.
    if user_role == UserType.restaurant.value and not data.restaurant_name:
        raise validation_error

    # Prepare user data, adding restaurant_name only if the role is 'restaurant'.
    user_data = {
        "username": data.username,
        "email": data.email,
        "password": hash_password(data.password),
    }
    if user_role == UserType.restaurant.value:
        user_data["restaurant_name"] = data.restaurant_name

    # Create a new user instance (Customer or Restaurant) using the provided role
    user = model_map[user_role](**user_data)

    # Add new user to the database
    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate a JWT access token for the new user
    token = create_access_token(user_id=user.id, role=user_role)

    # Return the access token along with the user data
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": schema_map[user_role].model_validate(user)
    }


def signin_user(data: SigninData, user_role: UserType, session: Session):
    """
    Authenticates a user by verifying their email and password.

    Args:
        data: The user sign-in data (email and password).
        user_role: The role the user is attempting to sign in as.
        session: The database session dependency.

    Returns:
        A dictionary containing the access token and the user's public data upon success.
        The access token is intended to be set in an HttpOnly cookie by the calling route.

    Raises:
        HTTPException: If the user is not found or the password is incorrect.
    """
    # Get user from database by given email and role
    user = get_user_by_email(
        session=session, email=data.email, model=model_map.get(user_role.value))

    # If user exists, verify the provided password against the stored hash
    if user and verify_password(plain_password=data.password, hashed_password=user.password):
        # Generate JWT access token upon successful authentication
        token = create_access_token(user_id=user.id, role=user_role)

        # Return access token and user data (based on role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": schema_map[user_role].model_validate(user)
        }

    # Raise exception if user not found or password is incorrect
    raise incorrect_email_or_password
