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

import { reservoirs2 } from "./assets/Javascript/res.js";
import { panelStyle } from "./assets/Javascript/infoStyles.js";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

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

  const candidates = reservoirs2.filter(r =>
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
  return reservoirs2.reduce((nearest, r) => {
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
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end[1]},${end[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes?.length) return null;

  return data.routes[0].geometry.coordinates.map(c => [
    c[1],
    c[0]
  ]);
}


const inputStyle = {
  width: "160px",
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
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
      const kamchia = reservoirs2.find(r => r.Име === "Камчия");
      if (kamchia) {

        const d = distance(pointPos, {
          lat: kamchia.position[0],
          lng: kamchia.position[1]
        });
        dam = { ...kamchia, dist: d };
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
          ...panelStyle,
          top: 103,
          left: 680,
          display: "flex",
          gap: "6px",
          alignItems: "center"
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
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </form>


      <MapContainer
        center={[42.7, 25.3]}
        zoom={8}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reservoirs2.map(r => (
          <Marker key={r.Име} position={r.position}>
            <Popup>
              <strong>{r.Име}</strong>
              <br />
              Област: {r.Област}
            </Popup>
          </Marker>
        ))}

        {point && (
          <Marker position={[point.lat, point.lng]}>
            <Popup>
              Въведеният адрес
              <br />
              Област: {cityOblast}
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
            ...panelStyle,
            bottom: 30,
            left: 20,
            maxWidth: "260px"
          }}
        >
          <strong>{nearest.Име}</strong>
          <br />
          Област: {nearest.Област}
          <br />
          Разстояние: {nearest.dist.toFixed(1)} km
        </div>
      )}
    </>
  );
}
