from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import pandas as pd
from prophet import Prophet
import numpy as np
import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime
from waitress import serve
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

DB_HOST = os.getenv('MYSQL_HOST', 'localhost')
DB_USER = os.getenv('MYSQL_USER', 'root')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
DB_DATABASE = os.getenv('MYSQL_DATABASE','dams_db')




def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_DATABASE
    )

@app.route('/api/dam/<name>', methods=['GET'])
def get_dam_data(name):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT id FROM dam_perm WHERE Име = %s LIMIT 1", (name,))
    dam = cursor.fetchone()

    if not dam:
        return jsonify({"error": "Язовирът не е намерен."}), 404

    

    sql = """
        SELECT Дата, Общ_обем, Мъртъв_обем, Наличен, 
               Наличен_процент, Разполагаем, Разполагаем_процент, 
               Приток, Разход 
        FROM dam_his WHERE DamID = %s 
        ORDER BY Дата ASC
    """
    cursor.execute(sql, (dam['id'],))
    results = cursor.fetchall()
    
    formatted = []
    for row in results:
        formatted.append({
            "date": row['Дата'].strftime('%Y-%m-%d') if hasattr(row['Дата'], 'strftime') else str(row['Дата']),
            "Общ_обем": row['Общ_обем'],
            "Мъртъв_обем": row['Мъртъв_обем'],
            "Наличен_процент": row['Наличен_процент'],
            "Наличен": row['Наличен'],
            "Разполагаем": row['Разполагаем'],
            "Разполагаем_процент": row['Разполагаем_процент'],
            "Разход": row['Разход'],
            "Приток": row['Приток'],
        })

    cursor.close()
    db.close()
    return jsonify(formatted)

@app.route('/api/predict', methods=['POST'])
def predict():
    req_data = request.get_json()
    dam_name = req_data.get('name')
    prediction_days = int(req_data.get('days', 7))
    coords = req_data.get('cords') 
    
    LAT = coords[0]
    LON = coords[1]
    OFFSET = 0.013
    LAG_DAYS = 1

    conn = get_db_connection()
    cursor = conn.cursor()

    id_query = "SELECT id FROM dam_perm WHERE Име = %s LIMIT 1"
    cursor.execute(id_query, (dam_name,))
    result = cursor.fetchone()

    if not result:
        conn.close()
        return jsonify({"error": "Язовирът не е намерен в dam_perm"}), 404

    dam_id = result[0]

    #Borders
    vol_query = """
        SELECT `Общ_обем`, `Мъртъв_обем` 
        FROM dam_his 
        WHERE DamId = %s 
        LIMIT 1
    """
    cursor.execute(vol_query, (dam_id,))
    vol_result = cursor.fetchone()

    if not vol_result:
        conn.close()
        return jsonify({"error": "Не са намерени данни за обеми в dam_his"}), 404

  
    DAM_CAPACITY = float(vol_result[0])
    DAM_FLOOR = float(vol_result[1])
   

    if not result:
        conn.close()
        return jsonify({"error": "Dam not found in dam_perm"}), 404

    # Weather
    def get_spatial_weather(lat, lon):
        lats = [lat, lat + OFFSET, lat - OFFSET, lat, lat]
        lons = [lon, lon, lon, lon + OFFSET, lon - OFFSET]
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        hist_url = "https://archive-api.open-meteo.com/v1/archive"
        hist_params = {"latitude": lats, "longitude": lons, "start_date": "2020-01-01", "end_date": current_date, "daily": "precipitation_sum", "timezone": "auto"}
        hist_responses = openmeteo.weather_api(hist_url, params=hist_params)
        
        fore_url = "https://api.open-meteo.com/v1/forecast"
        fore_params = {"latitude": lats, "longitude": lons, "daily": "precipitation_sum", "timezone": "auto", "forecast_days": 14}
        fore_responses = openmeteo.weather_api(fore_url, params=fore_params)

        def process_responses(responses):
            all_points_data = [res.Daily().Variables(0).ValuesAsNumpy() for res in responses]
            spatial_mean = np.mean(all_points_data, axis=0)
            spatial_max = np.max(all_points_data, axis=0)
            accented_rain = (spatial_mean * 0.7) + (spatial_max * 0.3)
            return pd.DataFrame({
                "ds": pd.to_datetime(responses[0].Daily().Time(), unit="s", utc=True).tz_localize(None) + pd.to_timedelta(range(accented_rain.size), unit='D'),
                "rain": accented_rain
            })

        h_df = process_responses(hist_responses)
        f_df = process_responses(fore_responses)
        return pd.concat([h_df, f_df]).drop_duplicates('ds').sort_values('ds')

    df_weather_all = get_spatial_weather(LAT, LON)

    # Past Data
    query = "SELECT Дата as ds, Разполагаем as y, Приток as inflow, Разход as outflow FROM dam_his WHERE DamId = %s"
    df_train = pd.read_sql(query, conn, params=(dam_id,))
    
    df_train['ds'] = pd.to_datetime(df_train['ds'])
    df_train['y'] = pd.to_numeric(df_train['y'], errors='coerce')
    df_train = df_train.set_index('ds').resample('D').mean().interpolate(method='time').reset_index()
    df_train = pd.merge(df_train, df_weather_all, on='ds', how='left').fillna(0)
    df_train['inflow_state'] = df_train['inflow'].rolling(window=7, min_periods=1).mean()
    df_train['outflow_state'] = df_train['outflow'].rolling(window=7, min_periods=1).mean()
    df_train['rain_lagged'] = df_train['rain'].shift(LAG_DAYS).fillna(0)
    df_train['inflow_state_lagged'] = df_train['inflow_state'].shift(LAG_DAYS).fillna(0)
    df_train['cap'], df_train['floor'] = DAM_CAPACITY, DAM_FLOOR

    # Prophet and fine tuning
    m = Prophet(growth='logistic', seasonality_mode='multiplicative', changepoint_prior_scale=6, seasonality_prior_scale=2.0, yearly_seasonality=False)
    m.add_seasonality(name='yearly', period=365.25, fourier_order=12) 
    m.add_regressor('rain_lagged')
    m.add_regressor('inflow_state_lagged')
    m.add_regressor('outflow_state')
    m.fit(df_train)

    # F Prediction
    last_real_value = df_train['y'].iloc[-1]
    check_last_point = m.predict(df_train.tail(1))
    bias = last_real_value - check_last_point['yhat'].iloc[0]

    future = m.make_future_dataframe(periods=prediction_days, freq='D')
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

    forecast_final = forecast.tail(prediction_days)[['ds', 'yhat']].rename(columns={'ds': 'date', 'yhat': 'prediction'})
    forecast_final['date'] = forecast_final['date'].dt.strftime('%Y-%m-%d')
    
    conn.close()
    return jsonify(forecast_final.to_dict(orient='records'))

if __name__ == '__main__':
    print("Serving production at http://0.0.0.0:5000")
    serve(app, host='0.0.0.0', port=5000)