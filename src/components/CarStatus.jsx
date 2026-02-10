const statusColors = {
  moving: '#34a853',
  idle: '#fbbc04',
  stopped: '#ea4335',
};

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
          <span className="status-label">IMEI</span>
          <span className="status-value">{carData.imei || carData.car_id}</span>
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
          <span className="status-label">Altitude</span>
          <span className="status-value">{carData.altitude ?? '--'} m</span>
        </div>

        <div className="status-row">
          <span className="status-label">Odometer</span>
          <span className="status-value">{carData.odometer ?? '--'} km</span>
        </div>

        <div className="status-row">
          <span className="status-label">Today's Dist</span>
          <span className="status-value">{carData.todays_distance ?? '--'} km</span>
        </div>

        <div className="status-row">
          <span className="status-label">Device</span>
          <span className="status-value">{carData.device_type || '--'}</span>
        </div>

        <div className="status-row">
          <span className="status-label">Ignition</span>
          <span className="status-value">
            <span
              className="status-dot"
              style={{ backgroundColor: carData.acc_status === 1 ? '#34a853' : '#ea4335' }}
            />
            {carData.acc_status === 1 ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">Age</span>
          <span className="status-value">{carData.agetime || '--'}</span>
        </div>

        <div className="status-row">
          <span className="status-label">Last GPS Time</span>
          <span className="status-value">{carData.datetime || '--'}</span>
        </div>

        <div className="status-row last-refreshed">
          <span className="status-label">Last Updated</span>
          <span className="status-value">
            {carData.timestamp
              ? new Date(carData.timestamp).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
