from database import query_to_dataframe

def get_items_by_merchant(merchant_id: str):
    query = """
        SELECT item_name, item_price, cuisine_tag 
        FROM items 
        WHERE merchant_id = :merchant_id
    """
    df = query_to_dataframe(query, {"merchant_id": merchant_id})
    return df.to_dict(orient="records")

def get_merchant_name_by_id(merchant_id: str):
    query = """
        SELECT merchant_name
        FROM merchants
        WHERE merchant_id = :merchant_id
    """
    df = query_to_dataframe(query,{"merchant_id": merchant_id})
    
    if df.empty:
        return "Unknown Merchant"
    
    return df['merchant_name'].iloc[0]