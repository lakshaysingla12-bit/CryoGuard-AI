import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Moon,
  Save
} from "lucide-react";
import "./Settings.css";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className={`settings-page ${darkMode ? "dark-mode" : ""}`}>

      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your worker dashboard preferences.</p>
        </div>

        <div className="settings-icon">
          <SettingsIcon size={22} />
        </div>
      </div>

      <div className="settings-card">

        {/* Notifications */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-item-icon">
              <Bell size={19} />
            </div>

            <div>
              <h3>Notifications</h3>
              <p>Receive important dashboard notifications.</p>
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className="slider"></span>
          </label>
        </div>


        {/* Safety Alerts */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-item-icon">
              <Shield size={19} />
            </div>

            <div>
              <h3>Safety Alerts</h3>
              <p>Receive alerts for cold-chain issues.</p>
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={alerts}
              onChange={() => setAlerts(!alerts)}
            />
            <span className="slider"></span>
          </label>
        </div>


        {/* Dark Mode */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-item-icon">
              <Moon size={19} />
            </div>

            <div>
              <h3>Dark Mode</h3>
              <p>Change the appearance of the dashboard.</p>
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleDarkMode}
            />
            <span className="slider"></span>
          </label>
        </div>


        <button className="save-settings" onClick={handleSave}>
          <Save size={16} />
          Save Settings
        </button>

      </div>

    </div>
  );
}

export default Settings;