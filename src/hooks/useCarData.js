import { useState, useEffect, useRef } from 'react';

// ===== FLAG: set to true for local dev, false for deployed (Netlify + Railway) =====
const USE_LOCAL_SERVER = false;

const WS_URL = USE_LOCAL_SERVER
  ? 'ws://localhost:8080'
  : 'wss://websocket-poc-production.up.railway.app';

const INITIAL_CAR = {
  car_id: '353742376437570',
  imei: '353742376437570',
  latitude: 18.5425,
  longitude: 73.9396,
  speed_kmh: 0,
  status: 'stopped',
  heading: 155,
  altitude: 567,
  odometer: 0,
  todays_distance: 0,
  device_type: 'Teltonika',
  acc_status: 0,
  agetime: '--',
  datetime: '--',
  timestamp: new Date().toISOString(),
};

export function useCarData() {
  const [carData, setCarData] = useState(INITIAL_CAR);
  const [routeHistory, setRouteHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    function connect() {
      console.log('Connecting to WebSocket...');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setCarData(data);

          // Only add to history if position actually changed
          setRouteHistory((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.lat === data.latitude && last.lng === data.longitude) {
              return prev; // No position change, skip
            }
            return [
              ...prev,
              {
                lat: data.latitude,
                lng: data.longitude,
                timestamp: data.timestamp,
                status: data.status,
              },
            ];
          });
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting in 3s...');
        setIsConnected(false);
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  return { carData, routeHistory, isConnected };
}
