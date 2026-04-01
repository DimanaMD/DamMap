import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {reservoirs, center, maxBoundsC} from './assets/Javascript/res.js'
import { Link } from 'react-router-dom';

const createSvgIcon = (color1, color2) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
  <defs>
    <linearGradient id="gradient-${color1.replace('#','')}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
  </filter>
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="url(#gradient-${color1.replace('#','')})" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"/>
  <path d="M12 6.5C10.8 8.2 9.5 9.2 9.5 10.5C9.5 11.9 10.6 13 12 13C13.4 13 14.5 11.9 14.5 10.5C14.5 9.2 13.2 8.2 12 6.5Z" fill="#ffffff"/>
</svg>
`.trim();

const createLeafletIcon = (svgString) => new L.Icon({
  iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
  iconSize: [40, 40],
  iconAnchor: [20, 37],
  popupAnchor: [0, -37]
});

const blueIcon = createLeafletIcon(createSvgIcon('#38bdf8', '#0284c7'));
const redIcon = createLeafletIcon(createSvgIcon('#f87171', '#dc2626'));
const greenIcon = createLeafletIcon(createSvgIcon('#4ade80', '#16a34a'));

function getReservoirIcon(purpose) {
  if (!purpose) return blueIcon;
  const p = purpose.toLowerCase();
  if (p.includes("енергетика") || p.includes("енергегтика")) return redIcon;
  if (p.includes("стопанство") || p.includes("напояване")) return greenIcon;
  return blueIcon;
}

const MapView = () => {
    
  return (
    <>
      <div style={{
        position: "fixed",
        top: "100px",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(4px)",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        fontFamily: "sans-serif",
        minWidth: "200px",
        border: "1px solid #e2e8f0"
        
      }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>Предназначение</h3>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "linear-gradient(to bottom, #38bdf8, #0284c7)", marginRight: "10px", boxShadow: "0 0 0 1px rgba(56, 189, 248, 0.3)" }}></div>
          <span style={{ fontSize: "13px", color: "#334155" }}>Питейно-битово</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "linear-gradient(to bottom, #f87171, #dc2626)", marginRight: "10px", boxShadow: "0 0 0 1px rgba(248, 113, 113, 0.3)" }}></div>
          <span style={{ fontSize: "13px", color: "#334155" }}>Енергетика</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "linear-gradient(to bottom, #4ade80, #16a34a)", marginRight: "10px", boxShadow: "0 0 0 1px rgba(74, 222, 128, 0.3)" }}></div>
          <span style={{ fontSize: "13px", color: "#334155" }}>Напояване</span>
        </div>
      </div>
      <MapContainer 
      center={center} 
      zoom={8}
      maxZoom={17}
      minZoom={8}
      scrollWheelZoom={true} 
      style={{ height: "100vh", width: "100%" }}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reservoirs.map((re, i) => (
        <Marker key={i} position={re.position} icon={getReservoirIcon(re["Предназначение"])}>
          <Popup>
            <div style={{ minWidth: "200px", fontFamily: "sans-serif" }}>
              <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px" }}>
                {re["Име"]}
              </h3>
              <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                <div><strong style={{ color: "#64748b" }}>Област:</strong> {re["Област"]}</div>
                <div><strong style={{ color: "#64748b" }}>Община:</strong> {re["Община местоположение"]}</div>
                <div><strong style={{ color: "#64748b" }}>Басейнов район:</strong> {re["Басейнов район"]}</div>
              </div>
              <div style={{ marginTop: "12px", textAlign: "right" }}>
                <Link 
                  to={`/info/${encodeURIComponent(re["Име"])}`}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#0ea5e9",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontWeight: "600",
                    transition: "background-color 0.2s",
                    boxShadow: "0 2px 4px rgba(14, 165, 233, 0.3)"
                  }}
                >
                  Виж повече
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      </MapContainer>
    </>
    
  );
};

export default MapView;
