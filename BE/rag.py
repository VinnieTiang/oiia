import pandas as pd
from datetime import datetime

def get_merchant_summary(merchant_id: str) -> str:
    try:
        df_tx = pd.read_csv("data/transaction_data.csv")
        df_items = pd.read_csv("data/items.csv")
        df_tx_items = pd.read_csv("data/transaction_items.csv")
    except Exception as e:
        return f"Error loading data: {e}"

    df_merchant_tx = df_tx[df_tx["merchant_id"] == merchant_id]
    if df_merchant_tx.empty:
        return "No data available for this merchant."

    # Sales
    total_revenue = df_merchant_tx["order_value"].sum()
    total_orders = len(df_merchant_tx)
    avg_order_value = total_revenue / total_orders

    # Order timing
    df_merchant_tx["order_hour"] = pd.to_datetime(df_merchant_tx["order_time"], dayfirst=False, errors="coerce").dt.hour
    peak_hours = df_merchant_tx["order_hour"].value_counts().sort_values(ascending=False).head(2).index.tolist()
    peak_range = f"{min(peak_hours)}:00–{max(peak_hours)+1}:00"

    # Top items
    df_joined = df_tx_items.merge(df_merchant_tx[["order_id"]], on="order_id")
    top_item_ids = df_joined["item_id"].value_counts().head(3).index.tolist()
    df_top_items = df_items[df_items["item_id"].isin(top_item_ids)]
    top_items_str = ", ".join(df_top_items["item_name"].values.tolist())

    # Top category
    category_counts = df_items[df_items["item_id"].isin(df_joined["item_id"])]["cuisine_tag"].value_counts()
    top_category = category_counts.idxmax()
    top_category_count = category_counts.max()

    # Basket size
    avg_basket_size = df_joined.groupby("order_id").size().mean()

    # Delivery time
    df_merchant_tx["order_time"] = pd.to_datetime(df_merchant_tx["order_time"], errors="coerce")
    df_merchant_tx["delivery_time"] = pd.to_datetime(df_merchant_tx["delivery_time"], errors="coerce")
    df_merchant_tx["delivery_duration_mins"] = (df_merchant_tx["delivery_time"] - df_merchant_tx["order_time"]).dt.total_seconds() / 60
    avg_delivery_time = df_merchant_tx["delivery_duration_mins"].mean()

    return f"""
Merchant Summary for ID: {merchant_id}

📈 Sales Performance:
- Total Revenue: ${total_revenue:.2f}
- Total Orders: {total_orders}
- Avg. Order Value: ${avg_order_value:.2f}

🕒 Peak Order Timing:
- Most orders happen between {peak_range}

🍽️ Top-Selling Items:
- {top_items_str}

🍱 Best-Performing Category:
- {top_category} ({top_category_count} items sold)

🛍️ Average Basket Size:
- {avg_basket_size:.2f} items per order

🚚 Delivery Efficiency:
- Average Delivery Time: {avg_delivery_time:.1f} minutes
""".strip()
