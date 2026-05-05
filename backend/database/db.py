from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# connection string used to talk to the postgres container running through docker compose
DATABASE_URL = "postgresql://admin:password123@db:5432/auth_db"

# the SQLAlchemy engine that manages the actual connection pool to the database
engine = create_engine(DATABASE_URL)

# session factory used to create per-request database sessions through get_db
SessionLocal = sessionmaker(bind=engine)

# declarative base that all ORM model classes inherit from so they share metadata
Base = declarative_base()


# yields a database session to a FastAPI route and makes sure it is closed after the
# request, used as a dependency in route handlers that need db access
# Output: SQLAlchemy Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()