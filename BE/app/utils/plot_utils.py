import os
import pandas as pd
import json
from openai import OpenAI
from database import query_to_dataframe

client = OpenAI()

def parse_graph_request(question: str, merchant_id: str):
    """
    Parse user question to determine graph type and required data
    Returns: dict containing graph type and data needed for frontend rendering
    """
    try:
        # Step 1: Get basic merchant information for context
        merchant_query = """
        SELECT * FROM merchants 
        WHERE merchant_id = :merchant_id
        """
        merchant_df = query_to_dataframe(merchant_query, {"merchant_id": merchant_id})
        
        if merchant_df.empty:
            return {"error": f"No data found for merchant {merchant_id}."}
        
        merchant_name = merchant_df['name'].iloc[0] if 'name' in merchant_df.columns else "Unknown"
        
        # Step 2: Use AI to determine what data we need and which graph type to use
        graph_selection_prompt = f"""
        Given this question about a food merchant's business: "{question}"
        
        Which of these tables would contain the most relevant data to answer the question with a graph?
        -TABLE "ingredient_usage":
            "name": "ingredient_id", "type": "BIGINT","name": "date", "type": "TEXT", "name": "usage", "type": "BIGINT"
        - TABLE "ingredients":
            "name": "ingredient_id", "type": "BIGINT", "name": "stock_left", "type": "BIGINT", "name": "last_restock", "type": "TEXT", "name": "recommended", "type": "BIGINT"
        - TABLE "items": 
            "name": "item_id", "type": "BIGINT", "name": "cuisine_tag", "type": "TEXT", "name": "item_name", "type": "TEXT", "name": "item_price", "type": "FLOAT", "name": "merchant_id", "type": "TEXT"
        - TABLE "keywords": 
            "name": "keyword", "type": "TEXT", "name": "view", "type": "BIGINT", "name": "menu", "type": "BIGINT", "name": "checkout", "type": "BIGINT", "name": "order", "type": "BIGINT"
        - TABLE "merchants": 
            "name": "merchant_id", "type": "TEXT", "name": "merchant_name", "type": "TEXT", "name": "join_date", "type": "BIGINT", "name": "city_id", "type": "BIGINT"
        - TABLE "transaction_items": 
            "name": "order_id", "type": "TEXT", "name": "item_id", "type": "BIGINT", "name": "merchant_id", "type": "TEXT"
        - TABLE "transactions":
            "name": "order_id", "type": "TEXT", "name": "order_time", "type": "DATETIME", "name": "driver_arrival_time", "type": "TEXT", "name": "driver_pickup_time", "type": "TEXT", "name": "delivery_time", "type": "TEXT", "name": "order_value", "type": "FLOAT", "name": "eater_id", "type": "BIGINT", "name": "merchant_id", "type": "TEXT"

        What is the most appropriate graph type to visualize this data? Choose from:
        1. LINE - For time series data and trends over time
        2. BAR - For comparing quantities across categories
        3. PIE - For showing proportions of a whole
        4. SCATTER - For showing relationships between two variables
        
        Answer in this format exactly:
        TABLE: [table_name](could be more than one table)
        GRAPH_TYPE: [ONE OF: LINE, BAR, PIE, SCATTER]
        SQL: [write a SQL query that will extract the relevant data for this merchant_id={merchant_id}]
        """
        
        data_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": graph_selection_prompt}],
            temperature=0
        )
        
        data_guidance = data_response.choices[0].message.content
        print(f"AI Response for graph selection: {data_guidance}")
        
        # Extract information from the AI response
        graph_type = None
        sql_query = None
        
        # Parse the response
        for line in data_guidance.split('\n'):
            if line.startswith('GRAPH_TYPE:'):
                graph_type = line.replace('GRAPH_TYPE:', '').strip()
            elif line.startswith('SQL:'):
                sql_query = line.replace('SQL:', '').strip()
                # Get everything after SQL: until the end
                sql_parts = data_guidance.split('SQL:')
                if len(sql_parts) > 1:
                    sql_query = sql_parts[1].strip()
        
        if not graph_type or not sql_query:
            return {"error": "Failed to determine graph type or generate SQL query"}
        
        # Execute the SQL query to get the data
        try:
            df = query_to_dataframe(sql_query, {"merchant_id": merchant_id})
            if df.empty:
                return {"error": f"No relevant data found for merchant {merchant_id} to answer this question."}
        except Exception as sql_error:
            return {"error": f"SQL Error: {str(sql_error)}"}
        
        # Process the dataframe based on graph type
        chart_data = prepare_chart_data(df, graph_type)
        
        # Generate a caption for the chart
        caption_prompt = f"""
        I've analyzed data to answer this question: "{question}"
        
        The data is for merchant "{merchant_name}" and includes these values:
        {df.describe().to_string()}
        
        Please write a concise, insightful caption (2-3 sentences) that:
        1. Explains what the data shows
        2. Highlights the most important insight
        3. Connects this insight to a business recommendation if possible
        
        Make it conversational and friendly, as if you're explaining it directly to the business owner.
        """
        
        caption_response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": caption_prompt}],
            temperature=0.7
        )
        
        caption = caption_response.choices[0].message.content.strip()
        
        # Return the result with graph type, data and caption
        return {
            "graph_type": graph_type,
            "chart_data": chart_data,
            "caption": caption,
            "status": "success"
        }

    except Exception as e:
        print(f"Error parsing graph request: {str(e)}")
        return {"error": f"Failed to process graph request: {str(e)}"}

def prepare_chart_data(df, graph_type):
    """
    Prepare dataframe for frontend chart rendering based on graph type
    """
    # Handle date/datetime columns
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].dt.strftime('%Y-%m-%d')
    
    result = {}
    
    if graph_type == "LINE":
        # Assume first column is x-axis (often date/time) and remaining columns are y-values
        x_column = df.columns[0]
        y_columns = df.columns[1:] if len(df.columns) > 1 else [df.columns[0]]
        
        result = {
            "labels": df[x_column].tolist(),
            "datasets": []
        }
        
        for col in y_columns:
            result["datasets"].append({
                "label": col,
                "data": df[col].tolist()
            })
    
    elif graph_type == "BAR":
        # Similar to LINE but for categorical data
        x_column = df.columns[0]
        y_columns = df.columns[1:] if len(df.columns) > 1 else [df.columns[0]]
        
        result = {
            "labels": df[x_column].tolist(),
            "datasets": []
        }
        
        for col in y_columns:
            result["datasets"].append({
                "label": col,
                "data": df[col].tolist()
            })
    
    elif graph_type == "PIE":
        # For pie charts, need labels and data
        label_column = df.columns[0]
        value_column = df.columns[1] if len(df.columns) > 1 else df.columns[0]
        
        result = {
            "labels": df[label_column].tolist(),
            "datasets": [{
                "data": df[value_column].tolist()
            }]
        }
    
    elif graph_type == "SCATTER":
        # For scatter plots, need x and y values
        x_column = df.columns[0]
        y_column = df.columns[1] if len(df.columns) > 1 else df.columns[0]
        
        result = {
            "datasets": [{
                "label": f"{x_column} vs {y_column}",
                "data": [{"x": x, "y": y} for x, y in zip(df[x_column], df[y_column])]
            }]
        }
    
    return result