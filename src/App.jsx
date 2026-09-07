import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Worker from "./components/Worker/Worker";
import Monitoring from "./pages/Monitoring";

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

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  );
}

export default App;