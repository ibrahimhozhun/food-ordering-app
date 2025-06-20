from dotenv import load_dotenv
from os import getenv, path

env_path = path.join(path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

DATABASE_URL = getenv("DATABASE_URL")
JWT_SECRET = getenv("JWT_SECRET")
CLIENT_URL = getenv("CLIENT_URL")

# JWT Hashing algorithm
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_DAYS = 15
