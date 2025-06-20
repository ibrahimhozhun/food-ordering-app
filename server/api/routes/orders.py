from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID

from server.db.schemas import OrderCreate, OrderPublic, OrderUpdate
from server.db.models import Customer, Order, Restaurant
from server.utils.exceptions import order_not_found, unauthorized
from server.utils.auth import authenticate_user
from server.db.session import get_session


router = APIRouter(prefix="/orders")


@router.get(
    "/{order_id}",
    response_model=OrderPublic
)
def get_order(
    order_id: UUID,
    current: Customer | Restaurant = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    order = session.get(Order, order_id)

    # Validate that the order exists
    if not order:
        raise order_not_found

    # Check if the current user is authorized to view the order
    is_customer = isinstance(
        current, Customer) and current.id == order.customer_id
    is_restaurant = isinstance(
        current, Restaurant) and current.id == order.restaurant_id

    if not (is_customer or is_restaurant):
        raise unauthorized

    return order


@router.post(
    "/new-order",
    status_code=201,
    response_model=OrderPublic
)
def create_order(
    data: OrderCreate,
    current: Customer = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    order = Order(**data.model_dump())
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.patch(
    "/{order_id}/status",
    response_model=OrderPublic
)
def update_order_status(
    order_id: UUID,
    data: OrderUpdate,
    current: Restaurant = Depends(authenticate_user),
    session: Session = Depends(get_session)
):
    # Fetch the order by ID
    order = session.get(Order, order_id)

    # If the order does not exist or does not belong to the current restaurant,
    # raise an error. This also prevents customers from accessing this route,
    # since their id's will not match
    if not order or order.restaurant_id != current.id:
        raise order_not_found

    # Extract only the fields provided in the request body (exclude unset fields)
    upd = data.model_dump(exclude_unset=True)

    # Update the order object with new values
    for k, v in upd.items():
        setattr(order, k, v)

    # Save changes to the database
    session.commit()
    session.refresh(order)

    # Return updated order
    return order
