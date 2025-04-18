import pandas as pd
from database import query_to_dataframe

def load_all_ingredients():
    """
    Fetch all records from the ingredients table.
    """
    query = "SELECT * FROM ingredients"
    df = query_to_dataframe(query)
    
    if df.empty:
        print("No ingredients found in the database.")
        return pd.DataFrame()
    
    return df

if __name__ == "__main__":
    # Test the function
    ingredients_df = load_all_ingredients()
    if not ingredients_df.empty:
        print("Ingredients Data:")
        print(ingredients_df)
    else:
        print("The ingredients table is empty.")