import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       
  password: '',
  database: 'dams_db', 
});


app.get('/api/dam/:name', (req, res) => {
  const damName = decodeURIComponent(req.params.name);


  const sqlFind = `SELECT id FROM dam_perm WHERE Име = ? LIMIT 1`;
  db.query(sqlFind, [damName], (err, damResult) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (damResult.length === 0) {
      return res.status(404).json({ error: 'Язовирът не е намерен.' });
    }

    const damId = damResult[0].id;

    // 2️⃣ Взимаме всички записи от dam_his за този DamID
    const sqlData = `
      SELECT 
        Дата, 
        Общ_обем, 
        Мъртъв_обем, 
        Наличен, 
        Наличен_процент, 
        Разполагаем, 
        Разполагаем_процент, 
        Приток, 
        Разход
      FROM dam_his
      WHERE DamID = ?
      ORDER BY Дата ASC
    `;

    db.query(sqlData, [damId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const formatted = results.map(row => ({
        date: row.Дата,
        Общ_обем: row.Общ_обем,
        Мъртъв_обем: row.Мъртъв_обем,
        Наличен: row.Наличен,
        Наличен_процент: row.Наличен_процент,
        Разполагаем: row.Разполагаем,
        Разполагаем_процент: row.Разполагаем_процент,
        Приток: row.Приток,
        Разход: row.Разход,
      }));

      res.json(formatted);
    });
  });
});

app.listen(5000, () =>
  console.log('✅ Server running on http://localhost:5000')
);