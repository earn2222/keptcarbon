from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.plot import PlotCreate, PlotUpdate, PlotResponse
from app.models.models import Plot

router = APIRouter()


from geoalchemy2.shape import to_shape
from shapely.geometry import mapping




from shapely.geometry import shape
from geoalchemy2.shape import from_shape

@router.post("/", response_model=PlotResponse)
async def create_plot(
    plot: PlotCreate,
    db: Session = Depends(get_db)
):
    """Create a new plot with geometry"""
    
    # Process Geometry
    db_geometry = None
    area_sqm = 0
    area_rai = 0

    if plot.geometry:
        try:
            # Convert GeoJSON dict to Shapely geometry
            shapely_geom = shape(plot.geometry)
            
            # Convert to WKBElement for GeoAlchemy2
            db_geometry = from_shape(shapely_geom, srid=4326)
            
            # Calculate Area
            # Project to Albers Equal Area used for Thailand or simple UTM
            # Using a simplified approach: transform to 3857 (Web Mercator) - acceptable for small plots
            # Or better: use pyproj to estimation
            
            from shapely.ops import transform
            import pyproj

            # Define projection (WGS84 -> Web Mercator or UTM47N for Thailand)
            # UTM Zone 47N is EPSG:32647
            wgs84 = pyproj.CRS('EPSG:4326')
            utm = pyproj.CRS('EPSG:32647') 
            project = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True).transform
            
            projected_geom = transform(project, shapely_geom)
            area_sqm = projected_geom.area
            area_rai = area_sqm / 1600.0

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid geometry: {str(e)}")

    # Create Plot Object
    db_plot = Plot(
        name=plot.name,
        planting_year=plot.planting_year,
        notes=plot.notes,
        geometry=db_geometry,
        area_sqm=area_sqm,
        area_rai=area_rai,
        # Determine status based on info
        status="completed" if plot.geometry else "pending",
        # Default owner for demo (User ID 1 should exist from init.sql)
        owner_id=1 
    )

    db.add(db_plot)
    db.commit()
    db.refresh(db_plot)

    # Convert geometry back to GeoJSON for response
    response_geom = None
    if db_plot.geometry is not None:
        try:
            response_geom = mapping(to_shape(db_plot.geometry))
        except Exception:
            pass

    return {
        "id": db_plot.id,
        "name": db_plot.name,
        "planting_year": db_plot.planting_year,
        "notes": db_plot.notes,
        "area_sqm": db_plot.area_sqm,
        "area_rai": db_plot.area_rai,
        "status": db_plot.status,
        "created_at": db_plot.created_at,
        "updated_at": db_plot.updated_at,
        "geometry": response_geom
    }


@router.get("/", response_model=List[PlotResponse])
async def read_plots(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    plots = db.query(Plot).offset(skip).limit(limit).all()
    
    # Convert WKBElement to GeoJSON dict for response
    results = []
    
    import datetime
    import math
    current_year = datetime.datetime.now().year

    for p in plots:
        geom = None
        if p.geometry is not None:
             try:
                sh_geom = to_shape(p.geometry)
                geom = mapping(sh_geom)
             except Exception:
                pass
        
        # Calculate tree age
        tree_age = 0
        if p.planting_year:
            tree_age = current_year - p.planting_year

        # On-the-fly correction: If DB area is 0 but we have simple geometry, try to calc area for display
        display_area_rai = p.area_rai
        if (display_area_rai is None or display_area_rai == 0) and p.geometry is not None:
             try:
                 # Re-calculate area explicitly for display
                 # Note: Ideally we should update the DB too, but for read-only speed let's just calc
                 from shapely.ops import transform
                 import pyproj
                 
                 # Initialize projections inside loop (or move out for performance if many plots)
                 wgs84 = pyproj.CRS('EPSG:4326')
                 utm = pyproj.CRS('EPSG:32647')
                 project = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True).transform
                 
                 sh_geom = to_shape(p.geometry)
                 projected_geom = transform(project, sh_geom)
                 area_sqm = projected_geom.area
                 display_area_rai = area_sqm / 1600.0
             except Exception:
                 pass

        # Calculate Carbon (Using Backend Logic directly)
        carbon_tons = 0.0
        # Use display_area_rai here instead of p.area_rai
        if tree_age > 0 and display_area_rai and display_area_rai > 0:
            # Estimate DBH
            if tree_age <= 5:
                dbh = 2.0 * tree_age
            elif tree_age <= 10:
                dbh = 10 + 1.5 * (tree_age - 5)
            elif tree_age <= 20:
                dbh = 17.5 + 1.0 * (tree_age - 10)
            else:
                dbh = 27.5 + 0.5 * (tree_age - 20)
            
            # AGB per tree
            try:
                agb_per_tree = math.exp(-2.134 + 2.530 * math.log(dbh))
                trees_per_rai = 70
                total_biomass = (agb_per_tree * trees_per_rai * display_area_rai) / 1000
                carbon_tons = total_biomass * 0.47
            except:
                carbon_tons = 0.0

        p_dict = {
            "id": p.id,
            "name": p.name,
            "planting_year": p.planting_year,
            "notes": p.notes,
            "area_sqm": p.area_sqm,
            "area_rai": display_area_rai,  # Send the calculated area
            "tree_age": tree_age,
            "status": p.status,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "geometry": geom,
            "carbon_tons": round(carbon_tons, 2)
        }
        results.append(p_dict)

    return results


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
