import { powerPlants, center } from "./assets/Javascript/res.js";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Copied from MapView.jsx to create custom icons
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
  <path d="M4 15 V8 L10 5 V2 H14 V5 L20 8 V15 L12 22 L4 15 Z" fill="url(#gradient-${color1.replace('#','')})" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"/>
  <path d="M12.5 6 L8.5 11 H12 L11.5 15 L15.5 10 H12 L12.5 6 Z" fill="#ffffff"/>
</svg>
`.trim();

const createLeafletIcon = (svgString) => new L.Icon({
  iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
  iconSize: [40, 40],
  iconAnchor: [20, 37],
  popupAnchor: [0, -37]
});

// Using the red icon for power plants, as it's used for "energetics" in MapView
const powerPlantIcon = createLeafletIcon(createSvgIcon('#f87171', '#dc2626'));

const Stations = () =>{
    return(
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
           {powerPlants.map((plant) => (
    <Marker 
        // 1. Use the correct key from your data (plant.name)
        key={plant.name} 
        // 2. Pass as an array [lat, lng]
        position={[plant.lat, plant.lng]} 
        icon={powerPlantIcon}
    >
        <Popup>
            <div style={{ minWidth: "200px", fontFamily: "sans-serif" }}>
                <h3 style={{ 
                    margin: "0 0 8px 0", 
                    color: "#0f172a", 
                    fontSize: "16px", 
                    borderBottom: "2px solid #e2e8f0", 
                    paddingBottom: "6px" 
                }}>
                    {plant.name}
                </h3>
                <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                    {plant.type && (
                        <div>
                            <strong style={{ color: "#64748b" }}>Тип:</strong> {plant.type}
                        </div>
                    )}
                    {plant.capacity && (
                        <div>
                            <strong style={{ color: "#64748b" }}>Мощност (MW):</strong> {plant.capacity}
                        </div>
                    )}
                </div>
            </div>
        </Popup>
    </Marker>
))}
        </MapContainer>
    );
};
export default Stations;