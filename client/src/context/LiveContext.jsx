import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api, getToken } from "../api/client";
import { useAuth } from "./AuthContext";

// Holds everything that updates live: vehicles, summary numbers,
// the temperature trend and new alerts. Pages just read from here.
const LiveContext = createContext(null);

export function LiveProvider({ children }) {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [connected, setConnected] = useState(false);
  const [tick, setTick] = useState(0); // goes up by one on every update
  const [alertCount, setAlertCount] = useState(0); // goes up when a new alert arrives
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!user) return;

    // first load, so the page is not empty while waiting for the first tick
    api("/vehicles").then(setVehicles);
    api("/dashboard/summary").then((data) => {
      const { trend: oldTrend, ...rest } = data;
      setSummary(rest);
      setTrend(oldTrend);
    });

    const socket = io({ auth: { token: getToken() } });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("tick", (data) => {
      setVehicles(data.vehicles);
      setSummary(data.summary);
      if (data.trendPoint) {
        setTrend((old) => [...old.slice(-39), data.trendPoint]);
      }
      setTick((t) => t + 1);
    });

    socket.on("alert", (alert) => {
      setAlertCount((n) => n + 1);
      if (alert.level === "Success") return; // no popup for deliveries
      showToast(alert);
    });

    return () => socket.disconnect();
  }, [user]);

  function showToast(alert) {
    setToasts((old) => [...old, alert]);
    setTimeout(() => dismissToast(alert.id), 7000);
  }

  function dismissToast(id) {
    setToasts((old) => old.filter((t) => t.id !== id));
  }

  const value = { vehicles, summary, trend, connected, tick, alertCount, toasts, dismissToast };
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export const useLive = () => useContext(LiveContext);
