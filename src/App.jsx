import CarMap from './components/CarMap';
import CarStatus from './components/CarStatus';
import { useCarData } from './hooks/useCarData';
import './App.css';

function App() {
  const { carData, isConnected } = useCarData();

  return (
    <div className="app-container">
      <div className="raw-data-bar">
        <span className="raw-data-label">SERVER DATA</span>
        <code className="raw-data-json">{JSON.stringify(carData)}</code>
      </div>
      <div className="map-wrapper">
        <CarMap carData={carData} />
        <CarStatus carData={carData} isConnected={isConnected} />
      </div>
    </div>
  );
}

export default App;
