from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app) # Keeps the "bridge" open for React

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="dams_db"
    )

@app.route('/api/dam/<name>', methods=['GET'])
def get_dam_data(name):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True) # Returns rows as dicts/objects

    # 1. Find the ID
    cursor.execute("SELECT id FROM dam_perm WHERE Име = %s LIMIT 1", (name,))
    dam = cursor.fetchone()

    if not dam:
        return jsonify({"error": "Язовирът не е намерен."}), 404

    # 2. Get Historical Data
    sql = """
        SELECT Дата, Общ_обем, Мъртъв_обем, Наличен, 
               Наличен_процент, Разполагаем, Разполагаем_процент, 
               Приток, Разход 
        FROM dam_his WHERE DamID = %s ORDER BY Дата ASC
    """
    cursor.execute(sql, (dam['id'],))
    results = cursor.fetchall()
    
    # 3. Format for Frontend
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

if __name__ == '__main__':
    app.run(port=5000)