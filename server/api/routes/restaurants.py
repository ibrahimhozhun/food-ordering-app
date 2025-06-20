from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from typing import List
from uuid import UUID
from server.db.models import Food, Restaurant
from server.db.schemas import (
    RestaurantPublic, FoodPublic,
    FoodCreate, RestaurantUpdate, RestaurantWithDetail,
)
from server.utils.auth import (
    get_session,
    authenticate_user,
)

router = APIRouter(prefix="/restaurants")


@router.get("/", response_model=List[RestaurantPublic])
def list_restaurants(session: Session = Depends(get_session)):
    """Retrieves a list of all restaurants available."""
    return session.exec(select(Restaurant)).all()


@router.get(
    "/me",
    response_model=RestaurantWithDetail
)
def read_own_restaurant(
    current: Restaurant = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    """Fetches the detailed profile of the currently authenticated restaurant."""
    session.refresh(current)
    return current


@router.get("/{restaurant_id}", response_model=RestaurantPublic)
def get_restaurant_details(restaurant_id: UUID, session: Session = Depends(get_session)):
    """Fetches the public details of a specific restaurant by its ID."""
    restaurant = session.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


@router.patch(
    "/me",
    response_model=RestaurantWithDetail
)
def update_own_restaurant(
    data: RestaurantUpdate,
    current: Restaurant = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    """
    Updates the profile of the currently authenticated restaurant.
    Accepts partial updates for fields like `restaurant_name` or `avg_wait_time`.
    """
    # Extract only the fields provided in the request body (exclude unset fields)
    upd = data.model_dump(exclude_unset=True)

    # Update the order object with new values
    for k, v in upd.items():
        setattr(current, k, v)

    # Save changes to the database
    session.commit()
    session.refresh(current)

    return current


@router.post(
    "/me/menu",
    status_code=201,
    response_model=FoodPublic
)
def add_menu_item(
    data: FoodCreate,
    current: Restaurant = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    """Adds a new food item to the authenticated restaurant's menu."""
    food = Food(**data.model_dump(), restaurant_id=current.id)
    session.add(food)
    session.commit()
    session.refresh(food)
    return food
