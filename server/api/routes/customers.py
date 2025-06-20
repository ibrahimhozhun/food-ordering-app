from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from uuid import UUID
from server.db.models import Customer, CustomerRestaurantLink, Restaurant
from server.db.schemas import (
    CustomerPublic, LikedRestaurantUpdate,
)
from server.db.session import get_session
from server.utils.auth import authenticate_user
from server.utils.exceptions import user_not_found

router = APIRouter(prefix="/customers")


@router.patch("/me/liked-restaurants", response_model=CustomerPublic)
def toggle_like_restaurant(
    update_data: LikedRestaurantUpdate,
    current_customer: Customer = Depends(authenticate_user),
    session: Session = Depends(get_session),
):
    """
    Toggles the liked status of a restaurant for the current customer.
    If the restaurant is already liked, it will be unliked.
    If it's not liked, it will be added to the liked list.
    """
    restaurant = session.get(Restaurant, update_data.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if the restaurant is already in the liked list
    if restaurant in current_customer.liked_restaurants:
        current_customer.liked_restaurants.remove(restaurant)
    else:
        current_customer.liked_restaurants.append(restaurant)

    session.add(current_customer)
    session.commit()
    session.refresh(current_customer)

    return current_customer


@router.get(
    "/me",
    response_model=CustomerPublic
)
def read_own_profile(
    current: Customer = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    """Fetches the profile of the currently authenticated customer."""
    session.refresh(current)
    return current


@router.get("/{customer_id}", response_model=CustomerPublic)
def get_customer_details(
    customer_id: UUID,
    # This ensures only authenticated restaurants can access this endpoint
    current_restaurant: Restaurant = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    """Fetches the details of a specific customer by their ID."""
    customer = session.get(Customer, customer_id)
    if not customer:
        raise user_not_found
    return customer


@router.get("/", response_model=list[CustomerPublic])
def get_all_customers(session: Session = Depends(get_session)):
    """Retrieves a list of all customers. Note: No authentication required."""
    customers = session.exec(select(Customer)).all()
    return customers
