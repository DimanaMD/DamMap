import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import Header from "./Header";
import Footer from "./Footer";
import { styles, THEME } from "./assets/Javascript/infoStyles";
import damsData from "./json/dams_data.json";
import damDescriptions, { reservoirs } from "./assets/Javascript/res";
import {damAreas} from "./assets/Javascript/res.js";



const monthNames = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];


const Info = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(name);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("10");
  const [activeChart, setActiveChart] = useState("обем");
  const [predictionDays, setPredictionDays] = useState(7);
  const [predictionData, setPredictionData] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const damDetails = damsData.find(d => d["Име"] === decodedName);
  const damDescription = damDescriptions[decodedName];
  const damArea = damAreas.find(d => d.Име === decodedName)?.Площ;


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

 const handlePredict = async () => {
    const resInfo = reservoirs.find(r => r["Име"] === decodedName);
    
    if (!resInfo || !resInfo.position) {
        alert("Липсват координати за този язовир!");
        return;
    }

    setIsPredicting(true);
    try {
        const response = await fetch(`http://localhost:5000/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: decodedName, 
                days: predictionDays,
                cords: resInfo.position // Увери се, че това е [lat, lon]
            })
        });

        if (!response.ok) {
            throw new Error(`Сървърна грешка: ${response.status}`);
        }

        const json = await response.json();
        setPredictionData(json);
    } catch (error) {
        console.error("Грешка при прогнозиране:", error);
        alert("Сървърът се забави твърде много или възникна грешка. Проверете конзолата на Python.");
    } finally {
        setIsPredicting(false);
    }
};

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
  const hasData = data.length > 0;
  const deadVol = damDetails?.["Мъртъв обем"] ?? (hasData ? data[0].Мъртъв_обем : 0);
  const totalVol = damDetails?.["Общ обем"] ?? (hasData ? data[0].Общ_обем : 0);
  const predictionGlow = {
    filter: "drop-shadow(0px 0px 6px rgba(239, 68, 68, 0.6))"
  };
  const combinedChartData = [...filteredData, ...predictionData];

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

          {/* STATS */}
          {hasData && (
            <div style={{ display: "flex", gap: isMobile ? "1rem" : "1.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <StatCard label="Общ обем" value={totalVol} color={THEME.primary} isMobile={isMobile} />
              <StatCard label="Мъртъв обем" value={deadVol} color={THEME.danger} isMobile={isMobile} />
              {damArea > 0 && (
                <StatCard label="Водна площ" value={damArea} unit="km²" color={THEME.info} isMobile={isMobile} />
              )} 
            </div>
          )}
          <div style={{ ...styles.controlPanel, flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>

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

            <div style={{ ...styles.buttonGroup, display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
              <select
                value={predictionDays}
                onChange={(e) => setPredictionDays(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "white",
                  color: THEME.textGray,
                  outline: "none",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} дни</option>
                ))}
              </select>
              <button
                onClick={handlePredict}
                disabled={isPredicting}
                style={{
                  ...styles.filterBtn,
                  backgroundColor: isPredicting ? "#94a3b8" : THEME.primary,
                  color: "white",
                  borderColor: isPredicting ? "#94a3b8" : THEME.primary,
                  cursor: isPredicting ? "not-allowed" : "pointer"
                }}
              >
                {isPredicting ? "Зареждане..." : "Прогнозирай"}
              </button>
            </div>

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

        <div style={styles.chartWrapper}>
          {activeChart === "обем" && (
            <ChartLayout
              data={combinedChartData}
              unit="m³"
              isMobile={isMobile}
              yDomain={[0, (dataMax) => Math.round(Math.max(dataMax, totalVol) + dataMax*0.05)]}
            >
              <Line 
                type="monotone" 
                dataKey="Наличен" 
                name="Наличен обем"
                stroke="#cbd5e1" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#cbd5e1" }}
              />
              <Line 
                type="monotone" 
                dataKey="Разполагаем" 
                name="Разполагаем обем"
                stroke="#0ea5e9" 
                strokeWidth={4} 
                dot={false} 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#0ea5e9" }}
              />
             {predictionData.length > 0 && (
                <Line 
                  type="monotone" 
                  dataKey="prediction" 
                  name="Прогноза (Разполагаем обем)"
                  stroke="#ef4444"          // Ярко червено
                  strokeWidth={4}           // Малко по-дебела за акцент
                  strokeDasharray="8 5"     // По-дълги прекъсвания за модерен вид
                  dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }} // Точки само на прогнозата
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#ef4444" }}
                  style={predictionGlow}    // Добавяме сиянието
                  connectNulls={true}       // Свързва историческата линия с прогнозата
                  animationDuration={2000}  // Плавно рисуване
                />
              )}
              <ReferenceLine 
                y={deadVol} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label={{ value: "Мъртъв обем", position: "insideTopRight", fill: "#ef4444", fontSize: 12 }}
              />
              <ReferenceLine
                y={totalVol}
                stroke="#22c55e"
                strokeDasharray="3 3"
                label={{ value: "Общ обем", position: "insideTopRight", fill: "#22c55e", fontSize: 12 }}
              />
            </ChartLayout>
          )}

          {activeChart === "прилив/отлив" && (
            <ChartLayout data={filteredData} unit="m³" isMobile={isMobile}>
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

const StatCard = ({ label, value, color, unit = "m³", isMobile }) => (
  <div style={{
    flex: isMobile ? "1 1 calc(50% - 1rem)" : "1 1 250px",
    padding: isMobile ? "1rem" : "1.5rem",
    background: THEME.white,
    borderRadius: "12px",
    boxShadow: THEME.shadow,
    borderLeft: `6px solid ${color}`
  }}>
    <div style={{ color: THEME.textGray }}>{label}</div>
    <div style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: "bold" }}>
      {value.toLocaleString()} {unit}
    </div>
  </div>
);

const ChartLayout = ({ children, data, yDomain, isMobile }) => (
  <div style={{ width: "100%", height: isMobile ? 300 : 450 }}>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={yDomain} />
        <Tooltip 
  formatter={(value, name, props) => {

    if (name === "Прогноза (Разполагаем обем)" || props.payload.prediction !== undefined) {
      return [Number(value).toFixed(3) + " m³", name];
    }
    
    // За всички останали линии (Наличен обем, Приток и т.н.) 
    // показваме стандартно закръгляне или оригиналната стойност
    return [value.toLocaleString() + " m³", name];
  }} 
  labelStyle={{ color: THEME.primary, fontWeight: "bold" }}
  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
/>
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