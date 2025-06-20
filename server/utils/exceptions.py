from fastapi import HTTPException, status

incorrect_email_or_password = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect email or password"
)

invalid_credentials = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid authentication credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

unauthorized = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="You are not authorized to perform this action"
)

validation_error = HTTPException(
    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    detail="Invalid data"
)

order_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Order not found"
)

user_not_found = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not found"
)
