import rasterio
from rasterio.windows import from_bounds
from pyproj import Transformer
import numpy as np
from scipy import ndimage
import json
import os

# -----------------------------------
# PATH BASE
# -----------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# -----------------------------------
# SATELLITE DAMS CONFIG
# -----------------------------------
SATELLITE_DAMS = [
    {
        "name": "Александър Стамболийски",
        "green": "Александър Стамболийски_03.jp2",
        "nir": "Александър Стамболийски_08.jp2",
        "bbox": {"lat_min": 43.08, "lon_min": 25.10, "lat_max": 43.14, "lon_max": 25.16},
        "ndwi_threshold": -0.1
    },
    {
        "name": "Батак",
        "green": "Батак_03.jp2",
        "nir": "Батак_08.jp2",
        "bbox": {"lat_min": 41.95, "lon_min": 24.17, "lat_max": 41.99, "lon_max": 24.21},
        "ndwi_threshold": -0.1
    },
    {
        "name": "Бели Лом",
        "green": "Бели лом_03.jp2",
        "nir": "Бели лом_08.jp2",
        "bbox": {"lat_min": 43.39, "lon_min": 26.66, "lat_max": 43.42, "lon_max": 26.70},
        "ndwi_threshold": -0.1
    },
    {
        "name": "Доспат",
        "green": "Доспат_03.jp2",
        "nir": "Доспат_08.jp2",
        "bbox": {"lat_min": 41.68, "lon_min": 24.09, "lat_max": 41.70, "lon_max": 24.12},
        "ndwi_threshold": -0.1
    },
   
    {
        "name": "Огоста",
        "green": "Огоста_03.jp2",
        "nir": "Огоста_08.jp2",
        "bbox": {"lat_min": 43.36, "lon_min": 23.16, "lat_max": 43.39, "lon_max": 23.20},
        "ndwi_threshold": -0.1
    }
]

# -----------------------------------
# OFFICIAL CONSTANT AREAS
# -----------------------------------
OFFICIAL_AREAS = {
    "Асеновец": 0.65,
    "Ахелой": 0.50,
    "Беглика": None,
    "Искър": 29.67,
    "Бели Искър": 0.85,
    "Белмекен": 4.5,
    "Боровица": 0.84,
    "Въча": 4.97,
    "Голям Беглик": 4.1,
    "Горни Дъбник": 3.65,
    "Домлян": 0.85,
    "Дяково": None,
    "Жребчево": 25.8,
    "Ивайловград": 15.0,
    "Искър": 30,
    "Йовковци": 25.6,
    "Калин": 0.08,
    "Камчия": 9.6,
    "Карагьол": 0.06,
    "Кокаляне": None,
    "Копринка": 11.2,
    "Кричим": None,
    "Кула": 0.77,
    "Кърджали": 16.07,
    "Малко Шарково": 2.0,
    "Огняново": 1.36,
    "Огоста": 23.6,
    "Панчарево": 0.75,
    "Порой": 0.99,
    "Пчелина": 4.65,
    "Пясъчник": 9.1,
    "Рабиша": None,
    "Розов кладенец": None,
    "Сопот": 3.04,
    "Среченска бара": None,
    "Студен кладенец": 27.8,
    "Студена": None,
    "Съединение": 1.43,
    "Тополница": 4.1,
    "Тошков чарк": None,
    "Тракиец": 4.58,
    "Христо Смирненски (Янтра)": None,
    "Цанков камък": None,
    "Чаира": None,
    "Широка поляна": 4.0,
    "Ясна поляна": 1.46,
    "Ястребино": 1.83
}

# -----------------------------------
# AREA CALCULATION
# -----------------------------------
def calculate_satellite_area(dam):
    try:
        green_path = os.path.join(BASE_DIR, dam["green"])
        nir_path = os.path.join(BASE_DIR, dam["nir"])

        with rasterio.open(green_path) as src:
            transformer = Transformer.from_crs("EPSG:4326", src.crs, always_xy=True)

            left, bottom = transformer.transform(dam["bbox"]["lon_min"], dam["bbox"]["lat_min"])
            right, top = transformer.transform(dam["bbox"]["lon_max"], dam["bbox"]["lat_max"])

            window = from_bounds(left, bottom, right, top, src.transform)

            green = src.read(1, window=window).astype(np.float32)
            with rasterio.open(nir_path) as src_nir:
                nir = src_nir.read(1, window=window).astype(np.float32)

            valid = (green > 0) & (nir > 0)
            green = np.where(valid, green / 10000.0, np.nan)
            nir = np.where(valid, nir / 10000.0, np.nan)

            ndwi = (green - nir) / (green + nir)
            water = ndwi > dam["ndwi_threshold"]
            water = ndimage.binary_dilation(water, iterations=2)

            pixel_area = src.res[0] * src.res[1]
            area_km2 = np.nansum(water) * pixel_area / 1_000_000

            return round(area_km2, 3)
    except Exception as e:
        print(f"⚠️ {dam['name']} failed: {e}")
        return None

# -----------------------------------
# MAIN
# -----------------------------------
def main():
    results = {}

    # Satellite dams (priority)
    for dam in SATELLITE_DAMS:
        area = calculate_satellite_area(dam)
        if area is not None:
            results[dam["name"]] = area

    # Official dams fallback
    for name, area in OFFICIAL_AREAS.items():
        if name not in results:
            results[name] = area

    # Convert to JSON format
    json_output = [{"Име": name, "Площ": area} for name, area in results.items()]

    output_path = os.path.join(BASE_DIR, "json_output", "dam_areas.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(json_output, f, ensure_ascii=False, indent=4)

    print(f"\n✅ dam_areas.json UPDATED (52 dams)")

if __name__ == "__main__":
    main()
