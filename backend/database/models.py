from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, text
from database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    createdAt = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))


class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    mediaType = Column(String, nullable=False)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    posterPath = Column(String, nullable=True)
