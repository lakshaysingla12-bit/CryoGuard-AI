
import {
  VEHICLES,
  RECENT_ALERTS,
  INVENTORY_ITEMS,
  SYSTEM_USERS,
  COMPLIANCE_REPORTS,
} from "../data/mockdata";

const TOKEN_KEY = "cryoguard_token";

let alerts = RECENT_ALERTS.map((a) => ({
  id: a.id,
  vehicleId: a.vehicleId,
  shipmentId: a.vehicleId.replace("TRK-", "SHP-10"),
  type: a.title,
  message: a.detail,
  level: a.severity,
  createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  resolved: a.acknowledged,
}));
let settings = {
  companyName: "CryoGuard AI",
  warningMargin: 2,
  aiHorizonMinutes: 30,
  autoDispatch: false,
  emailAlerts: true,
  smsAlerts: false,
};
let shipments = VEHICLES.map((v, index) => ({
  id: v.shipmentId,
  cargo: v.cargo,
  origin: v.route.split(" → ")[0],
  destination: v.route.split(" → ")[1],
  vehicleId: v.id,
  minTemp: v.minTemp,
  maxTemp: v.maxTemp,
  currentTemp: v.temperature,
  createdAt: new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString(),
  status: index === 3 ? "Delivered" : "In Transit",
  displayStatus:
    v.status === "Critical"
      ? "Critical"
      : v.status === "Warning"
      ? "Delayed"
      : index === 3
      ? "Delivered"
      : "In Transit",
  progress: [72, 45, 88, 100][index],
}));

const vehicles = VEHICLES.map((v, index) => ({
  ...v,
  plate: `PB-${10 + index}AB-${1000 + index}`,
  model: ["Reefer Truck", "Ultra-Cold Van", "Refrigerated Truck", "Hybrid Reefer"][index],
  temp: v.temperature,
  coolingHealth: [85, 94, 48, 65][index],
  tempStatus:
    v.status === "Critical"
      ? "critical"
      : v.status === "Warning"
      ? "warning"
      : "normal",
  status: index === 3 ? "Idle" : "In Transit",
}));

const cargoTypes = [
  { name: "COVID Vaccines", min: -80, max: -60 },
  { name: "Frozen Foods & Meat", min: -22, max: -18 },
  { name: "Dairy & Ice Cream", min: -25, max: -18 },
  { name: "Fresh Produce & Berries", min: 1, max: 4 },
];

const locations = [
  "Chandigarh",
  "Delhi",
  "Mumbai",
  "Pune",
  "Surat",
  "Anand",
];

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

function getSummary() {
  const openAlerts = alerts.filter((a) => !a.resolved);
  const activeShipments = shipments.filter((s) => s.status === "In Transit");

  return {
    activeShipments: activeShipments.length,
    deliveredCount: shipments.filter((s) => s.status === "Delivered").length,
    vehiclesOnRoad: vehicles.filter((v) => v.status === "In Transit").length,
    totalVehicles: vehicles.length,
    delayed: shipments.filter((s) => s.displayStatus === "Delayed").length,
    openAlerts: openAlerts.length,
    criticalAlerts: openAlerts.filter((a) => a.level === "Critical").length,
    onTimePercent: 96,
    statusBreakdown: {
      "On track": shipments.filter((s) => s.displayStatus === "In Transit").length,
      Delayed: shipments.filter((s) => s.displayStatus === "Delayed").length,
      "Temp excursion": shipments.filter((s) => s.displayStatus === "Critical").length,
      Delivered: shipments.filter((s) => s.displayStatus === "Delivered").length,
    },
  };
}

function getAIOverview() {
  return [
    {
      vehicleId: "TRK-03",
      risk: "High",
      summary: "Temperature excursion detected. Inspect the cooling unit and door seal.",
    },
    {
      vehicleId: "TRK-04",
      risk: "Medium",
      summary: "Temperature is above the recommended range.",
    },
  ];
}

