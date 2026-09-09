import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Snowflake, Menu, X } from "lucide-react";
import "./App.css";
import HeroFeatures from "./components/Landings/HeroFeatures";
import ReviewsWhyUs from "./components/Landings/ReviewsWhyUs";
import Login from "./components/Auth/Login";
function App() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <BrowserRouter>
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
                    Intelligent monitoring for temperature-sensitive logistics.
                  </p>
                </div>

                <div className="lp-footer-links">
                  <a href="#features">Features</a>
                  <a href="#why-us">Why CryoGuard</a>
                  <a href="#how-it-works">How it works</a>
                  <a href="#reviews">Reviews</a>
                  <Link to="/login">Sign in</Link>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
