import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shipments from "./pages/Shipments";
import Sidebar from "./components/Sidebar/Sidebar";
import Worker from "./components/Worker/Worker";
import Monitoring from "./pages/Monitoring";
import Inventory from "./pages/Inventory";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import { WorkerProvider } from "./context/WorkerContext";

function App() {
  return (
    <WorkerProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />

          <main>
            <Routes>
              <Route path="/" element={<Worker />} />
              <Route path="/dashboard" element={<Worker />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WorkerProvider>
  );
}


export default App;