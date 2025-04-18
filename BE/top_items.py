import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from database import query_to_dataframe
from date_utils import get_latest_transaction_date
import math
import traceback

# Simple in-memory cache
merchant_cache = {}

def get_top_selling_items(merchant_id: str, limit: int = 5):
    """
    Get top selling items for a merchant for the last 30 days.
    
    Args:
        merchant_id: The ID of the merchant
        limit: Number of top items to return
        
    Returns:
        dict: Dictionary containing chart data for top selling items
    """
    try:
        # Check if cached
        if merchant_id in merchant_cache:
            return merchant_cache[merchant_id]
        
        # Last 30 days
        end_date = get_latest_transaction_date()
        start_date = end_date - timedelta(days=30)

        # Optimized join query
        query = """
        SELECT 
            ti.item_id, 
            i.item_name, 
            i.item_price,
            COUNT(*) as item_count
        FROM transaction_items ti
        JOIN items i ON ti.item_id = i.item_id
        JOIN transactions t ON t.order_id = ti.order_id
        WHERE 
            i.merchant_id = :merchant_id AND 
            t.merchant_id = :merchant_id AND 
            DATE(t.order_time) BETWEEN :start_date AND :end_date
        GROUP BY ti.item_id
        ORDER BY item_count DESC
        LIMIT :limit
        """
        
        df = query_to_dataframe(query, {
            "merchant_id": merchant_id,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "limit": limit
        })

        if df.empty:
            return {
                "status": "loading",
                "message": "Data is being processed. Please try again shortly."
            }

        # Calculate total count for percentage
        total_count = df["item_count"].sum()
        df["percentage"] = (df["item_count"] / total_count * 100).round().astype(int)
        
        # Abbreviated name
        df["abbreviated_name"] = df["item_name"].apply(
            lambda name: name[:5] + "." if len(name) > 5 else name
        )

        items = []
        for _, row in df.iterrows():
            items.append({
                "name": str(row["item_name"]),
                "count": int(row["item_count"]),
                "percentage": int(row["percentage"])
            })

        result = {
            "items": items,
            "chart_data": {
                "labels": [str(name) for name in df["abbreviated_name"]],
                "datasets": [{"data": [int(x) for x in df["item_count"]]}]
            },
            "best_seller": str(df.iloc[0]["item_name"]),
            "best_seller_percent": int(df.iloc[0]["percentage"])
        }

        # Cache result
        merchant_cache[merchant_id] = result

        return result

    except Exception as e:
        print(f"Error in get_top_selling_items: {str(e)}")
        print(traceback.format_exc())
        return {
            "status": "error",
            "message": "Internal server error while fetching top items."
        }
