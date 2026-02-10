const statusColors = {
  moving: '#34a853',
  idle: '#fbbc04',
  stopped: '#ea4335',
};

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function headingToDirection(heading) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
}

export default function CarStatus({ carData, isConnected }) {
  return (
    <div className="car-status-panel">
      <div className="status-header">
        <h2>Vehicle Tracker</h2>
        <span className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'LIVE' : 'CONNECTING...'}
        </span>
      </div>

      <div className="status-body">
        <div className="status-row">
          <span className="status-label">Car ID</span>
          <span className="status-value">{carData.car_id}</span>
        </div>

        <div className="status-row">
          <span className="status-label">Status</span>
          <span className="status-value">
            <span
              className="status-dot"
              style={{ backgroundColor: statusColors[carData.status] || '#999' }}
            />
            {carData.status.charAt(0).toUpperCase() + carData.status.slice(1)}
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">Speed</span>
          <span className="status-value">{carData.speed_kmh} km/h</span>
        </div>

        <div className="status-row">
          <span className="status-label">Heading</span>
          <span className="status-value">
            {carData.heading}° {headingToDirection(carData.heading)}
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">Latitude</span>
          <span className="status-value">{carData.latitude}</span>
        </div>

        <div className="status-row">
          <span className="status-label">Longitude</span>
          <span className="status-value">{carData.longitude}</span>
        </div>

        <div className="status-row">
          <span className="status-label">Last Update</span>
          <span className="status-value">{formatTime(carData.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

