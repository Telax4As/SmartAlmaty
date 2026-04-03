import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { CityMetric } from '../types';
import L from 'leaflet';

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
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    const container = document.getElementById('leaflet-map-container');
    if (!container) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(container).setView(ALMATY_CENTER, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    metrics.forEach(m => {
      const popupContent = `
        <div class="p-2 min-w-[150px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow">
          <h3 class="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">${m.title}</h3>
          <div class="flex justify-between items-center gap-4">
            <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">${m.value}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">${m.unit}</span>
          </div>
          <div class="mt-2 py-1 px-2 rounded text-[10px] font-bold text-center inline-block
            ${m.status === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 
              m.status === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}">
            ${m.status.toUpperCase()}
          </div>
        </div>
      `;

      const marker = L.marker([m.lat, m.lng], { icon: createIcon(m.status) })
        .bindPopup(popupContent)
        .addTo(map);
      
      markersRef.current.set(m.id, marker);
    });
  }, [metrics]);

  return (
    <div className="h-full w-full relative z-0">
      <style>
        {`
          #leaflet-map-container {
            height: 100%;
            width: 100%;
            border-radius: 0.75rem;
          }
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
      <div id="leaflet-map-container" />
    </div>
  );
}