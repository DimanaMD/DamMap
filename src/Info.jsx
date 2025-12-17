import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Header from "./Header";

const THEME = {
  primary: "hsla(213, 40%, 22%, 1.00)",
  primaryLight: "hsla(213, 40%, 35%, 1.00)",
  danger: "#dc1d1d",
  success: "#4caf50",
  warning: "#ff9800",
  info: "#00bcd4",
  gray: "#f4f4f4",
  textGray: "#666",
  white: "#ffffff",
  shadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
};

const Info = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("10");
  const [activeChart, setActiveChart] = useState("volume");

  useEffect(() => {
    fetch(`http://localhost:5000/api/dam/${decodedName}`)
      .then(res => res.json())
      .then(json => {
        const formatted = json.map(row => ({
          ...row,
          date: row.date.split("T")[0],
        }));
        setData(formatted);
        applyFilter("10", formatted);
      })
      .catch(err => console.error('Fetch error:', err));
  }, [decodedName]);

  const applyFilter = (type, fullData = data) => {
    let filtered = [];
    if (type === "10") filtered = fullData.filter((_, i) => i % 10 === 0);
    else if (type === "month") {
      let lastMonth = null;
      filtered = fullData.filter(row => {
        const m = new Date(row.date).getMonth();
        if (m !== lastMonth) { lastMonth = m; return true; }
        return false;
      });
    } else if (type === "year") {
      let lastYear = null;
      filtered = fullData.filter(row => {
        const y = new Date(row.date).getFullYear();
        if (y !== lastYear) { lastYear = y; return true; }
        return false;
      });
    }
    setFilteredData(filtered);
    setFilterType(type);
  };

  const hasData = data.length > 0;
  const deadVol = hasData ? data[0].Мъртъв_обем : 0;
  const totalVol = hasData ? data[0].Общ_обем : 0;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={styles.fixedHeader}>
        <Header />
      </div>

      <main style={styles.mainContent}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", color: THEME.primary, marginBottom: "0.5rem" }}>
            яз. {decodedName}
          </h1>
          <p style={{ color: THEME.textGray }}>Historical data and volume analysis</p>
        </header>

        {hasData && (
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <StatCard label="Total Capacity" value={totalVol} color={THEME.primary} />
            <StatCard label="Dead Volume" value={deadVol} color={THEME.danger} />
          </div>
        )}

        <div style={styles.controlPanel}>
          <div style={styles.buttonGroup}>
            {['volume', 'percent', 'flow'].map(type => (
              <button 
                key={type}
                onClick={() => setActiveChart(type)}
                style={{
                  ...styles.tabBtn,
                  backgroundColor: activeChart === type ? THEME.primary : THEME.white,
                  color: activeChart === type ? THEME.white : THEME.primary,
                }}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={styles.buttonGroup}>
            {[{l: '10 Days', v: '10'}, {l: 'Monthly', v: 'month'}, {l: 'Yearly', v: 'year'}].map(f => (
              <button 
                key={f.v}
                onClick={() => applyFilter(f.v)}
                style={{
                  ...styles.filterBtn,
                  borderColor: filterType === f.v ? THEME.primary : "#ddd",
                  color: filterType === f.v ? THEME.primary : THEME.textGray,
                  fontWeight: filterType === f.v ? "600" : "400"
                }}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.chartWrapper}>
          {activeChart === "volume" && (
            <ChartLayout data={filteredData}>
              {/* Changed type to "monotone" for smoothness */}
              <Line yAxisId="left" type="monotone" dataKey="Наличен" stroke={THEME.success} strokeWidth={3} name="Available" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="Разполагаем" stroke={THEME.primaryLight} strokeWidth={2} name="Usable" dot={false} />
              <ReferenceLine yAxisId="left" y={deadVol} stroke={THEME.danger} strokeDasharray="8 4" label={{ position: 'right', value: 'Dead Vol', fill: THEME.danger, fontSize: 12 }} />
            </ChartLayout>
          )}

          {activeChart === "percent" && (
            <ChartLayout data={filteredData} isPercent>
              <Line yAxisId="left" type="monotone" dataKey="Наличен_процент" stroke={THEME.warning} strokeWidth={3} name="Available %" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="Разполагаем_процент" stroke={THEME.info} strokeWidth={2} name="Usable %" dot={false} />
            </ChartLayout>
          )}

          {activeChart === "flow" && (
            <ChartLayout data={filteredData}>
              <Line yAxisId="left" type="monotone" dataKey="Приток" stroke={THEME.success} strokeWidth={2} name="Inflow" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="Разход" stroke={THEME.danger} strokeWidth={2} name="Outflow" dot={false} />
            </ChartLayout>
          )}
        </div>

        <Link to="/Map" style={styles.backBtn}>
          ← Return to Map
        </Link>
      </main>
    </div>
  );
};

// --- Sub-Components ---
const StatCard = ({ label, value, color }) => (
  <div style={{
    flex: "1 1 250px",
    padding: "1.5rem",
    backgroundColor: THEME.white,
    borderRadius: "12px",
    boxShadow: THEME.shadow,
    borderLeft: `6px solid ${color}`
  }}>
    <div style={{ color: THEME.textGray, fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>{label}</div>
    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: THEME.primary }}>{value.toLocaleString()} <span style={{fontSize: '1rem'}}>m³</span></div>
  </div>
);

const ChartLayout = ({ children, data, isPercent }) => (
  <div style={{ width: "100%", height: 450 }}>
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
        <XAxis dataKey="date" tick={{fontSize: 12}} minTickGap={30} />
        <YAxis yAxisId="left" tick={{fontSize: 12}} label={{ value: isPercent ? '%' : 'm³', angle: -90, position: 'insideLeft' }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: THEME.shadow }} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {children}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const styles = {
  fixedHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    paddingTop: "100px" 
  },
  controlPanel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "2rem"
  },
  buttonGroup: {
    display: "flex",
    backgroundColor: "#eee",
    padding: "4px",
    borderRadius: "8px",
    gap: "4px"
  },
  tabBtn: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s"
  },
  filterBtn: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.85rem"
  },
  chartWrapper: {
    backgroundColor: THEME.white,
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: THEME.shadow,
    marginBottom: "2rem"
  },
  backBtn: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: THEME.primary,
    color: THEME.white,
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "transform 0.2s"
  }
};

export default Info;