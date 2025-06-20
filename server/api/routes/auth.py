from fastapi import APIRouter, Depends, Response
from server.db.models import Customer, Restaurant
from server.utils.auth import authenticate_user
from sqlmodel import Session

from server.db.schemas import UserCreate, UserType, UserWithToken, SigninData, CustomerPublic, RestaurantWithDetail, RestaurantPublic
from server.db.session import get_session
from server.services.auth import signin_user, signup_user
from server.utils.cookies import set_auth_cookie, delete_auth_cookie


router = APIRouter(prefix="/auth")


@router.post("/signup/{user_role}", response_model=CustomerPublic | RestaurantPublic)
def signup(user_role: UserType, data: UserCreate, response: Response, session: Session = Depends(get_session)):
    """
    Signs up a new user and sets an HttpOnly auth cookie.
    The access token is NOT returned in the response body.
    """
    result = signup_user(data=data, user_role=user_role, session=session)
    set_auth_cookie(response, result["access_token"])
    return result["user"]


@router.post("/signin/{user_role}", response_model=CustomerPublic | RestaurantPublic)
def signin(user_role: UserType, data: SigninData, response: Response, session: Session = Depends(get_session)):
    """
    Signs in an existing user and sets an HttpOnly auth cookie.
    The access token is NOT returned in the response body.
    """
    result = signin_user(data=data, user_role=user_role, session=session)
    set_auth_cookie(response, result["access_token"])
    return result["user"]


@router.post("/signout")
def signout(response: Response):
    """Signs out the current user by deleting the auth cookie."""
    delete_auth_cookie(response)
    return {"message": "Successfully signed out"}


@router.get("/me", response_model=CustomerPublic | RestaurantWithDetail)
async def get_current_user(current_user: Customer | Restaurant = Depends(authenticate_user)):
    """Get the current authenticated user's information."""
    return current_user
