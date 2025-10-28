import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {reservoirs, center, maxBoundsCn, redIcon} from './res'

const MapView = () => {
    
  return (
    <MapContainer 
      center={center} 
      zoom={7}
      maxZoom={17}
      minZoom={8}
      maxBounds={maxBoundsCn}
      scrollWheelZoom={true} 
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Object.entries(reservoirs).map(([name, position]) => (
        <Marker key={name} position={position} >
          <Popup>
            {name}
          </Popup>
        </Marker>
      ))}
      
    </MapContainer>
  );
};

export default MapView;
