from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.carbon import CarbonCalculation, CarbonResult

router = APIRouter()


def calculate_rubber_carbon(age: int, area_rai: float) -> dict:
    """
    Calculate carbon sequestration for rubber trees (Hevea brasiliensis)
    Using RRIM 600 Precise Formula (Hytönen et al., 2018)
    
    Formula for Above-ground Biomass (AGB):
    AGB (kg/tree) = 0.118 * DBH^2.53
    
    Assuming DBH growth = 2cm / year for RRIM 600 in Thailand
    """
    if age <= 0 or area_rai <= 0:
        return {"biomass_tons": 0, "carbon_tons": 0, "co2_equivalent_tons": 0}
    
    # Estimate DBH from age (2cm per year for RRIM 600)
    dbh = 2.0 * age
    
    # Calculate AGB per tree (kg)
    # AGB = 0.118 * DBH^2.53
    agb_per_tree_kg = 0.118 * (dbh ** 2.53)
    
    # Trees per rai (approximately 70 trees per rai for rubber)
    trees_per_rai = 70.0
    
    # Total biomass in tons
    total_biomass = (agb_per_tree_kg * trees_per_rai * area_rai) / 1000.0
    
    # Carbon = Biomass * 0.47
    carbon = total_biomass * 0.47
    
    # CO2 equivalent = Carbon * 3.67
    co2_equivalent = carbon * 3.67
    
    return {
        "biomass_tons": round(total_biomass, 2),
        "carbon_tons": round(carbon, 2),
        "co2_equivalent_tons": round(co2_equivalent, 2)
    }


@router.post("/calculate", response_model=CarbonResult)
async def calculate_carbon(
    data: CarbonCalculation,
    db: Session = Depends(get_db)
):
    """Calculate carbon sequestration for a plot"""
    result = calculate_rubber_carbon(data.tree_age, data.area_rai)
    
    return CarbonResult(
        plot_id=data.plot_id,
        tree_age=data.tree_age,
        area_rai=data.area_rai,
        biomass_tons=result["biomass_tons"],
        carbon_tons=result["carbon_tons"],
        co2_equivalent_tons=result["co2_equivalent_tons"]
    )


@router.get("/summary")
async def get_carbon_summary(
    db: Session = Depends(get_db)
):
    """Get total carbon summary for all plots"""
    # TODO: Implement with actual database query
    return {
        "total_plots": 25,
        "total_area_rai": 1250,
        "total_carbon_tons": 2580,
        "total_co2_equivalent_tons": 9468.6,
        "average_carbon_per_rai": 2.064
    }


@router.get("/history/{plot_id}")
async def get_carbon_history(
    plot_id: int,
    db: Session = Depends(get_db)
):
    """Get historical carbon data for a specific plot"""
    # TODO: Implement with actual database query
    return {
        "plot_id": plot_id,
        "history": [
            {"year": 2020, "carbon_tons": 180},
            {"year": 2021, "carbon_tons": 195},
            {"year": 2022, "carbon_tons": 210},
            {"year": 2023, "carbon_tons": 228},
            {"year": 2024, "carbon_tons": 245},
        ]
    }
