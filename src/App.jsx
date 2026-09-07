import './App.css'
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsRow from "./components/StatsRow";
import AiPredictioncards from "./components/AiPredictioncards";
import TemperatureChart from "./components/TemperatureChart";
import RecentAlerts from "./components/RecentAlerts";
import LiveFleetMap from "./components/LiveFleetMap";
import Shipments from "./components/Shipments";
import ActiveShipments from "./components/ActiveShipments";
import VehicleDetailsPanel from "./components/VehicleDetailsPanel";

function App() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <Header />

        <div className="dashboard-grid">

          <div className="stats-section">
            <StatsRow />
          </div>

          <div className="map-section">
            <LiveFleetMap />
          </div>

          <div className="alerts-section">
            <RecentAlerts />
          </div>

          <div className="chart-section">
            <TemperatureChart />
          </div>

          <div className="prediction-section">
            <AiPredictioncards />
          </div>

          <div className="shipment-section">
            <Shipments />
          </div>
          <div className="shipments-section">
  <ActiveShipments />
</div>
<div className="vehicle-section">
  <VehicleDetailsPanel />
</div>
        </div>

      </main>

    </div>
  );
}

export default App;