from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.plot import PlotCreate, PlotUpdate, PlotResponse

router = APIRouter()


@router.get("/", response_model=List[PlotResponse])
async def get_plots(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all plots for the current user"""
    # TODO: Implement with actual database query
    return []


@router.post("/", response_model=PlotResponse)
async def create_plot(
    plot: PlotCreate,
    db: Session = Depends(get_db)
):
    """Create a new plot"""
    # TODO: Implement plot creation with geometry
    return {
        "id": 1,
        "name": plot.name,
        "planting_year": plot.planting_year,
        "area_sqm": 0,
        "area_rai": 0,
        "status": "pending"
    }


@router.get("/{plot_id}", response_model=PlotResponse)
async def get_plot(
    plot_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific plot by ID"""
    # TODO: Implement
    raise HTTPException(status_code=404, detail="Plot not found")


@router.put("/{plot_id}", response_model=PlotResponse)
async def update_plot(
    plot_id: int,
    plot: PlotUpdate,
    db: Session = Depends(get_db)
):
    """Update a plot"""
    # TODO: Implement
    raise HTTPException(status_code=404, detail="Plot not found")


@router.delete("/{plot_id}")
async def delete_plot(
    plot_id: int,
    db: Session = Depends(get_db)
):
    """Delete a plot"""
    # TODO: Implement
    return {"message": "Plot deleted successfully"}
