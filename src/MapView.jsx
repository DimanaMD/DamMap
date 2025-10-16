import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
    const center = [42.304, 25.700];
    const maxBoundsC = [
        [41.2, 22.35],
        [44.3, 28.6]
        ]

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
      <Marker position={[43.90810, 22.51475]}>
        <Popup>
            яз. Кула <br/> <a href='https://bg.wikipedia.org/wiki/Кула_(язовир)' target='_blank'>Прочети повече</a>
        </Popup>
      </Marker>

      <Marker position={[43.10788, 25.12810]}>
        <Popup>
            яз. Александър Стамболийски
        </Popup>
      </Marker>

      <Marker position={[41.9669, 24.1802]}>
        <Popup>
            яз. Батак
        </Popup>
      </Marker>

      <Marker position={[41.82519, 24.12820]}>
        <Popup>
          яз. Беглика
        </Popup>
      </Marker>

      <Marker position={[41.80542, 24.11661]}>
        <Popup>
          яз. Голям Беглик
        </Popup>
      </Marker>

      <Marker position={[42.16251, 23.79944]}>
        <Popup>
          яз. Белмекен
        </Popup>
      </Marker>

       <Marker position={[42.46880, 23.56943]}>
        <Popup>
          яз. Искър
        </Popup>
      </Marker>

      <Marker position={[42.59462, 23.41755]}>
        <Popup>
          яз. Пасарел(Кокаляне)
        </Popup>
      </Marker>
      
       <Marker position={[41.81048, 24.16552]}>
        <Popup>
          яз. Тошков Чарк
        </Popup>
      </Marker>

        <Marker position={[42.156500, 23.869835]}>
        <Popup>
          яз. Чаира
        </Popup>
      </Marker>
    

      <Marker position={[41.75812, 24.17056]}>
        <Popup>
          яз. Широка Поляна
        </Popup>
      </Marker>

      
      <Marker position={[41.93364, 24.43623]}>
        <Popup>
          яз. Въча
        </Popup>
      </Marker>

      <Marker position={[41.70586, 24.07432]}>
        <Popup>
          яз. Доспат
        </Popup>
      </Marker>
      
       <Marker position={[41.64919, 25.95785]}>
        <Popup>
          яз. Ивайловград
        </Popup>
      </Marker>
      
      <Marker position={[42.61577, 25.28288]}>
        <Popup>
          яз. Копринка(Тунджа)
        </Popup>
      </Marker>

      <Marker position={[41.98494, 24.45933]}>
        <Popup>
          яз. Кричим
        </Popup>
      </Marker>

      <Marker position={[41.65098, 25.29121]}>
        <Popup>
          яз. Кърджали
        </Popup>
      </Marker>
      

      <Marker position={[42.14298, 25.90116]}>
        <Popup>
          яз. Розов Кладенец
        </Popup> 
      </Marker>

      <Marker position={[41.63982, 25.59186]}>
        <Popup>
          яз. Студен Кладенец
        </Popup> 
      </Marker>


      <Marker position={[41.82090, 24.43865]}>
        <Popup>
          яз. Цанков Камък
        </Popup> 
      </Marker>


      <Marker position={[42.93406, 25.77246]}>
        <Popup>
          яз. Йовковци
        </Popup> 
      </Marker>

      <Marker position={[43.20652, 23.20445]}>
        <Popup>
          яз. Среченска Бара
        </Popup> 
      </Marker>

      <Marker position={[42.80585, 25.25555]}>
        <Popup>
          яз. Хр. Смирненски
        </Popup> 
      </Marker>


      <Marker position={[42.12848, 23.56730]}>
        <Popup>
          яз. Бели Искър
        </Popup> 
      </Marker>

      <Marker position={[42.35277, 23.08741]}>
        <Popup>
          яз. Дяково
        </Popup> 
      </Marker>

      <Marker position={[42.52981, 23.15050]}>
        <Popup>
          яз. Студена
        </Popup> 
      </Marker>

      
      <Marker position={[42.72701, 26.25039]}>
        <Popup>
          яз. Асеновец
        </Popup> 
      </Marker>

       <Marker position={[41.76368, 25.13260]}>
        <Popup>
          яз. Боровица
        </Popup> 
      </Marker>


      <Marker position={[42.87018, 26.90766]}>
        <Popup>
          яз. Камчия
        </Popup> 
      </Marker>

      <Marker position={[43.05591, 26.76689]}>
        <Popup>
          яз. Тича
        </Popup> 
      </Marker>

      <Marker position={[42.24523, 27.58374]}>
        <Popup>
          яз. Ясна поляна
        </Popup> 
      </Marker>

       <Marker position={[43.40424, 26.66613]}>
        <Popup>
          яз. Бели лом
        </Popup> 
      </Marker>

      <Marker position={[43.33055, 26.58111]}>
        <Popup>
          яз. Съединение
        </Popup> 
      </Marker>

      <Marker position={[43.36999, 24.31666]}>
        <Popup>
          яз. Горен Дъбник
        </Popup> 
      </Marker>


    </MapContainer>
  );
};

export default MapView;
