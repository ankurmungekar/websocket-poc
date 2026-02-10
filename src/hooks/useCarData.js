import { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:8080';

const INITIAL_CAR = {
  car_id: 'CAR-001',
  latitude: 19.0760,
  longitude: 72.8777,
  speed_kmh: 0,
  status: 'idle',
  heading: 0,
  timestamp: new Date().toISOString(),
};

export function useCarData() {
  const [carData, setCarData] = useState(INITIAL_CAR);
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

  return { carData, isConnected };
}
