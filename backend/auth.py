from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import User

SECRET_KEY = "954721ada9de0f032e3c0f4b75ade19be212f78be065e54fecdbbb8c800318e3"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()


# Model for creating users used in the user_create and signup methods
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


# Model for public user information used as a response_model in the signup and read_me
# methods
class UserPublic(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


# model for Tokens used as a response_model in the login_for_token_acess method
class Token(BaseModel):
    access_token: str
    token_type: str


# manages password hashing using bcrypt schem to has passwords and deprycates old
# passowrds automatically if a new hashing scheme is introduced
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# Specifies that users will be authenticated using a bearer token gotten from /token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


# verifies the plain_password by hashing it and seeing if it matches the hashed_passowrd
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# hashes a password using bcrypt and returns it
def get_password_hash(password):
    return pwd_context.hash(password)


# gets a user from the database based on their username
def get_user(db, username: str):
    return db.query(User).filter(User.username == username).first()


# creates a User object and sends it to the database
# Input: database Session, UserCreate model object
# Output: created User object
def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)

    db_user = User(
        username=user.username, email=user.email, password_hash=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# authenticates a user by checking if their username is in the db and verifying their
# password
# Input: database object, username string, password string
# Output: boolean
def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)

    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False

    return user


# takes user data and adds an expiration time to it and returns it as a signed JWT token
# Input: dictionary containing user data, timedelta variable deciding expiration time
# Output: boolean
def create_access_token(data: dict, expires_delta: timedelta or None = None):
    # copy user data
    to_encode = data.copy()

    # if expires_delta exists set the expiration time to the current utc time +
    # expires_delta else set the expiration time to the current time + 30 minutes
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)

    # appends expiration time to user data and encodes it using the secret key and hashing
    # algorithm and returns the signed token
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# gets the current user by decoding the JWT token and getting the username and searching
# for it in the database
# Input: injects user jwt token and database connection object
# Output: User object
async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    # creates HTTP exception that gets raised if the user's username isnt it in the token
    # or user isnt in the database
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # tries to decode the token and extract the username from it raises credentials
    # exception if it fails
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # gets user from database and returns them raises exception if user isn't in the db
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception

    return user


# Post request method takes user information adn checks if they are an existing user, if
# not adds them to the db
# Input: UserCreate object (username, email, password), db Session
# Output: User object
@router.post("/signup", response_model=UserPublic)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    return create_user(db, user)


# Get request method that gets current user using JWT token and returns them
# Input: User object
# Output: User object
@router.get("/me", response_model=UserPublic)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


# post request method that takes username and password and authenticates the user if
# authentication succeeds
# creates and access token for them and returns it
# Input: OAuth2PasswordRequestForm (username,and password), db Session
# Output: dict with access token and token type
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)

    # if nothing was returned from user authentication raise an HTTPException
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # creates access token and returns it
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
