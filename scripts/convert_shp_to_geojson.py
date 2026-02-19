#!/usr/bin/env python3
"""
Convert Thailand Administrative Boundary SHP files to simplified GeoJSON
for use in web applications.

Requirements:
    pip install geopandas shapely

Usage:
    python convert_shp_to_geojson.py
"""

import os
import json
import zipfile
import geopandas as gpd
from pathlib import Path

# Paths
SHP_ZIP = Path("../frontend/public/shp/tha_admin_boundaries.shp.zip")
EXTRACT_DIR = Path("../frontend/public/shp/extracted")
OUTPUT_DIR = Path("../frontend/public/shp")

# Simplification tolerance (degrees) - higher = more simplified
# 0.001 = ~100m, 0.005 = ~500m, 0.01 = ~1km
SIMPLIFY_TOLERANCE = {
    "province": 0.005,   # Province level - moderate simplification
    "district": 0.003,   # District level - less simplification
    "subdistrict": 0.001, # Sub-district - minimal simplification
}

def extract_zip():
    """Extract the SHP zip file."""
    print(f"Extracting {SHP_ZIP}...")
    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(SHP_ZIP, 'r') as z:
        z.extractall(EXTRACT_DIR)
    print("Extraction complete.")
    # List extracted files
    for f in EXTRACT_DIR.rglob("*.shp"):
        print(f"  Found SHP: {f}")

def find_shp_files():
    """Find SHP files by admin level."""
    shp_files = {}
    for shp in EXTRACT_DIR.rglob("*.shp"):
        name = shp.stem.lower()
        if "adm1" in name or "admin1" in name or "province" in name:
            shp_files["province"] = shp
        elif "adm2" in name or "admin2" in name or "district" in name:
            shp_files["district"] = shp
        elif "adm3" in name or "admin3" in name or "subdistrict" in name or "tambon" in name:
            shp_files["subdistrict"] = shp
        elif "adm4" in name or "admin4" in name or "village" in name or "muban" in name:
            shp_files["village"] = shp
    return shp_files

def convert_to_geojson(shp_path, output_name, tolerance=0.005, keep_fields=None):
    """Convert a SHP file to simplified GeoJSON."""
    print(f"\nConverting {shp_path.name} -> {output_name}.geojson")
    
    # Read SHP
    gdf = gpd.read_file(shp_path)
    print(f"  CRS: {gdf.crs}")
    print(f"  Features: {len(gdf)}")
    print(f"  Columns: {list(gdf.columns)}")
    
    # Reproject to WGS84 if needed
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        print(f"  Reprojecting to WGS84...")
        gdf = gdf.to_crs(epsg=4326)
    
    # Simplify geometry
    print(f"  Simplifying with tolerance={tolerance}...")
    gdf["geometry"] = gdf["geometry"].simplify(tolerance, preserve_topology=True)
    
    # Select fields to keep
    if keep_fields:
        available = [f for f in keep_fields if f in gdf.columns]
        gdf = gdf[available + ["geometry"]]
    
    # Save to GeoJSON
    output_path = OUTPUT_DIR / f"{output_name}.geojson"
    gdf.to_file(output_path, driver="GeoJSON")
    
    size_mb = output_path.stat().st_size / 1024 / 1024
    print(f"  Saved: {output_path} ({size_mb:.1f} MB)")
    return output_path

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Extract if needed
    if not EXTRACT_DIR.exists() or not any(EXTRACT_DIR.rglob("*.shp")):
        extract_zip()
    else:
        print("SHP files already extracted.")
    
    # Find SHP files
    shp_files = find_shp_files()
    print(f"\nFound SHP files: {list(shp_files.keys())}")
    
    if not shp_files:
        print("ERROR: No SHP files found! Listing extracted files:")
        for f in EXTRACT_DIR.rglob("*"):
            print(f"  {f}")
        return
    
    # Province (Admin 1) - 77 provinces
    if "province" in shp_files:
        convert_to_geojson(
            shp_files["province"],
            "thailand_provinces",
            tolerance=SIMPLIFY_TOLERANCE["province"],
            keep_fields=["ADM1_EN", "ADM1_TH", "ADM1_PCODE", "ADM0_EN"]
        )
    
    # District (Admin 2) - 928 districts
    if "district" in shp_files:
        convert_to_geojson(
            shp_files["district"],
            "thailand_districts",
            tolerance=SIMPLIFY_TOLERANCE["district"],
            keep_fields=["ADM2_EN", "ADM2_TH", "ADM2_PCODE", "ADM1_EN", "ADM1_TH", "ADM1_PCODE"]
        )
    
    # Sub-district (Admin 3) - 7,425 sub-districts
    if "subdistrict" in shp_files:
        convert_to_geojson(
            shp_files["subdistrict"],
            "thailand_subdistricts",
            tolerance=SIMPLIFY_TOLERANCE["subdistrict"],
            keep_fields=["ADM3_EN", "ADM3_TH", "ADM3_PCODE", "ADM2_EN", "ADM2_TH", "ADM2_PCODE", "ADM1_EN", "ADM1_TH", "ADM1_PCODE"]
        )
    
    # Village (Admin 4) - if available
    if "village" in shp_files:
        convert_to_geojson(
            shp_files["village"],
            "thailand_villages",
            tolerance=0.0005,
            keep_fields=["ADM4_EN", "ADM4_TH", "ADM4_PCODE", "ADM3_EN", "ADM3_TH", "ADM3_PCODE", "ADM2_EN", "ADM2_TH", "ADM2_PCODE", "ADM1_EN", "ADM1_TH", "ADM1_PCODE"]
        )
    
    print("\n✅ Conversion complete!")
    print("\nOutput files:")
    for f in OUTPUT_DIR.glob("*.geojson"):
        size_mb = f.stat().st_size / 1024 / 1024
        print(f"  {f.name}: {size_mb:.1f} MB")

if __name__ == "__main__":
    main()
