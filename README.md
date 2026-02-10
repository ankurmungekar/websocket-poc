# WebSocket Car Tracker POC

A real-time car tracking proof-of-concept that displays a car moving on a map using WebSocket for live data updates — no page refresh needed.

**Tech Stack:** React + Vite, Google Maps, WebSocket, Node.js mock server

## Prerequisites

- Node.js v20+ installed
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the mock WebSocket server

Open a terminal and run:

```bash
node mock-server.js
```

You should see:

```
WebSocket mock server running on ws://localhost:8080
```

This server pushes mock car telemetry data (location, speed, status, heading) every 1–10 seconds over WebSocket.

### 3. Start the React dev server

Open a second terminal and run:

```bash
npm run dev
```

### 4. Open in browser

Navigate to [http://localhost:5173](http://localhost:5173)

You will see:
- A raw data bar at the top showing live JSON from the WebSocket server
- A Google Map centered on Mumbai with a car marker that moves in real time
- A status panel (top-right) showing car telemetry details

## Project Structure

```
websocket-poc/
├── mock-server.js                # Node.js WebSocket mock server
├── src/
│   ├── App.jsx                   # Main app layout
│   ├── App.css                   # All styling
│   ├── index.css                 # Global CSS reset
│   ├── main.jsx                  # React entry point
│   ├── components/
│   │   ├── CarMap.jsx            # Leaflet map with car marker
│   │   └── CarStatus.jsx         # Status overlay panel
│   └── hooks/
│       └── useCarData.js         # WebSocket connection hook
├── index.html
├── package.json
└── vite.config.js
```

## Switching to a Python Backend

The frontend connects to a WebSocket server via a single URL defined in `src/hooks/useCarData.js`:

```javascript
const WS_URL = 'ws://localhost:8080';
```

To switch from the mock Node.js server to a Python backend:

### 1. Create a Python WebSocket server

Using **FastAPI** (recommended):

```bash
pip install fastapi uvicorn websockets
```

```python
# server.py
import asyncio
import json
import random
from datetime import datetime
from fastapi import FastAPI, WebSocket

app = FastAPI()

lat, lng = 19.0760, 72.8777

@app.websocket("/ws/car-status")
async def car_status(websocket: WebSocket):
    global lat, lng
    await websocket.accept()
    try:
        while True:
            status = random.choice(["moving", "moving", "moving", "idle", "stopped"])
            is_moving = status == "moving"
            if is_moving:
                lat += (random.random() - 0.5) * 0.006
                lng += (random.random() - 0.5) * 0.006

            data = {
                "car_id": "CAR-001",
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "speed_kmh": random.randint(20, 120) if is_moving else 0,
                "status": status,
                "heading": random.randint(0, 360),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            await websocket.send_json(data)
            await asyncio.sleep(random.uniform(1, 10))
    except Exception:
        pass
```

Run it:

```bash
uvicorn server:app --reload --port 8080
```

### 2. Update the frontend URL

In `src/hooks/useCarData.js`, change:

```javascript
const WS_URL = 'ws://localhost:8080/ws/car-status';
```

That's it — no other frontend changes needed. The hook expects the same JSON shape from any WebSocket server.

### JSON Data Shape (expected by frontend)

```json
{
  "car_id": "CAR-001",
  "latitude": 19.076,
  "longitude": 72.8777,
  "speed_kmh": 45,
  "status": "moving",
  "heading": 120,
  "timestamp": "2026-02-10T12:00:00Z"
}
```

As long as your Python backend sends this JSON structure over WebSocket, the frontend will work without modifications.
