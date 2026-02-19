#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert Thailand Administrative Boundary SHP files to simplified GeoJSON
from local SHP directory.

Column structure found:
- Province: PROV_CODE, PROV_NAMT (Thai), PROV_NAME (English)
- District (Amphoe): varies
- Tambon: P_CODE, A_CODE, T_CODE, P_NAME_T, P_NAME_E, A_NAME_T, A_NAME_E, T_NAME_T, T_NAME_E
- Village: VILL_ID, NAME, AMP_ID, TAM_NAME, AMP_NAME, PRV_NAME

Requirements:
    conda install -c conda-forge geopandas fiona pyproj shapely

Usage:
    python convert_local_shp.py
"""

import os
import sys
import json

# Fix pyproj database path BEFORE importing geopandas
PROJ_DATA_PATHS = [
    r"C:\Users\RA_Earn\miniconda3\Library\share\proj",
    r"C:\Users\RA_Earn\miniconda3\share\proj",
    r"C:\Users\RA_Earn\miniconda3\Lib\site-packages\pyproj\proj_dir\share\proj",
]
for p in PROJ_DATA_PATHS:
    if os.path.exists(p):
        os.environ['PROJ_DATA'] = p
        os.environ['PROJ_LIB'] = p
        print(f"Set PROJ_DATA to: {p}")
        break

import geopandas as gpd
from pathlib import Path
from shapely.geometry import mapping

# ==========================================
# PATHS - Local SHP files
# ==========================================
# Use path relative to this script
BASE_DIR = Path(__file__).resolve().parent.parent
SHP_BASE = BASE_DIR / "data" / "shp"
OUTPUT_DIR = BASE_DIR / "frontend" / "public" / "boundaries"

# Simplification tolerance (degrees)
SIMPLIFY_TOLERANCE = {
    "province": 0.005,
    "district": 0.003,
    "subdistrict": 0.001,
    "village": 0.0005,
}

# Adjust these paths based on how you extract the ZIP file
SHP_FILES = {
    "province": SHP_BASE / "tha_admin_boundaries" / "province" / "TH_Province.shp",
    "district": SHP_BASE / "tha_admin_boundaries" / "amphoe" / "L05_AdminBoundary_Amphoe_2011_50k_FGDS_beta.shp",
    "subdistrict": SHP_BASE / "tha_admin_boundaries" / "Tambon" / "TH_Tambon.shp",
    "village": SHP_BASE / "tha_admin_boundaries" / "village" / "TH_Village.shp",
}

OUTPUT_NAMES = {
    "province": "thailand_provinces",
    "district": "thailand_districts",
    "subdistrict": "thailand_subdistricts",
    "village": "thailand_villages",
}

# Known column mappings based on inspection
FIELD_MAPPINGS = {
    "province": {
        "keep": ["PROV_CODE", "PROV_NAMT", "PROV_NAME"],
        "rename": {"PROV_CODE": "code", "PROV_NAMT": "name_th", "PROV_NAME": "name_en"}
    },
    "district": {
        # Will be determined after inspection
        "keep": None,
        "rename": {}
    },
    "subdistrict": {
        "keep": ["P_CODE", "A_CODE", "T_CODE", "P_NAME_T", "P_NAME_E", "A_NAME_T", "A_NAME_E", "T_NAME_T", "T_NAME_E"],
        "rename": {
            "P_CODE": "prov_code", "A_CODE": "amp_code", "T_CODE": "tam_code",
            "P_NAME_T": "prov_name_th", "P_NAME_E": "prov_name_en",
            "A_NAME_T": "amp_name_th", "A_NAME_E": "amp_name_en",
            "T_NAME_T": "name_th", "T_NAME_E": "name_en"
        }
    },
    "village": {
        "keep": ["VILL_ID", "NAME", "TAM_NAME", "AMP_NAME", "PRV_NAME"],
        "rename": {
            "VILL_ID": "code", "NAME": "name_th",
            "TAM_NAME": "tam_name_th", "AMP_NAME": "amp_name_th", "PRV_NAME": "prov_name_th"
        }
    },
}


def convert_to_geojson(shp_path, output_name, level, tolerance=0.005):
    """Convert a SHP file to simplified GeoJSON."""
    print(f"\nConverting {shp_path.name} -> {output_name}.geojson")

    # Read SHP with UTF-8 encoding
    try:
        gdf = gpd.read_file(shp_path, encoding='utf-8')
    except Exception:
        try:
            gdf = gpd.read_file(shp_path, encoding='tis620')
        except Exception:
            gdf = gpd.read_file(shp_path)

    print(f"  CRS: {gdf.crs}")
    print(f"  Features: {len(gdf)}")
    print(f"  Columns: {list(gdf.columns)}")

    # Reproject to WGS84 if needed
    if gdf.crs is not None:
        epsg = None
        try:
            epsg = gdf.crs.to_epsg()
        except Exception:
            pass
        
        if epsg != 4326:
            print(f"  Reprojecting from {gdf.crs.name} to WGS84...")
            # Use pyproj directly to avoid database issue
            try:
                gdf = gdf.to_crs(epsg=4326)
            except Exception as e:
                print(f"  to_crs(epsg) failed: {e}")
                print(f"  Trying to_crs with proj string...")
                gdf = gdf.to_crs("+proj=longlat +datum=WGS84 +no_defs")
    else:
        print(f"  No CRS, assuming WGS84")
        gdf = gdf.set_crs("+proj=longlat +datum=WGS84 +no_defs")

    # Simplify geometry
    print(f"  Simplifying with tolerance={tolerance}...")
    gdf["geometry"] = gdf["geometry"].simplify(tolerance, preserve_topology=True)

    # Select and rename fields
    mapping_info = FIELD_MAPPINGS.get(level, {})
    keep_fields = mapping_info.get("keep")
    rename_map = mapping_info.get("rename", {})

    if keep_fields:
        available = [f for f in keep_fields if f in gdf.columns]
        missing = [f for f in keep_fields if f not in gdf.columns]
        if missing:
            print(f"  WARNING: Missing fields: {missing}")
        gdf = gdf[available + ["geometry"]]
    
    # Rename columns
    if rename_map:
        actual_rename = {k: v for k, v in rename_map.items() if k in gdf.columns}
        gdf = gdf.rename(columns=actual_rename)

    # Save to GeoJSON
    output_path = OUTPUT_DIR / f"{output_name}.geojson"
    gdf.to_file(output_path, driver="GeoJSON", encoding='utf-8')

    size_mb = output_path.stat().st_size / 1024 / 1024
    print(f"  Saved: {output_path} ({size_mb:.1f} MB)")
    return output_path


def inspect_district(shp_path):
    """Inspect district file and set up field mapping."""
    try:
        gdf = gpd.read_file(shp_path, rows=3)
        cols = list(gdf.columns)
        print(f"  District columns: {cols}")
        
        # Try to find relevant columns
        keep = []
        rename = {}
        
        for col in cols:
            col_lower = col.lower()
            if 'code' in col_lower or 'id' in col_lower:
                keep.append(col)
            elif 'name' in col_lower or 'nam' in col_lower:
                keep.append(col)
        
        if not keep:
            keep = [c for c in cols if c != 'geometry']
        
        FIELD_MAPPINGS["district"]["keep"] = keep
        print(f"  Using fields: {keep}")
    except Exception as e:
        print(f"  Cannot inspect district: {e}")
        FIELD_MAPPINGS["district"]["keep"] = None


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("Thailand SHP to GeoJSON Converter")
    print("=" * 60)

    # Inspect district file
    print("\n--- INSPECTING DISTRICT FILE ---")
    if SHP_FILES["district"].exists():
        inspect_district(SHP_FILES["district"])

    print("\n\n--- CONVERTING FILES ---")

    converted = []

    for level, shp_path in SHP_FILES.items():
        if not shp_path.exists():
            print(f"\nSkipping {level}: file not found at {shp_path}")
            continue

        try:
            output_path = convert_to_geojson(
                shp_path,
                OUTPUT_NAMES[level],
                level,
                tolerance=SIMPLIFY_TOLERANCE[level],
            )
            converted.append((level, output_path))
        except Exception as e:
            print(f"\nERROR converting {level}: {e}")
            import traceback
            traceback.print_exc()

    print("\n\n" + "=" * 60)
    print("Conversion complete!")
    print("\nOutput files:")
    for level, path in converted:
        size_mb = path.stat().st_size / 1024 / 1024
        print(f"  [{level}] {path.name}: {size_mb:.1f} MB")

    print(f"\nFiles saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
