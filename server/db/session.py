from sqlmodel import SQLModel, create_engine, Session
from server.db.models import CustomerRestaurantLink, Customer, Restaurant, Order, Food
from server.config import DATABASE_URL

engine = create_engine(DATABASE_URL)


def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
