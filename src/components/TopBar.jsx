import React, { useState, useEffect } from "react";
import { Search, Clock, Building2, Sun, Moon } from "lucide-react";

export default function TopBar({
  onGlobalSearch,
  department,
  theme = "dark",
  onToggleTheme,
}) {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onGlobalSearch) {
      onGlobalSearch(e.target.value);
    }
  };

  return (
    <header className="topbar">
      {/* 1. Firm Name */}
      <div className="topbar__firm">
        <div className="firm-icon">
          <Building2 size={18} className="text-cyan" />
        </div>
        <div className="firm-details">
          <span className="firm-name">Metro General Hospital</span>
          <span className="firm-department">
            {department || "Department of Pharmacy & Biomedical Quality Assurance"} · Bay 03
          </span>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="topbar__search-wrap">
        <div className="topbar__search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search batch ID, drug, vehicle, driver..."
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchValue("");
                if (onGlobalSearch) onGlobalSearch("");
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Controls: Theme Toggle & Live Time */}
      <div className="topbar__controls">
        {/* Dark / Light Theme Toggle Button */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          <span
            className={`theme-toggle-segment ${
              theme === "dark" ? "theme-toggle-segment--active" : ""
            }`}
          >
            <Moon size={13} className="theme-toggle-icon" />
            <span className="theme-toggle-text">Dark</span>
          </span>
          <span
            className={`theme-toggle-segment ${
              theme === "light" ? "theme-toggle-segment--active" : ""
            }`}
          >
            <Sun size={13} className="theme-toggle-icon" />
            <span className="theme-toggle-text">Light</span>
          </span>
        </button>

        {/* Live Time & Date Card */}
        <div className="topbar__time-wrap">
          <div className="live-time-card">
            <Clock size={16} className="text-cyan" />
            <div className="time-content">
              <span className="time-val mono">{timeStr}</span>
              <span className="date-val">{dateStr}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
