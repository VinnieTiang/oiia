from database import query_to_dataframe

def get_category_distribution(merchant_id: str):
    """
    Calculate the percentage distribution of sales by category (cuisine_tag)
    for a specific merchant based on transaction data.
    
    Args:
        merchant_id (str): Merchant ID to analyze
        
    Returns:
        dict: Category distribution data with names, percentages, and colors
    """
    try:
        # Direct join between transaction_items and items tables
        # to get cuisine distribution for the merchant
        query = """
            SELECT i.cuisine_tag, COUNT(*) as count
            FROM transaction_items ti
            JOIN items i ON ti.item_id = i.item_id
            WHERE ti.merchant_id = :merchant_id
            GROUP BY i.cuisine_tag
            ORDER BY count DESC
        """
        
        category_df = query_to_dataframe(query, {"merchant_id": merchant_id})
        
        if category_df.empty:
            return {"status": "error", "message": "No category data found for this merchant"}
        
        # Calculate total items for percentage calculation
        total_items = category_df['count'].sum()
        
        # Define a list of pleasant colors for visualization
        colors = ["#2FAE60", "#FFA726", "#42A5F5", "#9C27B0", "#F44336", "#FF9800", "#8BC34A"]
        
        # Create category distribution data with percentages
        category_distribution = []
        
        for i, (_, row) in enumerate(category_df.iterrows()):
            category_name = row['cuisine_tag'] or "Uncategorized"
            count = row['count']
            
            # Calculate the percentage and round to nearest integer
            percentage = round((count / total_items) * 100)
            
            category_distribution.append({
                "name": category_name,
                "population": percentage,
                "color": colors[i % len(colors)],
                "legendFontColor": "#7F7F7F",
                "legendFontSize": 12
            })
        
        # Limit to top 5 categories to avoid overcrowding
        if len(category_distribution) > 5:
            # Calculate "Others" category
            others_percentage = sum(item["population"] for item in category_distribution[5:])
            if others_percentage > 0:
                category_distribution = category_distribution[:5] + [{
                    "name": "Others",
                    "population": others_percentage,
                    "color": "#9E9E9E",  # Gray color for "Others"
                    "legendFontColor": "#7F7F7F",
                    "legendFontSize": 12
                }]
            else:
                category_distribution = category_distribution[:5]
        
        return {
            "status": "success",
            "data": category_distribution
        }
        
    except Exception as e:
        print(f"Error in get_category_distribution: {str(e)}")
        return {"status": "error", "message": str(e)}