import pandas as pd
from datetime import datetime, timedelta
from database import query_to_dataframe
import math

# Add this helper function to sanitize numerical values
def safe_float(value):
    """Convert value to float safely, replacing NaN or infinity with 0."""
    try:
        result = float(value)
        if math.isnan(result) or math.isinf(result):
            return 0.0
        return result
    except (ValueError, TypeError):
        return 0.0

def get_daily_sales_trend(merchant_id: str):
    """
    Get 2-hourly sales trend for today.
    
    Args:
        merchant_id: The ID of the merchant
        
    Returns:
        dict: Dictionary containing labels (2-hour intervals) and datasets for chart visualization
    """
    try:
        query = """
        SELECT order_time, order_value 
        FROM transactions 
        WHERE merchant_id = :merchant_id
        """
        
        df = query_to_dataframe(query, {"merchant_id": merchant_id})
        
        if df.empty:
            return default_daily_sales_trend()

        # Convert order_time to datetime
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        
        # Find the latest date in the data (representing "today")
        df["date"] = df["order_time"].dt.date
        latest_date = df["date"].max()
        
        # Filter today's transactions
        today_df = df[df["date"] == latest_date]
        
        # Get yesterday's date for comparison
        yesterday_date = latest_date - timedelta(days=1)
        yesterday_df = df[df["date"] == yesterday_date]
        
        # Extract hour and aggregate sales by hour
        today_df["hour"] = today_df["order_time"].dt.hour
        today_df["two_hour_block"] = (today_df["hour"] // 2) * 2  # Group into 2-hour blocks
        today_hourly = today_df.groupby("two_hour_block")["order_value"].sum().reset_index()
        
        # Create 2-hour blocks from 8AM to 10PM (typical business hours)
        hour_blocks = list(range(8, 23, 2))  # [8, 10, 12, 14, 16, 18, 20, 22]
        
        # Prepare data for chart with 2-hour labels in AM/PM format
        hour_labels = []
        for h in hour_blocks:
            if h == 12:
                hour_labels.append("12PM")
            elif h > 12:
                hour_labels.append(f"{h-12}PM")
            else:
                hour_labels.append(f"{h}AM")
        
        # Get sales for each 2-hour block (filling in zeros for blocks with no sales)
        sales_data = []
        for hour_block in hour_blocks:
            block_sales = today_hourly[today_hourly["two_hour_block"] == hour_block]["order_value"].sum() if not today_hourly.empty else 0
            sales_data.append(safe_float(block_sales))
        
        # Get previous day comparison data with the same 2-hour blocks
        yesterday_df["hour"] = yesterday_df["order_time"].dt.hour
        yesterday_df["two_hour_block"] = (yesterday_df["hour"] // 2) * 2
        yesterday_hourly = yesterday_df.groupby("two_hour_block")["order_value"].sum().reset_index()
        
        prev_sales_data = []
        for hour_block in hour_blocks:
            block_sales = yesterday_hourly[yesterday_hourly["two_hour_block"] == hour_block]["order_value"].sum() if not yesterday_hourly.empty else 0
            prev_sales_data.append(safe_float(block_sales))
            
        # Find peak 2-hour block
        if not today_hourly.empty:
            peak_hour_row = today_hourly.loc[today_hourly["order_value"].idxmax()]
            peak_hour_block = int(peak_hour_row["two_hour_block"])
            peak_hour_formatted = f"{peak_hour_block}:00-{peak_hour_block+2}:00"
        else:
            peak_hour_formatted = "N/A"
                    
        return {
            "labels": hour_labels,
            "datasets": [
                {
                    "data": sales_data,
                    "color": "rgba(47, 174, 96, 1)",
                    "strokeWidth": 2,
                },
            ],
            "comparison_data": prev_sales_data,
            "peak_hour": peak_hour_formatted
        }
    except Exception as e:
        print(f"Error in get_daily_sales_trend: {str(e)}")
        return default_daily_sales_trend()
        
def get_weekly_sales_trend(merchant_id: str):
    """
    Get daily sales trend for the current week.
    
    Args:
        merchant_id: The ID of the merchant
        
    Returns:
        dict: Dictionary containing labels (days) and datasets for chart visualization
    """
    try:
        query = """
        SELECT order_time, order_value 
        FROM transactions 
        WHERE merchant_id = :merchant_id
        """
        
        df = query_to_dataframe(query, {"merchant_id": merchant_id})
        
        if df.empty:
            return default_weekly_sales_trend()

        # Convert order_time to datetime
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        df["date"] = df["order_time"].dt.date
        
        # Find the latest date in the data
        latest_date = df["date"].max()
        
        # Calculate the start of the current week (last 7 days including today)
        week_start = latest_date - timedelta(days=6)
        
        # Filter current week's transactions
        current_week_df = df[(df["date"] >= week_start) & (df["date"] <= latest_date)]
        
        # Previous week date range
        prev_week_end = week_start - timedelta(days=1)
        prev_week_start = prev_week_end - timedelta(days=6)
        
        # Filter previous week's transactions
        prev_week_df = df[(df["date"] >= prev_week_start) & (df["date"] <= prev_week_end)]
        
        # Prepare day labels
        days = [(latest_date - timedelta(days=i)) for i in range(6, -1, -1)]
        day_labels = [day.strftime("%a") for day in days]  # Short day names (Mon, Tue, etc.)
        
        # Aggregate sales by date
        daily_sales = {}
        for day in days:
            daily_sales[day] = current_week_df[current_week_df["date"] == day]["order_value"].sum()
        
        # Create sales data array matching the order of day_labels
        sales_data = [safe_float(daily_sales.get(day, 0)) for day in days]
        
        # Aggregate previous week's sales by date
        prev_week_days = [(prev_week_end - timedelta(days=i)) for i in range(6, -1, -1)]
        prev_daily_sales = {}
        for day in prev_week_days:
            prev_daily_sales[day] = prev_week_df[prev_week_df["date"] == day]["order_value"].sum()
        
        # Create previous week sales data array
        prev_sales_data = [safe_float(prev_daily_sales.get(day, 0)) for day in prev_week_days]
        
        # Find peak day based on sales
        if sales_data:
            peak_day_index = sales_data.index(max(sales_data))
            peak_day = days[peak_day_index]
            peak_day_name = peak_day.strftime("%A")  # Full day name
        else:
            peak_day_name = "N/A"
            
        # Calculate percentage increase on peak day compared to same day in previous week
        if peak_day_name != "N/A" and prev_sales_data and peak_day_index < len(prev_sales_data):
            peak_day_value = sales_data[peak_day_index]
            prev_peak_day_value = prev_sales_data[peak_day_index]
            
            if prev_peak_day_value > 0:
                peak_day_increase = ((peak_day_value - prev_peak_day_value) / prev_peak_day_value) * 100
                peak_day_increase_formatted = f"{int(peak_day_increase)}%"
            else:
                peak_day_increase_formatted = "N/A"
        else:
            peak_day_increase_formatted = "N/A"
        
        return {
            "labels": day_labels,
            "datasets": [
                {
                    "data": sales_data,
                    "color": "rgba(47, 174, 96, 1)",
                    "strokeWidth": 2,
                },
            ],
            "comparison_data": prev_sales_data,
            "peak_day": peak_day_name,
            "peak_day_increase": peak_day_increase_formatted
        }
    except Exception as e:
        print(f"Error in get_weekly_sales_trend: {str(e)}")
        return default_weekly_sales_trend()

def get_monthly_sales_trend(merchant_id: str):
    """
    Get weekly sales trend for the current month.
    
    Args:
        merchant_id: The ID of the merchant
        
    Returns:
        dict: Dictionary containing labels (weeks) and datasets for chart visualization
    """
    try:
        query = """
        SELECT order_time, order_value 
        FROM transactions 
        WHERE merchant_id = :merchant_id
        """
        
        df = query_to_dataframe(query, {"merchant_id": merchant_id})
        
        if df.empty:
            return default_monthly_sales_trend()

        # Convert order_time to datetime
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        df["date"] = df["order_time"].dt.date
        
        # Find the latest date in the data
        latest_date = df["date"].max()
        
        # Calculate the start of the current month (last 30 days including today)
        month_start = latest_date - timedelta(days=29)
        
        # Filter current month's transactions
        current_month_df = df[(df["date"] >= month_start) & (df["date"] <= latest_date)]
        
        # Previous month date range
        prev_month_end = month_start - timedelta(days=1)
        prev_month_start = prev_month_end - timedelta(days=29)
        
        # Filter previous month's transactions
        prev_month_df = df[(df["date"] >= prev_month_start) & (df["date"] <= prev_month_end)]
        
        # Divide month into 4 weeks
        week_boundaries = [
            (latest_date - timedelta(days=29), latest_date - timedelta(days=22)),  # Week 1
            (latest_date - timedelta(days=21), latest_date - timedelta(days=14)),  # Week 2
            (latest_date - timedelta(days=13), latest_date - timedelta(days=6)),   # Week 3
            (latest_date - timedelta(days=5), latest_date)                         # Week 4
        ]
        
        # Week labels
        week_labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
        
        # Calculate sales for each week
        weekly_sales = []
        for start, end in week_boundaries:
            week_sales = current_month_df[(current_month_df["date"] >= start) & 
                                        (current_month_df["date"] <= end)]["order_value"].sum()
            weekly_sales.append(safe_float(week_sales))
        
        # Calculate previous month's weekly sales
        prev_week_boundaries = [
            (prev_month_start, prev_month_start + timedelta(days=7)),              # Week 1
            (prev_month_start + timedelta(days=8), prev_month_start + timedelta(days=15)),  # Week 2
            (prev_month_start + timedelta(days=16), prev_month_start + timedelta(days=23)), # Week 3
            (prev_month_start + timedelta(days=24), prev_month_end)                # Week 4
        ]
        
        prev_weekly_sales = []
        for start, end in prev_week_boundaries:
            week_sales = prev_month_df[(prev_month_df["date"] >= start) & 
                                     (prev_month_df["date"] <= end)]["order_value"].sum()
            prev_weekly_sales.append(safe_float(week_sales))
        
        # Find peak week
        if weekly_sales:
            peak_week_index = weekly_sales.index(max(weekly_sales))
            peak_week = week_labels[peak_week_index]
        else:
            peak_week = "N/A"
            
        # Calculate percentage increase for peak week
        if peak_week != "N/A" and prev_weekly_sales and peak_week_index < len(prev_weekly_sales):
            peak_week_value = weekly_sales[peak_week_index]
            prev_peak_week_value = prev_weekly_sales[peak_week_index]
            
            if prev_peak_week_value > 0:
                peak_week_increase = ((peak_week_value - prev_peak_week_value) / prev_peak_week_value) * 100
                peak_week_increase_formatted = f"{int(peak_week_increase)}%"
            else:
                peak_week_increase_formatted = "N/A"
        else:
            peak_week_increase_formatted = "N/A"
        
        return {
            "labels": week_labels,
            "datasets": [
                {
                    "data": weekly_sales,
                    "color": "rgba(47, 174, 96, 1)",
                    "strokeWidth": 2,
                },
            ],
            "comparison_data": prev_weekly_sales,
            "peak_week": peak_week,
            "peak_week_increase": peak_week_increase_formatted
        }
    except Exception as e:
        print(f"Error in get_monthly_sales_trend: {str(e)}")
        return default_monthly_sales_trend()


def default_daily_sales_trend():
    """Return default data for daily sales trend when no data is available"""
    return {
        "labels": ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"],
        "datasets": [
            {
                "data": [0, 0, 0, 0, 0, 0, 0, 0],
                "color": lambda opacity=1: f"rgba(47, 174, 96, {opacity})",
                "strokeWidth": 2,
            },
        ],
        "comparison_data": [180, 300, 1000, 700, 350, 800, 500, 250],
        "peak_hour": "..."
    }


def default_weekly_sales_trend():
    """Return default data for weekly sales trend when no data is available"""
    return {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "datasets": [
            {
                "data": [850, 1200, 950, 1100, 1400, 1800, 1500],
                "color": "rgba(47, 174, 96, 1)",
                "strokeWidth": 2,
            },
        ],
        "comparison_data": [700, 1000, 800, 900, 1200, 1500, 1300],
        "peak_day": "Saturday",
        "peak_day_increase": "30%"
    }


def default_monthly_sales_trend():
    """Return default data for monthly sales trend when no data is available"""
    return {
        "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "datasets": [
            {
                "data": [5200, 5800, 6200, 7000],
                "color": "rgba(47, 174, 96, 1)",
                "strokeWidth": 2,
            },
        ],
        "comparison_data": [5000, 5200, 5800, 6500],
        "peak_week": "Week 4",
        "peak_week_increase": "20%"
    }


def get_sales_trend(merchant_id: str, period: str):
    """
    Get sales trend data for the specified period.
    
    Args:
        merchant_id: The ID of the merchant
        period: "daily", "weekly", or "monthly"
        
    Returns:
        dict: Dictionary containing chart data for the specified period
    """
    if period == "daily":
        return get_daily_sales_trend(merchant_id)
    elif period == "weekly":
        return get_weekly_sales_trend(merchant_id)
    elif period == "monthly":
        return get_monthly_sales_trend(merchant_id)
    else:
        raise ValueError("Period must be 'daily', 'weekly', or 'monthly'")