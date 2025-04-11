# I create as example data only, to show it on dashboard

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"],
    responses={404: {"description": "Not found"}},
)

class InventoryItem(BaseModel):
    id: int
    name: str
    current: int
    recommended: int
    status: str
    last_restocked: str

# Mock inventory data
inventory_data = [
    {"id": 1, "name": "Chicken Rice", "current": 5, "recommended": 20, "status": "low", "last_restocked": "2 days ago"},
    {"id": 2, "name": "Nasi Lemak", "current": 3, "recommended": 15, "status": "low", "last_restocked": "3 days ago"},
    {"id": 3, "name": "Mee Goreng", "current": 12, "recommended": 15, "status": "medium", "last_restocked": "1 day ago"},
    {"id": 4, "name": "Roti Canai", "current": 25, "recommended": 20, "status": "good", "last_restocked": "Today"},
    {"id": 5, "name": "Teh Tarik", "current": 30, "recommended": 25, "status": "good", "last_restocked": "Today"},
]

@router.get("/", response_model=List[InventoryItem])
async def get_inventory():
    """Get all inventory items"""
    return inventory_data

@router.get("/low-stock", response_model=List[InventoryItem])
async def get_low_stock():
    """Get low stock items"""
    return [item for item in inventory_data if item["status"] == "low"]

@router.post("/restock/{item_id}")
async def restock_item(item_id: int, quantity: int):
    """Restock an inventory item"""
    for item in inventory_data:
        if item["id"] == item_id:
            item["current"] += quantity
            
            # Update status based on new quantity
            if item["current"] >= item["recommended"] * 0.7:
                item["status"] = "good"
            elif item["current"] >= item["recommended"] * 0.3:
                item["status"] = "medium"
            else:
                item["status"] = "low"
                
            item["last_restocked"] = "Today"
            return {"message": f"Restocked {quantity} units of {item['name']}", "item": item}
            
    raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")