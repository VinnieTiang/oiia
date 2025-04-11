from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import openai
from rag import get_merchant_summary

# Load OpenAI key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

class ChatRequest(BaseModel):
    merchant_id: str
    question: str

@app.post("/ask")
async def ask_advice(request: ChatRequest):
    summary = get_merchant_summary(request.merchant_id)

    prompt = f"""
You are a helpful assistant for Southeast Asian food merchants.

Based on the business data below, give 2–3 personalized suggestions to help the merchant grow their business.

Be friendly, practical, and concise.

Give your reply in json format with the following keys:

{summary}

Question: {request.question}

Suggestions:
"""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    return {"reply": response["choices"][0]["message"]["content"]}
