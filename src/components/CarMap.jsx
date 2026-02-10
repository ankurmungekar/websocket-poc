import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useState, useEffect, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBKtWFlctPd62aMtTjfc4wNl31xUA6NTBQ';

// Car icon SVG as a data URL
const carIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48">
  <g transform="translate(32,32)">
    <circle cx="0" cy="0" r="28" fill="#1a73e8" stroke="#fff" stroke-width="3"/>
    <path d="M-10 8 L0 -16 L10 8 Z" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="4" fill="#1a73e8"/>
  </g>
</svg>
`)}`;

const statusColors = {
  moving: '#34a853',
  idle: '#fbbc04',
  stopped: '#ea4335',
};

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Draws a polyline along the route history
function RoutePolyline({ routeHistory }) {
  const map = useMap();
  const coreLib = useMapsLibrary('core');
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !coreLib || routeHistory.length < 2) return;

    const path = routeHistory.map((p) => new google.maps.LatLng(p.lat, p.lng));

    if (polylineRef.current) {
      polylineRef.current.setPath(path);
    } else {
      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#1a73e8',
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map,
      });
    }
  }, [map, coreLib, routeHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, []);

  return null;
}

// Pan map to follow the car
function PanToCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo(position);
    }
  }, [map, position]);

  return null;
}

// A single checkpoint dot marker
function Checkpoint({ point, index, isFirst }) {
  const [showInfo, setShowInfo] = useState(false);
  const position = { lat: point.lat, lng: point.lng };
  const color = statusColors[point.status] || '#999';

  return (
    <>
      <AdvancedMarker position={position} onClick={() => setShowInfo(!showInfo)}>
        <div
          style={{
            width: isFirst ? 16 : 12,
            height: isFirst ? 16 : 12,
            borderRadius: '50%',
            backgroundColor: isFirst ? '#1a73e8' : color,
            border: `2px solid #fff`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
        />
      </AdvancedMarker>
      {showInfo && (
        <InfoWindow position={position} onCloseClick={() => setShowInfo(false)}>
          <div style={{ fontFamily: 'system-ui', fontSize: 13 }}>
            <strong>{isFirst ? 'Start' : `Checkpoint #${index}`}</strong><br />
            Status: {point.status}<br />
            Time: {formatTime(point.timestamp)}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function CarMap({ carData, routeHistory }) {
  const [showCarInfo, setShowCarInfo] = useState(false);
  const position = { lat: carData.latitude, lng: carData.longitude };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={position}
        defaultZoom={15}
        mapId="car-tracker-map"
        style={{ height: '100%', width: '100%' }}
        gestureHandling="greedy"
      >
        <PanToCenter position={position} />
        <RoutePolyline routeHistory={routeHistory} />

        {/* Checkpoint markers (skip the last one since the car marker is there) */}
        {routeHistory.slice(0, -1).map((point, idx) => (
          <Checkpoint
            key={idx}
            point={point}
            index={idx}
            isFirst={idx === 0}
          />
        ))}

        {/* Current car position marker */}
        <AdvancedMarker position={position} onClick={() => setShowCarInfo(!showCarInfo)}>
          <img src={carIconUrl} width={48} height={48} alt="car" />
        </AdvancedMarker>

        {showCarInfo && (
          <InfoWindow position={position} onCloseClick={() => setShowCarInfo(false)}>
            <div style={{ fontFamily: 'system-ui', fontSize: 13 }}>
              <strong>{carData.car_id}</strong><br />
              Status: {carData.status}<br />
              Speed: {carData.speed_kmh} km/h
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
