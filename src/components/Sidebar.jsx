import {LayoutDashboard,Snowflake,Radar,Package2,Truck,Bell,FileBarChart2,Users,Settings}from "lucide-react";
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
const healthScore = 80;

let healthColor;

if (healthScore >= 80) {
  healthColor = "#22c55e"; // green
} else if (healthScore >= 50) {
  healthColor = "#eab308"; // yellow
} else {
  healthColor = "#ef4444"; // red
}
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
      <div className="connection-box">
        <span className="status-dot"></span>
        <p>
          Cold-chain link <span>stable</span>
          </p>
      </div>
      <div className="sidebar-bottom">

  <div className="fleet-health">
  <p>Fleet Health Score</p>

  <div
  className="health-circle"
  style={{
    background: `conic-gradient(
      ${healthColor} ${healthScore}%,
      #1e3448 ${healthScore}%
    )`
  }}
>
  <div className="health-circle-inner">
    {healthScore}%
  </div>
</div>
        <span style={{ color: healthColor }}>
  {healthScore >= 80
    ? "Excellent"
    : healthScore >= 50
    ? "Good"
    : "Critical"}
</span>
      </div>

  <div className="help-box">
    <p>Need Help?</p>
    <span>Contact Support</span>
  </div>

</div>
    </aside>
  );
}