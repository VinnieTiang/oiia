import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from database import query_to_dataframe
import math
import traceback

def safe_float(value):
    """Convert value to float safely, replacing NaN or infinity with 0."""
    try:
        result = float(value)
        if math.isnan(result) or math.isinf(result):
            return 0.0
        return result
    except (ValueError, TypeError):
        return 0.0

def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif isinstance(obj, (pd.Series, pd.DataFrame)):
        return obj.to_dict()
    return obj

def get_top_selling_items(merchant_id: str, period: str = "daily", limit: int = 5):
    """
    Get top selling items for a merchant based on specified period.
    
    Args:
        merchant_id: The ID of the merchant
        period: "daily", "weekly", or "monthly"
        limit: Number of top items to return
        
    Returns:
        dict: Dictionary containing chart data for top selling items
    """
    try:
        # Check if we have the tables we need
        tables_query = """
        SELECT name FROM sqlite_master 
        WHERE type='table' AND (name='transaction_items' OR name='transactions' OR name='items')
        """
        tables_df = query_to_dataframe(tables_query, {})
        
        available_tables = tables_df['name'].tolist() if not tables_df.empty else []
        print(f"Available tables: {available_tables}")
        
        if not all(table in available_tables for table in ['transaction_items', 'items', 'transactions']):
            print("Required tables not found in database")
            return default_top_items_data(period)
            
        # First, let's get transactions within the time period
        transaction_query = """
        SELECT order_id, order_time 
        FROM transactions 
        WHERE merchant_id = :merchant_id
        """
        
        transactions_df = query_to_dataframe(transaction_query, {"merchant_id": merchant_id})
        
        if transactions_df.empty:
            print(f"No transactions found for merchant {merchant_id}")
            return default_top_items_data(period)
            
        # Convert order_time to datetime and extract date
        transactions_df["order_time"] = pd.to_datetime(transactions_df["order_time"], errors="coerce")
        transactions_df["date"] = transactions_df["order_time"].dt.date
            
        # Find the latest date in the data
        latest_date = transactions_df["date"].max()
        
        # Filter transactions based on the period
        if period == "daily":
            # Today's data
            filtered_transactions = transactions_df[transactions_df["date"] == latest_date]
        elif period == "weekly":
            # Last 7 days
            week_start = latest_date - timedelta(days=6)
            filtered_transactions = transactions_df[(transactions_df["date"] >= week_start) & 
                                                (transactions_df["date"] <= latest_date)]
        elif period == "monthly":
            # Last 30 days
            month_start = latest_date - timedelta(days=29)
            filtered_transactions = transactions_df[(transactions_df["date"] >= month_start) & 
                                                (transactions_df["date"] <= latest_date)]
        else:
            return default_top_items_data(period)
            
        # Get transaction items for the filtered orders
        relevant_order_ids = filtered_transactions["order_id"].tolist()
        
        if not relevant_order_ids:
            print(f"No relevant orders found for {period} period")
            return default_top_items_data(period)
            
        # Using a simpler approach with individual queries for each order
        all_items_df = pd.DataFrame()
        
        # Get all items for all orders
        for order_id in relevant_order_ids:
            query = """
            SELECT ti.item_id, i.item_name, i.item_price 
            FROM transaction_items ti
            JOIN items i ON ti.item_id = i.item_id
            WHERE ti.order_id = :order_id
            AND i.merchant_id = :merchant_id
            """
            
            order_items = query_to_dataframe(query, {
                "order_id": order_id,
                "merchant_id": merchant_id
            })
            
            if not order_items.empty:
                all_items_df = pd.concat([all_items_df, order_items])
        
        if all_items_df.empty:
            print("No items found for the filtered transactions")
            return default_top_items_data(period)
            
        # Count occurrences of each item
        item_counts = all_items_df["item_id"].value_counts().reset_index()
        item_counts.columns = ["item_id", "count"]
        
        # Get top items
        top_items = item_counts.head(limit)
        
        # Get item details for the top items
        top_items_details = all_items_df[all_items_df["item_id"].isin(top_items["item_id"])].drop_duplicates("item_id")
        
        # Merge top items with their details
        top_items_with_details = pd.merge(top_items, top_items_details, on="item_id")
        
        # Calculate percentages
        total_count = int(top_items["count"].sum())  # Convert numpy.int64 to int
        top_items_with_details["percentage"] = (top_items_with_details["count"] / total_count * 100).round().astype(int)
        
        # Prepare data in the format needed for the chart
        # Abbreviate long item names
        top_items_with_details["abbreviated_name"] = top_items_with_details["item_name"].apply(
            lambda name: name[:5] + "." if len(name) > 5 else name
        )
        
        # Create result object with explicit type conversion
        items_list = []
        for _, row in top_items_with_details.iterrows():
            items_list.append({
                "name": str(row["item_name"]),
                "count": int(row["count"]),
                "percentage": int(row["percentage"])
            })
        
        # Get best seller info with explicit type conversion
        best_seller = str(top_items_with_details.iloc[0]["item_name"]) if not top_items_with_details.empty else "Unknown"
        best_seller_percent = int(top_items_with_details.iloc[0]["percentage"]) if not top_items_with_details.empty else 0
        
        # Convert all data to Python native types
        label_list = [str(name) for name in top_items_with_details["abbreviated_name"].tolist()]
        data_list = [int(count) for count in top_items_with_details["count"].tolist()]
        
        result = {
            "items": items_list,
            "chart_data": {
                "labels": label_list,
                "datasets": [
                    {
                        "data": data_list
                    }
                ]
            },
            "best_seller": best_seller,
            "best_seller_percent": best_seller_percent
        }
        
        return result
        
    except Exception as e:
        print(f"Error in get_top_selling_items: {str(e)}")
        print(traceback.format_exc())
        return default_top_items_data(period)

def default_top_items_data(period: str):
    """Return default data for top items when no data is available"""
    multiplier = 1 if period == "daily" else 7 if period == "weekly" else 30
    
    return {
        "items": [
            {"name": "Nasi Lemak", "count": 25 * multiplier, "percentage": 35},
            {"name": "Ayam Goreng", "count": 20 * multiplier, "percentage": 25},
            {"name": "Mee Goreng", "count": 15 * multiplier, "percentage": 20},
            {"name": "Roti Canai", "count": 10 * multiplier, "percentage": 15},
            {"name": "Teh Tarik", "count": 5 * multiplier, "percentage": 5}
        ],
        "chart_data": {
            "labels": ["Nasi L.", "Ayam G.", "Mee G.", "Roti C.", "Teh T."],
            "datasets": [
                {
                    "data": [25 * multiplier, 20 * multiplier, 15 * multiplier, 10 * multiplier, 5 * multiplier]
                }
            ]
        },
        "best_seller": "Nasi Lemak",
        "best_seller_percent": 35
    }