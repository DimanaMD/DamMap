import pandas as pd
from prophet import Prophet
import mysql.connector
import matplotlib.pyplot as plt
import openmeteo_requests
import requests_cache
from retry_requests import retry
import numpy as np

# --- 1. SETUP & DATABASE ---
conn = mysql.connector.connect(host="localhost", user="root", password="", database="dams_db")

# Dam Center Coordinates
LAT, LON = 41.85173, 25.40775
# Offset for ~2km (0.018 degrees latitude is roughly 2km)
OFFSET = 0.018 

LAG_DAYS = 5

# --- 2. MULTI-POINT WEATHER DATA ---
cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

def get_spatial_weather():
    # Define the 5 points: Center, North, South, East, West
    lats = [LAT, LAT + OFFSET, LAT - OFFSET, LAT, LAT]
    lons = [LON, LON, LON, LON + OFFSET, LON - OFFSET]
    
    # 2.1 Fetch Historical for all 5 points
    hist_url = "https://archive-api.open-meteo.com/v1/archive"
    hist_params = {
        "latitude": lats, 
        "longitude": lons, 
        "start_date": "2020-01-01", 
        "end_date": "2025-12-31", 
        "daily": "precipitation_sum", 
        "timezone": "auto"
    }
    hist_responses = openmeteo.weather_api(hist_url, params=hist_params)
    
    # 2.2 Fetch Forecast for all 5 points
    fore_url = "https://api.open-meteo.com/v1/forecast"
    fore_params = {
        "latitude": lats, 
        "longitude": lons, 
        "daily": "precipitation_sum", 
        "timezone": "auto", 
        "forecast_days": 14
    }
    fore_responses = openmeteo.weather_api(fore_url, params=fore_params)

    def process_responses(responses):
        all_points_data = []
        for res in responses:
            daily = res.Daily()
            data = daily.Variables(0).ValuesAsNumpy()
            all_points_data.append(data)
        
        # Logic: 70% Average of the area + 30% of the heaviest hit point
        # This "accents" the rain without multiplying the total volume by 5.
        spatial_mean = np.mean(all_points_data, axis=0)
        spatial_max = np.max(all_points_data, axis=0)
        
        accented_rain = (spatial_mean * 0.7) + (spatial_max * 0.3)
        
        return pd.DataFrame({
            "ds": pd.to_datetime(responses[0].Daily().Time(), unit="s", utc=True).tz_localize(None) + 
                pd.to_timedelta(range(accented_rain.size), unit='D'),
            "rain": accented_rain
        })

    h_df = process_responses(hist_responses)
    f_df = process_responses(fore_responses)
    
    return pd.concat([h_df, f_df]).drop_duplicates('ds').sort_values('ds')

print("Fetching spatial weather data for 5 coordinates...")
df_weather_all = get_spatial_weather()

# --- 3. TRAIN DATA PREP ---
df_train = pd.read_sql("SELECT Дата as ds, Разполагаем as y, Приток as inflow, Разход as outflow FROM dam_his WHERE DamId = 33 AND YEAR(Дата) < 2026", conn)
df_train['ds'] = pd.to_datetime(df_train['ds'])
df_train['y'] = pd.to_numeric(df_train['y'], errors='coerce')
df_train = df_train.set_index('ds').resample('D').mean().interpolate(method='time').reset_index()

df_train = pd.merge(df_train, df_weather_all, on='ds', how='left').fillna(0)
df_train['inflow_state'] = df_train['inflow'].rolling(window=7, min_periods=1).mean()
df_train['outflow_state'] = df_train['outflow'].rolling(window=7, min_periods=1).mean()
df_train['rain_lagged'] = df_train['rain'].shift(LAG_DAYS).fillna(0)
df_train['inflow_state_lagged'] = df_train['inflow_state'].shift(LAG_DAYS).fillna(0)

DAM_CAPACITY, DAM_FLOOR = 114, 24
df_train['cap'], df_train['floor'] = DAM_CAPACITY, DAM_FLOOR

# --- 4. FINE-TUNED PROPHET MODEL ---
m = Prophet(
    growth='logistic', 
    seasonality_mode='multiplicative',
    changepoint_prior_scale=4,      
    seasonality_prior_scale=10.0,    
    yearly_seasonality=False
)

m.add_seasonality(name='yearly', period=365.25, fourier_order=15) 
m.add_regressor('rain_lagged')
m.add_regressor('inflow_state_lagged')
m.add_regressor('outflow_state')

m.fit(df_train)

# --- 5. BIAS CORRECTION & FUTURE PREDICTION ---
last_real_value = df_train['y'].iloc[-1]
check_last_point = m.predict(df_train.tail(1))
model_last_estimate = check_last_point['yhat'].iloc[0]
bias = last_real_value - model_last_estimate

future = m.make_future_dataframe(periods=60, freq='D')
future['cap'], future['floor'] = DAM_CAPACITY, DAM_FLOOR
future = pd.merge(future, df_weather_all[['ds', 'rain']], on='ds', how='left')

avg_rain = df_train.groupby(df_train['ds'].dt.dayofyear)['rain'].mean()
future['rain'] = future.apply(lambda x: avg_rain[x['ds'].dayofyear] if pd.isna(x['rain']) else x['rain'], axis=1)
future['inflow_state'] = df_train['inflow_state'].iloc[-1]
future['outflow_state'] = df_train['outflow_state'].iloc[-1]
future['rain_lagged'] = future['rain'].shift(LAG_DAYS).fillna(0)
future['inflow_state_lagged'] = future['inflow_state'].shift(LAG_DAYS).fillna(df_train['inflow_state'].iloc[-1])

forecast = m.predict(future)
forecast['yhat'] = forecast['yhat'] + bias 

forecast_Final = forecast[(forecast['ds'] >= '2026-01-01') & (forecast['ds'] <= '2026-02-28')]

# --- 6. REAL DATA PREP ---
df_real = pd.read_sql("SELECT Дата as ds, Разполагаем as y FROM dam_his WHERE DamId = 33 AND YEAR(Дата) = 2026", conn)
df_real['ds'] = pd.to_datetime(df_real['ds'])
df_real['y'] = pd.to_numeric(df_real['y'], errors='coerce')
df_real = df_real.sort_values('ds').set_index('ds').resample('D').mean().interpolate(method='time').reset_index()

# --- 7. DISPLAY ---
plt.figure(figsize=(12,6))
plt.plot(df_real['ds'], df_real['y'], label="Real 60 days", color='blue', linewidth=2)
plt.plot(forecast_Final['ds'], forecast_Final['yhat'], label="Predicted 60 days", color='orange', linestyle='--')
plt.ylim(30, 80)  
plt.title("Phase 3: Historical data, Seasonality, Weather inputs")
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()