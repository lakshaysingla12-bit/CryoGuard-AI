import React from "react";
import {
  LayoutDashboard,
  Radio,
  ClipboardList,
  FileText,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { sound } from "../utils/soundFx";

export default function Sidebar({
  activeView,
  onNavigate,
  userProfile,
  onOpenProfile,
}) {
  const navItems = [
    {
      id: "dashboard",
      icon: <LayoutDashboard size={19} />,
      label: "Dashboard",
    },
    {
      id: "tracking",
      icon: <Radio size={19} />,
      label: "Live Tracking",
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

  const profile = userProfile || {
    name: "Dr. Elena Rostova",
    designation: "PharmD · Chief Quality Inspector",
  };

  return (
    <aside className="sidebar">
      {/* ── TOP: CryoGuard AI Brand with Logo ── */}
      <div className="sidebar__brand">
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
          <span className="brand-tagline">Receiving Desk · Bay 03</span>
        </div>
      </div>

      {/* ── 4 PRIMARY BUTTONS ── */}
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Navigation</div>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar__nav-item ${
                isActive ? "sidebar__nav-item--active" : ""
              }`}
              onClick={() => {
                sound.click();
                onNavigate(item.id);
              }}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── BOTTOM: User Profile (Clickable to open full profile & facility modal) ── */}
      <div className="sidebar__profile">
        <div
          className="profile-card profile-card--interactive"
          onClick={() => {
            sound.click();
            if (onOpenProfile) onOpenProfile();
          }}
          title="Click to inspect Officer Profile, Hospital Details & Security Settings"
        >
          <div className="profile-avatar">
            <span className="avatar-initials">ER</span>
            <span className="online-indicator" />
          </div>
          <div className="profile-info">
            <div className="profile-name">{profile.name}</div>
            <div className="profile-role">{profile.designation}</div>
            <div className="profile-badge">
              <ShieldCheck size={11} className="text-emerald" />
              <span>GxP Authorized Operator</span>
            </div>
          </div>
          <ChevronRight size={14} className="profile-chevron text-dim" />
        </div>
      </div>
    </aside>
  );
}
