import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Info = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/dam/${decodedName}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Error fetching data:', err));
  }, [decodedName]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Язовир: {decodedName}</h1>

      {data.length > 0 ? (
        <div style={{ width: '100%', height: 500 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: 'Обем (м³)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Процент / m³/s', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />

              {/* Всички показатели */}
              <Line yAxisId="left" type="monotone" dataKey="Общ_обем" stroke="#1976d2" name="Общ обем" />
              <Line yAxisId="left" type="monotone" dataKey="Мъртъв_обем" stroke="#9c27b0" name="Мъртъв обем" />
              <Line yAxisId="left" type="monotone" dataKey="Наличен" stroke="#4caf50" name="Наличен обем" />
              <Line yAxisId="right" type="monotone" dataKey="Наличен_процент" stroke="#ff9800" name="Наличен %" />
              <Line yAxisId="left" type="monotone" dataKey="Разполагаем" stroke="#f44336" name="Разполагаем обем" />
              <Line yAxisId="right" type="monotone" dataKey="Разполагаем_процент" stroke="#00bcd4" name="Разполагаем %" />
              <Line yAxisId="left" type="monotone" dataKey="Приток" stroke="#8bc34a" name="Приток" />
              <Line yAxisId="left" type="monotone" dataKey="Разход" stroke="#e91e63" name="Разход" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>Няма налични данни за този язовир.</p>
      )}

      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '20px',
          textDecoration: 'none',
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px'
        }}
      >
        ⬅️ Назад към картата
      </Link>
    </div>
  );
}

export default Info;