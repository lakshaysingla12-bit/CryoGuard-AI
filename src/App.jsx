import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Snowflake, Menu, X } from "lucide-react";
import "./App.css";
import HeroFeatures from "./components/Landings/HeroFeatures";
import ReviewsWhyUs from "./components/Landings/ReviewsWhyUs";
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

  // Popup Modal state
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "signup", // 'login' | 'signup'
  });

  const handleOpenAuth = (mode) => {
    setAuthModal({
      isOpen: true,
      mode,
    });
    setNavOpen(false);
  };

  const handleCloseAuth = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

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

                    {/* Nav Modal Buttons */}
                    <button
                      type="button"
                      className="lp-nav-cta"
                      onClick={() => handleOpenAuth("login")}
                    >
                      Sign In
                    </button>
                  </nav>

                  <button
                    className="lp-nav-toggle"
                    onClick={() => setNavOpen(!navOpen)}
                  >
                    {navOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                </header>

                {/* 3. Team Components */}
                <HeroFeatures onOpenSignup={() => handleOpenAuth("signup")} />
                <ReviewsWhyUs onOpenLogin={() => handleOpenAuth("login")} />

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

                    {/* Single Footer Auth Button */}
                    <button
                      type="button"
                      className="lp-footer-btn"
                      onClick={() => handleOpenAuth("login")}
                    >
                      <FontAwesomeIcon icon={faRightToBracket} />
                      <span>Sign In</span>
                    </button>
                  </div>

                  <div className="lp-footer-bottom">
                    <span>© {new Date().getFullYear()} CryoGuard AI</span>
                    <span>Intelligent cold-chain monitoring</span>
                  </div>
                </footer>

                {/* Background Blur Popup Auth Modal */}
                <Signup
                  isOpen={authModal.isOpen}
                  initialMode={authModal.mode}
                  onClose={handleCloseAuth}
                />
              </div>
            }
          />
        </Routes>
      </IntroGate>
    </BrowserRouter>
  );
}

export default App;
