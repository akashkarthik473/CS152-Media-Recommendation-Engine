from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, text
from database.db import Base


# ORM model representing a registered user in the users table, used everywhere we need
# to look up or create a user
# id: auto-incremented primary key
# username: unique display name used to log in
# email: unique email address tied to the account
# password_hash: bcrypt hash of the user's password (the plain password is never stored)
# createdAt: timestamp the row was created, defaults to the current db time
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    createdAt = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))


# ORM model representing a single media item saved to a user's list, used by the media
# router to persist things the user wants to track
# id: auto-incremented primary key
# user_id: foreign key to the owning user, cascades on delete so a user's media is removed with them
# mediaType: the kind of media (movie, tv, music, book, etc.)
# title: the title of the media item
# subtitle: optional secondary text like an author or release year
# posterPath: optional url or path to a poster/cover image
class Media(Base):
    __tablename__ = "media"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    mediaType = Column(String, nullable=False)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    posterPath = Column(String, nullable=True)
