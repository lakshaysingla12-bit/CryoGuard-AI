
import { createContext, useContext, useEffect, useState } from "react";
import {
  VEHICLES,
  RECENT_ALERTS,
  TEMPERATURE_TREND_DATA,
} from "../data/mockdata";

const LiveContext = createContext(null);

const VEHICLE_COORDINATES = [
  { lat: 30.7333, lng: 76.7794 }, // Chandigarh
  { lat: 28.6139, lng: 77.2090 }, // Delhi
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 18.5204, lng: 73.8567 }, // Pune
];

function makeVehicles() {
  return VEHICLES.map((v, index) => ({
    ...v,
    ...VEHICLE_COORDINATES[index % VEHICLE_COORDINATES.length],

    plate: `PB-${10 + index}AB-${1000 + index}`,
    model: [
      "Reefer Truck",
      "Ultra-Cold Van",
      "Refrigerated Truck",
      "Hybrid Reefer",
    ][index % 4],

    temp: v.temperature,
    coolingHealth: [85, 94, 48, 65][index % 4],

    tempStatus:
      v.status === "Critical"
        ? "critical"
        : v.status === "Warning"
        ? "warning"
        : "normal",

    status: index === 3 ? "Idle" : "In Transit",
  }));
}

function makeAlerts() {
  return RECENT_ALERTS.map((a, index) => ({
    id: a.id,
    vehicleId: a.vehicleId,
    shipmentId: `SHP-10${21 + index}`,
    type: a.title,
    message: a.detail,
    level:
      String(a.severity).toLowerCase() === "critical"
        ? "Critical"
        : "Warning",
    createdAt: new Date(
      Date.now() - (index + 1) * 2 * 60 * 1000
    ).toISOString(),
    resolved: Boolean(a.acknowledged),
  }));
}

function makeShipments(vehicles) {
  return vehicles.map((v, index) => ({
    id: v.shipmentId,
    cargo: v.cargo,
    origin: v.route?.split(" → ")[0] || "Origin unavailable",
    destination: v.route?.split(" → ")[1] || "Destination unavailable",
    vehicleId: v.id,
    minTemp: v.minTemp,
    maxTemp: v.maxTemp,
    currentTemp: v.temp,

    createdAt: new Date(
      Date.now() - (index + 1) * 60 * 60 * 1000
    ).toISOString(),

    status: v.status === "Idle" ? "Delivered" : "In Transit",

    displayStatus:
      v.tempStatus === "critical"
        ? "Critical"
        : v.tempStatus === "warning"
        ? "Delayed"
        : v.status === "Idle"
        ? "Delivered"
        : "In Transit",

    progress: [72, 45, 88, 100][index % 4],
  }));
}

function makeSummary(vehicles, alerts, shipments) {
  const openAlerts = alerts.filter((a) => !a.resolved);

  return {
    activeShipments: shipments.filter(
      (s) => s.status === "In Transit"
    ).length,

    deliveredCount: shipments.filter(
      (s) => s.status === "Delivered"
    ).length,

    vehiclesOnRoad: vehicles.filter(
      (v) => v.status === "In Transit"
    ).length,

    totalVehicles: vehicles.length,

    delayed: shipments.filter(
      (s) => s.displayStatus === "Delayed"
    ).length,

    openAlerts: openAlerts.length,

    criticalAlerts: openAlerts.filter(
      (a) => a.level === "Critical"
    ).length,

    onTimePercent: 96,

    statusBreakdown: {
      "On track": shipments.filter(
        (s) => s.displayStatus === "In Transit"
      ).length,

      Delayed: shipments.filter(
        (s) => s.displayStatus === "Delayed"
      ).length,

      "Temp excursion": shipments.filter(
        (s) => s.displayStatus === "Critical"
      ).length,

      Delivered: shipments.filter(
        (s) => s.displayStatus === "Delivered"
      ).length,
    },
  };
}

export function LiveProvider({ children }) {
  const [vehicles, setVehicles] = useState(() => makeVehicles());
  const [alerts, setAlerts] = useState(() => makeAlerts());
  const [tick, setTick] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const shipments = makeShipments(vehicles);
  const summary = makeSummary(vehicles, alerts, shipments);

  const trend = TEMPERATURE_TREND_DATA.map((point, index) => ({
    ts:
      Date.now() -
      (TEMPERATURE_TREND_DATA.length - index) * 60 * 60 * 1000,
    avg: point.temp,
    max: point.temp + 1,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles((oldVehicles) =>
        oldVehicles.map((v, index) => ({
          ...v,
          temp: Number(
            (
              v.temp +
              (index % 2 === 0 ? 0.1 : -0.1)
            ).toFixed(1)
          ),
        }))
      );

      setTick((n) => n + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  function showToast(alert) {
    setToasts((old) => [...old, alert]);
  }

  function dismissToast(id) {
    setToasts((old) => old.filter((t) => t.id !== id));
  }

  const value = {
    vehicles,
    summary,
    trend,
    connected: true,
    tick,
    alertCount,
    alerts,
    shipments,
    setVehicles,
    setAlerts,
    setAlertCount,
    showToast,
    toasts,
    dismissToast,
  };

  return (
    <LiveContext.Provider value={value}>
      {children}
    </LiveContext.Provider>
  );
}

export const useLive = () => useContext(LiveContext);
