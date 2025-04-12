from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from rag import get_merchant_summary
from openai import OpenAI
from forecast import (
    load_merchant_sales_series,
    forecast_sales,
    forecast_to_summary
)

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

    Answer the question based on the question language.

    You are a helpful assistant for Southeast Asian food merchants.

    Based on the business data below, answer the question. 

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


@app.get("/forecast/{merchant_id}")
async def get_forecast(merchant_id: str, days: int = 7):
    try:
        # Load merchant sales data
        df = load_merchant_sales_series(merchant_id)
        if df.empty:
            return {"error": "No sales data available for this merchant."}

        # Run forecasting
        forecast_df = forecast_sales(df, periods=days)
        summary = forecast_to_summary(forecast_df)

        # Return forecast values + summary
        return {
            "merchant_id": merchant_id,
            "days": days,
            "forecast": forecast_df.to_dict(orient="records"),
            "summary": summary
        }

    except Exception as e:
        return {"error": str(e)}

