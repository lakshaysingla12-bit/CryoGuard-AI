
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  notifications: true,
  alerts: true,
  darkMode: false,
};

function getSavedSettings() {
  try {
    const saved = localStorage.getItem("cryoguard-settings");
    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(getSavedSettings);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark-mode",
      settings.darkMode
    );

    document.body.classList.toggle(
      "dark-mode",
      settings.darkMode
    );

    try {
      localStorage.setItem(
        "cryoguard-settings",
        JSON.stringify(settings)
      );
    } catch {
      // Settings still work for the current session.
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, showToast }}
    >
      {children}

      {toast && (
        <div
          className={`app-toast app-toast-${toast.type}`}
          role="status"
        >
          <span>{toast.type === "success" ? "✓" : "!"}</span>
          {toast.message}
        </div>
      )}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}
