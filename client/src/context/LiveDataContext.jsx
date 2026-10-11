import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api, getToken } from "../api/client";

// Holds everything that updates live (vehicles, alerts, fleet trend).
// Pages just read from here, so they all stay in sync without refreshing.
const LiveDataContext = createContext(null);

export function LiveDataProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trend, setTrend] = useState([]);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  const reloadAlerts = useCallback(() => {
    api("/alerts").then(setAlerts).catch(() => {});
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    // first load, so the page is not empty while waiting for the next tick
    api("/vehicles").then(setVehicles).catch(() => {});
    api("/dashboard/trend").then(setTrend).catch(() => {});
    reloadAlerts();

    const socket = io({ auth: { token: getToken() } });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // arrives every 5 seconds
    socket.on("telemetry", (data) => {
      setVehicles(data.vehicles);
      setTrend((old) => [...old, data.fleetPoint].slice(-60));
    });

    socket.on("alert:new", (alert) => {
      reloadAlerts();
      if (alert.severity === "Success") return; // no popup for deliveries

      setToasts((list) => [...list, alert].slice(-4));
      setTimeout(() => dismissToast(alert.id), 8000);
    });

    socket.on("alert:updated", reloadAlerts);

    return () => socket.disconnect();
  }, [reloadAlerts, dismissToast]);

  const openAlerts = alerts.filter((a) => !a.resolved);

  const value = { vehicles, alerts, openAlerts, trend, connected, toasts, dismissToast, reloadAlerts };
  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
}

export function useLive() {
  return useContext(LiveDataContext);
}
