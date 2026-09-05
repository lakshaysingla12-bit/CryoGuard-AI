import { Search, Bell, Settings } from "lucide-react";

function Header() {
  return (
    <header className="header">

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search shipments, vehicles, locations..."
        />
      </div>

      <div className="header-actions">

        <button className="icon-button">
          <Bell size={18} />
          <span className="notification">13</span>
        </button>

        <button className="icon-button">
          <Settings size={18} />
        </button>

        <div className="profile">
          <div className="avatar">M</div>

          <div>
            <p>Manager</p>
            <span>Administrator</span>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Header;