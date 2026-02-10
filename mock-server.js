import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const STATUSES = ['moving', 'moving', 'moving', 'idle', 'stopped'];
let lat = 19.0760;
let lng = 72.8777;

wss.on('connection', (ws) => {
  console.log('Client connected');

  const sendUpdate = () => {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const isMoving = status === 'moving';

    if (isMoving) {
      lat += (Math.random() - 0.5) * 0.006;
      lng += (Math.random() - 0.5) * 0.006;
    }

    const data = {
      car_id: 'CAR-001',
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      speed_kmh: isMoving ? Math.round(Math.random() * 100 + 20) : 0,
      status,
      heading: Math.round(Math.random() * 360),
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(data));
    console.log(`Sent: ${data.status} @ ${data.latitude}, ${data.longitude} | ${data.speed_kmh} km/h`);

    // Schedule next update in random 1-10 seconds
    const delay = Math.floor(Math.random() * 9000 + 1000);
    ws.timer = setTimeout(sendUpdate, delay);
  };

  sendUpdate();

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.timer) clearTimeout(ws.timer);
  });
});

console.log('WebSocket mock server running on ws://localhost:8080');

