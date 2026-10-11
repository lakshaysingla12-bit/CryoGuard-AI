import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LiveProvider } from "./context/LiveContext";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Monitoring from "./pages/Monitoring.jsx";
import Shipments from "./pages/Shipments.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import Alerts from "./pages/Alerts.jsx";
import AiPredictions from "./pages/AiPredictions.jsx";
import Reports from "./pages/Reports.jsx";
import Users from "./pages/Users.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-screen text-secondary">Loading...</div>;
  }

  // not logged in: only the login page is available
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <LiveProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/ai" element={<AiPredictions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LiveProvider>
  );
}

export default App;
