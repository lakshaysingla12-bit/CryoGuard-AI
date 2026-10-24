import { jsPDF } from "jspdf";

const API_BASE = "/api";
const TOKEN_KEY = "cryoguard_token";
const LEGACY_COMPANY_IDS = {
  "CMP-MUM-001": "MCPE-001", "CMP-PUN-002": "PBD-002", "CMP-DEL-003": "DFDC-003",
  "CMP-CHD-004": "CGHP-004", "CMP-AHM-005": "AFF-005", "CMP-SUR-006": "SVL-006",
  "CMP-HYD-007": "HDPU-007", "CMP-BLR-008": "BFFP-008", "CMP-JAI-009": "JFFS-009",
  "CMP-LKO-010": "LPCC-010", "CMP-IDR-011": "IDC-011", "CMP-NAG-012": "NFPC-012",
};

const canonicalCompanyId = (id) => LEGACY_COMPANY_IDS[id] || id;

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

function getDemoScope() {
  const token = getToken();
  if (!token?.startsWith("demo-token:")) return null;
  const parts = token.split(":");
  if (parts[2] === "company" || parts[2] === "facility") return { type: parts[2], id: parts[2] === "company" ? canonicalCompanyId(parts[3]) : parts[3] || null, userId: parts[1] };
  // Accept tokens issued by the earlier hospital-only demo.
  if (parts[2] && parts[2] !== "global") return { type: "facility", id: parts[2], userId: parts[1] };
  return null;
}

function matchesScope(row, scope) {
  if (!scope) return true;
  if (scope.type === "company") return row.companyId === scope.id;
  return (row.facilityId || row.hospitalId) === scope.id;
}

