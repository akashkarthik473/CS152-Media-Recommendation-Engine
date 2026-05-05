from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from auth import router as auth_router, get_current_user
from media import router as media_router
from database.models import User
from database.db import engine, Base
import os

# creates all tables defined on the SQLAlchemy Base in the database if they don't exist
Base.metadata.create_all(engine)

# loads environment variables from the .env file so things like the gemini api key can be read
load_dotenv()

# creates the FastAPI application instance that exposes all the api endpoints
app = FastAPI()

# attaches the auth and media routers so their endpoints are reachable on the app
app.include_router(auth_router)
app.include_router(media_router)

# allows the frontend running on localhost:5173 to call the backend without being blocked by CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# initializes the Gemini client using the api key from the environment so we can call the model
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# the gemini model used for generating recommendations
MODEL = "gemini-2.5-flash"


# Model for incoming recommendation requests used in the get_recommendations endpoint
# query is the user's prompt and media_type narrows the kind of recommendation
class RecommendationRequest(BaseModel):
    query: str
    media_type: str = "any"  # "movie", "tv", "music", "book", "any"


# Model for the response returned by the recommendation endpoint
class RecommendationResponse(BaseModel):
    recommendations: str


# Get request method that confirms the server is running, used as a basic health probe
# Output: dict with a status field
@app.get("/health")
def health_check():
    return {"status": "ok"}


# Post request method that takes a user query plus media type and asks Gemini for 5
# recommendations, only callable by an authenticated user
# Input: RecommendationRequest object (query, media_type), authenticated User from JWT
# Output: RecommendationResponse object containing the model's text
@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    _user: User = Depends(get_current_user),
):
    # builds the prompt sent to gemini using the user's media type and free-form query
    prompt = (
        f"You are a media recommendation engine. "
        f"The user is looking for {request.media_type} recommendations. "
        f"Based on the following request, provide 5 recommendations with a short "
        f"description for each:\n\n{request.query}"
    )

    # sends the prompt to gemini and gets back the generated recommendations text
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )

    return RecommendationResponse(recommendations=response.text)
