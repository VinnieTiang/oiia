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
                "total_sales_formatted": "RM0",
                "total_orders": 0,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "vs_last_period": 0,
                "vs_last_period_formatted": "+0%",
                "avg_order_value": 0,
                "avg_order_value_formatted": "RM0.00",
                "avg_order_vs_last_period": 0,
                "avg_order_vs_last_period_formatted": "+0%",
                "status": "No transactions found for this merchant"
            }

        # Convert order_time to datetime and create date column
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        df["order_date"] = df["order_time"].dt.date
        
        # Find the latest date in the data (representing "today")
        latest_date = df["order_date"].max()
        yesterday_date = latest_date - timedelta(days=1)
        
        # Filter for today's transactions
        today_df = df[df["order_date"] == latest_date]
        
        # Filter for yesterday's transactions
        yesterday_df = df[df["order_date"] == yesterday_date]
        
        # Calculate totals for today
        total_sales = today_df["order_value"].sum()
        total_orders = len(today_df)
        
        # Calculate average order value
        avg_order = total_sales / total_orders if total_orders > 0 else 0
        
        # Calculate totals for yesterday
        yesterday_sales = yesterday_df["order_value"].sum()
        
        # Calculate percentage change
        if yesterday_sales > 0:
            percentage_change = ((total_sales - yesterday_sales) / yesterday_sales) * 100
        else:
            percentage_change = 0 if total_sales == 0 else 100  # If previous was 0, and current > 0, that's 100% increase
        
        # Calculate average order value change
        yesterday_avg_order = yesterday_sales / len(yesterday_df) if len(yesterday_df) > 0 else 0
        
        if yesterday_avg_order > 0:
            avg_order_percentage_change = ((avg_order - yesterday_avg_order) / yesterday_avg_order) * 100
        else:
            avg_order_percentage_change = 0 if avg_order == 0 else 100
            
        # Format for display
        formatted_sales = f"RM{total_sales:.0f}"
        formatted_percentage = f"{'+' if percentage_change >= 0 else ''}{percentage_change:.0f}%"
        formatted_avg_order_percentage = f"{'+' if avg_order_percentage_change >= 0 else ''}{avg_order_percentage_change:.0f}%"
        
        return {
            "total_sales": total_sales,
            "total_sales_formatted": formatted_sales,
            "total_orders": total_orders,
            "date": latest_date.strftime("%Y-%m-%d"),
            "vs_last_period": percentage_change,
            "vs_last_period_formatted": formatted_percentage,
            "avg_order_value": avg_order,
            "avg_order_value_formatted": f"RM{avg_order:.2f}",
            "avg_order_vs_last_period": avg_order_percentage_change,
            "avg_order_vs_last_period_formatted": formatted_avg_order_percentage,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "total_sales": 0,
            "total_sales_formatted": "RM0",
            "total_orders": 0,
            "vs_last_period": 0,
            "vs_last_period_formatted": "+0%",
            "avg_order_value": 0,
            "avg_order_value_formatted": "RM0.00",
            "avg_order_vs_last_period": 0,
            "avg_order_vs_last_period_formatted": "+0%",
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
                "total_sales_formatted": "RM0",
                "total_orders": 0,
                "period": period,
                "vs_last_period": 0,
                "vs_last_period_formatted": "+0%",
                "orders_vs_last_period": 0,
                "orders_vs_last_period_formatted": "+0%",
                "avg_order_value": 0,
                "avg_order_value_formatted": "RM0.00",
                "avg_order_vs_last_period": 0,
                "avg_order_vs_last_period_formatted": "+0%",
                "status": "No transactions found for this merchant"
            }

        # Convert order_time to datetime and create date column
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        df["order_date"] = df["order_time"].dt.date
        
        # Find the latest date in the data (representing "today")
        latest_date = df["order_date"].max()
        
        # Determine the start date based on the period
        if period == "week":
            # Current period: Last 7 days including today
            current_period_start = latest_date - timedelta(days=6)
            current_period_end = latest_date
            
            # Previous period: The 7 days before the current period
            previous_period_start = current_period_start - timedelta(days=7)
            previous_period_end = current_period_start - timedelta(days=1)
        elif period == "month":
            # Current period: Last 30 days including today
            current_period_start = latest_date - timedelta(days=29)
            current_period_end = latest_date
            
            # Previous period: The 30 days before the current period
            previous_period_start = current_period_start - timedelta(days=30)
            previous_period_end = current_period_start - timedelta(days=1)
        else:
            raise ValueError("Period must be 'week' or 'month'")
            
        # Filter for the current period's transactions
        current_period_df = df[(df["order_date"] >= current_period_start) & (df["order_date"] <= current_period_end)]
        
        # Filter for the previous period's transactions
        previous_period_df = df[(df["order_date"] >= previous_period_start) & (df["order_date"] <= previous_period_end)]
        
        # Calculate current period totals
        current_total_sales = current_period_df["order_value"].sum()
        current_total_orders = len(current_period_df)
        
        # Calculate previous period totals
        previous_total_sales = previous_period_df["order_value"].sum()
        previous_total_orders = len(previous_period_df)
        
        # Calculate percentage changes
        if previous_total_sales > 0:
            sales_percentage_change = ((current_total_sales - previous_total_sales) / previous_total_sales) * 100
        else:
            sales_percentage_change = 0 if current_total_sales == 0 else 100
            
        if previous_total_orders > 0:
            orders_percentage_change = ((current_total_orders - previous_total_orders) / previous_total_orders) * 100
        else:
            orders_percentage_change = 0 if current_total_orders == 0 else 100
        
        # Calculate average order value and its percentage change
        current_avg_order = current_total_sales / current_total_orders if current_total_orders > 0 else 0
        previous_avg_order = previous_total_sales / previous_total_orders if previous_total_orders > 0 else 0
        
        if previous_avg_order > 0:
            avg_order_percentage_change = ((current_avg_order - previous_avg_order) / previous_avg_order) * 100
        else:
            avg_order_percentage_change = 0 if current_avg_order == 0 else 100
        
        # Format for display
        formatted_sales = f"RM{current_total_sales:.0f}"
        formatted_sales_percentage = f"{'+' if sales_percentage_change >= 0 else ''}{sales_percentage_change:.0f}%"
        formatted_orders_percentage = f"{'+' if orders_percentage_change >= 0 else ''}{orders_percentage_change:.0f}%"
        formatted_avg_order_percentage = f"{'+' if avg_order_percentage_change >= 0 else ''}{avg_order_percentage_change:.0f}%"
        
        return {
            "total_sales": current_total_sales,
            "total_sales_formatted": formatted_sales,
            "total_orders": current_total_orders,
            "period": period,
            "start_date": current_period_start.strftime("%Y-%m-%d"),
            "end_date": current_period_end.strftime("%Y-%m-%d"),
            "vs_last_period": sales_percentage_change,
            "vs_last_period_formatted": formatted_sales_percentage,
            "orders_vs_last_period": orders_percentage_change,
            "orders_vs_last_period_formatted": formatted_orders_percentage,
            "avg_order_value": current_avg_order,
            "avg_order_value_formatted": f"RM{current_avg_order:.2f}",
            "avg_order_vs_last_period": avg_order_percentage_change,
            "avg_order_vs_last_period_formatted": formatted_avg_order_percentage,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "total_sales": 0,
            "total_sales_formatted": "RM0",
            "total_orders": 0,
            "vs_last_period": 0,
            "vs_last_period_formatted": "+0%",
            "orders_vs_last_period": 0,
            "orders_vs_last_period_formatted": "+0%",
            "avg_order_value": 0,
            "avg_order_value_formatted": "RM0.00",
            "avg_order_vs_last_period": 0,
            "avg_order_vs_last_period_formatted": "+0%",
            "status": f"Error: {str(e)}"
        }
