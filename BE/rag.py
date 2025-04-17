import pandas as pd
from datetime import datetime, timedelta
from collections import Counter
from database import query_to_dataframe  # Import the database function

def get_city_comparison(merchant_id: str) -> str:
    """Generate comparison metrics against city peers"""
    try:
        # Get merchant info from database
        merchant_query = """
        SELECT * FROM merchants
        WHERE merchant_id = :merchant_id
        """
        merchant_df = query_to_dataframe(merchant_query, {"merchant_id": merchant_id})
        
        if merchant_df.empty:
            return "\n⚠️ Could not generate city comparison: Merchant not found"
            
        merchant = merchant_df.iloc[0]
        city_id = merchant["city_id"]  # Adjust field name if different in your schema
        
        # Get all merchants in same city from database
        city_merchants_query = """
        SELECT * FROM merchants
        WHERE city_id = :city_id
        """
        city_merchants = query_to_dataframe(city_merchants_query, {"city_id": city_id})
        city_merchant_ids = city_merchants["merchant_id"].tolist()
        
        # Create placeholders for SQL IN clause
        merchant_ids_str = "', '".join(city_merchant_ids)
        
        # Get city transactions from database
        city_transactions_query = f"""
        SELECT * FROM transactions
        WHERE merchant_id IN ('{merchant_ids_str}')
        """
        city_transactions = query_to_dataframe(city_transactions_query)
        
        # Get merchant transactions from database
        merchant_transactions_query = """
        SELECT * FROM transactions
        WHERE merchant_id = :merchant_id
        """
        merchant_transactions = query_to_dataframe(merchant_transactions_query, {"merchant_id": merchant_id})
        
        # Calculate comparison metrics
        metrics = {
            # Revenue metrics
            "total_revenue": {
                "merchant": merchant_transactions["order_value"].sum(),
                "city_avg": city_transactions.groupby("merchant_id")["order_value"].sum().mean(),
                "city_top_25": city_transactions.groupby("merchant_id")["order_value"].sum().quantile(0.75)
            },
            # Order volume
            "order_count": {
                "merchant": len(merchant_transactions),
                "city_avg": city_transactions.groupby("merchant_id").size().mean(),
                "city_top_25": city_transactions.groupby("merchant_id").size().quantile(0.75)
            }
        }
        
        # Add delivery speed metrics if columns exist
        if "delivery_time" in merchant_transactions.columns and "order_time" in merchant_transactions.columns:
            metrics["delivery_speed"] = {
                "merchant": (pd.to_datetime(merchant_transactions["delivery_time"]) - 
                            pd.to_datetime(merchant_transactions["order_time"])).dt.total_seconds().mean() / 60,
                "city_avg": (pd.to_datetime(city_transactions["delivery_time"]) - 
                            pd.to_datetime(city_transactions["order_time"])).dt.total_seconds().mean() / 60
            }
        
        # Add business age metrics if the column exists
        if "join_date" in merchant.keys():
            metrics["business_age"] = {
                "merchant": (datetime.now() - pd.to_datetime(merchant["join_date"])).days / 365,
                "city_avg": (datetime.now() - pd.to_datetime(city_merchants["join_date"])).dt.days.mean() / 365
            }
        
        # Generate comparison text
        comparison_text = f"""
🏙️ City Comparison Metrics (City ID: {city_id}):

💰 Revenue:
- Yours: ${metrics['total_revenue']['merchant']:,.2f}
- City Avg: ${metrics['total_revenue']['city_avg']:,.2f}
- Top 25%: ${metrics['total_revenue']['city_top_25']:,.2f}

📦 Order Volume:
- Yours: {metrics['order_count']['merchant']} orders
- City Avg: {metrics['order_count']['city_avg']:.1f} orders
- Top 25%: {metrics['order_count']['city_top_25']:.1f} orders
"""

        # Add delivery speed if available
        if "delivery_speed" in metrics:
            comparison_text += f"""
⏱️ Delivery Speed:
- Yours: {metrics['delivery_speed']['merchant']:.1f} mins
- City Avg: {metrics['delivery_speed']['city_avg']:.1f} mins
"""

        # Add business age if available
        if "business_age" in metrics:
            comparison_text += f"""
🏢 Business Longevity:
- Yours: {metrics['business_age']['merchant']:.1f} years
- City Avg: {metrics['business_age']['city_avg']:.1f} years
"""
        return comparison_text
        
    except Exception as e:
        return f"\n⚠️ Could not generate city comparison: {str(e)}"

