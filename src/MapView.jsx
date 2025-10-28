import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {reservoirs, center, maxBoundsC, redIcon} from './res'

const MapView = () => {
    
  return (
    <MapContainer 
      center={center} 
      zoom={7}
      maxZoom={17}
      minZoom={8}
      maxBounds={maxBoundsC}
      scrollWheelZoom={true} 
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reservoirs.map((re, i) => (
        <Marker key={i} position={re.position} >
          <Popup>
            <strong>{re["Име"]}</strong><br />
            Област: {re["Област"]}<br />
            Община: {re["Община местоположение"]}<br />
            Басейнов район: {re["Басейнов район"]}
          </Popup>
        </Marker>
      ))}
      
    </MapContainer>
  );
};

export default MapView;
