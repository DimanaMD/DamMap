import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Header from "./Header";
import Footer from "./Footer";
import { styles, THEME } from "./assets/Javascript/infoStyles";
import damsData from "./json/dams_data.json";
import damDescriptions from "./assets/Javascript/res";

const Info = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(name);

  const TICA_AREA_KM2 = 19.655;
  const isTicha = decodedName === "Тича";

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("10");
  const [activeChart, setActiveChart] = useState("обем");

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

  // 📅 Calculate date limits
  const { minDataDate, maxDataDate } = useMemo(() => {
    if (!data.length) return {};
    let min = data[0].date;
    let max = data[0].date;
    for (let i = 1; i < data.length; i++) {
      if (data[i].date < min) min = data[i].date;
      if (data[i].date > max) max = data[i].date;
    }
    return { minDataDate: min, maxDataDate: max };
  }, [data]);

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

    const filtered = data.filter(r => {
      return r.date >= fromDate && r.date <= toDate;
    });

    setFilteredData(filtered);
    setFilterType("custom");
  };

  const clearPeriodFilter = () => {
    setFromDate("");
    setToDate("");
    applyFilter("10");
  };

  const hasData = data.length > 0;
  const deadVol = hasData ? data[0].Мъртъв_обем : 0;
  const totalVol = hasData ? data[0].Общ_обем : 0;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ ...styles.mainContent, flex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", width: "100%" }}>
        
        <header style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate(-1)}
            title="Назад"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              color: "#64748b",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              flexShrink: 0
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#334155";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
            }}
          >
            <span className="material-icons" style={{ fontSize: "20px" }}>arrow_back</span>
          </button>

          <div>
            <h1 style={{ fontSize: "2.5rem", color: THEME.primary, margin: 0, lineHeight: 1.2 }}>
              яз. {decodedName}
            </h1>

            {damDetails && (
              <div style={{ color: THEME.textGray, marginTop: "4px" }}>
                {damDetails["Област"]} | {damDetails["Басейнов район"]}
              </div>
            )}
          </div>
        </header>

        {hasData && (
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <StatCard label="Общ обем" value={totalVol} color={THEME.primary} />
            <StatCard label="Мъртъв обем" value={deadVol} color={THEME.danger} />
            {damArea && (
              <StatCard
                label="Водна площ"
                value={damArea}
                unit="km²"
                color={THEME.info}
              />
            )}
          </div>
        )}

        {/* 🎛 CONTROLS */}
        <div style={styles.controlPanel}>
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

          {/* 📅 PERIOD PICKER */}
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            backgroundColor: THEME.white,
            padding: "6px 12px",
            borderRadius: "12px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ 
              position: "relative", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              transition: "all 0.2s"
            }}>
              <span className="material-icons" style={{ 
                fontSize: "18px", 
                color: "#64748b",
                pointerEvents: "none" 
              }}>
                event
              </span>
              <input
                type="date"
                value={fromDate}
                min={minDataDate}
                max={maxDataDate}
                onChange={e => setFromDate(e.target.value)}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer"
                }}
                onClick={(e) => {
                  if (e.target.showPicker) e.target.showPicker();
                }}
                onFocus={(e) => {
                    e.target.parentElement.style.borderColor = THEME.primary;
                    e.target.parentElement.style.backgroundColor = "#fff";
                    e.target.parentElement.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
                }}
                onBlur={(e) => {
                    e.target.parentElement.style.borderColor = "#cbd5e1";
                    e.target.parentElement.style.backgroundColor = "#f8fafc";
                    e.target.parentElement.style.boxShadow = "none";
                }}
                title={fromDate ? `От: ${fromDate}` : "Начална дата"}
              />
            </div>
            
            <span style={{ color: "#cbd5e1", fontSize: "12px" }}>➜</span>

            <div style={{ 
              position: "relative", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              transition: "all 0.2s"
            }}>
              <span className="material-icons" style={{ 
                fontSize: "18px", 
                color: "#64748b",
                pointerEvents: "none" 
              }}>
                event_available
              </span>
              <input
                type="date"
                value={toDate}
                min={minDataDate}
                max={maxDataDate}
                onChange={e => setToDate(e.target.value)}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer"
                }}
                onClick={(e) => {
                  if (e.target.showPicker) e.target.showPicker();
                }}
                onFocus={(e) => {
                    e.target.parentElement.style.borderColor = THEME.primary;
                    e.target.parentElement.style.backgroundColor = "#fff";
                    e.target.parentElement.style.boxShadow = `0 0 0 3px ${THEME.primary}15`;
                }}
                onBlur={(e) => {
                    e.target.parentElement.style.borderColor = "#cbd5e1";
                    e.target.parentElement.style.backgroundColor = "#f8fafc";
                    e.target.parentElement.style.boxShadow = "none";
                }}
                title={toDate ? `До: ${toDate}` : "Крайна дата"}
              />
            </div>

            <div style={{ display: "flex", gap: "6px", marginLeft: "4px" }}>
              <button 
                onClick={applyPeriodFilter} 
                title="Приложи"
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: THEME.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 4px rgba(14, 165, 233, 0.25)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#0284c7";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = THEME.primary;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span className="material-icons" style={{ fontSize: "18px" }}>check</span>
              </button>

              {(fromDate || toDate) && (
                <button 
                  onClick={clearPeriodFilter}
                  title="Изчисти"
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fee2e2",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fecaca"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                >
                  <span className="material-icons" style={{ fontSize: "18px" }}>close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📈 CHARTS */}
        <div style={styles.chartWrapper}>
          {activeChart === "обем" && (
            <ChartLayout data={filteredData} unit="m³">
              <Line 
                type="monotone" 
                dataKey="Наличен" 
                name="Наличен обем"
                stroke="#0ea5e9" 
                strokeWidth={3} 
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#0ea5e9" }}
              />
              <Line 
                type="monotone" 
                dataKey="Разполагаем" 
                name="Разполагаем обем"
                stroke="#cbd5e1" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#cbd5e1" }}
              />
              <ReferenceLine 
                y={deadVol} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label={{ value: "Мъртъв обем", position: "insideTopRight", fill: "#ef4444", fontSize: 12 }}
              />
            </ChartLayout>
          )}

          {activeChart === "прилив/отлив" && (
            <ChartLayout data={filteredData} unit="m³">
              <Line 
                type="monotone" 
                dataKey="Приток" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
              />
              <Line 
                type="monotone" 
                dataKey="Разход" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }}
              />
            </ChartLayout>
          )}
        </div>
        
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
      
      <Footer />
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

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        fontFamily: "sans-serif"
      }}>
        <p style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#64748b", fontWeight: "600" }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: entry.color }} />
            <span style={{ fontSize: "0.9rem", color: "#334155", fontWeight: "500" }}>
              {entry.name}:
            </span>
            <span style={{ fontSize: "0.9rem", color: "#0f172a", fontWeight: "bold" }}>
              {Number(entry.value).toLocaleString()} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ChartLayout = ({ children, data, unit = "m³" }) => (
  <div style={{ width: "100%", height: 450, marginTop: "20px" }}>
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
          minTickGap={40}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value;
          }}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
        {children}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default Info;