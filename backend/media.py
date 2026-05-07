from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from auth import get_current_user
from database.db import get_db
from database.models import Media, User

router = APIRouter()


# Model for incoming media create requests, used by the add_media endpoint when the
# frontend persists a new item to a user's list
class MediaCreate(BaseModel):
    user_id: int
    mediaType: str
    title: str
    subtitle: Optional[str] = None
    posterPath: Optional[str] = None


# Model for the public shape of a media item returned to the frontend, mirrors the Media
# ORM model and is also what gets cached in localStorage on the client
class MediaPublic(BaseModel):
    id: int
    user_id: int
    mediaType: str
    title: str
    subtitle: Optional[str] = None
    posterPath: Optional[str] = None

    class Config:
        from_attributes = True


# Model for the request body of the /media_list endpoint, the frontend sends the user_id
# of the currently logged in user so we know whose list to load
class MediaListRequest(BaseModel):
    user_id: int


# Post request method that creates a new media row owned by the current user, called by
# the frontend when the user adds a movie/tv/book/game to their list
# Input: MediaCreate object, authenticated User from JWT, db Session
# Output: MediaPublic representing the newly created row
@router.post("/media", response_model=MediaPublic)
def add_media(
    media: MediaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # block users from saving media on behalf of someone else
    if media.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot add media for another user")

    # creates the ORM object and persists it to the database
    db_media = Media(
        user_id=media.user_id,
        mediaType=media.mediaType,
        title=media.title,
        subtitle=media.subtitle,
        posterPath=media.posterPath,
    )

    db.add(db_media)
    db.commit()
    db.refresh(db_media)

    return db_media


# Delete request method that removes a media row by id, the user can only delete rows
# that they themselves own
# Input: media id from the path, authenticated User from JWT, db Session
# Output: dict confirming deletion
@router.delete("/media/{media_id}")
def delete_media(
    media_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # look up the media row and 404 if it doesn't exist
    db_media = db.query(Media).filter(Media.id == media_id).first()
    if not db_media:
        raise HTTPException(status_code=404, detail="Media not found")

    # block users from deleting other people's saved media
    if db_media.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete another user's media")

    db.delete(db_media)
    db.commit()

    return {"ok": True}


# Post request method that returns every media row belonging to the requested user,
# called right after login to hydrate the cached media list in localStorage
# Input: MediaListRequest (user_id), authenticated User from JWT, db Session
# Output: list of MediaPublic objects
@router.post("/media_list", response_model=List[MediaPublic])
def list_media(
    payload: MediaListRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # block users from reading another user's saved media
    if payload.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot read another user's media")

    return db.query(Media).filter(Media.user_id == payload.user_id).all()
