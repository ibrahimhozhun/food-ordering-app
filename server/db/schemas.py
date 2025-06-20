from datetime import datetime
from enum import Enum
import re
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
from sqlmodel import SQLModel


class UserCreate(SQLModel):
    username: str
    email: EmailStr
    password: str
    # restaurant_name is optional because it's only required for restaurant users.
    # Setting the default to None is crucial for Pydantic validation to pass
    # when a customer signs up without providing this field.
    restaurant_name: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, pw: str) -> str:
        if len(pw) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", pw):
            raise ValueError(
                "Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", pw):
            raise ValueError(
                "Password must contain at least one lowercase letter.")
        if not re.search(r"\d", pw):
            raise ValueError("Password must contain at least one number.")
        return pw


class SigninData(BaseModel):
    email: EmailStr
    password: str


class LikedRestaurantUpdate(SQLModel):
    restaurant_id: UUID


class UserType(str, Enum):
    customer = "CUSTOMER"
    restaurant = "RESTAURANT"


class FoodBase(SQLModel):
    title: str
    price: float
    image: str


class FoodPublic(FoodBase):
    id: UUID


class FoodCreate(FoodBase):
    """This class was created to improve readability when defining API routes"""
    pass


class RestaurantUpdate(SQLModel):
    # Both fields are optional to allow for partial updates.
    # Setting the default to None ensures validation passes when a client
    # sends a request to update only one of the fields.
    restaurant_name: str | None = None
    avg_wait_time: int | None


# Public schema for customers to see restaurant
class RestaurantPublic(SQLModel):
    id: UUID
    restaurant_name: str
    avg_wait_time: int
    menu: list[FoodPublic]


class OrderStatus(str, Enum):
    pending = "pending"
    preparing = "preparing"
    ready = "ready"
    delivered = "delivered"
    cancelled = "cancelled"


class OrderBase(SQLModel):
    customer_id: UUID
    restaurant_id: UUID
    food_id: UUID
    status: OrderStatus


class OrderPublic(OrderBase):
    id: UUID
    food: FoodPublic
    created_at: datetime


# Public schema for restaurant's itself
class RestaurantWithDetail(RestaurantPublic):
    username: str
    email: EmailStr
    orders: list[OrderPublic]
    created_at: datetime


class CustomerPublic(SQLModel):
    id: UUID
    username: str
    email: EmailStr
    orders: list[OrderPublic]
    liked_restaurants: list[RestaurantPublic]


class OrderCreate(OrderBase):
    status: OrderStatus = OrderStatus.pending.value


class OrderUpdate(SQLModel):
    status: OrderStatus | None


# This schema includes a JWT token for authentication and other necessary fields
class UserWithToken(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: CustomerPublic | RestaurantPublic
