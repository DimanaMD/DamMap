import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { reservoirs as allReservoirs, center } from "./assets/Javascript/res.js";
import { panelStyle } from "./assets/Javascript/infoStyles.js";

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
  <defs>
    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
  </filter>
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="url(#waterGradient)" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"/>
  <path d="M12 6.5C10.8 8.2 9.5 9.2 9.5 10.5C9.5 11.9 10.6 13 12 13C13.4 13 14.5 11.9 14.5 10.5C14.5 9.2 13.2 8.2 12 6.5Z" fill="#ffffff"/>
</svg>
`.trim();

const modernIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgIcon)}`,
  iconSize: [40, 40],
  iconAnchor: [20, 37],
  popupAnchor: [0, -37]
});

const userSvgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
  <defs>
    <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
  </filter>
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="url(#userGradient)" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"/>
  <circle cx="12" cy="9" r="3" fill="#ffffff"/>
</svg>
`.trim();

const userIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(userSvgIcon)}`,
  iconSize: [40, 40],
  iconAnchor: [20, 37],
  popupAnchor: [0, -37]
});

const reservoirs = allReservoirs.filter(r => r["Предназначение"] === "за питейно-битово водоснабдяване");

function distance(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}


const OBLAST_MAP = {
  "sofia": "софия",
  "sofia city": "софия",
  "sofia-grad": "софия",
  "област софия-град": "софия",

  "sofia province": "софийска област",
  "област софийска област": "софийска област",

  "plovdiv": "пловдив",
  "varna": "варна",
  "burgas": "бургас",
  "ruse": "русе",
  "pernik": "перник",
  "pleven": "плевен",
  "vidin": "видин",
  "montana": "монтана",
  "vratsa": "враца",
  "lovech": "ловеч",
  "gabrovo": "габрово",
  "razgrad": "разград",
  "silistra": "силистра",
  "shumen": "шумен",
  "targovishte": "търговище",
  "dobrich": "добрич",
  "sliven": "сливен",
  "yambol": "ямбол",
  "haskovo": "хасково",
  "kardzhali": "кърджали",
  "smolyan": "смолян",
  "blagoevgrad": "благоевград",
  "kyustendil": "кюстендил",
  "pazardzhik": "пазарджик",
  "stara zagora": "стара загора"
};

function normalizeOblast(name) {
  if (!name) return "";
  const key = name.toLowerCase();
  return OBLAST_MAP[key] || key;
}


async function getOblastByAdminLevel(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&addressdetails=1&lat=${lat}&lon=${lng}`
  );
  const data = await res.json();
  return (
    data.address.state ||
    data.address.county ||
    ""
  );
}


async function geocodeAddress(city, district, street) {
  const query = `${street}, ${district}, ${city}, Bulgaria`;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      query
    )}`
  );

  const data = await res.json();
  if (!data.length) return null;

  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);

  const oblastRaw = await getOblastByAdminLevel(lat, lng);

  return {
    lat,
    lng,
    oblast: normalizeOblast(oblastRaw)
  };
}


function expandOblastSearch(oblast) {
  if (oblast === "софия") {
    return ["софия", "софийска област"];
  }
  return [oblast];
}

function findReservoirByOblast(point, oblast) {
  const oblasts = expandOblastSearch(oblast);

  const candidates = reservoirs.filter(r =>
    oblasts.includes(normalizeOblast(r.Област))
  );

  if (!candidates.length) return null;

  return candidates.reduce((nearest, r) => {
    const d = distance(point, {
      lat: r.position[0],
      lng: r.position[1]
    });
    return !nearest || d < nearest.dist
      ? { ...r, dist: d }
      : nearest;
  }, null);
}

function findNearestReservoir(point) {
  return reservoirs.reduce((nearest, r) => {
    const d = distance(point, {
      lat: r.position[0],
      lng: r.position[1]
    });
    return !nearest || d < nearest.dist
      ? { ...r, dist: d }
      : nearest;
  }, null);
}


async function fetchRoute(start, end) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.routes?.length) return null;

    return data.routes[0].geometry.coordinates.map(c => [
      c[1],
      c[0]
    ]);
  } catch (error) {
    return null;
  }
}


