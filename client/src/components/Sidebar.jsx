import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLive } from "../context/LiveContext";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "bi-grid-1x2" },
  { path: "/monitoring", label: "Monitoring", icon: "bi-broadcast" },
  { path: "/shipments", label: "Shipments", icon: "bi-box-seam" },
  { path: "/inventory", label: "Inventory", icon: "bi-boxes" },
  { path: "/vehicles", label: "Vehicles", icon: "bi-truck" },
  { path: "/alerts", label: "Alerts", icon: "bi-bell", showAlertCount: true },
  { path: "/ai", label: "AI Predictions", icon: "bi-cpu" },
  { path: "/reports", label: "Reports", icon: "bi-file-earmark-text" },
  { path: "/users", label: "Users", icon: "bi-people", managerOnly: true },
  { path: "/my-profile", label: "My Profile", icon: "bi-person-circle" },
  { path: "/settings", label: "Settings", icon: "bi-gear" },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { summary, connected } = useLive();

  const items = menuItems.filter(
    (item) => !item.managerOnly || user?.role === "Manager"
  );

  return (
    <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
      <div className="brand" title={collapsed ? "CryoGuard AI" : undefined}>
        <span className="brand-icon">
          <i className="bi bi-snow2" />
        </span>

        {!collapsed && (
          <span className="brand-name">
            CryoGuard <span className="brand-ai">AI</span>
          </span>
        )}

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i
            className={`bi ${
              collapsed ? "bi-chevron-right" : "bi-chevron-left"
            }`}
          />
        </button>
      </div>

      <nav className="nav flex-column mt-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              "side-link" + (isActive ? " active" : "")
            }
          >
            <i className={`bi ${item.icon}`} />
            {!collapsed && <span>{item.label}</span>}

            {item.showAlertCount && summary?.openAlerts > 0 && (
              <span className="badge rounded-pill bg-danger ms-auto">
                {summary.openAlerts}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="link-status" title={collapsed ? (connected ? "Live data connected" : "Reconnecting…") : undefined}>
        <span className={`status-dot ${connected ? "on" : "off"}`} />
        {!collapsed && (
          <span>{connected ? "Live data connected" : "Reconnecting..."}</span>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
