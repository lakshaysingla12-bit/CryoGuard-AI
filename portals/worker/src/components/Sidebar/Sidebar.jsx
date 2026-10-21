import {
  LayoutDashboard,
  Snowflake,
  Radar,
  Package2,
  Truck,
  Bell,
  FileBarChart2,
  Users,
  Settings,
  ChevronLeft,
  PanelLeftOpen,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

import "./Sidebar.css";

const icons = {
  LayoutDashboard,
  Radar,
  Package2,
  Truck,
  Bell,
  FileBarChart2,
  Users,
  Settings
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
  { id: "monitoring", label: "Monitoring", icon: "Radar", path: "/monitoring" },
  { id: "inventory", label: "Inventory", icon: "Package2", path: "/inventory" },
  { id: "shipments", label: "Shipments", icon: "Truck", path: "/shipments" },
  { id: "alerts", label: "Alerts", icon: "Bell", badge: "3", path: "/alerts" },
 // { id: "reports", label: "Reports", icon: "FileBarChart2", path: "/reports" },
  { id: "users", label: "Users", icon: "Users", path: "/users" },
  { id: "settings", label: "Settings", icon: "Settings", path: "/settings" }
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-header">
        <span className="logo-icon">
          <Snowflake size={18} />
        </span>

        <span className="logo-text">
          CryoGuard <span>AI</span>
        </span>

        <button
          className="sidebar-toggle"
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">

        {navItems.map((item) => {
          const Icon = icons[item.icon];

          const isActive =
            location.pathname === item.path ||
            (item.id === "dashboard" && location.pathname === "/");

          return (
            <button
              key={item.id}
              className={`nav-item ${
                isActive ? "active-nav-item" : ""
              }`}
              onClick={() => navigate(item.path)}
              title={item.label}
              aria-label={item.label}
            >

              <Icon size={17} />

              <span className="nav-label">
                {item.label}
              </span>

              {item.badge && (
                <span className="badge">
                  {item.badge}
                </span>
              )}

            </button>
          );
        })}

      </nav>


      {/* Connection Status */}
      <div className="connection-box">

        <span className="status-dot"></span>

        <p>
          Cold-chain link <span>stable</span>
        </p>

      </div>

    </aside>
    </>
  );
}
