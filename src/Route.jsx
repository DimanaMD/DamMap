import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { reservoirs2 } from './assets/Javascript/res.js';
import { panelStyle } from "./assets/Javascript/infoStyles.js";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function distance(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) *
      Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function findNearest(point) {
  return reservoirs2.reduce((nearest, r) => {
    const d = distance(
      point,
      { lat: r.position[0], lng: r.position[1] }
    );
    return !nearest || d < nearest.dist
      ? { ...r, dist: d }
      : nearest;
  }, null);
}

async function geocode(address) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await res.json();
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

async function fetchRoute(start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end[1]},${end[0]}?overview=full&geometries=geojson`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    }
    return null;
  } catch (error) {
    console.error("Routing error:", error);
    return null;
  }
}

export default function Route() {
  const [address, setAddress] = useState("");
  const [point, setPoint] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [routePath, setRoutePath] = useState([]); 

  async function handleSearch(e) {
    e.preventDefault();
    const location = await geocode(address);
    if (!location) return alert("Address not found");

    const dam = findNearest(location);
    setPoint(location);
    setNearest(dam);

    const path = await fetchRoute(location, dam.position);
    if (path) {
      setRoutePath(path);
    } else {
      setRoutePath([[location.lat, location.lng], dam.position]);
    }
  }

  return (
    <>
      <form
  onSubmit={handleSearch}
  style={{
    ...panelStyle,
    top: 103,         
    left: 680,
    display: "flex",
    gap: "8px",
    alignItems: "center"
  }}
>
  <input
    value={address}
    onChange={e => setAddress(e.target.value)}
    placeholder="Search address…"
    style={{
      width: "240px",
      padding: "8px 10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px"
    }}
  />
  <button
    style={{
      padding: "8px 14px",
      borderRadius: "6px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      fontSize: "14px",
      cursor: "pointer"
    }}
  >
    Search
  </button>
</form>

      <MapContainer
  center={[42.7, 25.3]}
  zoom={8}
  style={{
    height: "100vh",
    width: "100%",
    zIndex: 1
  }}
>
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reservoirs2.map(r => (
          <Marker key={r.Име} position={r.position}>
            <Popup>
              <strong>{r.Име}</strong><br />
              Област: {r.Област}<br />
              Басейнов район: {r["Басейнов район"]}
            </Popup>
          </Marker>
        ))}

        {point && (
          <Marker position={[point.lat, point.lng]}>
            <Popup>Entered address</Popup>
          </Marker>
        )}

        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>

     {nearest && (
  <div
    style={{
      ...panelStyle,
      bottom: 30,
      left: 20,
      maxWidth: "260px",
      lineHeight: 1.4
    }}
  >
    <div style={{ fontWeight: 600, marginBottom: "6px" }}>
      Reservoir
    </div>

    <div style={{ fontSize: "14px" }}>
      <strong>{nearest.Име}</strong><br />
      Distance: {nearest.dist.toFixed(1)} km
    </div>
  </div>
)}

    </>
  );
}