import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Snowflake, Menu, X } from "lucide-react";
import "./App.css";
import HeroFeatures from "./components/Landings/HeroFeatures";
import ReviewsWhyUs from "./components/Landings/ReviewsWhyUs";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import IntroGate from "./components/Intro/IntroGate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faShieldHalved,
  faRoute,
  faStar,
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <BrowserRouter>
      <IntroGate>
        <Routes>
          <Route
            path="/"
            element={
              <div className="lp">
                {/* 1. Background Effects */}
                <div className="lp-bg-glow lp-bg-glow-one"></div>
                <div className="lp-bg-glow lp-bg-glow-two"></div>
                <div className="lp-grid-background"></div>

                {/* 2. Navigation Bar */}
                <header className="lp-nav">
                  <Link to="/" className="lp-logo">
                    <span className="lp-logo-icon">
                      <Snowflake size={19} />
                    </span>
                    <span>
                      CryoGuard <b>AI</b>
                    </span>
                  </Link>

                  <nav className={`lp-nav-links ${navOpen ? "open" : ""}`}>
                    <a href="#features" onClick={() => setNavOpen(false)}>
                      Features
                    </a>
                    <a href="#why-us" onClick={() => setNavOpen(false)}>
                      Why CryoGuard
                    </a>
                    <a href="#how-it-works" onClick={() => setNavOpen(false)}>
                      How it works
                    </a>
                    <a href="#reviews" onClick={() => setNavOpen(false)}>
                      Reviews
                    </a>
                    <Link
                      to="/login"
                      className="lp-nav-cta"
                      onClick={() => setNavOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="lp-nav-cta"
                      onClick={() => setNavOpen(false)}
                    >
                      Sign up
                    </Link>
                  </nav>

                  <button
                    className="lp-nav-toggle"
                    onClick={() => setNavOpen(!navOpen)}
                  >
                    {navOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                </header>

                {/* 3. Team Components */}
                <HeroFeatures />
                <ReviewsWhyUs />

                {/* 4. Footer */}
                <footer className="lp-footer">
                  <div className="lp-footer-brand">
                    <Link to="/" className="lp-logo">
                      <span className="lp-logo-icon">
                        <Snowflake size={17} />
                      </span>
                      <span>
                        CryoGuard <b>AI</b>
                      </span>
                    </Link>
                    <p>
                      Intelligent monitoring for temperature-sensitive
                      logistics.
                    </p>
                  </div>

                  <div className="lp-footer-links">
                    <a href="#features">
                      <FontAwesomeIcon icon={faLayerGroup} />
                      <span>Features</span>
                    </a>

                    <a href="#why-us">
                      <FontAwesomeIcon icon={faShieldHalved} />
                      <span>Why CryoGuard</span>
                    </a>

                    <a href="#how-it-works">
                      <FontAwesomeIcon icon={faRoute} />
                      <span>How it works</span>
                    </a>

                    <a href="#reviews">
                      <FontAwesomeIcon icon={faStar} />
                      <span>Reviews</span>
                    </a>

                    <Link to="/login">
                      <FontAwesomeIcon icon={faRightToBracket} />
                      <span>Login</span>
                    </Link>

                    <Link to="/signup">
                      <FontAwesomeIcon icon={faUserPlus} />
                      <span>Sign up</span>
                    </Link>
                  </div>

                  <div className="lp-footer-bottom">
                    <span>© {new Date().getFullYear()} CryoGuard AI</span>
                    <span>Intelligent cold-chain monitoring</span>
                  </div>
                </footer>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </IntroGate>
    </BrowserRouter>
  );
}

export default App;
