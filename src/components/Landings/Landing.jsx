import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Snowflake, Menu, X } from "lucide-react";
import "../../App.css";
import HeroFeatures from "./HeroFeatures";
import ReviewsWhyUs from "./ReviewsWhyUs";
import Signup from "../Auth/Signup"; // Correct relative path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faShieldHalved,
  faRoute,
  faStar,
  faRightToBracket,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";

// Clean data array to eliminate repetitive footer SVG code
const TEAM_MEMBERS = [
  {
    name: "Akshita",
    github: "https://github.com/kaushikakshita20",
    linkedin: "https://www.linkedin.com/in/akshitakaushik20/",
  },
  {
    name: "Yashika",
    github: "https://github.com/yashikaguptaworld",
    linkedin: "https://www.linkedin.com/in/yashika-gupta-69b301366/",
  },
  {
    name: "Lakshay",
    github: "https://github.com/lakshaysingla12-bit",
    linkedin: "https://www.linkedin.com/in/lakshay-singla-be/",
  },
];

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
  });

  // Soft reveal observer for landing sections
  useEffect(() => {
    const targets = document.querySelectorAll(
      "section, .lp-features, .lp-why, .lp-how, .cg-testimonials, .lp-final-cta",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleOpenAuth = (mode = "login") => {
    setAuthModal({ isOpen: true, mode });
    setNavOpen(false);
  };

  const handleCloseAuth = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div className="lp">
      {/* 1. Background Effects */}
      <div className="lp-bg-glow lp-bg-glow-one"></div>
      <div className="lp-bg-glow lp-bg-glow-two"></div>
      <div className="lp-grid-background"></div>

      {/* 2. Navigation Bar */}
      <header className="lp-nav">
        <Link to="/" className="lp-logo" onClick={scrollToTop}>
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
          <a href="#faq" onClick={() => setNavOpen(false)}>
            FAQ
          </a>
          <button
            type="button"
            className="lp-nav-cta"
            onClick={() => handleOpenAuth("login")}
          >
            Sign In
          </button>
        </nav>

        <button className="lp-nav-toggle" onClick={() => setNavOpen(!navOpen)}>
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
          <p>Intelligent monitoring for temperature-sensitive logistics.</p>
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
          <a href="#faq">
            <FontAwesomeIcon icon={faCircleQuestion} />
            <span>FAQ</span>
          </a>
          <button
            type="button"
            className="lp-footer-btn"
            onClick={() => handleOpenAuth("login")}
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>Sign In</span>
          </button>
        </div>

        {/* 3-Column Footer Bottom */}
        <div className="lp-footer-bottom">
          <span className="lp-footer-copy">
            © {new Date().getFullYear()} CryoGuard AI
          </span>

          <span className="lp-footer-crafted">
            Crafted with ⚡ by <b>Akshita</b>, <b>Yashika</b> & <b>Lakshay</b>
          </span>

          <div className="lp-footer-team-socials">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                key={member.name}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div className="lp-member-social">
                  <span className="lp-member-name">{member.name}:</span>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noreferrer"
                    title={`${member.name} GitHub`}
                    className="lp-social-icon-btn"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    title={`${member.name} LinkedIn`}
                    className="lp-social-icon-btn"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
                {index < TEAM_MEMBERS.length - 1 && (
                  <span className="lp-social-divider">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Signup
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={handleCloseAuth}
      />
    </div>
  );
}
