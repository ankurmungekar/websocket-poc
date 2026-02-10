import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Custom car icon using an inline SVG data URI
const carIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48">
  <g transform="translate(32,32)">
    <circle cx="0" cy="0" r="28" fill="#1a73e8" stroke="#fff" stroke-width="3"/>
    <path d="M-10 8 L0 -16 L10 8 Z" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="4" fill="#1a73e8"/>
  </g>
</svg>
`;

const carIcon = L.divIcon({
  html: `<div class="car-icon-wrapper">${carIconSvg}</div>`,
  className: 'car-marker-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

// Component to smoothly pan map to follow the car
function MapFollower({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true, duration: 1 });
    }
  }, [map, position]);

  return null;
}

export default function CarMap({ carData }) {
  const position = [carData.latitude, carData.longitude];

  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFollower position={position} />
      <Marker position={position} icon={carIcon}>
        <Popup>
          <strong>{carData.car_id}</strong>
          <br />
          Status: {carData.status}
          <br />
          Speed: {carData.speed_kmh} km/h
        </Popup>
      </Marker>
    </MapContainer>
  );
}

