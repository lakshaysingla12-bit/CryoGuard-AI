import React from "react";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function SettingsView({ theme: propTheme, onToggleTheme, onLogout }) {
  const { theme: contextTheme, setTheme } = useTheme();
  const currentTheme = propTheme || contextTheme;

  const selectTheme = (requestedTheme) => {
    if (requestedTheme !== currentTheme) {
      if (onToggleTheme) {
        onToggleTheme();
      } else {
        setTheme(requestedTheme);
      }
    }
  };

  return (
    <section className="account-page" aria-labelledby="settings-title">
      <header className="account-page__heading">
        <h1 id="settings-title">Settings</h1>
        <p>Manage your portal preferences</p>
      </header>

      <div className="settings-card">
        <div className="settings-card__heading">
          <Monitor size={19} className="text-cyan" />
          <div>
            <h2>Appearance</h2>
            <p>Choose the color theme for this portal.</p>
          </div>
        </div>
        <div className="settings-theme-options" role="group" aria-label="Color theme">
          <button
            type="button"
            className={currentTheme === "dark" ? "settings-theme-option settings-theme-option--selected" : "settings-theme-option"}
            onClick={() => selectTheme("dark")}
          >
            <Moon size={17} />
            Dark
          </button>
          <button
            type="button"
            className={currentTheme === "light" ? "settings-theme-option settings-theme-option--selected" : "settings-theme-option"}
            onClick={() => selectTheme("light")}
          >
            <Sun size={17} />
            Light
          </button>
        </div>
      </div>

      <div className="settings-card settings-card--logout">
        <div className="settings-card__heading">
          <LogOut size={19} className="text-rose" />
          <div>
            <h2>Logout</h2>
            <p>End this local portal session on this device.</p>
          </div>
        </div>
        <button
          type="button"
          className="account-logout-btn"
          onClick={() => {
            if (onLogout) onLogout();
          }}
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </section>
  );
}
