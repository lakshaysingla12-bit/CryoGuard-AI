const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TOKEN_KEY = "cryoguard_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    ...(options.body && typeof options.body !== "string"
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function api(path, { method = "GET", body } = {}) {
  const url = new URL(path, window.location.origin);
  const route = url.pathname;
  const params = url.searchParams;
  const verb = method.toUpperCase();

  if (route === "/auth/login" && verb === "POST") {
    const users = await request("/users");
    const user = users.find((entry) => entry.role === "Manager") || users[0];
    setToken("demo-token");
    return { token: "demo-token", user: { ...user, email: body?.email || user.email } };
  }
  if (route === "/auth/me") {
    const users = await request("/users");
    return users.find((entry) => entry.role === "Manager") || users[0];
  }

  const telemetryMatch = route.match(/^\/vehicles\/([^/]+)\/telemetry$/);
  if (telemetryMatch && verb === "GET") {
    const readings = await request(`/temperatureReadings?vehicleId=${encodeURIComponent(telemetryMatch[1])}&_sort=timestamp&_order=asc`);
    const limit = Math.min(Number(params.get("limit") || 40), 40);
    return readings.slice(-limit).map((reading) => ({
      ts: reading.timestamp,
      temp: reading.temperature,
      humidity: reading.humidity,
      vibration: reading.vibration,
    }));
  }

  if (route === "/vehicles") return request("/vehicles");

  if (route === "/dashboard/summary") {
    const [vehicles, shipments, alerts] = await Promise.all([
      request("/vehicles"), request("/shipments"), request("/alerts"),
    ]);
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

  if (route === "/shipments" && verb === "GET") {
    let shipments = await request("/shipments");
    const status = params.get("status");
    if (status && status !== "All") shipments = shipments.filter((shipment) => shipment.displayStatus === status || shipment.status === status);
    const query = params.get("q")?.toLowerCase();
    if (query) shipments = shipments.filter((shipment) => `${shipment.id} ${shipment.cargo} ${shipment.origin} ${shipment.destination}`.toLowerCase().includes(query));
    return shipments;
  }

  if (route === "/shipments/create" && verb === "POST") {
    const id = `SHP-${Date.now()}`;
    const vehicle = await request(`/vehicles/${encodeURIComponent(body.vehicleId)}`);
    if (vehicle.status !== "Idle") throw new Error("Please select an available vehicle.");
    const shipment = await request("/shipments", {
      method: "POST",
      body: {
        ...body,
        id,
        minTemp: Number(body.minTemp),
        maxTemp: Number(body.maxTemp),
        currentTemp: vehicle.temp,
        createdAt: new Date().toISOString(),
        status: "In Transit",
        displayStatus: "In Transit",
        progress: 0,
      },
    });
    await request(`/vehicles/${encodeURIComponent(vehicle.id)}`, { method: "PATCH", body: { status: "In Transit", shipmentId: id } });
    return shipment;
  }

  if (route === "/options") {
    const [cargoTypes, locations] = await Promise.all([request("/cargoTypes"), request("/locations")]);
    return { cargoTypes, locations: locations.map((location) => location.name) };
  }

  if (route === "/ai/overview") return [];

  if (route === "/alerts" && verb === "GET") {
    let alerts = await request("/alerts");
    const status = params.get("status");
    const level = params.get("level");
    if (status === "open") alerts = alerts.filter((alert) => !alert.resolved);
    if (status === "resolved") alerts = alerts.filter((alert) => alert.resolved);
    if (level && level !== "All") alerts = alerts.filter((alert) => alert.level === level);
    const limit = Number(params.get("limit") || alerts.length);
    return alerts.slice(0, limit);
  }

  const resolveMatch = route.match(/^\/alerts\/([^/]+)\/resolve$/);
  if (resolveMatch && verb === "PATCH") {
    await request(`/alerts/${encodeURIComponent(resolveMatch[1])}`, { method: "PATCH", body: { resolved: true, status: "resolved" } });
    return { success: true };
  }

  if (route.startsWith("/reports/compliance/")) return { success: true };

  if (route === "/inventory" && verb === "GET") {
    const [items, units] = await Promise.all([request("/inventoryItems"), request("/storageUnits")]);
    return {
      units,
      items: items.map((item) => ({
        ...item,
        unitName: units.find((unit) => unit.id === item.unitId)?.name || item.unitName || "Unknown location",
        status: Number(item.qty) < Number(item.minStock) ? "Low" : "In stock",
      })),
    };
  }

  const inventoryMatch = route.match(/^\/inventory\/([^/]+)$/);
  if (inventoryMatch && verb === "PATCH") {
    const items = await request("/inventoryItems");
    const item = items.find((entry) => entry.sku === inventoryMatch[1]);
    if (!item) throw new Error("Inventory item not found.");
    const qty = Number(body.qty);
    return request(`/inventoryItems/${encodeURIComponent(item.id)}`, { method: "PATCH", body: { qty, status: qty < item.minStock ? "Low" : "In stock" } });
  }

  if (route === "/inventory" && verb === "POST") {
    const items = await request("/inventoryItems");
    if (items.some((item) => item.sku === body.sku)) throw new Error("That SKU already exists.");
    return request("/inventoryItems", {
      method: "POST",
      body: { ...body, id: `inv-${Date.now()}`, category: "General", unitType: "units", currentTemp: 0 },
    });
  }

  if (route === "/settings" && verb === "GET") {
    const settings = await request("/settings");
    return settings[0] || {};
  }
  if (route === "/settings" && verb === "PUT") {
    const settings = await request("/settings");
    const saved = settings[0]
      ? await request(`/settings/${settings[0].id}`, { method: "PATCH", body })
      : await request("/settings", { method: "POST", body: { id: "1", ...body } });
    return saved;
  }

  if (["/users", "/reports"].includes(route)) return request(route);
  return request(`${route}${url.search}`, { method: verb, ...(body === undefined ? {} : { body }) });
}

export async function downloadFile(_path, filename, report) {
  const content = [
    "CryoGuard AI - Demo Compliance Report",
    `Report: ${report?.title || filename}`,
    `Shipment: ${report?.shipmentId || "—"}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Result: ${report?.status || "Pending"}`,
    "",
    "This is a frontend demo report generated from shared JSON data.",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename.replace(/\.pdf$/i, ".txt");
  link.click();
  URL.revokeObjectURL(objectUrl);
}
