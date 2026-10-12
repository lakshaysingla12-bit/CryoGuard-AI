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
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
