from fastapi import FastAPI, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from openai import OpenAI
from sqlalchemy.orm import Session
from functools import lru_cache
import asyncio
from typing import List
import base64
from insights import get_category_distribution

# Import our modules
from rag import get_merchant_summary
from forecast import load_merchant_sales_series, forecast_sales, forecast_to_summary
from ingredient import load_all_ingredients, predict_stock_and_restock
from database import get_db, import_csv_to_db, Ingredient
from sales import get_merchant_today_summary, get_merchant_period_summary
from item_service import get_items_by_merchant, get_frequently_bought_together, get_merchant_name_by_id
from sales_trends import get_sales_trend
from top_items import get_top_selling_items, get_best_seller


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

class Item(BaseModel):
    id: int
    item_name: str
    item_price: float
    cuisine_tag: str
    
class ImageRequest(BaseModel):
    prompt: str
    size: str = "1024x1024"


@lru_cache(maxsize=100)
def get_cached_merchant_summary(merchant_id: str) -> str:
    return get_merchant_summary(merchant_id)
    
@lru_cache(maxsize=20)
def get_cached_bundle_suggestions(merchant_id: str):
    """Cache bundle suggestions to avoid repeated API calls and generation"""
    try:
        # Get frequently bought together items and generate bundle suggestions
        result = generate_bundle_suggestions(merchant_id)
        return result
    except Exception as e:
        print(f"Error in cache function for bundle suggestions: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to cache bundle suggestions: {str(e)}"
        }

@app.get("/merchant/{merchant_id}/bundle-suggestions")
async def get_bundle_suggestions(merchant_id: str):
    """Get cached bundle promotion suggestions"""
    return get_cached_bundle_suggestions(merchant_id)

@app.get("/merchant/{merchant_id}/category-distribution")
async def merchant_category_distribution(merchant_id: str):
    """Get the distribution of sales by category for a merchant"""
    result = get_category_distribution(merchant_id)
    return result

