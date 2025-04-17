import pandas as pd
from datetime import datetime, timedelta
from database import query_to_dataframe

def get_merchant_today_summary(merchant_id: str) -> dict:
    """
    Get today's sales summary for a specific merchant.
    Assumes the latest day in the transaction database is "today". :D
    
    Args:
        merchant_id: The ID of the merchant
        
    Returns:
        dict: Dictionary containing total_sales and total_orders for today
    """
    try:
        # Get all transactions for the merchant
        query = """
        SELECT order_time, order_value 
        FROM transactions 
        WHERE merchant_id = :merchant_id
        """
        
        df = query_to_dataframe(query, {"merchant_id": merchant_id})
        
        if df.empty:
            return {
                "total_sales": 0,
                "total_orders": 0,
                "status": "No transactions found for this merchant"
            }

        # Convert order_time to datetime and create date column
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        df["order_date"] = df["order_time"].dt.date
        
        # Find the latest date in the data (representing "today")
        latest_date = df["order_date"].max()
        
        # Filter for today's transactions
        today_df = df[df["order_date"] == latest_date]
        
        # Calculate totals
        total_sales = today_df["order_value"].sum()
        total_orders = len(today_df)
        
        # Format for display
        formatted_sales = f"RM{total_sales:.2f}"
        
        return {
            "total_sales": total_sales,
            "total_sales_formatted": formatted_sales,
            "total_orders": total_orders,
            "date": latest_date.strftime("%Y-%m-%d"),
            "status": "success"
        }
        
    except Exception as e:
        return {
            "total_sales": 0,
            "total_orders": 0,
            "status": f"Error: {str(e)}"
        }

def get_merchant_period_summary(merchant_id: str, period: str = "week") -> dict:
    """
    Get sales summary for a specific period (week/month) for a merchant.
    
    Args:
        merchant_id: The ID of the merchant
        period: "week" or "month"
        
    Returns:
        dict: Dictionary containing total_sales and total_orders for the period
    """
    try:
        # Get all transactions for the merchant
        query = """
        SELECT order_time, order_value 
        FROM transactions 
        WHERE merchant_id = :merchant_id
        """
        
        df = query_to_dataframe(query, {"merchant_id": merchant_id})
        
        if df.empty:
            return {
                "total_sales": 0,
                "total_orders": 0,
                "status": "No transactions found for this merchant"
            }

        # Convert order_time to datetime and create date column
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        df["order_date"] = df["order_time"].dt.date
        
        # Find the latest date in the data (representing "today")
        latest_date = df["order_date"].max()
        
        # Determine the start date based on the period
        if period == "week":
            # Last 7 days including today
            start_date = latest_date - timedelta(days=6)
        elif period == "month":
            # Last 30 days including today
            start_date = latest_date - timedelta(days=29)
        else:
            raise ValueError("Period must be 'week' or 'month'")
            
        # Filter for the period's transactions
        period_df = df[(df["order_date"] >= start_date) & (df["order_date"] <= latest_date)]
        
        # Calculate totals
        total_sales = period_df["order_value"].sum()
        total_orders = len(period_df)
        
        # Format for display
        formatted_sales = f"RM{total_sales:.2f}"
        
        return {
            "total_sales": total_sales,
            "total_sales_formatted": formatted_sales,
            "total_orders": total_orders,
            "period": period,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": latest_date.strftime("%Y-%m-%d"),
            "status": "success"
        }
        
    except Exception as e:
        return {
            "total_sales": 0,
            "total_orders": 0,
            "status": f"Error: {str(e)}"
        }
