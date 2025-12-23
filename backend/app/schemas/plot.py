from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PlotBase(BaseModel):
    name: str
    planting_year: int
    notes: Optional[str] = None


class PlotCreate(PlotBase):
    geometry: Optional[dict] = None  # GeoJSON geometry


class PlotUpdate(BaseModel):
    name: Optional[str] = None
    planting_year: Optional[int] = None
    notes: Optional[str] = None
    geometry: Optional[dict] = None


class PlotResponse(PlotBase):
    id: int
    area_sqm: float
    area_rai: float
    tree_age: Optional[int] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
