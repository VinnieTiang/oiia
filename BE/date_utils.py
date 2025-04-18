import pandas as pd
from database import query_to_dataframe
from functools import lru_cache
from datetime import datetime, timedelta

@lru_cache(maxsize=1)
def get_latest_transaction_date():
    """
    Get the latest transaction date from the database.
    Cached for better performance.
    
    Returns:
        datetime.date: The latest transaction date
    """
    try:
        query = """
        SELECT MAX(DATE(order_time)) as latest_date
        FROM transactions
        """
        
        df = query_to_dataframe(query)
        
        if not df.empty and df['latest_date'].iloc[0] is not None:
            return pd.to_datetime(df['latest_date'].iloc[0]).date()
        else:
            # Fallback to current date if no transactions
            return datetime.now().date()
            
    except Exception as e:
        print(f"Error getting latest transaction date: {str(e)}")
        return datetime.now().date()