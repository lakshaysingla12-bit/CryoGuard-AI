import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import HeroFeatures from "./components/Landings/HeroFeatures";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="landing-page">
              <HeroFeatures />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;