import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import HeroFeatures from "./components/Landings/HeroFeatures";
import ReviewsWhyUs from "./components/Landings/ReviewsWhyUs";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="landing-page">
              <HeroFeatures />
              <ReviewsWhyUs />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;