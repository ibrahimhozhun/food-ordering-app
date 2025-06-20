from sqlmodel import Field, Relationship, SQLModel
from pydantic import EmailStr
from datetime import datetime
from uuid import UUID, uuid4

from server.db.schemas import FoodBase, OrderBase, OrderStatus


class CustomerRestaurantLink(SQLModel, table=True):
    customer_id: UUID = Field(foreign_key="customers.id", primary_key=True)
    restaurant_id: UUID = Field(foreign_key="restaurants.id", primary_key=True)


class Customer(SQLModel, table=True):
    __tablename__ = "customers"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True, index=True)
    password: str
    orders: list["Order"] = Relationship(back_populates="customer")
    liked_restaurants: list["Restaurant"] = Relationship(
        back_populates="likes",
        link_model=CustomerRestaurantLink
    )
    created_at: datetime = Field(default_factory=datetime.now)


class Restaurant(SQLModel, table=True):
    __tablename__ = "restaurants"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True, index=True)
    password: str
    restaurant_name: str = Field(unique=True, index=True)
    avg_wait_time: int = 25
    orders: list["Order"] = Relationship(back_populates="restaurant")
    likes: list["Customer"] = Relationship(
        back_populates="liked_restaurants",
        link_model=CustomerRestaurantLink
    )
    menu: list["Food"] = Relationship()
    created_at: datetime = Field(default_factory=datetime.now)


class Food(FoodBase, table=True):
    __tablename__ = "foods"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    restaurant_id: UUID = Field(foreign_key="restaurants.id")


class Order(OrderBase, table=True):
    __tablename__ = "orders"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    customer_id: UUID = Field(foreign_key="customers.id")
    customer: Customer | None = Relationship(back_populates="orders")
    food_id: UUID = Field(foreign_key="foods.id")
    food: Food = Relationship()
    restaurant_id: UUID = Field(foreign_key="restaurants.id")
    restaurant: Restaurant | None = Relationship(back_populates="orders")
    status: OrderStatus = Field(default=OrderStatus.pending.value)
    created_at: datetime = Field(default_factory=datetime.now)
