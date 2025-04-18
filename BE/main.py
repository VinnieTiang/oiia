from fastapi import FastAPI, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from openai import OpenAI
from sqlalchemy.orm import Session
from functools import lru_cache

# Import our modules
from rag import get_merchant_summary
from forecast import load_merchant_sales_series, forecast_sales, forecast_to_summary
from database import get_db, import_csv_to_db
from sales import get_merchant_today_summary, get_merchant_period_summary
from sales_trends import get_sales_trend

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

class AdviceRequest(BaseModel):
    merchant_id: str

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

# POST endpoint
@app.post("/advice")
async def personalized_advice(request: AdviceRequest, db: Session = Depends(get_db)):

    # Step 1: Get summary for merchant
    summary =  get_cached_merchant_summary(request.merchant_id)
    print("Summary:", summary)

    # Step 2: Build prompt
    prompt = f"""
    You are a helpful assistant for Southeast Asian food merchants.

    Based on the business data below (including country, food types, and sales performance), suggest 6 personalized recommendations to help the merchant improve their sales.

    Each recommendation should have the following format:
    - category: The category of the advice (only have sales, inventory, customers, finance)
    - title: A clear, concise title for the advice
    - impact: The potential impact of following this advice
    - details: A brief explanation of the recommendation and how it can help
    - icon: The name of a relevant icon
    - color: Unique color code for each advice

    Constraints:
    - Use only these icons:
        "sales": "sale", "chart-line", "tag-multiple", "storefront", "bullhorn", "percent", "cart-arrow-down",
        "inventory": "warehouse", "package-variant", "barcode-scan", "truck-delivery-outline", "clipboard-list", "fridge-outline", "cube-outline",
        "customers": "account-group", "star-circle", "emoticon-happy-outline", "message-reply-text", "heart-outline", "gift-outline", "handshake-outline",
        "finance": "currency-usd", "bank-outline", "cash-multiple", "chart-areaspline", "wallet-outline", "credit-card-outline", "calculator-variant"
    - No icon should be used more than once in the advice list.
    - Only return icon names, not the icon pack.

    Each piece of advice should be actionable, friendly, and practical. Be concise and tailored to the local context, and include any relevant insights about the business.

    Return the output in JSON format with the following structure:
    {{
        "advice": [
            {{
                "category": "customers",
                "title": "Boost your ratings",
                "impact": "Potential +15% repeat orders",
                "details": "Your rating is 4.2/5, with praise for your authentic flavors. However, 15% of reviews mention wait times. Responding to these reviews could improve customer retention.",
                "icon": "account-group"
                "color": "#F2994A"
            }},
            ...
        ]
    }}

    {summary}
    """

    # Step 3: Send to OpenAI
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    # Step 4: Return LLM's response

    content = response.choices[0].message.content
    advice_list = json.loads(content)["advice"]
    return {
        "advice": advice_list
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

@app.get("/merchant/{merchant_id}/trends/{period}")
async def get_merchant_sales_trend(merchant_id: str, period: str):
    """Get sales trend data for charts"""
    if period not in ["daily", "weekly", "monthly"]:
        return {"error": "Period must be 'daily', 'weekly', or 'monthly'"}
    
    return get_sales_trend(merchant_id, period)