def generate_bundle_suggestions(merchant_id: str):
    """Generate bundle promotion suggestions based on frequently bought together items"""
    try:
        # Get frequently bought together items
        frequent_pairs = get_frequently_bought_together(merchant_id)
        
        # Check if we got valid data
        if frequent_pairs.get("status") == "error":
            return {
                "status": "error",
                "message": frequent_pairs.get("message", "Failed to get frequently bought together items")
            }
        
        # Extract the pairs from the response
        pairs = frequent_pairs.get("pairs", [])
        
        # If no valid pairs were found, return early
        if not pairs or len(pairs) == 0 or pairs[0]["count"] == 0:
            return {
                "status": "error", 
                "message": "No valid item pairs found for bundle suggestions"
            }
        
        # Build prompt for OpenAI
        prompt = f"""
        Create exactly 3 attractive bundle promotions for a food merchant based on the following frequently bought together items.
        For each pair, suggest:
        1. A catchy bundle name
        2. A short description explaining the bundle's appeal
        3. An appropriate discount percentage (between 5% and 25%)
        
        Here are the item pairs that customers frequently buy together:
        
        {json.dumps(pairs, indent=2)}
        
        Return your suggestions in the following JSON format with the key "suggestions" containing exactly 3 bundle suggestions:
        {{
          "suggestions": [
            {{
              "id": 1,
              "name": "catchy bundle name",
              "description": "short appealing description",
              "items": [
                {{ "id": item_id1, "name": "item1_name", "price": item1_price }},
                {{ "id": item_id2, "name": "item2_name", "price": item2_price }}
              ],
              "discount": discount_percentage,
              "originalPrice": sum_of_individual_prices,
              "discountedPrice": price_after_discount,
              "popularity": popularity_score
            }},
            {{
              "id": 2,
              ...
            }},
            {{
              "id": 3,
              ...
            }}
          ]
        }}
        
        Notes:
        - Always create exactly 3 bundles
        - Use the provided pairs data to create the bundles
        - If there aren't enough unique pairs, you can reuse pairs or creatively combine items
        - "id" should be sequential numbers 1, 2, and 3
        - "discount" should be a number between 5 and 25
        - "originalPrice" should be the sum of the individual item prices
        - "discountedPrice" should be the originalPrice minus the discount amount
        - "popularity" should be a number between 75 and 95
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # Parse the response
        result_content = response.choices[0].message.content
        result_json = json.loads(result_content)
        
        # Extract suggestions
        bundle_suggestions = result_json.get("suggestions", [])
        
        # Ensure we have exactly 3 bundles
        if len(bundle_suggestions) < 3:
            # Fill with dummy suggestions if needed
            for i in range(len(bundle_suggestions), 3):
                bundle_suggestions.append({
                    "id": i + 1,
                    "name": f"Value Bundle {i + 1}",
                    "description": "A special combination of our popular items",
                    "items": [
                        {"id": 1, "name": "Menu Item 1", "price": 8.99},
                        {"id": 2, "name": "Menu Item 2", "price": 5.99}
                    ],
                    "discount": 10,
                    "originalPrice": 14.98,
                    "discountedPrice": 13.48,
                    "popularity": 80
                })
        elif len(bundle_suggestions) > 3:
            # Keep only the first 3
            bundle_suggestions = bundle_suggestions[:3]
        
        # Return the suggestions
        return {
            "status": "success",
            "suggestions": bundle_suggestions
        }
        
    except Exception as e:
        print(f"Error generating bundle suggestions: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to generate bundle suggestions: {str(e)}"
        }

@app.post("/generate-image")
async def generate_image(request: ImageRequest):
    """Generate an image using OpenAI DALL-E 3"""
    try:
        # Call OpenAI's DALL-E API to generate the image
        response = client.images.generate(
            model="dall-e-3",  # Use DALL-E 3 model
            prompt=request.prompt,
            size=request.size,
            quality="standard",
            n=1,  # Generate 1 image
            response_format="b64_json"  # Get base64 encoded image
        )
        
        # Extract the base64 image data
        image_data = response.data[0].b64_json
        image_url = response.data[0].url if hasattr(response.data[0], 'url') else None
        
        # Return both base64 and URL (if available)
        return {
            "success": True,
            "image_data": image_data,
            "image_url": image_url
        }
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/merchant-name/{merchant_id}")
async def get_merchant_name(merchant_id : str):
    """Get the merchant name by ID"""
    try:
        name = get_merchant_name_by_id(merchant_id)
        return {"merchant_id": merchant_id, "name": name}
    except Exception as e:
        print(f"Error fetching merchant name: {e}")
        return {"merchant_id": merchant_id, "name": "Unknown", "error": str(e)}


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
    - title: A clear, concise title for the advice, limit to 3 words
    - impact: The potential impact of following this advice, make it short
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
    
@app.get("/ingredients")
async def get_ingredients(db: Session = Depends(get_db)):
    try:
        # Load merchant sales data
        df = load_all_ingredients()
        if df.empty:
            return {"error": "No ingredients data available."}

        # Return ingredients data
        return {
            "ingredients": df.to_dict(orient="records")
        }
    except Exception as e:
        return {"error": str(e)}
    
class InventoryUpdateRequest(BaseModel):
    stock_left: int
    last_restock: str

@app.patch("/ingredients/{ingredient_id}")
async def update_ingredient(ingredient_id: int, update_data: InventoryUpdateRequest, db: Session = Depends(get_db)):
    """Update an ingredient's stock level and restock date"""
    try:
        # Get the ingredient from the database
        ingredient = db.query(Ingredient).filter(Ingredient.ingredient_id == ingredient_id).first()
        
        if not ingredient:
            return {
                "status": "error",
                "message": f"Ingredient with ID {ingredient_id} not found"
            }
        
        # Update the ingredient
        ingredient.stock_left = update_data.stock_left
        ingredient.last_restock = update_data.last_restock
        
        # Commit the changes
        db.commit()
        
        return {
            "status": "success",
            "message": f"Successfully updated ingredient {ingredient.ingredient_name}",
            "data": {
                "ingredient_id": ingredient.ingredient_id,
                "ingredient_name": ingredient.ingredient_name,
                "stock_left": ingredient.stock_left,
                "last_restock": ingredient.last_restock
            }
        }
    except Exception as e:
        db.rollback()
        print(f"Error updating ingredient: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to update ingredient: {str(e)}"
        }

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

  
@app.get("/insights/{merchant_id}/{period}")
async def get_insights(merchant_id: str, period: str, db: Session = Depends(get_db)):
    """Generate AI-powered insights specific to a time period"""
    
    if period not in ["daily", "weekly", "monthly"]:
        return {"error": "Period must be 'daily', 'weekly', or 'monthly'"}
    
    try:
        # Step 1: Get merchant summary and sales data for the period
        summary = get_cached_merchant_summary(merchant_id)
        
        # Get period-specific data
        if period == "daily":
            sales_data = get_merchant_today_summary(merchant_id)
        else:
            sales_data = get_merchant_period_summary(merchant_id, period.replace("ly", ""))
            
        # Get trend data for the period
        trend_data = get_sales_trend(merchant_id, period)
        
        # Convert json data to strings first to avoid backslash issues in f-strings
        sales_data_json = json.dumps(sales_data)
        trend_data_json = json.dumps(trend_data)
        
        # Build improved prompts specific to each insight type
        time_prompt = f"""
        You are providing a direct insight to a food merchant about their business performance.
        This insight will be displayed in an app under the section key insight. The merchant will be able to see when he click in, keep it simple but meaningful!
        Analyze this {period} sales data and give ONE clear insight about the merchant's best selling time.
        
        Your response must:
        1. Speak directly to the merchant using "you" and "your", no need to mention about the name of merchant.
        2. Be extremely concise (15-25 words)
        3. Contain one specific, data-backed observation
        4. Include a clear action the merchant should take
        
        Sales data: {sales_data_json}
        Trend data: {trend_data_json}
        Merchant summary: {summary}
        """
        
        menu_prompt = f"""
        You are providing a direct insight to a food merchant about their menu performance.
        This insight will be displayed in an app under the section key insight. The merchant will be able to see when he click in, keep it simple but meaningful!
        Analyze this {period} sales data and give ONE clear insight about the merchant's menu items.
        
        Your response must:
        1. Speak directly to the merchant using "you" and "your", no need to mention about the name of merchant.
        2. Be extremely concise (15-25 words)
        3. Refer to a specific menu item or category
        4. Include a clear action the merchant should take
        
        Sales data: {sales_data_json}
        Trend data: {trend_data_json}
        Merchant summary: {summary}
        """
        
        opportunity_prompt = f"""
        You are providing a direct insight to a food merchant about a business opportunity.
        This insight will be displayed in an app under the section key insight. The merchant will be able to see when he click in, keep it simple but meaningful!
        Analyze this {period} sales data and identify ONE clear business opportunity.
        
        Your response must:
        1. Speak directly to the merchant using "you" and "your", no need to mention about the name of merchant.
        2. Be extremely concise (15-25 words)
        3. Highlight one specific growth opportunity
        4. Include a clear, actionable recommendation
        
        Sales data: {sales_data_json}
        Trend data: {trend_data_json}
        Merchant summary: {summary}
        """
        
        # Generate insights using OpenAI in parallel
        responses = await asyncio.gather(
            generate_insight(time_prompt),
            generate_insight(menu_prompt),
            generate_insight(opportunity_prompt)
        )
        
        return {
            "best_selling_time": {
                "title": "Best Selling Time",
                "description": responses[0]
            },
            "menu_performance": {
                "title": "Menu Performance",
                "description": responses[1]
            },
            "opportunity": {
                "title": "Opportunity",
                "description": responses[2]
            }
        }
        
    except Exception as e:
        print(f"Error generating insights: {str(e)}")
        return {
            "error": f"Failed to generate insights: {str(e)}"
        }

async def generate_insight(prompt: str) -> str:
    """Generate a single insight using OpenAI"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in generate_insight: {str(e)}")
        return "Could not generate insight at this time."

@app.get("/merchant-items/{merchant_id}", response_model=List[Item])
async def get_merchant_items(merchant_id: str):
    return get_items_by_merchant(merchant_id)

@app.get("/merchant/{merchant_id}/top-items")
async def get_merchant_top_items(merchant_id: str):
    """
    Get top selling items for a merchant
    it always returns monthly data (last 30 days) regardless of period
    """
    return get_top_selling_items(merchant_id)

@app.get("/merchant/{merchant_id}/best-seller")
async def get_best_seller_item(merchant_id:str):
    return get_best_seller(merchant_id)


@app.get("/ingredients/predict")
async def predict_ingredient_stock():
    """
    Predict how many days the current stock of ingredients can last
    and identify if restocking is needed.
    """
    try:
        # Call the prediction function
        prediction_df = predict_stock_and_restock()
        
        # Convert the DataFrame to a list of dictionaries for JSON response
        prediction_data = prediction_df.to_dict(orient="records")
        
        return {
            "status": "success",
            "data": prediction_data
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }