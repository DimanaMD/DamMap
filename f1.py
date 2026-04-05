import pandas as pd
from prophet import Prophet
import mysql.connector
import matplotlib.pyplot as plt
import numpy as np

# --- 1. SETUP & DATABASE ---
conn = mysql.connector.connect(host="localhost", user="root", password="", database="dams_db")

# --- 2. RECENT TRAIN DATA (The "Memory" Fix) ---
# We only pull data from the last 6 months of 2025 to capture the 'live' slope
df_train = pd.read_sql("""
    SELECT Дата as ds, Разполагаем as y 
    FROM dam_his 
    WHERE DamId = 33 
    AND Дата >= '2025-06-01' AND Дата < '2026-01-01'
""", conn)

df_train['ds'] = pd.to_datetime(df_train['ds'])
df_train['y'] = pd.to_numeric(df_train['y'], errors='coerce')
df_train = df_train.set_index('ds').resample('D').mean().interpolate(method='time').reset_index()

DAM_CAPACITY, DAM_FLOOR = 114.0, 24.0
df_train['cap'], df_train['floor'] = DAM_CAPACITY, DAM_FLOOR

# --- 3. HIGH-FLEXIBILITY TREND ---
m = Prophet(
    growth='logistic', 
    yearly_seasonality=False, 
    weekly_seasonality=False, 
    daily_seasonality=False,
    # Extreme flexibility (1.0) forces the line to follow the recent slope
    # instead of flattening out into an average.
    changepoint_prior_scale=1.0,
    # Tells the model that the 'change' happened right at the end of the data
    changepoint_range=0.95 
)

m.fit(df_train)

# --- 4. BIAS ALIGNMENT ---
last_real_value = df_train['y'].iloc[-1]
check_last_point = m.predict(df_train.tail(1))
model_last_estimate = check_last_point['yhat'].iloc[0]
bias = last_real_value - model_last_estimate

# --- 5. FORECASTING ---
future = m.make_future_dataframe(periods=60, freq='D')
future['cap'], future['floor'] = DAM_CAPACITY, DAM_FLOOR

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
plt.ylabel("Обем (милиона кубични метри)")
plt.title("Phase 1: Historical Data (No Seasonality, No weather inputs)")
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()