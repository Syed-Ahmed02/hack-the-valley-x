from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
load_dotenv()


app = FastAPI(
    title="HackTheValleyX API",
    description="Backend API for HackTheValleyX project",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to HackTheValleyX API!"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


def add_two_numbers(a: int, b: int) -> int:
    return a + b


@app.post("/add")
async def add(a: int, b: int):
    """Add two numbers"""
    return {"result": add_two_numbers(a, b)}

@app.post("/gemini")
def get_gemini_response(prompt: str) -> str:
    
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )
    print(response.text)
    return response.text


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)