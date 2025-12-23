from pydantic import BaseModel
from typing import Optional


class CarbonCalculation(BaseModel):
    plot_id: Optional[int] = None
    tree_age: int
    area_rai: float


class CarbonResult(BaseModel):
    plot_id: Optional[int] = None
    tree_age: int
    area_rai: float
    biomass_tons: float
    carbon_tons: float
    co2_equivalent_tons: float


class CarbonSummary(BaseModel):
    total_plots: int
    total_area_rai: float
    total_carbon_tons: float
    total_co2_equivalent_tons: float
    average_carbon_per_rai: float


class CarbonHistory(BaseModel):
    year: int
    carbon_tons: float
