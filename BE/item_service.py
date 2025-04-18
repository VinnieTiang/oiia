from database import query_to_dataframe

def get_items_by_merchant(merchant_id: str):
    query = """
        SELECT item_name, item_price, cuisine_tag 
        FROM items 
        WHERE merchant_id = :merchant_id
    """
    df = query_to_dataframe(query, {"merchant_id": merchant_id})
    return df.to_dict(orient="records")