import {
  VEHICLES,
  RECENT_ALERTS,
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
let inventoryUnits = [
  { id: "cold-room-1", name: "Vaccine Cold Room", min: 2, max: 8, temp: 4.2, used: 680, capacity: 1000 },
  { id: "freezer-1", name: "Frozen Goods Freezer", min: -25, max: -18, temp: -20.4, used: 420, capacity: 800 },
  { id: "cryo-1", name: "Cryogenic Storage", min: -80, max: -60, temp: -68.1, used: 290, capacity: 500 },
];
let inventoryItems = [
  { sku: "VAC-001", name: "COVID Vaccines", unitId: "cold-room-1", qty: 240, minStock: 100 },
  { sku: "FRZ-014", name: "Frozen Salmon", unitId: "freezer-1", qty: 86, minStock: 100 },
  { sku: "BIO-008", name: "mRNA Vaccine Vials", unitId: "cryo-1", qty: 1250, minStock: 500 },
];
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

  if (route === "/alerts" && verb === "POST") {
    const report = {
      ...body,
      id: body?.id || `ALT-${Date.now()}`,
      createdAt: body?.createdAt || new Date().toISOString(),
      resolved: false,
    };
    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error((await response.text()) || "Unable to report the issue.");
    const savedReport = await response.json();
    alerts = [savedReport, ...alerts];
    return savedReport;
  }

  if (route === "/alerts" && verb === "GET") {
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

  if (route === "/inventory" && verb === "GET") {
    return {
      units: inventoryUnits.map((unit) => ({
        ...unit,
        status: unit.temp < unit.min || unit.temp > unit.max ? "Critical" : "Normal",
      })),
      items: inventoryItems.map((item) => ({
        ...item,
        unitName: inventoryUnits.find((unit) => unit.id === item.unitId)?.name || "Unknown storage",
        status: item.qty < item.minStock ? "Low" : "In Stock",
      })),
    };
  }

  if (route === "/inventory" && verb === "POST") {
    const sku = String(body?.sku || "").trim();
    const name = String(body?.name || "").trim();
    if (!sku || !name) throw new Error("SKU and item name are required.");
    if (inventoryItems.some((item) => item.sku.toLowerCase() === sku.toLowerCase())) {
      throw new Error("An item with this SKU already exists.");
    }
    if (!inventoryUnits.some((unit) => unit.id === body.unitId)) {
      throw new Error("Please select a valid storage unit.");
    }
    const item = { sku, name, unitId: body.unitId, qty: Math.max(0, Number(body.qty) || 0), minStock: Math.max(0, Number(body.minStock) || 0) };
    inventoryItems = [...inventoryItems, item];
    return item;
  }

  const inventoryMatch = route.match(/^\/inventory\/([^/]+)$/);
  if (inventoryMatch && verb === "PATCH") {
    const sku = decodeURIComponent(inventoryMatch[1]);
    const qty = Number(body?.qty);
    if (!Number.isFinite(qty) || qty < 0) throw new Error("Quantity must be zero or greater.");
    const item = inventoryItems.find((entry) => entry.sku === sku);
    if (!item) throw new Error("Inventory item not found.");
    inventoryItems = inventoryItems.map((entry) => entry.sku === sku ? { ...entry, qty } : entry);
    return { success: true };
  }
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

export async function downloadFile(path, filename, report = {}) {
  const clean = (value) => String(value ?? "—")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "");
  const escapePdf = (value) => clean(value).replace(/([\\()])/g, "\\$1");
  const lines = [
    "CryoGuard AI Compliance Report",
    `Report: ${report.title || report.id || filename}`,
    `Report ID: ${report.id || "—"}`,
    `Date: ${report.date || new Date().toLocaleDateString()}`,
    `Auditor: ${report.auditor || "—"}`,
    `Result: ${report.status || "Report copy"}`,
    "",
    "Generated from the report data available in this demo application.",
  ];
  const content = [
    "BT",
    "/F1 16 Tf",
    "50 760 Td",
    `(${escapePdf(lines[0])}) Tj`,
    "/F1 11 Tf",
    ...lines.slice(1).map((line) => `0 -28 Td (${escapePdf(line)}) Tj`),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
