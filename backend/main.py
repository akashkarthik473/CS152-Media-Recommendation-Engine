from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class RecommendationRequest(BaseModel):
    query: str
    media_type: str = "any"  # "movie", "tv", "music", "book", "any"


class RecommendationResponse(BaseModel):
    recommendations: str


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    prompt = (
        f"You are a media recommendation engine. "
        f"The user is looking for {request.media_type} recommendations. "
        f"Based on the following request, provide 5 recommendations with a short "
        f"description for each:\n\n{request.query}"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return RecommendationResponse(recommendations=response.text)
