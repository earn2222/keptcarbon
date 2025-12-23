from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """Get current user profile"""
    # TODO: Implement with JWT authentication
    return {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "province": "นครศรีธรรมราช"
    }


@router.put("/me")
async def update_user():
    """Update current user profile"""
    # TODO: Implement
    return {"message": "User updated successfully"}
