import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Landing from "./components/Landings/Landing";
import IntroGate from "./components/Intro/IntroGate";

export default function App() {
  return (
    <BrowserRouter>
      <IntroGate>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </IntroGate>
    </BrowserRouter>
  );
}
