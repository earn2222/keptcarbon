from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.carbon import CarbonCalculation, CarbonResult

router = APIRouter()


def calculate_rubber_carbon(age: int, area_rai: float) -> dict:
    """
    Calculate carbon sequestration for rubber trees (Hevea brasiliensis)
    
    Formula for Above-ground Biomass (AGB):
    AGB = exp(-2.134 + 2.530 * ln(DBH))
    
    For rubber trees, DBH can be estimated from age using:
    DBH (cm) = 2.5 * age (for young trees) to 4 * age (for mature trees)
    
    Carbon = AGB * 0.47 (carbon fraction)
    """
    if age <= 0:
        return {"biomass": 0, "carbon": 0}
    
    # Estimate DBH from age (simplified model for rubber trees)
    if age <= 5:
        dbh = 2.0 * age
    elif age <= 10:
        dbh = 10 + 1.5 * (age - 5)
    elif age <= 20:
        dbh = 17.5 + 1.0 * (age - 10)
    else:
        dbh = 27.5 + 0.5 * (age - 20)
    
    # Calculate AGB per tree (kg)
    import math
    agb_per_tree = math.exp(-2.134 + 2.530 * math.log(dbh))
    
    # Trees per rai (approximately 70 trees per rai for rubber)
    trees_per_rai = 70
    
    # Total biomass in tons
    total_biomass = (agb_per_tree * trees_per_rai * area_rai) / 1000
    
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
