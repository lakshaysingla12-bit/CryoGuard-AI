import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

  const refresh = useCallback(async () => {
    try {
      const [nextVehicles, nextShipments, nextAlerts] = await Promise.all([
        api("/vehicles"),
        api("/shipments"),
        api("/alerts"),
      ]);
      setVehicles(nextVehicles);
      setShipments(nextShipments);
      setAlerts(nextAlerts);
      setConnected(true);
      setTick((value) => value + 1);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((alert) => {
    const toast = { ...alert, id: alert.id || `toast-${Date.now()}` };
    setToasts((current) => [...current, toast].slice(-4));
  }, []);

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
    dismissToast,
    refresh,
  };

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export const useLive = () => useContext(LiveContext);
