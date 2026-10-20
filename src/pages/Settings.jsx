
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Moon,
  Save,
  Check,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import "./Settings.css";

function Settings() {
  const { settings, updateSetting, showToast } = useSettings();

  const handleSave = () => {
    // Settings are already saved automatically by SettingsContext.
    showToast("Your settings have been saved!");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your Worker Dashboard preferences.</p>
        </div>

        <div className="settings-icon">
          <SettingsIcon size={22} />
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-section-heading">
          <h2>Preferences</h2>
          <p>Choose how CryoGuard works for you.</p>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-item-icon">
              <Bell size={19} />
            </div>
            <div>
              <h3>Notifications</h3>
              <p>Enable or mute in-app notification messages.</p>
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => {
                updateSetting("notifications", e.target.checked);
                showToast(
                  e.target.checked
                    ? "Notifications enabled"
                    : "Notifications muted",
                  e.target.checked ? "success" : "warning"
                );
              }}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-item-icon">
              <Shield size={19} />
            </div>
            <div>
              <h3>Safety Alerts</h3>
              <p>
                Control in-app warnings for cold-chain issues.
                Monitoring itself remains active.
              </p>
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.alerts}
              onChange={(e) => {
                updateSetting("alerts", e.target.checked);
                showToast(
                  e.target.checked
                    ? "Safety alert messages enabled"
                    : "Safety alert messages muted",
                  e.target.checked ? "success" : "warning"
                );
              }}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-item-icon">
              <Moon size={19} />
            </div>
            <div>
              <h3>Dark Mode</h3>
              <p>Change the appearance across the dashboard.</p>
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => {
                updateSetting("darkMode", e.target.checked);
                showToast(
                  e.target.checked
                    ? "Dark mode enabled"
                    : "Light mode enabled"
                );
              }}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="settings-footer">
          <span className="settings-saved-note">
            <Check size={15} /> Preferences save automatically
          </span>

          <button className="save-settings" onClick={handleSave}>
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
