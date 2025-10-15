import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Markers = () => {
    return(<><Marker position={[42.704, 25.300]}>
        <Popup>
           Center <br /> 
        </Popup>
      </Marker>
        
      <Marker position={[43.90810, 22.51475]}>
        <Popup>
            яз. Кула <br/> <a href='https://bg.wikipedia.org/wiki/Кула_(язовир)' target='_blank'>Прочети повече</a>
        </Popup>
      </Marker></>);
}
