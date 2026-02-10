import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = process.env.PORT || 8080;

// ===== TESTING FLAG: set to true to simulate car movement, false for real data =====
const SIMULATE_MOVEMENT = true;

const API_URL =
  'https://cosmicagps.com/tracking/api/location/acecfdb5d01220ff343a646f4314b751/353742376437570/json';

// Track cumulative offset for simulated movement
let latOffset = 0;
let lngOffset = 0;
let pollCount = 0;

// Fetch vehicle data from CosmicaGPS API
async function fetchVehicleData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.error('Unexpected API response:', data);
      return null;
    }

    const vehicle = data[0];

    // If testing, manipulate data to simulate driving
    if (SIMULATE_MOVEMENT) {
      pollCount++;
      latOffset += (Math.random() - 0.5) * 0.006;
      lngOffset += (Math.random() - 0.5) * 0.006;

      return {
        car_id: vehicle.vehicleName || vehicle.imei,
        imei: vehicle.imei,
        latitude: parseFloat((vehicle.lat + latOffset).toFixed(6)),
        longitude: parseFloat((vehicle.lng + lngOffset).toFixed(6)),
        speed_kmh: Math.round(Math.random() * 100 + 20),
        status: 'moving',
        heading: Math.round(Math.random() * 360),
        altitude: vehicle.altitude,
        odometer: parseFloat((vehicle.odometer + pollCount * 0.3).toFixed(2)),
        todays_distance: parseFloat((vehicle.todays_distance + pollCount * 0.3).toFixed(2)),
        device_type: vehicle.deviceType,
        acc_status: 1,
        agetime: 'just now',
        datetime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        timestamp: new Date().toISOString(),
      };
    }

    // Real data — no manipulation
    let status = 'stopped';
    if (vehicle.speed > 0) {
      status = 'moving';
    } else if (vehicle.acc_status === 1) {
      status = 'idle';
    }

    return {
      car_id: vehicle.vehicleName || vehicle.imei,
      imei: vehicle.imei,
      latitude: vehicle.lat,
      longitude: vehicle.lng,
      speed_kmh: vehicle.speed,
      status,
      heading: vehicle.heading,
      altitude: vehicle.altitude,
      odometer: vehicle.odometer,
      todays_distance: vehicle.todays_distance,
      device_type: vehicle.deviceType,
      acc_status: vehicle.acc_status,
      agetime: vehicle.agetime,
      datetime: vehicle.datetime,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to fetch from API:', err.message);
    return null;
  }
}

// Create HTTP server (required by Render for health checks)
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  const sendUpdate = async () => {
    const data = await fetchVehicleData();

    if (data && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
      console.log(
        `Sent: ${data.status} @ ${data.latitude}, ${data.longitude} | ${data.speed_kmh} km/h | ${data.agetime}`
      );
    }

    // Poll every 5 seconds
    ws.timer = setTimeout(sendUpdate, 5000);
  };

  sendUpdate();

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.timer) clearTimeout(ws.timer);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Fetching live data from: ${API_URL}`);
});