const inputStyle = {
  width: "180px",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  backgroundColor: "#f8fafc"
};


export default function Route() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");

  const [point, setPoint] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [cityOblast, setCityOblast] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    const location = await geocodeAddress(city, district, street);

    if (!location) {
      alert("Адресът не беше намерен");
      return;
    }

    const pointPos = { lat: location.lat, lng: location.lng };
    setCityOblast(location.oblast);

    let dam = null;
    const normalizedCity = city.trim().toLowerCase();


    if (normalizedCity === "варна" || normalizedCity === "бургас" || normalizedCity === "varna" || normalizedCity === "burgas") {
      const kamchia = reservoirs.find(r => r.Име === "Камчия");
      if (kamchia) {

        const d = distance(pointPos, {
          lat: kamchia.position[0],
          lng: kamchia.position[1]
        });
        dam = { ...kamchia, dist: d };
      }
    } else if (normalizedCity === "софия" || normalizedCity === "sofia") {
      const iskar = reservoirs.find(r => r.Име === "Искър");
      if (iskar) {
        const d = distance(pointPos, {
          lat: iskar.position[0],
          lng: iskar.position[1]
        });
        dam = { ...iskar, dist: d };
      }
    }

    
    if (!dam) {
      dam = findReservoirByOblast(pointPos, location.oblast) || findNearestReservoir(pointPos);
    }

    setPoint(pointPos);
    setNearest(dam);

    const path = await fetchRoute(pointPos, dam.position);
    setRoutePath(path || [[pointPos.lat, pointPos.lng], dam.position]);
  }

  return (
    <>

      <form
        onSubmit={handleSearch}
        style={{
          position: "absolute",
          top: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          padding: "16px 24px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "auto",
          maxWidth: "90%"
        }}
      >
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Град"
          required
          style={inputStyle}
        />
        <input
          value={district}
          onChange={e => setDistrict(e.target.value)}
          placeholder="Квартал"
          style={inputStyle}
        />
        <input
          value={street}
          onChange={e => setStreet(e.target.value)}
          placeholder="Улица и номер"
          required
          style={inputStyle}
        />
        <button
          style={{
            padding: "10px 20px",
            borderRadius: "50px",
            border: "none",
            background: "#0ea5e9",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.3)"
          }}
        >
          Search
        </button>
      </form>


      <MapContainer
        center={center}
        zoom={8}
        minZoom={8}
        maxZoom={17}
        scrollWheelZoom={true}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reservoirs.map(r => (
          <Marker key={r.Име} position={r.position} icon={modernIcon}>
            <Popup>
              <div style={{ minWidth: "200px", fontFamily: "sans-serif" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px" }}>
                  {r.Име}
                </h3>
                <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  <div><strong style={{ color: "#64748b" }}>Област:</strong> {r.Област}</div>
                </div>
                <div style={{ marginTop: "12px", textAlign: "right" }}>
                  <Link 
                    to={`/info/${encodeURIComponent(r["Име"])}`}
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

        {point && (
          <Marker position={[point.lat, point.lng]} icon={userIcon}>
            <Popup>
              <div style={{ minWidth: "180px", fontFamily: "sans-serif" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#b91c1c", fontSize: "15px", borderBottom: "2px solid #fee2e2", paddingBottom: "6px" }}>
                  Вашата локация
                </h3>
                <div style={{ fontSize: "13px", color: "#334155" }}>
                  <strong>Област:</strong> {cityOblast || "Неизвестна"}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="blue"
            weight={4}
          />
        )}
      </MapContainer>

      {/* Info panel */}
      {nearest && (
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "20px",
            zIndex: 1000,
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            maxWidth: "300px",
            fontFamily: "sans-serif"
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#0f172a", fontSize: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
            Най-близък язовир
          </h3>
          <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
            <div style={{ fontWeight: "bold", color: "#0ea5e9", fontSize: "1.1em" }}>{nearest.Име}</div>
            <div><span style={{ color: "#64748b" }}>Област:</span> {nearest.Област}</div>
            <div style={{ marginTop: "4px" }}><span style={{ color: "#64748b" }}>Разстояние:</span> <strong>{nearest.dist.toFixed(1)} km</strong></div>
          </div>
        </div>
      )}
    </>
  );
}