export async function api(path, { method = "GET", body } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const url = new URL(path, window.location.origin);
  const route = url.pathname;
  const params = url.searchParams;
  const verb = method.toUpperCase();

  if (route === "/auth/login" && verb === "POST") {
    const user = {
      id: "USR-01",
      name: "Vikram Malhotra",
      role: "Manager",
      email: body?.email || "manager@cryoguard.demo",
    };

    setToken("demo-token");
    return { token: "demo-token", user };
  }

  if (route === "/auth/me") {
    return {
      id: "USR-01",
      name: "Vikram Malhotra",
      role: "Manager",
      email: "manager@cryoguard.demo",
    };
  }
const telemetryMatch = route.match(/^\/vehicles\/([^/]+)\/telemetry$/);

if (telemetryMatch && verb === "GET") {
  const vehicle = vehicles.find((item) => item.id === telemetryMatch[1]);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  const count = Math.min(Number(params.get("limit") || 40), 40);

  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin(index / 3);

    return {
      ts: new Date(Date.now() - (count - index - 1) * 30_000).toISOString(),
      temp: Number((vehicle.temp + wave * 0.4).toFixed(1)),
      humidity: Number(((vehicle.humidity ?? 70) + wave * 2).toFixed(1)),
      vibration: Number(((vehicle.vibration ?? 0.3) + Math.abs(wave) * 0.1).toFixed(2)),
    };
  });
}
  if (route === "/vehicles") return vehicles;

  if (route === "/dashboard/summary") return getSummary();

  if (route === "/shipments" && verb === "GET") {
    return shipments;
  }

  if (route === "/shipments/create" && verb === "POST") {
    const vehicle = vehicles.find((v) => v.id === body?.vehicleId);

    if (!vehicle || vehicle.status !== "Idle") {
      throw new Error("Please select an available vehicle.");
    }

    const shipment = {
      id: `SHP-${1030 + shipments.length}`,
      cargo: body.cargo,
      origin: body.origin,
      destination: body.destination,
      vehicleId: vehicle.id,
      minTemp: Number(body.minTemp),
      maxTemp: Number(body.maxTemp),
      currentTemp: vehicle.temp,
      createdAt: new Date().toISOString(),
      status: "In Transit",
      displayStatus: "In Transit",
      progress: 0,
    };

    shipments = [...shipments, shipment];
    vehicle.status = "In Transit";
    return shipment;
  }

  if (route === "/options") return { cargoTypes, locations };

  if (route === "/ai/overview") return getAIOverview();

  if (route === "/alerts") {
    let result = [...alerts];

    const status = params.get("status");
    const level = params.get("level");
    const limit = Number(params.get("limit") || result.length);

    if (status === "open") result = result.filter((a) => !a.resolved);
    if (status === "resolved") result = result.filter((a) => a.resolved);
    if (level && level !== "All") result = result.filter((a) => a.level === level);

    return result.slice(0, limit);
  }

  const resolveMatch = route.match(/^\/alerts\/([^/]+)\/resolve$/);

  if (resolveMatch && verb === "PATCH") {
    alerts = alerts.map((a) =>
      a.id === resolveMatch[1] ? { ...a, resolved: true } : a
    );
    return { success: true };
  }

  if (route.startsWith("/reports/compliance/")) {
    return { success: true };
  }

  if (route === "/inventory") return INVENTORY_ITEMS;
  if (route === "/settings" && verb === "GET") {
  return settings;
}

if (route === "/settings" && verb === "PUT") {
  settings = { ...body };
  return settings;
}

  if (route === "/users") return SYSTEM_USERS;

  if (route === "/reports") return COMPLIANCE_REPORTS;

  throw new Error(`No mock data configured for ${route}`);
}

export async function downloadFile(path, filename) {
  const content = [
    "CryoGuard AI - Demo Compliance Report",
    `Report: ${filename}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "This is a frontend demo report. No backend is connected.",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename.replace(/\.pdf$/i, ".txt");
  link.click();

  URL.revokeObjectURL(url);
}