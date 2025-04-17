from fastapi import FastAPI, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from datetime import datetime
from openai import OpenAI
from sqlalchemy.orm import Session
from functools import lru_cache

# Import our modules
from rag import get_merchant_summary
from forecast import load_merchant_sales_series, forecast_sales, forecast_to_summary
from database import get_db, import_csv_to_db
from sales import get_merchant_today_summary, get_merchant_period_summary

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

class PromptRequest(BaseModel):
    prompt: str

@lru_cache(maxsize=100)
def get_cached_merchant_summary(merchant_id: str) -> str:
    return get_merchant_summary(merchant_id)

@app.get("/merchant/{merchant_id}/summary")
async def get_merchant_summary_endpoint(merchant_id: str):
    """Get cached merchant summary for a specific merchant"""
    try:
        summary = get_cached_merchant_summary(merchant_id)
        return {
            "merchant_id": merchant_id,
            "summary": summary,
            "status": "success"
        }
    except Exception as e:
        return {
            "merchant_id": merchant_id,
            "summary": "",
            "status": f"Error: {str(e)}"
        }
    
# POST endpoint
@app.post("/ask")
async def ask_advice(request: ChatRequest, db: Session = Depends(get_db)):
    
    # Step 1: Get summary for merchant
    summary = get_cached_merchant_summary(request.merchant_id)
    print("Summary:", summary)

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
async def get_forecast(merchant_id: str, days: int = 7, db: Session = Depends(get_db)):
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
    
@app.post("/generate-content")
async def ask_advice(request: PromptRequest):
    prompt = f"""{request.prompt}"""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return {
        "reply": response.choices[0].message.content
    }

@app.post("/initialize-db")
async def initialize_database():
    """Initialize the database by importing CSV files"""
    try:
        import_csv_to_db()
        return {"message": "Database initialized successfully"}
    except Exception as e:
        return {"error": str(e)}
    

@app.get("/merchant/{merchant_id}/today")
async def get_today_summary(merchant_id: str):
    return get_merchant_today_summary(merchant_id)

@app.get("/merchant/{merchant_id}/summary/{period}")
async def get_period_sales(merchant_id: str, period: str):
    """Get sales summary for a specific period (week/month)"""
    if period not in ["week", "month"]:
        return {"error": "Period must be 'week' or 'month'"}
    return get_merchant_period_summary(merchant_id, period)