from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import os

# Set OpenAI API key
openai.api_key = "use_your_api_key"

app = FastAPI()

# Allow cross-origin requests from React frontend (localhost:3000)
origins = [
    "http://localhost:3000",  # React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Request model for translation
class TranslationRequest(BaseModel):
    text: str
    target_language: str

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    try:
        # Constructing the prompt for the translation task
        prompt = f"Translate the following text to {request.target_language}: {request.text}"

        # Use the new method for chat completions (openai.ChatCompletion.create)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        translated_text = response['choices'][0]['message']['content'].strip()

        return {"translated_text": translated_text}

    except Exception as e:
        return {"error": str(e)}
