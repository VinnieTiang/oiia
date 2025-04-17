import os
import pandas as pd
from sqlalchemy import create_engine, text, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

# Create SQLite database in project directory
DATABASE_URL = "sqlite:///./data/grablet.db"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create base class for models
Base = declarative_base()

# Define database models
class Merchant(Base):
    __tablename__ = "merchants"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(String, unique=True, index=True)
    name = Column(String)
    city = Column(String)
    category = Column(String)
    
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    merchant_id = Column(String, index=True)
    eater_id = Column(String, index=True)
    order_time = Column(DateTime)
    order_value = Column(Float)
    
class TransactionItem(Base):
    __tablename__ = "transaction_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, index=True)
    item_id = Column(String, index=True)
    quantity = Column(Integer)
    price = Column(Float)
    
class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String, unique=True, index=True)
    merchant_id = Column(String, index=True)
    name = Column(String)
    price = Column(Float)
    category = Column(String)

class Keyword(Base):
    __tablename__ = "keywords"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(String, index=True)
    keyword = Column(String)
    count = Column(Integer)

# Create tables
Base.metadata.create_all(bind=engine)

# SessionLocal factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to convert query results to dataframe
def query_to_dataframe(query, params=None):
    """Execute SQL query and return results as pandas DataFrame"""
    with engine.connect() as conn:
        if params:
            result = conn.execute(text(query), params)
        else:
            result = conn.execute(text(query))
        columns = result.keys()
        data = result.fetchall()
    
    return pd.DataFrame(data, columns=columns)

# Function to import CSV files into database
def import_csv_to_db():
    """Import all CSV files into the database tables"""
    # Import merchants
    if os.path.exists("data/merchant.csv"):
        merchants_df = pd.read_csv("data/merchant.csv")
        merchants_df.to_sql("merchants", engine, if_exists="replace", index=False)
        print("Merchants data imported")
    
    # Import transactions
    if os.path.exists("data/transaction_data.csv"):
        transactions_df = pd.read_csv("data/transaction_data.csv")
        transactions_df["order_time"] = pd.to_datetime(transactions_df["order_time"], errors="coerce")
        transactions_df.to_sql("transactions", engine, if_exists="replace", index=False)
        print("Transactions data imported")
    
    # Import transaction items
    if os.path.exists("data/transaction_items.csv"):
        transaction_items_df = pd.read_csv("data/transaction_items.csv")
        transaction_items_df.to_sql("transaction_items", engine, if_exists="replace", index=False)
        print("Transaction items data imported")
    
    # Import items
    if os.path.exists("data/items.csv"):
        items_df = pd.read_csv("data/items.csv")
        items_df.to_sql("items", engine, if_exists="replace", index=False)
        print("Items data imported")
        
    # Import keywords
    if os.path.exists("data/keywords.csv"):
        keywords_df = pd.read_csv("data/keywords.csv")
        keywords_df.to_sql("keywords", engine, if_exists="replace", index=False)
        print("Keywords data imported")

# Only run this when directly executing this file
if __name__ == "__main__":
    import_csv_to_db()