def get_merchant_summary(merchant_id: str) -> str:
    try:
        # Load all datasets from database
        merchants_query = """SELECT * FROM merchants"""
        df_merchants = query_to_dataframe(merchants_query)
        
        tx_query = """SELECT * FROM transactions"""
        df_tx = query_to_dataframe(tx_query)
        
        items_query = """SELECT * FROM items"""
        df_items = query_to_dataframe(items_query)
        
        tx_items_query = """SELECT * FROM transaction_items"""
        df_tx_items = query_to_dataframe(tx_items_query)
        
        keywords_query = """SELECT * FROM keywords"""
        df_keywords = query_to_dataframe(keywords_query)
        
        # Convert date columns
        df_tx["order_time"] = pd.to_datetime(df_tx["order_time"])
        df_merchants["join_date"] = pd.to_datetime(df_merchants["join_date"], format="%d%m%Y", errors="coerce")
    except Exception as e:
        return f"Error loading data: {e}"
    
    # Get merchant info
    merchant_info = df_merchants[df_merchants["merchant_id"] == merchant_id].iloc[0]
    merchant_name = merchant_info["merchant_name"]  # Adjust field name if different
    join_date = merchant_info["join_date"]
    city_id = merchant_info["city_id"]  # Adjust field name if different
    business_duration = (datetime.now() - join_date).days // 30  # in months
    
    # Filter merchant transactions
    df_merchant_tx = df_tx[df_tx["merchant_id"] == merchant_id]
    if df_merchant_tx.empty:
        return "No data available for this merchant."
    
    # --- Business Scale Analysis ---
    tx_count = len(df_merchant_tx)
    avg_daily_orders = tx_count / ((datetime.now() - df_merchant_tx["order_time"].min()).days or 1)
    item_variety = len(df_items[df_items["merchant_id"] == merchant_id])
    
    if tx_count < 500 or avg_daily_orders < 5:
        business_scale = "Small (Street vendor/Family shop)"
    elif tx_count < 5000 or avg_daily_orders < 50:
        business_scale = "Medium (Full restaurant)"
    else:
        business_scale = "Large (Chain/Multi-location)"
    
    # Create joined DataFrame
    df_joined = df_tx_items.merge(
        df_merchant_tx[["order_id", "eater_id"]],  # Include both columns
        on="order_id"
    )

    # --- Sales Performance ---
    total_revenue = df_merchant_tx["order_value"].sum()
    total_orders = len(df_merchant_tx)
    avg_order_value = total_revenue / total_orders
    
    # Weekly revenue
    last_week = datetime.now() - timedelta(days=7)
    weekly_revenue = df_merchant_tx[df_merchant_tx["order_time"] >= last_week]["order_value"].sum()
    
    # --- Customer Analysis ---
    # Returning customers
    customer_orders = df_merchant_tx["eater_id"].value_counts()
    returning_customers = len(customer_orders[customer_orders > 1])
    total_customers = len(customer_orders)
    retention_rate = round((returning_customers / total_customers) * 100, 1) if total_customers else 0
    
    # Get top items for returning customers
    returning_eater_ids = customer_orders[customer_orders > 1].index.tolist()
    df_returning_cust_orders = df_joined[df_joined["eater_id"].isin(returning_eater_ids)]
    
    # Check if df_items has 'item_name' or 'name' for the item name
    item_name_col = "item_name" if "item_name" in df_items.columns else "name"
    cuisine_tag_col = "cuisine_tag" if "cuisine_tag" in df_items.columns else "category"
    
    top_returning_items = df_items[df_items["item_id"].isin(
        df_returning_cust_orders["item_id"].value_counts().head(2).index
    )][item_name_col].tolist()

    # Inactive returning customers (last order >30 days ago)
    last_order_dates = df_merchant_tx.groupby("eater_id")["order_time"].max()
    inactive_returning = len([
        eid for eid in returning_eater_ids 
        if (datetime.now() - last_order_dates[eid]).days > 30
    ])
    
    # --- Order Timing ---
    df_merchant_tx = df_merchant_tx.copy()  # Create an explicit copy
    df_merchant_tx.loc[:, "order_hour"] = df_merchant_tx["order_time"].dt.hour
    peak_hours = df_merchant_tx["order_hour"].value_counts().sort_values(ascending=False).head(2).index.tolist()
    peak_range = f"{min(peak_hours)}:00–{max(peak_hours)+1}:00"
    
    # --- Product Analysis ---
    df_joined = df_tx_items.merge(df_merchant_tx[["order_id"]], on="order_id")
    
    # Top items
    top_item_ids = df_joined["item_id"].value_counts().head(3).index.tolist()
    df_top_items = df_items[df_items["item_id"].isin(top_item_ids)]
    top_items_str = ", ".join(df_top_items[item_name_col].values.tolist())
    
    # Top category
    category_counts = df_items[df_items["item_id"].isin(df_joined["item_id"])][cuisine_tag_col].value_counts()
    top_category = category_counts.idxmax() if not category_counts.empty else "Unknown"
    top_category_count = category_counts.max() if not category_counts.empty else 0
    
    # View vs Purchase analysis (if keywords data is available)
    view_to_purchase_ratio = ""
    if not df_keywords.empty and "view" in df_keywords.columns:
        viewed_items = df_keywords["view"].value_counts() 
        purchased_items = df_joined["item_id"].value_counts()
        
        # Items with high views but low purchases
        common_items = set(viewed_items.index).intersection(set(purchased_items.index))
        underperforming_items = []
        for item in common_items:
            ratio = purchased_items.get(item, 0) / viewed_items.get(item, 1)
            if ratio < 0.1:  # Only 10% of views convert to purchases
                item_name = df_items[df_items["item_id"] == item][item_name_col].values[0]
                underperforming_items.append(item_name)
        
        if underperforming_items:
            view_to_purchase_ratio = "\n🚨 Underperforming Items (High Views, Low Purchases):\n- " + "\n- ".join(underperforming_items)
    
    # --- Basket Analysis ---
    avg_basket_size = df_joined.groupby("order_id").size().mean()
    
    # --- Delivery Performance ---
    if "delivery_time" in df_merchant_tx.columns:
        df_merchant_tx["delivery_time"] = pd.to_datetime(df_merchant_tx["delivery_time"])
        df_merchant_tx["delivery_duration_mins"] = (df_merchant_tx["delivery_time"] - df_merchant_tx["order_time"]).dt.total_seconds() / 60
        avg_delivery_time = df_merchant_tx["delivery_duration_mins"].mean()
    else:
        avg_delivery_time = "N/A"
    
    # --- Competitor Analysis ---
    city_merchants = df_merchants[df_merchants["city_id"] == city_id]["merchant_id"].tolist()
    city_avg_order_value = df_tx[df_tx["merchant_id"].isin(city_merchants)]["order_value"].mean()
    
    # --- Business Maturity ---
    business_years = business_duration / 12  # Convert months to years

    if business_years < 2:
        maturity = f"Established (1-2 years) – Focus on customer retention and menu optimization.\n• Implement loyalty rewards\n• Analyze customer feedback\n• Optimize your top-selling items"
    elif business_years < 5:
        maturity = f"Maturing ({business_years:.1f} years) – Time to expand and innovate.\n• Develop seasonal specials\n• Explore catering options\n• Partner with local businesses"
    elif business_years < 10:
        maturity = f"Seasoned (5-10 years) – Strengthen your market position.\n• Refresh your brand image\n• Train staff for consistency\n• Automate routine tasks"
    else:
        maturity = f"Veteran (10+ years) – Legacy business opportunities.\n• Consider franchising\n• Mentor new entrepreneurs\n• Community engagement programs"
        
    # Add city comparison
    city_merchants = df_merchants[df_merchants["city_id"] == city_id]
    city_ages = (datetime.now() - pd.to_datetime(city_merchants["join_date"], format="%d%m%Y")).dt.days / 365
    city_avg = city_ages.mean()
    
    # --- City Comparison ---
    city_comparison = get_city_comparison(merchant_id)

    comparison = ""
    if not pd.isna(city_avg):
        percentile = (city_ages < business_years).mean() * 100
        comparison = f"\n🏙️ Compared to city average of {city_avg:.1f} years (older than {percentile:.0f}% of peers)"
    
    return f"""
Merchant Profile: {merchant_name} ({merchant_id})

📊 Business Scale: {business_scale}
- Total Orders: {tx_count}
- Avg Daily Orders: {avg_daily_orders:.1f}
- Menu Items: {item_variety}

📊 Customer Loyalty:
- Returning Customers: {returning_customers}/{total_customers} ({retention_rate}%)
- Most Loyal Customer: {customer_orders.max()} orders
- Top Returning Customer Choices: {", ".join(top_returning_items)}
- Inactive Returners: {inactive_returning} (30+ days since last order)

📍 Location: City {city_id} | 🏢 Business Age: {maturity}

📈 Sales Performance:
- Total Revenue: ${total_revenue:.2f}
- Last 7 Days Revenue: ${weekly_revenue:.2f}
- Total Orders: {total_orders}
- Avg. Order Value: ${avg_order_value:.2f} (City Avg: ${city_avg_order_value:.2f})
- Returning Customers: {returning_customers}

🕒 Peak Order Timing:
- Most orders happen between {peak_range}

🍽️ Product Performance:
- Top-Selling Items: {top_items_str}
- Best Category: {top_category} ({top_category_count} items sold)
{view_to_purchase_ratio}

🛍️ Customer Behavior:
- Avg. Basket Size: {avg_basket_size:.2f} items per order

🚚 Delivery Metrics:
- Avg. Delivery Time: {avg_delivery_time if isinstance(avg_delivery_time, str) else f"{avg_delivery_time:.1f} minutes"}

{city_comparison}
""".strip()