import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Search,
  Thermometer,
  Truck,
  X,
} from "lucide-react";
import "./Monitoring.css";
import LogoutButton from "../components/LogoutButton.jsx";
import UnifiedTripMap from "../../../../src/components/UI/UnifiedTripMap.jsx";

const API_URL = "/api/vehicles";

const DEFAULT_VEHICLES = [
  {
    id: "TRK-01",
    shipmentId: "SHP-1021",
    cargo: "Frozen salmon and poultry",
    driver: "Priya Singh",
    driverId: "wrk-mcpe-001-01",
    temperature: -19.6,
    temp: -19.6,
    targetTemp: -20,
    minTemp: -22,
    maxTemp: -18,
    minTemperature: -22,
    maxTemperature: -18,
    targetTemperature: -20,
    route: "Mumbai → Pune",
    origin: "Mumbai",
    destination: "Pune",
    originCity: "Mumbai",
    destinationCity: "Pune",
    sourceName: "Mumbai Frozen Foods Processing Plant",
    facilityName: "Pune Frozen Foods Distribution Hub",
    companyName: "Mumbai Coastal Protein Exports",
    eta: "1h 15m (35 km remaining)",
    status: "In Transit",
    speed: "48 km/h",
    progress: 18,
    lat: 18.836,
    lng: 73.258,
  },
  {
    id: "TRK-02",
    shipmentId: "SHP-1022",
    cargo: "mRNA vaccine vials",
    driver: "Rohan Mehta",
    temperature: -68.6,
    temp: -68.6,
    targetTemp: -70,
    minTemp: -80,
    maxTemp: -60,
    minTemperature: -80,
    maxTemperature: -60,
    targetTemperature: -70,
    route: "Pune → Hyderabad",
    origin: "Pune",
    destination: "Hyderabad",
    originCity: "Pune",
    destinationCity: "Hyderabad",
    sourceName: "Pune Vaccine Dispatch Center",
    facilityName: "Hyderabad Vaccine Cold Chain Center",
    companyName: "Pune BioPharma Distributors",
    eta: "3h 45m (180 km remaining)",
    status: "In Transit",
    speed: "64 km/h",
    progress: 31,
    lat: 17.6599,
    lng: 75.9064,
  },
  {
    id: "TRK-03",
    shipmentId: "SHP-1023",
    cargo: "Dairy and ice cream",
    driver: "Amit Verma",
    temperature: -19.4,
    temp: -19.4,
    targetTemp: -20,
    minTemp: -25,
    maxTemp: -18,
    minTemperature: -25,
    maxTemperature: -18,
    targetTemperature: -20,
    route: "Delhi → Nagpur",
    origin: "Delhi",
    destination: "Nagpur",
    originCity: "Delhi",
    destinationCity: "Nagpur",
    sourceName: "Delhi Dairy Collection & Chilling Center",
    facilityName: "Nagpur Dairy Processing & Cold Store",
    companyName: "Delhi Fresh Dairy Cooperative",
    eta: "Delivered at Bay 02",
    status: "Delivered",
    speed: "0 km/h",
    progress: 100,
    lat: 21.1458,
    lng: 79.0882,
  },
];

const getTemperatureStatus = (vehicle) => {
  const temp = Number(vehicle.temperature ?? vehicle.temp ?? 4.0);
  const min = Number(vehicle.minTemperature ?? vehicle.minTemp ?? 2.0);
  const max = Number(vehicle.maxTemperature ?? vehicle.maxTemp ?? 8.0);
  if (temp < min - 2 || temp > max + 2) return "Critical";
  if (temp < min || temp > max) return "Warning";
  return "Normal";
};

const formatTemp = (value) => `${Number(value).toFixed(1)}°C`;

