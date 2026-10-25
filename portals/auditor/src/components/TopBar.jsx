import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Clock,
  Building2,
  Sun,
  Moon,
  Bell,
  CheckCheck,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  markAllRead,
  markRead,
  removeNotification,
  clearAllNotifications,
} from "../store";

export default function TopBar({
  onGlobalSearch,
  firmName: propFirmName,
  department: propDepartment,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}) {
  const dispatch = useDispatch();
  const { theme: contextTheme, toggleTheme: contextToggleTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const onToggleTheme = propToggleTheme || contextToggleTheme;

  const profile = useSelector((state) => state.profile);
  const notifications = useSelector((state) => state.notifications?.items || []);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const firmName = propFirmName || profile?.firmName || "Pune Frozen Foods Distribution Hub";
  const department = propDepartment || profile?.department || "Quality Assurance & Inward Cold-Chain Verification";

  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onGlobalSearch) {
      onGlobalSearch(e.target.value);
    }
  };

  return (
    <header className="topbar">
      {/* 1. Firm Name */}
      <div className="topbar__firm">
        <div className="firm-icon">
          <Building2 size={18} className="text-cyan" />
        </div>
        <div className="firm-details">
          <span className="firm-name">{firmName}</span>
          <span className="firm-department">{department}</span>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="topbar__search-wrap">
        <div className="topbar__search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search batch ID, drug, vehicle, driver... (Press '/' to focus)"
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchValue("");
                if (onGlobalSearch) onGlobalSearch("");
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Controls: Theme Toggle + Notification Bell Tab + Live Time */}
      <div className="topbar__controls">
        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          <span
            className={`theme-toggle-segment ${
              theme === "dark" ? "theme-toggle-segment--active" : ""
            }`}
          >
            <Moon size={13} className="theme-toggle-icon" />
            <span className="theme-toggle-text">Dark</span>
          </span>
          <span
            className={`theme-toggle-segment ${
              theme === "light" ? "theme-toggle-segment--active" : ""
            }`}
          >
            <Sun size={13} className="theme-toggle-icon" />
            <span className="theme-toggle-text">Light</span>
          </span>
        </button>

        {/* ── Top Notification Tab & Dropdown ── */}
        <div className="topbar__notif-wrap" ref={notifRef}>
          <button
            type="button"
            className={`topbar__notif-btn ${isNotifOpen ? "topbar__notif-btn--active" : ""}`}
            onClick={() => setIsNotifOpen((prev) => !prev)}
            title="Notifications & Quality Alerts"
            aria-label="Notifications"
          >
            <Bell size={17} className={unreadCount > 0 ? "text-cyan" : "text-muted"} />
            {unreadCount > 0 && (
              <span className="notif-badge-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown__header">
                <div className="notif-dropdown__title-group">
                  <span className="notif-dropdown__title">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="notif-dropdown__badge">{unreadCount} new</span>
                  ) : (
                    <span className="notif-dropdown__badge notif-dropdown__badge--muted">All read</span>
                  )}
                </div>
                <div className="notif-dropdown__actions">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-action-btn"
                      onClick={() => dispatch(markAllRead())}
                      title="Mark all as read"
                    >
                      <CheckCheck size={13} />
                      <span>Mark read</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="notif-action-btn notif-action-btn--clear"
                      onClick={() => dispatch(clearAllNotifications())}
                      title="Clear all notifications"
                    >
                      <Trash2 size={13} />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="notif-dropdown__list">
                {notifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <div className="notif-empty-icon">
                      <Bell size={24} className="text-dim" />
                    </div>
                    <p className="notif-empty-title">No notifications</p>
                    <span className="notif-empty-desc">
                      Quality alerts, consignment intakes, and docking logs will appear here.
                    </span>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconMap = {
                      success: <CheckCircle2 size={16} className="text-emerald" />,
                      warning: <AlertTriangle size={16} className="text-amber" />,
                      error: <AlertOctagon size={16} className="text-rose" />,
                      info: <Info size={16} className="text-cyan" />,
                    };

                    return (
                      <div
                        key={n.id}
                        className={`notif-item ${n.unread ? "notif-item--unread" : ""}`}
                        onClick={() => dispatch(markRead(n.id))}
                      >
                        <div className="notif-item__icon">
                          {iconMap[n.type] || iconMap.info}
                        </div>
                        <div className="notif-item__body">
                          <div className="notif-item__header">
                            <span className="notif-item__title">{n.title}</span>
                            <span className="notif-item__time">{n.timestamp}</span>
                          </div>
                          <p className="notif-item__message">{n.message}</p>
                        </div>
                        <button
                          type="button"
                          className="notif-item__dismiss"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeNotification(n.id));
                          }}
                          title="Dismiss notification"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Time & Date Card */}
        <div className="topbar__time-wrap">
          <div className="live-time-card">
            <Clock size={16} className="text-cyan" />
            <div className="time-content">
              <span className="time-val mono">{timeStr}</span>
              <span className="date-val">{dateStr}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