export async function api(path, { method = "GET", body } = {}) {
  const url = new URL(path, window.location.origin);
  const route = url.pathname;
  const params = url.searchParams;
  const verb = method.toUpperCase();

  if (route === "/auth/login" && verb === "POST") {
    const users = await request("/users");
    if (body?.companyManagerId || body?.companyId) {
      const managers = await request("/companyManagers");
      const companies = await request("/companies");
      const manager = managers.find((entry) => entry.id === body.companyManagerId)
        || managers.find((entry) => entry.companyId === canonicalCompanyId(body.companyId));
      const company = companies.find((entry) => entry.id === (manager?.companyId || canonicalCompanyId(body.companyId)));
      if (!manager || !company) throw new Error("Company manager ID not found.");
      const user = { ...manager, role: "Manager", accountType: "Company Manager", companyId: company.id, companyName: company.name };
      const token = `demo-token:${manager.id}:company:${company.id}`;
      setToken(token);
      return { token, user };
    }
    if (body?.hospitalId || body?.facilityId) {
      const facilityId = String(body.facilityId || body.hospitalId).trim().toUpperCase();
      const facilities = await request("/facilities").catch(() => request("/hospitals"));
      const facility = facilities.find((entry) => entry.id.toUpperCase() === facilityId);
      const auditor = facility && users.find((entry) => entry.role === "Auditor" && (entry.facilityId === facility.id || entry.hospitalId === facility.id));
      if (!facility || !auditor) throw new Error("Facility ID not found or no auditor is assigned to it.");
      const token = `demo-token:${auditor.id}:facility:${facility.id}`;
      setToken(token);
      return { token, user: { ...auditor, facilityId: facility.id, facilityName: facility.name, ...(facility.type === "Hospital" ? { hospitalId: facility.id, hospitalName: facility.name } : {}) } };
    }
    const user = users.find((entry) => entry.role === "Manager") || users[0];
    const token = `demo-token:${user.id}:global`;
    setToken(token);
    return { token, user: { ...user, email: body?.email || user.email } };
  }
  if (route === "/auth/me") {
    const users = await request("/users");
    const savedToken = getToken();
    const scope = getDemoScope();
    const userId = savedToken?.startsWith("demo-token:") ? savedToken.split(":")[1] : null;
    if (scope?.type === "company") {
      const manager = (await request("/companyManagers")).find((entry) => entry.id === userId);
      return manager ? { ...manager, role: "Manager", accountType: "Company Manager", companyId: manager.companyId } : null;
    }
    return users.find((entry) => entry.id === userId) || users.find((entry) => entry.role === "Manager") || users[0];
  }

  const telemetryMatch = route.match(/^\/vehicles\/([^/]+)\/telemetry$/);
  if (telemetryMatch && verb === "GET") {
    const scope = getDemoScope();
    if (scope) {
      const vehicles = await request("/vehicles");
      const vehicle = vehicles.find((entry) => entry.id === telemetryMatch[1]);
      if (!matchesScope(vehicle || {}, scope)) throw new Error("This vehicle is outside your assigned company or facility.");
    }
    const readings = await request(`/temperatureReadings?vehicleId=${encodeURIComponent(telemetryMatch[1])}&_sort=timestamp&_order=asc`);
    const limit = Math.min(Number(params.get("limit") || 40), 40);
    return readings.slice(-limit).map((reading) => ({
      ts: reading.timestamp,
      temp: reading.temperature,
      humidity: reading.humidity,
      vibration: reading.vibration,
    }));
  }

  if (route === "/vehicles") {
    const vehicles = await request("/vehicles");
    const scope = getDemoScope();
    return scope ? vehicles.filter((vehicle) => matchesScope(vehicle, scope)) : vehicles;
  }

  if (route === "/dashboard/summary") {
    let [vehicles, shipments, alerts] = await Promise.all([
      request("/vehicles"), request("/shipments"), request("/alerts"),
    ]);
    const scope = getDemoScope();
    if (scope) {
      vehicles = vehicles.filter((vehicle) => matchesScope(vehicle, scope));
      shipments = shipments.filter((shipment) => matchesScope(shipment, scope));
      alerts = alerts.filter((alert) => matchesScope(alert, scope));
    }
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
    const scope = getDemoScope();
    if (scope) shipments = shipments.filter((shipment) => matchesScope(shipment, scope));
    const status = params.get("status");
    if (status && status !== "All") shipments = shipments.filter((shipment) => shipment.displayStatus === status || shipment.status === status);
    const query = params.get("q")?.toLowerCase();
    if (query) shipments = shipments.filter((shipment) => `${shipment.id} ${shipment.cargo} ${shipment.origin} ${shipment.destination}`.toLowerCase().includes(query));
    const facilities = await request("/facilities");
    const users = await request("/users");
    return shipments.map((shipment) => {
      const facilityId = shipment.facilityId || shipment.destinationFacilityId;
      const facility = facilities.find((entry) => entry.id === facilityId);
      const auditor = facility && users.find((entry) => entry.id === facility.auditorId);
      return {
        ...shipment,
        auditorId: shipment.auditorId || facility?.auditorId || "",
        auditorName: shipment.auditorName || auditor?.name || facility?.auditorName || "Unassigned",
      };
    });
  }

  if (route === "/shipments/create" && verb === "POST") {
    const id = `SHP-${Date.now()}`;
    const vehicle = await request(`/vehicles/${encodeURIComponent(body.vehicleId)}`);
    if (vehicle.status !== "Idle") throw new Error("Please select an available vehicle.");
    const scope = getDemoScope();
    const facilities = await request("/facilities");
    const sources = await request("/sources");
    const source = sources.find((entry) => entry.id === body.sourceId && entry.cargoCategory === body.cargo)
      || sources.find((entry) => entry.location === body.origin && entry.cargoCategory === body.cargo);
    if (!source) throw new Error("No cargo source is configured for this cargo type and city yet.");
    if (scope?.type === "company" && source.companyId !== scope.id) throw new Error("This source is outside your company.");
    if (scope?.type === "company" && vehicle.companyId !== scope.id) throw new Error("Select a vehicle assigned to your company.");
    const facility = facilities.find((entry) => entry.id === body.destinationFacilityId && entry.cargoType === body.cargo)
      || facilities.find((entry) => entry.location === body.destination && entry.cargoType === body.cargo);
    if (!facility) throw new Error("No receiving facility is configured for this cargo type and city yet.");
    const destination = `${facility.name}, ${facility.location}`;
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 1);
    const shipment = await request("/shipments", {
      method: "POST",
      body: {
        ...body,
        id,
        category: body.cargo,
        originCity: source.location,
        sourceName: source.name,
        sourceLocation: `${source.name}, ${source.location}`,
        companyId: source.companyId,
        companyName: source.companyName,
        companyManagerId: source.managerId,
        companyManagerName: source.managerName,
        destinationCity: facility.location,
        destinationFacilityId: facility.id,
        destination,
        route: `${source.companyName} · ${source.name}, ${source.location} → ${destination}`,
        facilityId: facility.id,
        facilityName: facility.name,
        destinationOrganizationId: facility.organizationId || facility.id,
        destinationOrganizationName: facility.organizationName || facility.name,
        destinationOrganizationType: facility.organizationType || facility.type || facility.facilityType,
        facilityType: facility.facilityType || facility.type,
        auditorId: facility.auditorId,
        auditorName: facility.auditorName || "Unassigned",
        hospitalId: facility.type === "Hospital" ? facility.id : "",
        hospitalName: facility.type === "Hospital" ? facility.name : "",
        workerId: vehicle.driverId,
        workerName: vehicle.driver,
        minTemp: Number(body.minTemp),
        maxTemp: Number(body.maxTemp),
        currentTemp: vehicle.temp,
        createdAt: new Date().toISOString(),
        expectedDeliveryDate: expectedDeliveryDate.toISOString().slice(0, 10),
        status: "In Transit",
        displayStatus: "In Transit",
        progress: 0,
      },
    });
    await request(`/vehicles/${encodeURIComponent(vehicle.id)}`, {
      method: "PATCH",
      body: {
        status: "In Transit", shipmentId: id, origin: source.location,
        originCity: source.location, sourceName: source.name,
        companyId: source.companyId, companyName: source.companyName,
        companyManagerId: source.managerId, companyManagerName: source.managerName,
        destination: facility.location, destinationCity: facility.location,
        destinationFacilityId: facility.id, facilityId: facility.id,
        facilityName: facility.name, route: `${body.origin} → ${facility.location}`,
        hospitalId: facility.type === "Hospital" ? facility.id : "",
      },
    });
    return shipment;
  }

  if (route === "/options") {
    const [cargoTypes, locations, facilities, sources] = await Promise.all([request("/cargoTypes"), request("/locations"), request("/facilities"), request("/sources")]);
    const scope = getDemoScope();
    const visibleSources = scope?.type === "company" ? sources.filter((source) => source.companyId === scope.id) : sources;
    const visibleCargoTypes = scope?.type === "company"
      ? cargoTypes.filter((cargoType) => visibleSources.some((source) => source.cargoCategory === cargoType.name))
      : cargoTypes;
    return { cargoTypes: visibleCargoTypes, locations: locations.map((location) => location.name), facilities, sources: visibleSources };
  }

  if (route === "/ai/overview") return [];

  if (route === "/alerts" && verb === "GET") {
    let alerts = await request("/alerts");
    const scope = getDemoScope();
    if (scope) alerts = alerts.filter((alert) => matchesScope(alert, scope));
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
    const alert = await request(`/alerts/${encodeURIComponent(resolveMatch[1])}`);
    const scope = getDemoScope();
    if (scope && !matchesScope(alert, scope)) throw new Error("This alert is outside your company or facility.");
    await request(`/alerts/${encodeURIComponent(resolveMatch[1])}`, { method: "PATCH", body: { resolved: true, status: "resolved" } });
    return { success: true };
  }

  if (route.startsWith("/reports/compliance/")) return { success: true };

  if (route === "/inventory" && verb === "GET") {
    const [items, units] = await Promise.all([request("/inventoryItems"), request("/storageUnits")]);
    const scope = getDemoScope();
    const visibleItems = scope?.type === "company" ? items.filter((item) => item.companyId === scope.id) : items;
    const unitIds = new Set(visibleItems.map((item) => item.unitId).filter(Boolean));
    return {
      units: scope?.type === "company" ? units.filter((unit) => unitIds.has(unit.id)) : units,
      items: visibleItems.map((item) => ({
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
    const scope = getDemoScope();
    if (scope?.type === "company" && item.companyId !== scope.id) throw new Error("This inventory item belongs to another company.");
    const qty = Number(body.qty);
    return request(`/inventoryItems/${encodeURIComponent(item.id)}`, { method: "PATCH", body: { qty, status: qty < item.minStock ? "Low" : "In stock" } });
  }

  if (route === "/inventory" && verb === "POST") {
    const items = await request("/inventoryItems");
    if (items.some((item) => item.sku === body.sku)) throw new Error("That SKU already exists.");
    const scope = getDemoScope();
    const company = scope?.type === "company" ? (await request("/companies")).find((entry) => entry.id === scope.id) : null;
    return request("/inventoryItems", {
      method: "POST",
      body: { ...body, ...(company ? { companyId: company.id, companyName: company.name } : {}), id: `inv-${Date.now()}`, category: body.category || company?.cargoCategory || "General", unitType: body.unitType || "units", currentTemp: 0 },
    });
  }

  if (route === "/settings" && verb === "GET") {
    const settings = await request("/settings");
    const scope = getDemoScope();
    return (scope?.type === "company"
      ? settings.find((entry) => entry.companyId === scope.id)
      : settings[0]) || {};
  }
  if (route === "/settings" && verb === "PUT") {
    const settings = await request("/settings");
    const scope = getDemoScope();
    if (scope?.type === "facility") throw new Error("Only company managers can update company settings.");
    const current = scope?.type === "company"
      ? settings.find((entry) => entry.companyId === scope.id)
      : settings[0];
    const company = scope?.type === "company"
      ? (await request("/companies")).find((entry) => entry.id === scope.id)
      : null;
    const saved = current
      ? await request(`/settings/${current.id}`, { method: "PATCH", body: { ...body, ...(company ? { companyId: scope.id, companyName: company.name } : {}) } })
      : await request("/settings", { method: "POST", body: { id: "1", ...body } });
    return saved;
  }

  if (route === "/myProfile" && verb === "GET") {
    const profiles = await request("/myProfile");
    const scope = getDemoScope();
    return scope?.type === "company"
      ? profiles.find((profile) => profile.userId === scope.userId) || null
      : profiles[0] || null;
  }

  const profileMatch = route.match(/^\/myProfile\/([^/]+)$/);
  if (profileMatch && verb === "PATCH") {
    const scope = getDemoScope();
    if (scope?.type === "facility") throw new Error("Auditor profile editing is not available in the manager portal.");
    const profile = await request(`/myProfile/${encodeURIComponent(profileMatch[1])}`);
    if (scope?.type === "company" && profile.userId !== scope.userId) throw new Error("You can only update your own manager profile.");
    const saved = await request(`/myProfile/${encodeURIComponent(profileMatch[1])}`, { method: "PATCH", body });
    if (scope?.type === "company") {
      await request(`/companyManagers/${encodeURIComponent(scope.userId)}`, { method: "PATCH", body: { name: saved.name, email: saved.email, location: saved.location, phone: saved.phone } });
    }
    return saved;
  }

  if (route === "/assignments" && verb === "GET") {
    const assignments = await request("/assignments");
    const scope = getDemoScope();
    return scope ? assignments.filter((assignment) => matchesScope(assignment, scope)) : assignments;
  }

  if (route === "/assignments" && verb === "POST") {
    const scope = getDemoScope();
    if (scope?.type === "company" && body.companyId !== scope.id) throw new Error("Tasks can only be assigned within your company.");
    if (scope?.type === "facility") throw new Error("Receiving auditors cannot assign worker tasks.");
    if (scope?.type === "company") {
      const [worker, shipment] = await Promise.all([
        request(`/users/${encodeURIComponent(body.workerId)}`),
        body.shipmentId ? request(`/shipments/${encodeURIComponent(body.shipmentId)}`) : Promise.resolve(null),
      ]);
      if (worker.companyId !== scope.id || worker.role !== "Worker") throw new Error("Choose a worker from your company.");
      if (shipment && shipment.companyId !== scope.id) throw new Error("This shipment is outside your company.");
    }
    return request(route, { method: verb, body });
  }

  const assignmentMatch = route.match(/^\/assignments\/([^/]+)$/);
  if (assignmentMatch && verb === "PATCH") {
    const assignment = await request(`/assignments/${encodeURIComponent(assignmentMatch[1])}`);
    const scope = getDemoScope();
    if (scope && !matchesScope(assignment, scope)) throw new Error("This task is outside your company or facility.");
    if (scope?.type === "facility") throw new Error("Receiving auditors cannot edit worker tasks.");
    if (scope?.type === "company") {
      const worker = await request(`/users/${encodeURIComponent(body.workerId || assignment.workerId)}`);
      if (worker.companyId !== scope.id || worker.role !== "Worker") throw new Error("Choose a worker from your company.");
      if (body.shipmentId) {
        const shipment = await request(`/shipments/${encodeURIComponent(body.shipmentId)}`);
        if (shipment.companyId !== scope.id) throw new Error("This shipment is outside your company.");
      }
    }
    return request(route, { method: verb, body });
  }

  if (route === "/reports" && verb === "GET") {
    const reports = await request("/reports");
    const scope = getDemoScope();
    return scope ? reports.filter((report) => matchesScope(report, scope)) : reports;
  }

  if (route === "/reports" && verb === "POST") {
    const scope = getDemoScope();
    if (scope?.type !== "facility") throw new Error("Only the receiving facility auditor can submit an audit report.");
    const shipment = (await request("/shipments")).find((entry) => entry.id === body.shipmentId);
    if (!shipment || shipment.facilityId !== scope.id) throw new Error("This shipment is not assigned to your receiving facility.");
    const auditor = (await request("/users")).find((entry) => entry.id === scope.userId);
    const temperatureAtDelivery = Number(body.temperatureAtDelivery);
    if (!Number.isFinite(temperatureAtDelivery)) throw new Error("Enter the cargo temperature recorded at delivery.");
    const temperatureWithinRange = temperatureAtDelivery >= shipment.minTemp && temperatureAtDelivery <= shipment.maxTemp;
    const status = temperatureWithinRange && body.qualityCondition === "Good" && body.packagingCondition === "Intact"
      ? "Passed"
      : "Needs review";
    return request(route, { method: verb, body: {
      ...body,
      id: body.id || `RPT-${Date.now()}`,
      title: body.title || `Delivery audit · ${shipment.id}`,
      shipmentId: shipment.id,
      companyId: shipment.companyId,
      companyName: shipment.companyName,
      companyManagerId: shipment.companyManagerId,
      companyManagerName: shipment.companyManagerName,
      sourceName: shipment.sourceName,
      originCity: shipment.originCity,
      facilityId: shipment.facilityId,
      facilityName: shipment.facilityName,
      auditorId: scope.userId,
      auditor: auditor?.name || "Receiving auditor",
      temperatureAtDelivery,
      temperatureUnit: "°C",
      temperatureWithinRange,
      status,
      auditedAt: new Date().toISOString(),
      date: body.date || new Date().toISOString().slice(0, 10),
    } });
  }

  if (route === "/hospitals" && verb === "GET") {
    const hospitals = await request("/hospitals");
    const scope = getDemoScope();
    return scope?.type === "facility" ? hospitals.filter((hospital) => hospital.id === scope.id) : hospitals;
  }

  if (route === "/facilities" && verb === "GET") {
    const facilities = await request("/facilities");
    const scope = getDemoScope();
    return scope?.type === "facility" ? facilities.filter((facility) => facility.id === scope.id) : facilities;
  }

  if (route === "/destination-auditors" && verb === "GET") {
    const [shipments, facilities, users] = await Promise.all([
      request("/shipments"), request("/facilities"), request("/users"),
    ]);
    const scope = getDemoScope();
    const visibleShipments = scope ? shipments.filter((shipment) => matchesScope(shipment, scope)) : shipments;
    const facilityIds = new Set(visibleShipments.map((shipment) => shipment.facilityId || shipment.destinationFacilityId).filter(Boolean));
    return facilities.filter((facility) => facilityIds.has(facility.id)).map((facility) => {
      const auditor = users.find((entry) => entry.id === facility.auditorId)
        || users.find((entry) => entry.role === "Auditor" && (entry.facilityId || entry.hospitalId) === facility.id);
      return {
        id: facility.id,
        loginId: facility.id,
        name: auditor?.name || facility.auditorName || "Auditor not assigned",
        email: auditor?.email || "",
        role: "Auditor",
        facilityId: facility.id,
        facilityName: facility.name,
        facilityType: facility.facilityType || facility.type,
        location: facility.location,
      };
    });
  }

  if (route === "/companies" && verb === "GET") {
    const companies = await request(route);
    const scope = getDemoScope();
    return scope?.type === "company" ? companies.filter((company) => company.id === scope.id) : companies;
  }

  if (route === "/companyManagers" && verb === "GET") {
    const managers = await request(route);
    const scope = getDemoScope();
    return scope?.type === "company" ? managers.filter((manager) => manager.companyId === scope.id) : managers;
  }

  if (route === "/portal-options" && verb === "GET") {
    return { companyManagers: await request("/companyManagers") };
  }

  if (route === "/sources" && verb === "GET") {
    const sources = await request(route);
    const scope = getDemoScope();
    return scope?.type === "company" ? sources.filter((source) => source.companyId === scope.id) : sources;
  }

  if (route === "/users" && verb === "GET") {
    const users = await request(route);
    const scope = getDemoScope();
    if (scope?.type === "company") return users.filter((user) => user.role === "Worker" && user.companyId === scope.id);
    if (scope?.type === "facility") return users.filter((user) => user.role === "Auditor" && (user.facilityId || user.hospitalId) === scope.id);
    return users;
  }

  if (route === "/users" && verb === "POST") {
    const scope = getDemoScope();
    if (scope?.type === "company") {
      if (body.role !== "Worker") throw new Error("Company managers can add worker accounts only.");
      const [company, manager] = await Promise.all([
        request("/companies").then((rows) => rows.find((entry) => entry.id === scope.id)),
        request("/companyManagers").then((rows) => rows.find((entry) => entry.id === scope.userId)),
      ]);
      return request(route, { method: verb, body: {
        ...body,
        companyId: scope.id,
        companyName: company?.name || "",
        companyManagerId: scope.userId,
        companyManagerName: manager?.name || "",
        sourceName: company?.sourceName || "",
        location: body.location || company?.sourceLocation || "",
      } });
    }
    if (scope?.type === "facility") throw new Error("Auditors cannot create worker accounts.");
    return request(route, { method: verb, body });
  }

  const userMatch = route.match(/^\/users\/([^/]+)$/);
  if (userMatch && (verb === "PATCH" || verb === "DELETE")) {
    const current = await request(`/users/${encodeURIComponent(userMatch[1])}`);
    const scope = getDemoScope();
    if (scope?.type === "company" && (current.role !== "Worker" || current.companyId !== scope.id)) throw new Error("This worker is outside your company.");
    if (scope?.type === "company" && body?.role && body.role !== "Worker") throw new Error("Company managers can manage workers only.");
    if (scope?.type === "facility") throw new Error("Auditors cannot edit users here.");
    if (verb === "DELETE") return request(route, { method: verb });
    const company = scope?.type === "company" ? (await request("/companies")).find((entry) => entry.id === scope.id) : null;
    return request(route, { method: verb, body: { ...body, ...(scope?.type === "company" ? { companyId: scope.id, companyName: company?.name || "" } : {}) } });
  }

  if (route === "/messages" && verb === "GET") {
    const messages = await request(route);
    const scope = getDemoScope();
    return scope?.type === "company" ? messages.filter((message) => message.companyId === scope.id) : messages;
  }

  if (route === "/messages" && verb === "POST") {
    const scope = getDemoScope();
    if (scope?.type === "company" && body.companyId !== scope.id) throw new Error("You can only message workers in your company.");
    if (scope?.type === "company") {
      const recipient = await request(`/users/${encodeURIComponent(body.toUserId || body.workerId)}`);
      if (recipient.companyId !== scope.id || recipient.role !== "Worker") throw new Error("You can only message workers in your company.");
    }
    return request(route, { method: verb, body });
  }

  if (route === "/alerts" && verb === "POST") {
    const scope = getDemoScope();
    if (scope?.type === "facility") throw new Error("Receiving auditors cannot create operational alerts here.");
    if (scope?.type === "company" && body.companyId !== scope.id) throw new Error("You can only create alerts for your company.");
    return request(route, { method: verb, body });
  }

  if (route === "/users") return request(route);
  return request(`${route}${url.search}`, { method: verb, ...(body === undefined ? {} : { body }) });
}

export async function downloadFile(_path, filename, report = {}) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const left = 18;
  const right = 192;
  let y = 24;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(14, 116, 144);
  pdf.text("CryoGuard AI", left, y);
  y += 9;
  pdf.setFontSize(13);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Compliance Report", left, y);
  y += 5;
  pdf.setDrawColor(56, 189, 248);
  pdf.line(left, y, right, y);
  y += 9;

  const details = [
    ["Report", report.title || "Shipment compliance report"],
    ["Shipment", report.shipmentId || report.id || "—"],
    ["Cargo", report.cargo || report.category || "—"],
    ["Source company", `${report.companyName || "—"}${report.companyId ? ` (${report.companyId})` : ""}`],
    ["Dispatch source", `${report.sourceName || report.sourceLocation || report.origin || "—"}${report.originCity ? ` · ${report.originCity}` : ""}`],
    ["Destination", `${report.facilityName || report.hospitalName || report.destination || "—"}${report.facilityId || report.hospitalId ? ` (${report.facilityId || report.hospitalId})` : ""}`],
    ["Auditor", report.auditorName || report.auditor || "—"],
    ["Vehicle", report.vehicleId || "—"],
    ["Safe temperature range", report.minTemp != null || report.maxTemp != null ? `${report.minTemp ?? "—"}°C to ${report.maxTemp ?? "—"}°C` : "—"],
    ["Temperature at delivery", report.temperatureAtDelivery != null ? `${report.temperatureAtDelivery}${report.temperatureUnit || "°C"}` : report.currentTemp != null || report.temp != null ? `${report.currentTemp ?? report.temp}°C` : "—"],
    ["Temperature within range", report.temperatureWithinRange === undefined ? "Not recorded" : report.temperatureWithinRange ? "Yes" : "No"],
    ["Cargo condition", report.qualityCondition || "Not recorded"],
    ["Packaging condition", report.packagingCondition || "Not recorded"],
    ["Audit notes", report.auditNotes || "—"],
    ["Shipment status", report.displayStatus || report.status || "Pending"],
    ["Report result", report.status || "Pending"],
    ["Generated", new Date().toLocaleString("en-IN")],
  ];

  pdf.setFontSize(10);
  for (const [label, rawValue] of details) {
    const value = String(rawValue);
    const lines = pdf.splitTextToSize(value, 126);
    const rowHeight = Math.max(7, lines.length * 5);
    if (y + rowHeight > 278) {
      pdf.addPage();
      y = 20;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(71, 85, 105);
    pdf.text(`${label}:`, left, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(15, 23, 42);
    pdf.text(lines, 66, y);
    y += rowHeight;
  }

  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Generated from CryoGuard AI demo data.", left, Math.min(y + 5, 287));
  pdf.save(filename.replace(/\.(pdf|txt)$/i, "") + ".pdf");
}