function Monitoring() {
  const session = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
    } catch {
      return null;
    }
  }, []);

  const defaultVehicleId = session?.user?.vehicleId || "TRK-01";

  const [vehicles, setVehicles] = useState(DEFAULT_VEHICLES);
  const [selectedId, setSelectedId] = useState(defaultVehicleId);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editTemperature, setEditTemperature] = useState("-20");
  const [editing, setEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchVehicles = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not fetch vehicle data.");

      const data = await response.json();
      if (Array.isArray(data) && data.length) {
        setVehicles(data);
        setSelectedId((current) =>
          data.some((vehicle) => vehicle.id === current)
            ? current
            : defaultVehicleId || data[0]?.id
        );
      }
      setLastUpdated(new Date());
    } catch {
      // Use fallback default vehicles without failing
      setVehicles(DEFAULT_VEHICLES);
    } finally {
      setLoading(false);
    }
  }, [defaultVehicleId]);

  useEffect(() => {
    fetchVehicles();
    const timer = setInterval(fetchVehicles, 15000);
    return () => clearInterval(timer);
  }, [fetchVehicles]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedId) || vehicles[0] || null,
    [vehicles, selectedId]
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const status = getTemperatureStatus(vehicle);
      const matchesFilter =
        filter === "All" ||
        (filter === "Normal" && status === "Normal") ||
        (filter === "Alerts" && (status === "Warning" || status === "Critical"));

      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        vehicle.id.toLowerCase().includes(term) ||
        (vehicle.route && vehicle.route.toLowerCase().includes(term)) ||
        (vehicle.cargo && vehicle.cargo.toLowerCase().includes(term)) ||
        (vehicle.driver && vehicle.driver.toLowerCase().includes(term));

      return matchesFilter && matchesSearch;
    });
  }, [vehicles, filter, search]);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const normal = vehicles.filter((v) => getTemperatureStatus(v) === "Normal").length;
    const alerts = total - normal;
    const inTransit = vehicles.filter((v) => v.status === "In Transit").length;
    return { total, normal, alerts, routes: inTransit };
  }, [vehicles]);

  const selectVehicle = (vehicle) => {
    setSelectedId(vehicle.id);
    setEditTemperature(String(vehicle.targetTemperature ?? vehicle.targetTemp ?? -20));
    setEditing(false);
  };

  const startEditing = () => {
    if (!selectedVehicle) return;
    setEditTemperature(String(selectedVehicle.targetTemperature ?? selectedVehicle.targetTemp ?? -20));
    setEditing(true);
  };

  const saveTemperature = async () => {
    if (!selectedVehicle) return;
    const parsed = Number(editTemperature);
    if (Number.isNaN(parsed)) return;

    setSaving(true);
    try {
      await fetch(`${API_URL}/${selectedVehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetTemperature: parsed,
          targetTemp: parsed,
        }),
      });

      setVehicles((current) =>
        current.map((v) =>
          v.id === selectedVehicle.id
            ? { ...v, targetTemperature: parsed, targetTemp: parsed }
            : v
        )
      );
      setEditing(false);
    } catch {
      // Local state update
      setVehicles((current) =>
        current.map((v) =>
          v.id === selectedVehicle.id
            ? { ...v, targetTemperature: parsed, targetTemp: parsed }
            : v
        )
      );
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="monitoring-page">
      <header className="monitoring-header">
        <div>
          <span className="monitoring-subtitle">Driver Route & Live Telemetry Radar</span>
          <h1>Monitoring & Route Guidance</h1>
        </div>
        <div className="monitoring-header-actions">
          <span className="monitoring-sync-badge">
            <span className="live-dot" /> Live Map Guidance
          </span>
          <button
            className="monitoring-refresh-btn"
            onClick={fetchVehicles}
            title="Refresh Fleet Telemetry"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <LogoutButton />
        </div>
      </header>

      {error && (
        <div className="monitoring-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={fetchVehicles}>Retry</button>
        </div>
      )}

      <section className="monitoring-stats">
        <StatCard
          icon={<Truck />}
          label="Assigned Vehicle"
          value={selectedVehicle ? selectedVehicle.id : "TRK-01"}
          detail={selectedVehicle?.cargo || "Cold-chain cargo"}
        />
        <StatCard
          icon={<Route />}
          label="Active Route"
          value={selectedVehicle ? `${selectedVehicle.originCity || selectedVehicle.origin} → ${selectedVehicle.destCity || selectedVehicle.destination}` : "Mumbai → Pune"}
          detail={selectedVehicle?.eta || "In Transit"}
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Current Temperature"
          value={selectedVehicle ? formatTemp(selectedVehicle.temperature ?? selectedVehicle.temp ?? -19.6) : "-19.6°C"}
          detail={`Target: ${formatTemp(selectedVehicle?.targetTemp ?? -20)}`}
        />
        <StatCard
          icon={<AlertTriangle />}
          label="Fleet Status"
          value={`${stats.normal}/${stats.total} Normal`}
          detail={stats.alerts > 0 ? `${stats.alerts} excursion warnings` : "All vehicles within spec"}
          warning={stats.alerts > 0}
        />
      </section>

      <section className="monitoring-main-grid">
        <div className="monitoring-panel monitoring-map-panel">
          <div className="monitoring-panel-header">
            <div>
              <h2>Live Fleet Map & Assigned Route</h2>
              <p>
                <span className="live-dot" /> Sender Portal 🏢, Receiver Portal 🏥, and Truck Location 🚚
              </p>
            </div>
            <span className="map-count">
              <MapPin size={14} /> {vehicles.length} vehicles on radar
            </span>
          </div>

          <div className="monitoring-map" style={{ height: "480px" }}>
            <UnifiedTripMap
              trips={filteredVehicles}
              selectedId={selectedId}
              onSelect={(id) => {
                const found = vehicles.find((v) => v.id === id || v.shipmentId === id);
                if (found) selectVehicle(found);
              }}
              height="480px"
              userRole="worker"
            />
          </div>

          <div className="monitoring-map-legend">
            <span className="legend-item">
              <span className="legend-icon-badge">🏢</span>
              <span>Sender Portal (Dispatch)</span>
            </span>
            <span className="legend-item">
              <span className="legend-icon-badge">🏥</span>
              <span>Receiver Portal (Intake)</span>
            </span>
            <span className="legend-item">
              <span className="legend-icon-badge">🚚</span>
              <span>Live Vehicle</span>
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-normal" />
              <span>Normal</span>
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-warning" />
              <span>Warning</span>
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-danger" />
              <span>Critical</span>
            </span>
          </div>
        </div>

        <div className="monitoring-panel monitoring-fleet-panel">
          <div className="monitoring-panel-header">
            <div>
              <h2>Fleet Vehicles</h2>
              <p>Select any vehicle to inspect its route</p>
            </div>
            <span className="vehicle-count">
              <Truck size={13} /> {filteredVehicles.length}
            </span>
          </div>

          <div className="monitoring-filters-bar">
            {["All", "Normal", "Alerts"].map((pill) => (
              <button
                type="button"
                key={pill}
                className={`monitoring-filter-pill ${filter === pill ? "active" : ""}`}
                onClick={() => setFilter(pill)}
              >
                {pill}
              </button>
            ))}
          </div>

          <div className="monitoring-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by vehicle ID, route, cargo, driver…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit" }}
                onClick={() => setSearch("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="vehicle-list">
            {filteredVehicles.map((vehicle) => {
              const isSelected = vehicle.id === selectedId;
              const status = getTemperatureStatus(vehicle);
              return (
                <button
                  type="button"
                  key={vehicle.id}
                  className={`vehicle-list-item ${isSelected ? "selected" : ""}`}
                  onClick={() => selectVehicle(vehicle)}
                >
                  <div className="vehicle-list-icon">
                    <Truck size={18} />
                  </div>

                  <div className="vehicle-list-info">
                    <strong>
                      {vehicle.id} · {vehicle.route || `${vehicle.origin} → ${vehicle.destination}`}
                    </strong>
                    <span>
                      {vehicle.cargo} · Driver: {vehicle.driver || "Priya Singh"}
                    </span>
                    <span className="vehicle-list-temperature">
                      <Thermometer size={13} /> {formatTemp(vehicle.temperature ?? vehicle.temp ?? 4)} (Target: {formatTemp(vehicle.targetTemperature ?? vehicle.targetTemp ?? -20)})
                    </span>
                  </div>

                  <div className="vehicle-list-right">
                    <span
                      className={`monitoring-status ${
                        status.toLowerCase() === "warning"
                          ? "warning"
                          : status.toLowerCase() === "critical"
                          ? "danger"
                          : ""
                      }`}
                    >
                      {status}
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Target Temperature Control for Worker */}
      {selectedVehicle && (
        <section className="monitoring-control-panel">
          <div className="temperature-control">
            <div className="temperature-control-heading">
              <div className="temperature-control-icon">
                <Thermometer size={20} />
              </div>
              <div>
                <h3>Reefer Unit Temperature Control — {selectedVehicle.id}</h3>
                <p>Adjust and verify the refrigeration setpoint for {selectedVehicle.cargo}.</p>
              </div>
            </div>

            {editing ? (
              <div className="temperature-edit-form">
                <label htmlFor="target-temperature">Target temperature (°C)</label>
                <input
                  id="target-temperature"
                  type="number"
                  min="-80"
                  max="20"
                  step="0.5"
                  value={editTemperature}
                  onChange={(event) => setEditTemperature(event.target.value)}
                />
                <button
                  className="monitoring-primary-btn"
                  onClick={saveTemperature}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Setpoint"}
                </button>
                <button
                  className="monitoring-secondary-btn"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            ) : (
              <div className="temperature-control-summary">
                <div>
                  <strong>{formatTemp(selectedVehicle.targetTemperature ?? selectedVehicle.targetTemp ?? -20)}</strong>
                  <span>Current Reefer Setpoint</span>
                </div>
                <button
                  className="monitoring-primary-btn"
                  onClick={startEditing}
                >
                  <Thermometer size={16} /> Adjust Reefer Target
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({ icon, label, value, detail, warning }) {
  return (
    <div className={`monitoring-stat-card ${warning ? "stat-warning" : ""}`}>
      <div className="monitoring-stat-icon">{icon}</div>
      <div className="monitoring-stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

export default Monitoring;
