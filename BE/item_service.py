from database import query_to_dataframe
from collections import Counter
from itertools import combinations
import pandas as pd

def get_items_by_merchant(merchant_id: str):
    query = """
        SELECT item_name, item_price, cuisine_tag 
        FROM items 
        WHERE merchant_id = :merchant_id
    """
    df = query_to_dataframe(query, {"merchant_id": merchant_id})
    records = df.to_dict(orient="records")
    
    # Add incremental id starting from 1
    for i, record in enumerate(records, start=1):
        record["id"] = i

    return records

def get_frequently_bought_together(merchant_id: str, limit: int = 3):
    """
    Get the top frequently bought together item pairs for a specific merchant.
    Uses the same sequential IDs as get_items_by_merchant.
    
    Args:
        merchant_id (str): The merchant ID
        limit (int): Maximum number of pairs to return (default: 3)
        
    Returns:
        dict: Contains the top item pairs, their prices, and frequency
    """
    try:
        # Get the merchant's items with the same query as get_items_by_merchant
        # This ensures we're using the same data structure
        items_query = """
            SELECT item_name, item_price, cuisine_tag, item_id 
            FROM items 
            WHERE merchant_id = :merchant_id
        """
        df_items = query_to_dataframe(items_query, {"merchant_id": merchant_id})
        
        if df_items.empty:
            return {
                "status": "error", 
                "message": "No items found for this merchant"
            }
            
        # Create a mapping from database item_id to sequential front-end id
        frontend_id_map = {}
        # Create a price map to store item prices
        price_map = {}
        for i, row in enumerate(df_items.itertuples(), start=1):
            frontend_id_map[getattr(row, 'item_id')] = i
            price_map[getattr(row, 'item_id')] = getattr(row, 'item_price')
            
        # Get merchant's item IDs from database
        merchant_item_ids = set(df_items["item_id"].tolist())
        
        # Get merchant's transactions
        tx_query = """SELECT order_id FROM transactions WHERE merchant_id = :merchant_id"""
        df_tx = query_to_dataframe(tx_query, {"merchant_id": merchant_id})
        
        if df_tx.empty:
            return {
                "status": "error",
                "message": "No transactions found for this merchant"
            }
            
        # Get order IDs to filter transaction items
        order_ids = df_tx["order_id"].tolist()
        if not order_ids:
            return {
                "status": "error",
                "message": "No order IDs found for this merchant"
            }
            
        # Build placeholders for SQL query
        placeholders = ', '.join(f"'{oid}'" for oid in order_ids)
        
        # Get transaction items for these orders
        tx_items_query = f"""SELECT * FROM transaction_items WHERE order_id IN ({placeholders})"""
        df_tx_items = query_to_dataframe(tx_items_query)
        
        if df_tx_items.empty:
            return {
                "status": "error",
                "message": "No transaction items found for this merchant's orders"
            }
            
        # Filter to only include the merchant's items
        merchant_tx_items = df_tx_items[df_tx_items["item_id"].isin(merchant_item_ids)]
        
        if merchant_tx_items.empty:
            return {
                "status": "error",
                "message": "No transaction items match this merchant's inventory"
            }
        
        # Build a list of all item combinations per order
        merchant_orders = merchant_tx_items.groupby("order_id")["item_id"].apply(list)
        
        pair_counter = Counter()
        
        for items in merchant_orders:
            unique_items = list(set(items))  # Avoid duplicate items in the same order
            if len(unique_items) > 1:
                pairs = combinations(sorted(unique_items), 2)
                pair_counter.update(pairs)
        
        # Get top N most common item pairs
        top_pairs = pair_counter.most_common(limit)
        
        # Convert item IDs to item names and use frontend IDs
        pair_results = []
        for (item1, item2), count in top_pairs:
            if item1 in merchant_item_ids and item2 in merchant_item_ids:
                # Get the corresponding frontend IDs
                frontend_id1 = frontend_id_map.get(item1)
                frontend_id2 = frontend_id_map.get(item2)
                
                # Get the item names
                name1 = df_items[df_items["item_id"] == item1]["item_name"].values[0]
                name2 = df_items[df_items["item_id"] == item2]["item_name"].values[0]
                
                # Get item prices
                price1 = float(price_map.get(item1, 0))
                price2 = float(price_map.get(item2, 0))
                
                # Calculate bundle price
                bundle_price = price1 + price2
                
                pair_results.append({
                    "item1": {
                        "id": frontend_id1,
                        "name": name1,
                        "price": price1
                    },
                    "item2": {
                        "id": frontend_id2,
                        "name": name2,
                        "price": price2
                    },
                    "bundle_price": bundle_price,
                    "count": count,
                    "display": f"{name1} (${price1:.2f}) + {name2} (${price2:.2f}) = ${bundle_price:.2f} ({count} times)"
                })
        
        # Handle the case when we don't have enough item pairs
        while len(pair_results) < limit:
            pair_results.append({
                "item1": {"id": 0, "name": "", "price": 0},
                "item2": {"id": 0, "name": "", "price": 0},
                "bundle_price": 0,
                "count": 0,
                "display": "No other frequent combinations"
            })
        
        return {
            "status": "success",
            "pairs": pair_results
        }
        
    except Exception as e:
        print(f"Error in get_frequently_bought_together: {str(e)}")
        return {
            "status": "error",
            "message": f"Error retrieving frequently bought together items: {str(e)}"
        }