import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";

const LiveContext = createContext(null);

function makeSummary(vehicles, alerts, shipments) {
  const openAlerts = alerts.filter((alert) => !alert.resolved);
  const count = (status) => shipments.filter((shipment) => shipment.displayStatus === status).length;

  return {
    activeShipments: shipments.filter((shipment) => shipment.status === "In Transit").length,
    deliveredCount: shipments.filter((shipment) => shipment.status === "Delivered").length,
    vehiclesOnRoad: vehicles.filter((vehicle) => vehicle.status === "In Transit").length,
    totalVehicles: vehicles.length,
    delayed: count("Delayed"),
    openAlerts: openAlerts.length,
    criticalAlerts: openAlerts.filter((alert) => alert.level === "Critical").length,
    onTimePercent: 96,
    statusBreakdown: {
      "On track": count("In Transit"),
      Delayed: count("Delayed"),
      "Temp excursion": count("Critical"),
      Delivered: count("Delivered"),
    },
  };
}

export function LiveProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tick, setTick] = useState(0);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [toastNotificationsEnabled, setToastNotificationsEnabled] = useState(() =>
    localStorage.getItem("cryoguard_toast_notifications") !== "false"
  );
  const seenAlertIds = useRef(null);

  useEffect(() => {
    api("/settings")
      .then((settings) => {
        if (typeof settings.toastNotifications === "boolean") {
          setToastNotificationsEnabled(settings.toastNotifications);
          localStorage.setItem("cryoguard_toast_notifications", String(settings.toastNotifications));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!toastNotificationsEnabled) setToasts([]);
  }, [toastNotificationsEnabled]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((alert) => {
    if (!toastNotificationsEnabled) return;
    const toast = { ...alert, id: alert.id || `toast-${Date.now()}` };
    setToasts((current) => [...current, toast].slice(-4));
    window.setTimeout(() => dismissToast(toast.id), alert.duration || 4200);
  }, [dismissToast, toastNotificationsEnabled]);

  const refresh = useCallback(async () => {
    try {
      const [nextVehicles, nextShipments, nextAlerts] = await Promise.all([
        api("/vehicles"),
        api("/shipments"),
        api("/alerts"),
      ]);
      if (seenAlertIds.current) {
        const previousIds = seenAlertIds.current;
        nextAlerts.filter((alert) => !previousIds.has(alert.id) && !alert.resolved)
          .forEach((alert) => showToast(alert));
      }
      seenAlertIds.current = new Set(nextAlerts.map((alert) => alert.id));
      setVehicles(nextVehicles);
      setShipments(nextShipments);
      setAlerts(nextAlerts);
      setConnected(true);
      setTick((value) => value + 1);
    } catch {
      setConnected(false);
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const summary = useMemo(
    () => makeSummary(vehicles, alerts, shipments),
    [vehicles, alerts, shipments]
  );

  const value = {
    vehicles,
    shipments,
    alerts,
    summary,
    connected,
    tick,
    alertCount: alerts.filter((alert) => !alert.resolved).length,
    setVehicles,
    setAlerts,
    showToast,
    toasts,
    toastNotificationsEnabled,
    setToastNotificationsEnabled,
    dismissToast,
    refresh,
  };

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export const useLive = () => useContext(LiveContext);
