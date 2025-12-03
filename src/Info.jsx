import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import Header from "./Header";

const Info = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterType, setFilterType] = useState("10");
  const [activeChart, setActiveChart] = useState("volume");

  const cleanDate = (isoString) => isoString.split("T")[0];

  useEffect(() => {
    fetch(`http://localhost:5000/api/dam/${decodedName}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(row => ({
          ...row,
          date: cleanDate(row.date),
        }));

        setData(formatted);
        filterData("10", formatted);
      })
      .catch(err => console.error('Error fetching data:', err));
  }, [decodedName]);

  // ✅ Wikipedia click handler with Google fallback
  const handleLinkClick = async (e) => {
    e.preventDefault();

    const searchTitle = `язовир_${decodedName}`;
    const wikiApi = `https://bg.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      searchTitle
    )}&format=json&origin=*`;

    const googleUrl = `https://www.google.com/search?q=язовир+${encodeURIComponent(decodedName)}`;

    try {
      const res = await fetch(wikiApi);
      const data = await res.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId !== "-1") {
        // Wikipedia page exists
        const wikiUrl = `https://bg.wikipedia.org/wiki/${searchTitle}`;
        window.open(wikiUrl, "_blank");
      } else {
        // Page does not exist → fallback to Google search
        window.open(googleUrl, "_blank");
      }
    } catch (err) {
      window.open(googleUrl, "_blank");
    }
  };

  const filterData = (type, fullData = data) => {
    let filtered = [];

    if (type === "10") {
      filtered = fullData.filter((_, i) => i % 10 === 0);
    } else if (type === "month") {
      let lastMonth = null;
      filtered = fullData.filter(row => {
        const current = new Date(row.date).getMonth();
        if (current !== lastMonth) {
          lastMonth = current;
          return true;
        }
        return false;
      });
    } else if (type === "year") {
      let lastYear = null;
      filtered = fullData.filter(row => {
        const current = new Date(row.date).getFullYear();
        if (current !== lastYear) {
          lastYear = current;
          return true;
        }
        return false;
      });
    }

    setFilteredData(filtered);
    setFilterType(type);
  };

  const constantsAvailable = data.length > 0;

  return (
    <>
      <Header />

      <div style={{ padding: "2rem" }}>
        {/* Clickable title */}
        <h1>
          <span
            onClick={handleLinkClick}
            style={{
              color: "hsla(213, 40%, 22%, 1.00)",
              textDecoration: "none",
              cursor: "pointer"
            }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
          >
            яз.{decodedName} 🔗
          </span>
        </h1>

        {/* Constant Volume Info */}
        {constantsAvailable && (
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{
              padding: "12px 24px",
              background:  "hsla(213, 40%, 22%, 1.00)",
              color: "white",
              borderRadius: "10px",
              fontWeight: "bold"
            }}>
              Total Volume: {data[0].Общ_обем} m³
            </div>

            <div style={{
              padding: "12px 24px",
              background: "#dc1d1dff",
              color: "white",
              borderRadius: "10px",
              fontWeight: "bold"
            }}>
              Dead Volume: {data[0].Мъртъв_обем} m³
            </div>
          </div>
        )}

        {/* Chart Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Volume", value: "volume" },
            { label: "Percent", value: "percent" },
            { label: "Flow", value: "flow" },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setActiveChart(btn.value)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: activeChart === btn.value ? "hsla(212, 36%, 20%, 1.00)" : "#bbb",
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Time Filter Buttons */}
        <div style={{ marginBottom: "20px" }}>
          {[
            { label: "Every 10 days", value: "10" },
            { label: "Every month", value: "month" },
            { label: "Every year", value: "year" },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => filterData(btn.value)}
              style={{
                marginRight: "10px",
                padding: "10px 20px",
                borderRadius: "8px",
                background: filterType === btn.value ? "hsla(213, 40%, 22%, 1.00)" : "#ccc",
                color: filterType === btn.value ? "white" : "black",
                border: "none",
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Active Chart */}
        {activeChart === "volume" && (
          <ChartContainer data={filteredData}>
            <Line yAxisId="left" type="monotone" dataKey="Наличен" stroke="#4caf50" name="Available Volume" />
            <Line yAxisId="left" type="monotone" dataKey="Разполагаем" stroke="#f44336" name="Usable Volume" />
          </ChartContainer>
        )}

        {activeChart === "percent" && (
          <ChartContainer data={filteredData} rightAxis>
            <Line yAxisId="right" type="monotone" dataKey="Наличен_процент" stroke="#ff9800" name="Available %" />
            <Line yAxisId="right" type="monotone" dataKey="Разполагаем_процент" stroke="#00bcd4" name="Usable %" />
          </ChartContainer>
        )}

        {activeChart === "flow" && (
          <ChartContainer data={filteredData}>
            <Line yAxisId="left" type="monotone" dataKey="Приток" stroke="#8bc34a" name="Inflow" />
            <Line yAxisId="left" type="monotone" dataKey="Разход" stroke="#e91e63" name="Outflow" />
          </ChartContainer>
        )}

        <Link
          to="/Map"
          style={{
            display: "inline-block",
            marginTop: "20px",
            textDecoration: "none",
            backgroundColor: "hsla(213, 40%, 22%, 1.00)" ,
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px"
          }}
        >
          ⬅️ Back to map
        </Link>
      </div>
    </>
  );
};

// Reusable Chart Component
const ChartContainer = ({ children, data, rightAxis }) => (
  <div style={{ width: "100%", height: 350, marginBottom: "40px" }}>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => value} 
        />
        {!rightAxis && (
          <YAxis yAxisId="left" label={{ value: "m³", angle: -90, position: "insideLeft" }} />
        )}
        {rightAxis && (
          <YAxis yAxisId="right" orientation="right" label={{ value: "%", angle: 90, position: "insideRight" }} />
        )}
        <Tooltip labelFormatter={(value) => value} />
        <Legend />
        {children}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default Info;