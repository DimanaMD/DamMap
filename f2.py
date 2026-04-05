import pandas as pd
from prophet import Prophet
import mysql.connector
import matplotlib.pyplot as plt
import numpy as np

# --- 1. SETUP & DATABASE ---
conn = mysql.connector.connect(host="localhost", user="root", password="", database="dams_db")

# --- 2. TRAIN DATA PREP (No Weather Merging) ---
# Training on all data BEFORE 2026
df_train = pd.read_sql("SELECT Дата as ds, Разполагаем as y FROM dam_his WHERE DamId = 33 AND YEAR(Дата) < 2026", conn)
df_train['ds'] = pd.to_datetime(df_train['ds'])
df_train['y'] = pd.to_numeric(df_train['y'], errors='coerce')

# Clean and Resample
df_train = df_train.set_index('ds').resample('D').mean().interpolate(method='time').reset_index()

DAM_CAPACITY, DAM_FLOOR = 114.0, 24.0
df_train['cap'], df_train['floor'] = DAM_CAPACITY, DAM_FLOOR

# --- 3. THE "GOOD SEASONALITY" MODEL ---
# We keep your high flexibility settings but remove the regressors
m = Prophet(
    growth='logistic', 
    seasonality_mode='multiplicative',
    changepoint_prior_scale=0.25,      # High flexibility to adapt to recent years
    seasonality_prior_scale=10.0,     # Strong seasonal peaks
    yearly_seasonality=False          # Custom yearly below
)

# Progress Point: Using Fourier Order 20 for "Sharper" seasonal waves
m.add_seasonality(name='yearly', period=365.25, fourier_order=20) 

m.fit(df_train)

# --- 4. THE "INITIAL CONDITION" FIX (Bias Correction) ---
# This ensures the orange line starts exactly where 2025 ended
last_real_value = df_train['y'].iloc[-1]
check_last_point = m.predict(df_train.tail(1))
model_last_estimate = check_last_point['yhat'].iloc[0]

# Calculate the Vertical Gap
bias = last_real_value - model_last_estimate

# --- 5. FORECASTING 2026 ---
future = m.make_future_dataframe(periods=60, freq='D')
future['cap'], future['floor'] = DAM_CAPACITY, DAM_FLOOR

forecast = m.predict(future)

# Apply the Manual Shift (The Progress Fix)
forecast['yhat'] = forecast['yhat'] + bias 

forecast_Final = forecast[(forecast['ds'] >= '2026-01-01') & (forecast['ds'] <= '2026-02-28')]

# --- 6. REAL DATA PREP FOR COMPARISON ---
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
plt.title("Phase 2: Historical Data and Seasonality (No weather inputs)")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()