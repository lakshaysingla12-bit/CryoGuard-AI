import React from "react";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Radio,
  ClipboardList,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  Settings,
  Building2,
} from "lucide-react";

export default function Sidebar({
  activeView,
  onNavigate,
  isCollapsed = false,
  onToggleCollapsed,
  profile: propProfile,
}) {
  const reduxProfile = useSelector((state) => state.profile);
  const profile = propProfile || reduxProfile;

  const navItems = [
    {
      id: "dashboard",
      icon: <LayoutDashboard size={19} />,
      label: "Dashboard",
    },
    {
      id: "tracking",
      icon: <Radio size={19} />,
      label: "Monitoring",
    },
    {
      id: "ledger",
      icon: <ClipboardList size={19} />,
      label: "Intake Ledger",
    },
    {
      id: "reports",
      icon: <FileText size={19} />,
      label: "GRN Report",
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>
      {/* ── TOP: CryoGuard AI Brand with Logo & Collapse Toggle Button ── */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-identity">
          <div className="sidebar__logo-ai">
            <svg
              className="cryo-logo-svg"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="8" fill="var(--cyan)" fillOpacity="0.14" />
              <path
                d="M16 7V25M7 16H25M9.64 9.64L22.36 22.36M9.64 22.36L22.36 9.64"
                stroke="var(--cyan)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="2.8" fill="var(--cyan)" />
            </svg>
          </div>
          <div className="sidebar__brand-text">
            <div className="brand-title">
              <span className="brand-name">CryoGuard</span>
              <span className="brand-ai">AI</span>
            </div>
            <span className="brand-tagline">Clinical Quality Intake</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* ── PRIMARY OPERATIONS NAVIGATION ── */}
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Operations</div>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar__nav-item ${
                isActive ? "sidebar__nav-item--active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── BOTTOM: Hospital Firm Card & Account Controls ── */}
      <div className="sidebar__profile">
        {!isCollapsed && (
          <div
            className="sidebar__facility-card"
            onClick={() => onNavigate("profile")}
            title="Hospital facility identity - Click to view in My Profile"
          >
            <div className="sidebar__facility-badge">
              <Building2 size={13} className="text-cyan" />
              <span className="sidebar__facility-tag">Receiving Hub</span>
            </div>
            <div className="sidebar__facility-name">
              {profile?.firmName || "Pune Frozen Foods Distribution Hub"}
            </div>
            <div className="sidebar__facility-sub">Cold Storage & Distribution Facility</div>
          </div>
        )}

        <div className="sidebar__secondary-nav">
          <div className="sidebar__nav-label">Account</div>
          <button
            type="button"
            className={`sidebar__nav-item sidebar__nav-item--secondary ${
              activeView === "profile" ? "sidebar__nav-item--active" : ""
            }`}
            onClick={() => onNavigate("profile")}
            title={isCollapsed ? "My Profile" : undefined}
          >
            <span className="sidebar__nav-icon"><UserRound size={19} /></span>
            <span className="sidebar__nav-text">My Profile</span>
          </button>
          <button
            type="button"
            className={`sidebar__nav-item sidebar__nav-item--secondary ${
              activeView === "settings" ? "sidebar__nav-item--active" : ""
            }`}
            onClick={() => onNavigate("settings")}
            title={isCollapsed ? "Settings" : undefined}
          >
            <span className="sidebar__nav-icon"><Settings size={19} /></span>
            <span className="sidebar__nav-text">Settings</span>
          </button>
        </div>
        <div className="sidebar__connection-status" title="Connected to Hospital Telemetry Gateway">
          <span className="sidebar__connection-dot" />
          <span className="sidebar__connection-text">Live data connected</span>
        </div>
      </div>
    </aside>
  );
}
