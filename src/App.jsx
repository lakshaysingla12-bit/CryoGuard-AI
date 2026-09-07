import './App.css'
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsRow from './components/StatsRow';
import AiPredictioncards from "./components/AiPredictioncards";
import TemperatureChart from "./components/TemperatureChart";
import RecentAlerts from "./components/RecentAlerts";
function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />
        <StatsRow />
        <AiPredictioncards />
        <TemperatureChart />
         <RecentAlerts />
      </main>
    </div>
  );
}

export default App;