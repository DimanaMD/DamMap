import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Header from "./Header";
import { styles, THEME } from "./assets/Javascript/infoStyles";
import damsData from "./json/dams_data.json";
import damDescriptions from "./assets/Javascript/res";

const Info = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);

  const TICA_AREA_KM2 = 19.655;
  const isTicha = decodedName === "Тича";

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("10");
  const [activeChart, setActiveChart] = useState("volume");

  // 📅 period state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const damDetails = damsData.find(d => d["Име"] === decodedName);
const damDescription = damDescriptions[decodedName];
const damArea = damDetails?.Площ_km2;

  useEffect(() => {
    fetch(`http://localhost:5000/api/dam/${decodedName}`)
      .then(res => res.json())
      .then(json => {
        const formatted = json.map(r => ({
          ...r,
          date: r.date.split("T")[0],
        }));
        setData(formatted);
        applyFilter("10", formatted);
      })
      .catch(() => setData([]));
  }, [decodedName]);

  // 🔍 standard filters
  const applyFilter = (type, fullData = data) => {
    let filtered = [];

    if (type === "10") {
      filtered = fullData.filter((_, i) => i % 10 === 0);
    } else if (type === "month") {
      let last = null;
      filtered = fullData.filter(r => {
        const m = r.date.slice(0, 7);
        if (m !== last) {
          last = m;
          return true;
        }
        return false;
      });
    } else if (type === "year") {
      let last = null;
      filtered = fullData.filter(r => {
        const y = r.date.slice(0, 4);
        if (y !== last) {
          last = y;
          return true;
        }
        return false;
      });
    }

    setFilteredData(filtered);
    setFilterType(type);
  };

  // 📅 period filter
  const applyPeriodFilter = () => {
    if (!fromDate || !toDate) return;

    const from = new Date(fromDate + "-01");
    const to = new Date(toDate + "-01");
    to.setMonth(to.getMonth() + 1);

    const filtered = data.filter(r => {
      const d = new Date(r.date);
      return d >= from && d < to;
    });

    setFilteredData(filtered);
    setFilterType("custom");
  };

  const hasData = data.length > 0;
  const deadVol = hasData ? data[0].Мъртъв_обем : 0;
  const totalVol = hasData ? data[0].Общ_обем : 0;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Header />

      <main style={styles.mainContent}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", color: THEME.primary }}>
            яз. {decodedName}
          </h1>

          {damDetails && (
            <div style={{ color: THEME.textGray }}>
              {damDetails["Област"]} | {damDetails["Басейнов район"]}
            </div>
          )}
        </header>

        {/* 📊 STATS (NO DUPLICATION) /}
        {hasData && (
  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
    <StatCard label="Total Capacity" value={totalVol} color={THEME.primary} />
    <StatCard label="Dead Volume" value={deadVol} color={THEME.danger} />

    {damArea && (
      <StatCard
        label="Water Surface Area"
        value={damArea}
        unit="km²"
        color={THEME.info}
      />
    )}
  </div>
)}


        {/ 🎛 CONTROLS /}
        <div style={styles.controlPanel}>
          {/ chart tabs */}
          {hasData && (
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <StatCard label="Общ обем" value={totalVol} color={THEME.primary} />
            <StatCard label="Мъртъв обем" value={deadVol} color={THEME.danger} />
          </div>
        )}
          <div style={styles.buttonGroup}>
            {["обем", "прилив/отлив"].map(t => (
              <button
                key={t}
                onClick={() => setActiveChart(t)}
                style={{
                  ...styles.tabBtn,
                  backgroundColor: activeChart === t ? THEME.primary : THEME.white,
                  color: activeChart === t ? THEME.white : THEME.primary,
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={styles.buttonGroup}>
            {[
              { l: "10 Дневно", v: "10" },
              { l: "Месечно", v: "month" },
              { l: "Годишно", v: "year" }
            ].map(f => (
              <button
                key={f.v}
                onClick={() => applyFilter(f.v)}
                style={{
                  ...styles.filterBtn,
                  borderColor: filterType === f.v ? THEME.primary : "#ddd",
                  color: filterType === f.v ? THEME.primary : THEME.textGray
                }}
              >
                {f.l}
              </button>
            ))}
          </div>

          {/* 📅 PERIOD PICKER /}
          <div style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <input
              type="month"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={{ color: THEME.textGray }}>→</span>
            <input
              type="month"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              style={styles.dateInput}
            />
            <button onClick={applyPeriodFilter} style={styles.applyBtn}>
              Apply
            </button>
          </div>
        </div>

        {/ 📈 CHARTS */}
        <div style={styles.chartWrapper}>
          {activeChart === "обем" && (
            <ChartLayout data={filteredData}>
              <Line dataKey="Наличен" stroke={THEME.success} strokeWidth={3} dot={false} />
              <Line dataKey="Разполагаем" stroke={THEME.primaryLight} strokeWidth={2} dot={false} />
              <ReferenceLine y={deadVol} stroke={THEME.danger} strokeDasharray="6 4" />
            </ChartLayout>
          )}

          {activeChart === "прилив/отлив" && (
            <ChartLayout data={filteredData}>
              <Line dataKey="Приток" stroke={THEME.success} strokeWidth={2} dot={false} />
              <Line dataKey="Разход" stroke={THEME.danger} strokeWidth={2} dot={false} />
            </ChartLayout>
          )}
          {damDescription && (
  <section
    style={{
      marginTop: "3rem",
      padding: "2rem",
backgroundColor: THEME.white,
      borderRadius: "14px",
      boxShadow: THEME.shadow,
      lineHeight: 1.7,
    }}
  >
    <h2 style={{ color: THEME.primary, marginBottom: "1rem" }}>
      За язовир „{decodedName}“
    </h2>

    <p
      style={{
        whiteSpace: "pre-line",
        color: "#333",
        fontSize: "1.05rem",
      }}
    >
      {damDescription}
    </p>
  </section>
)}

        </div>
        
      </main>
      
    </div>
  );
};


/* ---------- helpers ---------- */

const StatCard = ({ label, value, color, unit = "m³" }) => (
  <div style={{
    flex: "1 1 250px",
    padding: "1.5rem",
    background: THEME.white,
    borderRadius: "12px",
    boxShadow: THEME.shadow,
    borderLeft: `6px solid ${color}`
  }}>
    <div style={{ color: THEME.textGray, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
      {value.toLocaleString()} <span style={{ fontSize: "1rem" }}>{unit}</span>
    </div>
  </div>
);

const ChartLayout = ({ children, data, isPercent }) => (
  <div style={{ width: "100%", height: 450 }}>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" />
        <YAxis label={{ value: isPercent ? "%" : "m³", angle: -90 }} />
        <Tooltip />
        <Legend />
        {children}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default Info;