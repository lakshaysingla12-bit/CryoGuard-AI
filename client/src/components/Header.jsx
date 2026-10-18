import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLive } from "../context/LiveContext";
import { getMyProfile } from "../api/myProfileApi.js";

export default function Header() {
  const { user } = useAuth();
  const { summary } = useLive();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState({
    name: user?.name || "Vikram Malhotra",
    role: user?.role || "Manager",
  });

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        if (data?.name) setProfile(data);
      })
      .catch(() => {
        // API unavailable ho toh demo user ka naam dikhate raho
      });
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    navigate("/shipments?q=" + encodeURIComponent(search.trim()));
  }

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <form className="search-box" onSubmit={handleSearch}>
        <Search size={18} aria-hidden="true" />

        <input
          type="search"
          className="form-control"
          placeholder="Search shipments, vehicles, locations..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search shipments, vehicles, and locations"
        />
      </form>

      <div className="d-flex align-items-center gap-3">
        <Link
          to="/alerts"
          className="icon-btn position-relative"
          aria-label="Alerts"
        >
          <Bell size={19} />
          {summary?.openAlerts > 0 && (
            <span className="notif-count">{summary.openAlerts}</span>
          )}
        </Link>

        <Link
          to="/my-profile"
          className="user-box d-flex align-items-center gap-2 text-decoration-none"
          aria-label="My Profile"
        >
          <div className="avatar">{initials}</div>

          <div className="lh-sm d-none d-md-block">
            <div className="fw-semibold">{profile.name}</div>
            <small className="text-secondary">
              {profile.role || user?.role || "My Profile"}
            </small>
          </div>
        </Link>

        <button
          type="button"
          className="icon-btn"
          title="Log out — link later"
          aria-label="Log out"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}