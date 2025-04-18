import pandas as pd
import math
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

def predict_stock_and_restock():
    # Load ingredient and usage data
    ingredient_df = pd.read_csv("data/ingredient.csv")
    usage_df = pd.read_csv("data/ingredient_usage.csv")
    
    # Convert date columns to datetime
    usage_df['date'] = pd.to_datetime(usage_df['date'], format='%m/%d/%Y')
    
    # Calculate average daily usage for each ingredient
    avg_usage = usage_df.groupby('ingredient_id')['usage'].mean().reset_index()
    avg_usage.rename(columns={'usage': 'avg_daily_usage'}, inplace=True)
    
    # Merge average usage with ingredient data
    ingredient_df = ingredient_df.merge(avg_usage, on='ingredient_id', how='left')
    
    # Calculate days left for each ingredient
    ingredient_df['days_left'] = ingredient_df.apply(
        lambda row: math.floor(row['stock_left'] / row['avg_daily_usage']) if row['avg_daily_usage'] > 0 else float('inf'),
        axis=1
    )
    
    # Determine if restocking is needed
    ingredient_df['needs_restock'] = ingredient_df['days_left'] <= 3
    
    # Output results
    for _, row in ingredient_df.iterrows():
        print(f"Ingredient: {row['ingredient_name']}")
        print(f"  Stock Left: {row['stock_left']}")
        print(f"  Avg Daily Usage: {row['avg_daily_usage']:.2f}")
        print(f"  Days Left: {row['days_left']}")
        if row['needs_restock']:
            print(f"  ** Restock Needed! Recommended stock: {row['recommended']} **")
        print()
    
    return ingredient_df

if __name__ == "__main__":
    # Test the function
    ingredients_df = load_all_ingredients()
    if not ingredients_df.empty:
        print("Ingredients Data:")
        print(ingredients_df)
    else:
        print("The ingredients table is empty.")