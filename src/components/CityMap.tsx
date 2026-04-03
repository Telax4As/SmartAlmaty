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
    <div className="h-full w-full relative z-0"> {/* Обертка для изоляции z-index */}
      <style>
        {`
          /* Это исправит проблему перекрытия хедера */
          .leaflet-container {
            z-index: 1 !important;
          }
          .leaflet-pane {
            z-index: 1 !important;
          }
          .leaflet-top, .leaflet-bottom {
            z-index: 2 !important;
          }
        `}
      </style>
      <MapContainer 
        center={ALMATY_CENTER} 
        zoom={12} 
        className="h-full w-full rounded-xl"
        scrollWheelZoom={false} // Чтобы страница не "залипала" при скролле
      >
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
            <Popup className="custom-popup">
              <div className="p-2 min-w-[150px]">
                <h3 className="font-bold text-slate-800 border-b pb-1 mb-2">{m.title}</h3>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xl font-black text-indigo-600">{m.value}</span>
                  <span className="text-xs text-slate-500">{m.unit}</span>
                </div>
                <div className={`mt-2 py-1 px-2 rounded text-[10px] font-bold text-center inline-block
                  ${m.status === 'danger' ? 'bg-red-100 text-red-600' : 
                    m.status === 'warning' ? 'bg-orange-100 text-orange-600' : 
                    'bg-emerald-100 text-emerald-600'}`}
                >
                  {m.status.toUpperCase()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}