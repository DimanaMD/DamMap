import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import Header from "./Header";
import Footer from "./Footer";
import { styles, THEME } from "./assets/Javascript/infoStyles";
import damsData from "./json/dams_data.json";
import damDescriptions from "./assets/Javascript/res";
import {damAreas} from "./assets/Javascript/res.js";



const monthNames = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

/* ---------- component ---------- */

const Info = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(name);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("10");
  const [activeChart, setActiveChart] = useState("обем");

  // 🗓 period state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const damDetails = damsData.find(d => d["Име"] === decodedName);
  const damDescription = damDescriptions[decodedName];
  const damArea = damAreas.find(d => d.Име === decodedName)?.Площ;

  /* ---------- data fetch ---------- */

  useEffect(() => {
    fetch(`http://localhost:5000/api/dam/${decodedName}`)
      .then(res => res.json())
      .then(json => {
        const formatted = json.map(r => ({
          ...r,
          date: r.date.split("T")[0],
        }));

        setData(formatted);

        if (formatted.length) {
          const lastDate = formatted[formatted.length - 1].date;
          setSelectedYear(Number(lastDate.slice(0, 4)));
          setSelectedMonth(Number(lastDate.slice(5, 7)) - 1);
        }
      })
      .catch(() => setData([]));
  }, [decodedName]);

  /* ---------- filtering ---------- */

  useEffect(() => {
    if (!data.length) return;

    let filtered = [];

    if (filterType === "10") {
      filtered = data.filter((_, i) => i % 10 === 0);
    }

    if (filterType === "month") {
      const m = String(selectedMonth + 1).padStart(2, "0");
      const prefix = `${selectedYear}-${m}`;
      filtered = data.filter(d => d.date.startsWith(prefix));
    }

    if (filterType === "year") {
      filtered = data.filter(d => d.date.startsWith(`${selectedYear}`));
    }

    setFilteredData(filtered);
  }, [filterType, selectedMonth, selectedYear, data]);

  /* ---------- navigation ---------- */

  const prevPeriod = () => {
    if (filterType === "month") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(y => y - 1);
      } else {
        setSelectedMonth(m => m - 1);
      }
    }
    if (filterType === "year") {
      setSelectedYear(y => y - 1);
    }
  };

  const nextPeriod = () => {
    if (filterType === "month") {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(y => y + 1);
      } else {
        setSelectedMonth(m => m + 1);
      }
    }
    if (filterType === "year") {
      setSelectedYear(y => y + 1);
    }
  };

  /* ---------- stats ---------- */

  const hasData = data.length > 0;
  const deadVol = hasData ? data[0].Мъртъв_обем : 0;
  const totalVol = hasData ? data[0].Общ_обем : 0;
  const waterArea = damArea ? Number(damArea) : 0;

  /* ---------- render ---------- */

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ ...styles.mainContent, flex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

          {/* HEADER */}
          <header style={{ marginBottom: "2rem", display: "flex", gap: "16px" }}>
            <button onClick={() => navigate(-1)} style={navBackBtn}>
              <span className="material-icons">arrow_back</span>
            </button>

            <div>
              <h1 style={{ fontSize: "2.5rem", color: THEME.primary }}>
                яз. {decodedName}
              </h1>
              {damDetails && (
                <div style={{ color: THEME.textGray }}>
                  {damDetails["Област"]} | {damDetails["Басейнов район"]}
                </div>
              )}
            </div>
          </header>

          {/* STATS */}
          {hasData && (
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <StatCard label="Общ обем" value={totalVol} color={THEME.primary} />
              <StatCard label="Мъртъв обем" value={deadVol} color={THEME.danger} />
              {waterArea > 0 && (
                <StatCard label="Водна площ" value={waterArea} unit="km²" color={THEME.info} />
              )} 
            </div>
          )}

          {/* CONTROLS */}
          <div style={styles.controlPanel}>

            {/* CHART TYPE */}
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

            {/* FILTER TYPE */}
            <div style={styles.buttonGroup}>
              {[
                { l: "10 Дневно", v: "10" },
                { l: "Месечно", v: "month" },
                { l: "Годишно", v: "year" }
              ].map(f => (
                <button
                  key={f.v}
                  onClick={() => setFilterType(f.v)}
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

            {/* PERIOD NAVIGATOR */}
            {filterType !== "10" && (
              <div style={periodNav}>
                <button onClick={prevPeriod} style={periodBtn}>
                  <span className="material-icons">chevron_left</span>
                </button>

                <div style={{ fontWeight: 600, color: THEME.primary }}>
                  {filterType === "month"
                    ? `${monthNames[selectedMonth]} ${selectedYear}`
                    : selectedYear}
                </div>

                <button onClick={nextPeriod} style={periodBtn}>
<span className="material-icons">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* CHART */}
          <div style={styles.chartWrapper}>
            {activeChart === "обем" && (
              <ChartLayout data={filteredData}>
                <Line dataKey="Наличен" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                <Line dataKey="Разполагаем" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} />
                <ReferenceLine y={deadVol} stroke="#ef4444" strokeDasharray="3 3" />
              </ChartLayout>
            )}

            {activeChart === "прилив/отлив" && (
              <ChartLayout data={filteredData}>
                <Line dataKey="Приток" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line dataKey="Разход" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ChartLayout>
            )}
          </div>

          {/* DESCRIPTION */}
          {damDescription && (
            <section style={{
              marginTop: "3rem",
              padding: "2rem",
              backgroundColor: THEME.white,
              borderRadius: "14px",
              boxShadow: THEME.shadow
            }}>
              <h2 style={{ color: THEME.primary }}>
                За язовир „{decodedName}“
              </h2>
              <p style={{ whiteSpace: "pre-line" }}>{damDescription}</p>
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
    <div style={{ color: THEME.textGray }}>{label}</div>
    <div style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
      {value.toLocaleString()} {unit}
    </div>
  </div>
);

const ChartLayout = ({ children, data }) => (
  <div style={{ width: "100%", height: 450 }}>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {children}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

/* ---------- styles ---------- */

const periodNav = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "8px 16px",
  backgroundColor: THEME.white,
  borderRadius: "12px",
  border: "1px solid #e2e8f0"
};

const periodBtn = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const navBackBtn = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer"
};

export default Info;