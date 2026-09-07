import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shipments from "./pages/Shipments";
import Sidebar from "./components/Sidebar/Sidebar";
import Worker from "./components/Worker/Worker";
import Monitoring from "./pages/Monitoring";
import Inventory from "./pages/Inventory";
import Alerts from "./pages/Alerts";


function App() {
  return (
    <BrowserRouter>

      <div className="app-layout">

        <Sidebar />

        <main>

          <Routes>

            <Route path="/" element={<Worker />} />

            <Route path="/dashboard" element={<Worker />} />

            <Route
              path="/monitoring"
              element={<Monitoring />}
            />
            <Route
              path="/shipments"
              element={<Shipments />}
            />
            <Route path="/inventory" 
            element={<Inventory />} />
<Route path="/alerts" element={<Alerts />} />
          </Routes>

        </main>

      </div>

    </BrowserRouter>
  );
}

export default App;