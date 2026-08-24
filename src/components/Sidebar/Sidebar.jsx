import {LayoutDashboard,Snowflake,Radar,Package2,Truck,Bell,FileBarChart2,Users,Settings}from "lucide-react";
import "./Sidebar.css";
const icons = {LayoutDashboard,Radar,Package2,Truck,Bell,FileBarChart2,Users,Settings
};
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "monitoring", label: "Monitoring", icon: "Radar" },
  { id: "inventory", label: "Inventory", icon: "Package2" },
  { id: "shipments", label: "Shipments", icon: "Truck" },
  { id: "alerts", label: "Alerts", icon: "Bell", badge: "3" },
  { id: "reports", label: "Reports", icon: "FileBarChart2" },
  { id: "users", label: "Users", icon: "Users" },
  { id: "settings", label: "Settings", icon: "Settings" }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <span className="logo-icon">
          <Snowflake size={18} />
        </span>

        <span className="logo-text">
          CryoGuard <span>AI</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          return (
            <button
              key={item.id}
              className="nav-item"
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
    </aside>
  );
}