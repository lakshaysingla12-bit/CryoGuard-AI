import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLive } from "../context/LiveContext";
import { getMyProfile } from "../api/myProfileApi.js";

function Topbar() {
  const { summary } = useLive();
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

  const initials = profile.name
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

        <Link
          to="/my-profile"
          className="user-box d-flex align-items-center gap-2 text-decoration-none"
          aria-label="My Profile"
        >
          <div className="avatar">{initials}</div>
          <div className="lh-sm d-none d-md-block">
            <div className="fw-semibold">{profile.name}</div>
            <small className="text-secondary">My Profile</small>
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