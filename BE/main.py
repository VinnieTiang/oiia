from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from rag import get_merchant_summary
from openai import OpenAI

# Load API key from .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Create OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Create FastAPI app
app = FastAPI()

# Define input model
class ChatRequest(BaseModel):
    merchant_id: str
    question: str

# POST endpoint
@app.post("/ask")
async def ask_advice(request: ChatRequest):
    # Step 1: Get summary for merchant
    summary = get_merchant_summary(request.merchant_id)

    # Step 2: Build prompt
    prompt = f"""
You are a helpful assistant for Southeast Asian food merchants.

Based on the business data below, give 2–3 personalized suggestions to help the merchant grow their business.

Be friendly, practical, and concise.

{summary}

Question: {request.question}

Suggestions:
"""

    # Step 3: Send to OpenAI
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    # Step 4: Return LLM's response
    return {
        "reply": response.choices[0].message.content
    }
