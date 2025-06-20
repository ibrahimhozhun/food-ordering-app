from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.api.routes import restaurants, customers, orders, auth
from server.config import CLIENT_URL
from server.db.session import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events."""
    create_db_and_tables()
    yield

# Initialize the FastAPI app
app = FastAPI(lifespan=lifespan)

# Configure CORS middleware for FastAPI to allow credentials, etc.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all the REST API routers
app.include_router(restaurants.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(auth.router)
