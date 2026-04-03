import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { CityMetric } from '../types';
import L from 'leaflet';

// Исправляем дефолтные иконки Leaflet
const createIcon = (status: string) => {
  const color = status === 'danger' ? 'red' : status === 'warning' ? 'orange' : 'green';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export function CityMap({ metrics }: { metrics: CityMetric[] }) {
  const ALMATY_CENTER: [number, number] = [43.2389, 76.8897];

  return (
    <MapContainer center={ALMATY_CENTER} zoom={12} className="h-full w-full rounded-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {metrics.map((m) => (
        <Marker 
          key={m.id} 
          position={[m.lat, m.lng]} 
          icon={createIcon(m.status)}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold border-b mb-1">{m.title}</h3>
              <p className="text-lg">{m.value} {m.unit}</p>
              <p className={`text-xs font-bold ${m.status === 'danger' ? 'text-red-500' : 'text-green-600'}`}>
                Статус: {m.status.toUpperCase()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}