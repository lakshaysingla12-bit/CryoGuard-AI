import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Monitoring from "./pages/Monitoring.jsx";
import Shipments from "./pages/Shipments.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import Alerts from "./pages/Alerts.jsx";
import Inventory from "./pages/Inventory.jsx";
import Reports from "./pages/Reports.jsx";
import Users from "./pages/Users.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import Settings from "./pages/Settings.jsx";
import AiPredictions from "./pages/AiPredictions.jsx";
import WorkerProfile from "./pages/WorkerProfile.jsx";

function App() {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
  } catch {
    session = null;
  }
  if (String(session?.role || "").toLowerCase() !== "manager") {
    session = {
      role: "manager",
      accountId: "cmgr-001",
      user: {
        id: "cmgr-001",
        name: "Arvind Kapoor",
        email: "manager@cryoguard.demo",
        role: "manager",
        companyId: "MCPE-001",
        companyName: "Mumbai Coastal Protein Exports",
        location: "Mumbai",
        sourceName: "Mumbai Frozen Foods Processing Plant",
      },
    };
    try {
      localStorage.setItem("cryoguard_demo_session", JSON.stringify(session));
      localStorage.setItem("cryoguard_token", "demo-token:cmgr-001:company:MCPE-001");
    } catch {
      // ignore
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/ai" element={<AiPredictions />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        <Route path="/workers/:workerId" element={<WorkerProfile />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
