# I create as example data only, to show it on dashboard

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter(
    prefix="/sales",
    tags=["sales"],
    responses={404: {"description": "Not found"}},
)

# Mock data - in a real app, this would come from a database
def generate_mock_sales_data():
    today = datetime.now()
    daily_sales = [
        {"date": (today - timedelta(days=i)).strftime("%Y-%m-%d"), 
         "amount": random.randint(800, 1500)} 
        for i in range(7)
    ]
    return daily_sales

@router.get("/summary")
async def get_sales_summary():
    """Get sales summary for the dashboard"""
    return {
        "today": "RM1,250",
        "this_week": "RM8,800",
        "vs_last_week": "+12%",
        "top_item": "Nasi Lemak",
        "peak_hour": "12PM-2PM"
    }

@router.get("/daily")
async def get_daily_sales():
    """Get daily sales data for charts"""
    return generate_mock_sales_data()