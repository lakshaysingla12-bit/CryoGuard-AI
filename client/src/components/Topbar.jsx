import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLive } from "../context/LiveContext";
import { getMyProfile } from "../api/myProfileApi.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Topbar() {
  const { summary } = useLive();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState({ name: "Aarav Sharma" });

  useEffect(() => {
    const handleProfileUpdate = (event) => setProfile(event.detail);

    window.addEventListener("cryoguard-demo-profile-updated", handleProfileUpdate);

    getMyProfile()
  .then((myProfile) => {
    if (myProfile) setProfile(myProfile);
  })
  .catch(() => {});

    return () => {
      window.removeEventListener("cryoguard-demo-profile-updated", handleProfileUpdate);
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    navigate("/shipments?q=" + encodeURIComponent(search.trim()));
  }

  const displayName = user?.companyId ? user.name : profile.name;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <form className="search-box" onSubmit={handleSearch}>
        <i className="bi bi-search"></i>
        <input
          type="text"
          className="form-control"
          placeholder="Search shipments, vehicles, locations..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      <div className="d-flex align-items-center gap-3">
        <Link to="/alerts" className="icon-btn position-relative" aria-label="Alerts">
          <i className="bi bi-bell"></i>
          {summary?.openAlerts > 0 && (
            <span className="notif-count">{summary.openAlerts}</span>
          )}
        </Link>

        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`} />
        </button>

        {user?.companyId && (
          <div className="company-context d-none d-lg-flex" title={`${user.companyName} · ${user.companyId}`}>
            <span className="company-context-icon"><i className="bi bi-buildings" /></span>
            <span className="company-context-copy">
              <small>COMPANY PORTAL</small>
              <strong>{user.companyName}</strong>
            </span>
            <span className="company-code-pill">{user.companyId}</span>
          </div>
        )}

        <Link
          to="/my-profile"
          className="user-box d-flex align-items-center gap-2 text-decoration-none"
          aria-label="My Profile"
        >
          <div className="avatar">{initials}</div>
          <div className="lh-sm d-none d-md-block">
            <div className="fw-semibold">{displayName}</div>
            <small className="text-secondary">{user?.companyId ? `Manager · ${user.id}` : "My Profile"}</small>
          </div>
        </Link>

        <button
          type="button"
          className="icon-btn"
          title="Log out — link later"
          aria-label="Log out"
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
