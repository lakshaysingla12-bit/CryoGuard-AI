import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLive } from "../context/LiveContext";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "bi-grid-1x2" },
  { path: "/monitoring", label: "Monitoring", icon: "bi-broadcast" },
  { path: "/shipments", label: "Shipments", icon: "bi-box-seam" },
  { path: "/vehicles", label: "Vehicles", icon: "bi-truck" },
  { path: "/alerts", label: "Alerts", icon: "bi-bell", showAlertCount: true },
  { path: "/ai", label: "AI Predictions", icon: "bi-cpu" },
  { path: "/reports", label: "Reports", icon: "bi-file-earmark-text" },
  { path: "/users", label: "Users", icon: "bi-people", managerOnly: true },
  { path: "/settings", label: "Settings", icon: "bi-gear" },
];

function Sidebar() {
  const { user } = useAuth();
  const { summary, connected } = useLive();

  
const items = menuItems.filter(
  (item) => !item.managerOnly || user?.role === "Manager"
);


  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">
          <i className="bi bi-snow2"></i>
        </span>
        <span className="brand-name">
          CryoGuard <span className="text-info">AI</span>
        </span>
      </div>

      <nav className="nav flex-column mt-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => "side-link" + (isActive ? " active" : "")}
          >
            <i className={"bi " + item.icon}></i>
            <span>{item.label}</span>
            {item.showAlertCount && summary?.openAlerts > 0 && (
              <span className="badge rounded-pill bg-danger ms-auto">{summary.openAlerts}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="link-status">
        <span className={"status-dot " + (connected ? "on" : "off")}></span>
        {connected ? "Live data connected" : "Reconnecting..."}
      </div>
    </aside>
  );
}

export default Sidebar;
