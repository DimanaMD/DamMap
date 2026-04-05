import rasterio
from rasterio.windows import from_bounds
from pyproj import Transformer
import numpy as np
from scipy import ndimage
import json
import os

# -----------------------------------
# DAM CONFIGURATION
# -----------------------------------
dams = [
    {
        "name": "Тича",
        "green": "Тича_03.jp2",
        "nir": "Тича_08.jp2",
        "bbox": {
            "lat_min": 42.950,
            "lon_min": 26.520,
            "lat_max": 43.170,
            "lon_max": 26.950
        },
        "ndwi_threshold": -0.05
    },
    {
        "name": "Цонево",
        "green": "Цонево_03.jp2",
        "nir": "Цонево_08.jp2",
        "bbox": {
            "lat_min": 42.860,
            "lon_min": 26.980,
            "lat_max": 43.280,
            "lon_max": 27.550
        },
        "ndwi_threshold": -0.08
    }
]

# -----------------------------------
# AREA CALCULATION FUNCTION
# -----------------------------------
def calculate_area(dam):
    with rasterio.open(dam["green"]) as src:
        transformer = Transformer.from_crs("EPSG:4326", src.crs, always_xy=True)

        left, bottom = transformer.transform(
            dam["bbox"]["lon_min"], dam["bbox"]["lat_min"]
        )
        right, top = transformer.transform(
            dam["bbox"]["lon_max"], dam["bbox"]["lat_max"]
        )

        window = from_bounds(left, bottom, right, top, transform=src.transform)

        green = src.read(1, window=window).astype(np.float32)
        with rasterio.open(dam["nir"]) as src_nir:
            nir = src_nir.read(1, window=window).astype(np.float32)

        # --- REMOVE NODATA ---
        valid = (green > 0) & (nir > 0)
        green = np.where(valid, green, np.nan)
        nir   = np.where(valid, nir, np.nan)

        # --- SCALE TO REFLECTANCE ---
        green /= 10000.0
        nir   /= 10000.0

        # --- NDWI ---
        ndwi = (green - nir) / (green + nir)

        # --- WATER MASK ---
        water = ndwi > dam["ndwi_threshold"]

        # --- SHORELINE RECOVERY ---
        water = ndimage.binary_dilation(water, iterations=2)

        water_pixels = np.nansum(water)

        pixel_area = src.res[0] * src.res[1]  # 100 m²
        area_km2 = (water_pixels * pixel_area) / 1_000_000

        return round(area_km2, 2)

# -----------------------------------
# MAIN
# -----------------------------------
def main():
    results = []

    for dam in dams:
        area = calculate_area(dam)
        print(f"{dam['name']} area: {area} km²")

        results.append({
            "Име": dam["name"],
            "Площ": f"{area}"
        })

    # --- SAVE JSON ---
    output_path = os.path.join(
        "my-react-app", "src", "python", "dam_areas.json"
    )
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=4)

    print(f"\nSaved results to {output_path}")

if __name__ == "__main__":
    main()
