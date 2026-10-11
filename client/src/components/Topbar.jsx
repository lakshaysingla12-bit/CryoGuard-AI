import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLive } from "../context/LiveContext";

function Topbar() {
  const { user, logout } = useAuth();
  const { summary } = useLive();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // pressing Enter opens the shipments page filtered by the text
  function handleSearch(e) {
    e.preventDefault();
    navigate("/shipments?q=" + encodeURIComponent(search.trim()));
  }

  return (
    <header className="topbar">
      <form className="search-box" onSubmit={handleSearch}>
        <i className="bi bi-search"></i>
        <input
          type="text"
          className="form-control"
          placeholder="Search shipments, vehicles, locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="d-flex align-items-center gap-3">
        <Link to="/alerts" className="icon-btn position-relative" aria-label="Alerts">
          <i className="bi bi-bell"></i>
          {summary?.openAlerts > 0 && <span className="notif-count">{summary.openAlerts}</span>}
        </Link>

        <div className="user-box d-flex align-items-center gap-2">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div className="lh-sm d-none d-md-block">
            <div className="fw-semibold">{user.name}</div>
            <small className="text-secondary">{user.role}</small>
          </div>
        </div>

        <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
