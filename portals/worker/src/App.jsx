import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import Shipments from "./pages/Shipments";
import Sidebar from "./components/Sidebar/Sidebar";
import Worker from "./components/Worker/Worker";
import Monitoring from "./pages/Monitoring";
import Inventory from "./pages/Inventory";
import { SettingsProvider } from "./context/SettingsContext";
import Alerts from "./pages/Alerts";
//import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import { WorkerProvider } from "./context/WorkerContext";
import { useState } from "react";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
  } catch {
    session = null;
  }
  if (String(session?.role || "").toLowerCase() !== "worker") {
    session = {
      role: "worker",
      accountId: "wrk-001",
      user: {
        id: "wrk-001",
        name: "Priya Singh",
        email: "worker@cryoguard.demo",
        phone: "+91 98765 10000",
        role: "worker",
        companyId: "MCPE-001",
        companyName: "Mumbai Coastal Protein Exports",
        companyManagerId: "cmgr-001",
        companyManagerName: "Arvind Kapoor",
        sourceName: "Mumbai Frozen Foods Processing Plant",
        location: "Mumbai",
        vehicleId: "TRK-01",
        assignedShipmentId: "SHP-1021",
      },
    };
    try {
      localStorage.setItem("cryoguard_demo_session", JSON.stringify(session));
      localStorage.setItem("cryoguard_token", "demo-token:wrk-001:company:MCPE-001");
    } catch {
      // ignore
    }
  }

  return (
    <SettingsProvider>
      <WorkerProvider>
        <HashRouter>
          <div className={`app-layout${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
            />

            <main>
              <Routes>
                <Route path="/" element={<Worker />} />
                <Route path="/dashboard" element={<Worker />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="/shipments" element={<Shipments />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/alerts" element={<Alerts />} />
                {/* <Route path="/reports" element={<Reports />} /> */}
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </WorkerProvider>
    </SettingsProvider>
  );
}

export default App;
