import pandas as pd
from prophet import Prophet
from database import query_to_dataframe

def load_merchant_sales_series(merchant_id: str):
    query = """
    SELECT order_time, order_value 
    FROM transactions 
    WHERE merchant_id = :merchant_id
    """
    
    df = query_to_dataframe(query, {"merchant_id": merchant_id})
    
    if df.empty:
        return pd.DataFrame()

    df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
    df["order_date"] = df["order_time"].dt.date
    daily_sales = df.groupby("order_date")["order_value"].sum().reset_index()
    daily_sales.columns = ["ds", "y"]
    return daily_sales

def forecast_sales(df: pd.DataFrame, periods=7):
    if len(df) < 10:
        raise ValueError("Not enough data to train a forecast model.")

    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)

    # Select only date and prediction
    forecast_result = forecast[["ds", "yhat"]].tail(periods)

    return forecast_result


def forecast_to_summary(forecast_df: pd.DataFrame):
    avg_sales = forecast_df["yhat"].mean()
    high_day = forecast_df.loc[forecast_df["yhat"].idxmax()]
    low_day = forecast_df.loc[forecast_df["yhat"].idxmin()]

    return f"""
📊 Forecast Summary (Next {len(forecast_df)} Days):
- Average predicted daily sales: RM{avg_sales:.0f}
- Highest predicted sales: RM{high_day['yhat']:.0f} on {high_day['ds'].strftime('%A, %d %b')}
- Lowest predicted sales: RM{low_day['yhat']:.0f} on {low_day['ds'].strftime('%A, %d %b')}
""".strip()
