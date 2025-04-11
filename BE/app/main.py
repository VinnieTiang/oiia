from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import sales, inventory

app = FastAPI(
    title="Grablet API",
    description="Backend API for Grablet mobile app",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sales.router)
app.include_router(inventory.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Grablet API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



# Sample data for testing the linkage between fe and be onlyyy
inventory_items = [
    {"id": 1, "name": "Chicken Rice", "current": 5, "recommended": 20, "status": "low"},
    {"id": 2, "name": "Nasi Lemak", "current": 3, "recommended": 15, "status": "low"},
    {"id": 3, "name": "Mee Goreng", "current": 12, "recommended": 15, "status": "medium"}
]
@app.get("/inventory/low-stock")
async def get_low_stock():
    low_stock = [item for item in inventory_items if item["status"] == "low"]
    return low_stock