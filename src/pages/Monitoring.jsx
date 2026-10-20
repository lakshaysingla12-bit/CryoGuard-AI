
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
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Monitoring.css";

const API_URL = "http://localhost:3001/vehicles";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

// The allowed range here is a demo rule, not a universal rule for all cargo.
const getTemperatureStatus = (vehicle) => {
  if (
    vehicle.temperature < vehicle.minTemperature ||
    vehicle.temperature > vehicle.maxTemperature
  ) {
    return "Warning";
  }
  return "Normal";
};

const formatTemp = (value) => `${Number(value).toFixed(1)}°C`;

function FitMap({ selectedVehicle, routes }) {
  const map = useMap();

  useEffect(() => {
    if (selectedVehicle && routes[selectedVehicle.id]?.length) {
      map.fitBounds(routes[selectedVehicle.id], { padding: [45, 45] });
    } else if (Object.keys(routes).length) {
      const allPoints = Object.values(routes).flat();
      if (allPoints.length) {
        map.fitBounds(allPoints, { padding: [35, 35] });
      }
    }
  }, [map, selectedVehicle, routes]);

  return null;
}

function Monitoring() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [routes, setRoutes] = useState({});
  const [routeProgress, setRouteProgress] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [editTemperature, setEditTemperature] = useState("4");
  const [editing, setEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not fetch vehicle data.");

      const data = await response.json();
      setVehicles(data);

      setSelectedId((current) =>
        data.some((vehicle) => vehicle.id === current)
          ? current
          : data[0]?.id ?? null
      );
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        `${err.message} Make sure JSON Server is running on port 3001.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    const timer = setInterval(fetchVehicles, 15000);
    return () => clearInterval(timer);
  }, [fetchVehicles]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedId) ?? null,
    [vehicles, selectedId]
  );

  // Fetch actual road geometry from OSRM for every vehicle.
  useEffect(() => {
    if (!vehicles.length) return;

    let cancelled = false;

    async function fetchRoutes() {
      setRouteLoading(true);
      setRouteError("");

      const nextRoutes = {};
      const nextProgress = {};

      try {
        await Promise.all(
          vehicles.map(async (vehicle) => {
            const start = `${vehicle.lng},${vehicle.lat}`;
            // Demo destination coordinates. Replace with stored destination
            // coordinates from your backend when available.
            const destination = DESTINATIONS[vehicle.id];

            if (!destination) return;

            const url =
              `${OSRM_URL}/${start};${destination.lng},${destination.lat}` +
              "?overview=full&geometries=geojson&steps=false";

            const response = await fetch(url);
            if (!response.ok) throw new Error("Routing request failed.");

            const data = await response.json();
            if (data.code !== "Ok" || !data.routes?.[0]) {
              throw new Error(`No road route found for ${vehicle.id}.`);
            }

            const coordinates = data.routes[0].geometry.coordinates.map(
              ([lng, lat]) => [lat, lng]
            );

            nextRoutes[vehicle.id] = coordinates;
            nextProgress[vehicle.id] = 0;
          })
        );

        if (!cancelled) {
          setRoutes((current) => ({ ...current, ...nextRoutes }));
          setRouteProgress((current) => ({ ...current, ...nextProgress }));
        }
      } catch (err) {
        if (!cancelled) {
          setRouteError(
            `${err.message} The public routing service may be busy. Try Refresh Routes.`
          );
        }
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    }

    fetchRoutes();

    return () => {
      cancelled = true;
    };
  }, [vehicles]);

  // Demo movement: markers advance along their calculated road routes.
  // This is simulated movement, not GPS telemetry.
  useEffect(() => {
    const timer = setInterval(() => {
      setRouteProgress((current) => {
        const next = { ...current };

        for (const [vehicleId, points] of Object.entries(routes)) {
          if (points.length > 1) {
            next[vehicleId] = ((current[vehicleId] ?? 0) + 1) % points.length;
          }
        }

        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [routes]);

  // Derive marker positions from route progress.
  const markerPositions = useMemo(() => {
    const positions = {};

    for (const vehicle of vehicles) {
      const points = routes[vehicle.id];
      const index = routeProgress[vehicle.id] ?? 0;

      positions[vehicle.id] =
        points?.length ? points[index] : [vehicle.lat, vehicle.lng];
    }

    return positions;
  }, [vehicles, routes, routeProgress]);

  const visibleVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.id.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.shipmentId.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.origin.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.destination.toLowerCase().includes(search.toLowerCase());

      const status = getTemperatureStatus(vehicle);
      const matchesFilter =
        filter === "All" ||
        (filter === "Warning" && status === "Warning") ||
        (filter === "Normal" && status === "Normal");

      return matchesSearch && matchesFilter;
    });
  }, [vehicles, search, filter]);

  const stats = useMemo(() => {
    const alerts = vehicles.filter(
      (vehicle) => getTemperatureStatus(vehicle) === "Warning"
    ).length;

    return {
      total: vehicles.length,
      normal: vehicles.length - alerts,
      alerts,
      routes: vehicles.filter((vehicle) => vehicle.status === "In Transit")
        .length,
    };
  }, [vehicles]);

  async function saveTemperature() {
    if (!selectedVehicle) return;

    const target = Number(editTemperature);

    if (!Number.isFinite(target) || target < -30 || target > 20) {
      alert("Enter a target temperature between -30°C and 20°C.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/${selectedVehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTemperature: target }),
      });

      if (!response.ok) throw new Error("Could not save temperature setting.");

      const updatedVehicle = await response.json();

      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === selectedVehicle.id
            ? { ...vehicle, ...updatedVehicle }
            : vehicle
        )
      );

      setEditing(false);
    } catch (err) {
      alert(
        `${err.message} Make sure JSON Server is running and the vehicle exists.`
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    if (!selectedVehicle) return;
    setEditTemperature(String(selectedVehicle.targetTemperature));
    setEditing(true);
  }

  function selectVehicle(vehicle) {
    setSelectedId(vehicle.id);
    setEditing(false);
  }

  return (
    <main className="monitoring-page">
      <header className="monitoring-header">
        <div>
          <div className="monitoring-eyebrow">
            <span className="live-dot" />
            OPERATIONS CENTER
          </div>
          <h1>Fleet Monitoring</h1>
          <p>Track cold-chain shipments, routes, and temperature conditions.</p>
        </div>

        <div className="monitoring-header-actions">
          <span className="demo-badge">SIMULATED GPS</span>
          <button
            className="monitoring-refresh"
            onClick={fetchVehicles}
            title="Refresh vehicle data"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
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
          label="Total Vehicles"
          value={loading ? "—" : stats.total}
          detail="Registered fleet"
        />
        <StatCard
          icon={<Route />}
          label="Active Routes"
          value={loading ? "—" : stats.routes}
          detail="Shipments in transit"
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Normal Temperature"
          value={loading ? "—" : stats.normal}
          detail="Within allowed range"
        />
        <StatCard
          icon={<AlertTriangle />}
          label="Temperature Alerts"
          value={loading ? "—" : stats.alerts}
          detail="Outside allowed range"
          warning={stats.alerts > 0}
        />
      </section>

      <section className="monitoring-main-grid">
        <div className="monitoring-panel monitoring-map-panel">
          <div className="monitoring-panel-header">
            <div>
              <h2>Live Fleet Map</h2>
              <p>
                <span className="live-dot" /> Road routes and vehicle positions
              </p>
            </div>
            <span className="map-count">
              <MapPin size={14} /> {vehicles.length} vehicles
            </span>
          </div>

          {routeError && (
            <div className="monitoring-map-message">
              <AlertTriangle size={16} />
              {routeError}
            </div>
          )}

          <div className="monitoring-map">
            <MapContainer
              center={[30.5, 76.8]}
              zoom={6}
              scrollWheelZoom
              className="monitoring-leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {Object.entries(routes).map(([vehicleId, points]) => (
                <Polyline
                  key={vehicleId}
                  positions={points}
                  pathOptions={{
                    color:
                      vehicleId === selectedId ? "#22d3ee" : "#64748b",
                    weight: vehicleId === selectedId ? 5 : 3,
                    opacity: vehicleId === selectedId ? 0.95 : 0.65,
                  }}
                />
              ))}

              {vehicles.map((vehicle) => {
                const position = markerPositions[vehicle.id];
                if (!position) return null;

                const isWarning =
                  getTemperatureStatus(vehicle) === "Warning";

                return (
                  <CircleMarker
                    key={vehicle.id}
                    center={position}
                    radius={vehicle.id === selectedId ? 10 : 7}
                    pathOptions={{
                      color: "#07111f",
                      fillColor: isWarning ? "#fb7185" : "#22d3ee",
                      fillOpacity: 1,
                      weight: vehicle.id === selectedId ? 4 : 2,
                    }}
                    eventHandlers={{
                      click: () => selectVehicle(vehicle),
                    }}
                  >
                    <Popup>
                      <strong>{vehicle.id}</strong>
                      <br />
                      {vehicle.origin} → {vehicle.destination}
                      <br />
                      Temperature: {formatTemp(vehicle.temperature)}
                      <br />
                      Status: {getTemperatureStatus(vehicle)}
                    </Popup>
                  </CircleMarker>
                );
              })}

              <FitMap selectedVehicle={selectedVehicle} routes={routes} />
            </MapContainer>

            <div className="map-legend">
              <span><i className="legend-normal" /> Normal</span>
              <span><i className="legend-warning" /> Temperature alert</span>
              <span><i className="legend-route" /> Road route</span>
            </div>

            {routeLoading && (
              <div className="map-loading">
                <RefreshCw size={15} className="spin-icon" />
                Fetching road routes…
              </div>
            )}
          </div>

          <div className="map-footer">
            <span>
              <LocateFixed size={15} />
              {lastUpdated
                ? `Data refreshed ${lastUpdated.toLocaleTimeString()}`
                : "Waiting for vehicle data"}
            </span>
            <span>Demo movement every 3 seconds</span>
          </div>
        </div>

        <aside className="monitoring-panel vehicle-panel">
          <div className="monitoring-panel-header">
            <div>
              <h2>Fleet Vehicles</h2>
              <p>Select a vehicle to manage it</p>
            </div>
            <span className="vehicle-count">{vehicles.length}</span>
          </div>

          <label className="monitoring-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicle or shipment"
            />
          </label>

          <div className="monitoring-filters">
            {["All", "Normal", "Warning"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="vehicle-list">
            {loading ? (
              <p className="monitoring-empty">Loading vehicles…</p>
            ) : visibleVehicles.length === 0 ? (
              <p className="monitoring-empty">No matching vehicles found.</p>
            ) : (
              visibleVehicles.map((vehicle) => {
                const status = getTemperatureStatus(vehicle);
                const active = vehicle.id === selectedId;

                return (
                  <button
                    className={`vehicle-list-item ${active ? "selected" : ""}`}
                    key={vehicle.id}
                    onClick={() => selectVehicle(vehicle)}
                  >
                    <div className="vehicle-list-icon">
                      <Truck size={19} />
                    </div>
                    <div className="vehicle-list-info">
                      <strong>{vehicle.id}</strong>
                      <span>{vehicle.origin} → {vehicle.destination}</span>
                      <div className="vehicle-list-temperature">
                        <Thermometer size={14} />
                        {formatTemp(vehicle.temperature)}
                      </div>
                    </div>
                    <div className="vehicle-list-right">
                      <span className={`monitoring-status ${status.toLowerCase()}`}>
                        {status}
                      </span>
                      <ChevronRight size={16} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>
      </section>

      {selectedVehicle && (
        <section className="monitoring-panel vehicle-details">
          <div className="monitoring-panel-header details-heading">
            <div>
              <div className="monitoring-eyebrow">SELECTED VEHICLE</div>
              <h2>{selectedVehicle.id}</h2>
              <p>Shipment {selectedVehicle.shipmentId} · {selectedVehicle.driver}</p>
            </div>
            <span
              className={`monitoring-status ${getTemperatureStatus(
                selectedVehicle
              ).toLowerCase()}`}
            >
              {getTemperatureStatus(selectedVehicle)}
            </span>
          </div>

          <div className="vehicle-details-grid">
            <div className="detail-tile">
              <span>Current temperature</span>
              <strong>{formatTemp(selectedVehicle.temperature)}</strong>
              <small>Simulated sensor reading</small>
            </div>
            <div className="detail-tile">
              <span>Target temperature</span>
              <strong>{formatTemp(selectedVehicle.targetTemperature)}</strong>
              <small>Saved setting</small>
            </div>
            <div className="detail-tile">
              <span>Allowed temperature</span>
              <strong>
                {selectedVehicle.minTemperature}° to {selectedVehicle.maxTemperature}°C
              </strong>
              <small>Configured safe range</small>
            </div>
            <div className="detail-tile">
              <span>Shipment route</span>
              <strong className="detail-route">
                {selectedVehicle.origin}
                <Navigation size={15} />
                {selectedVehicle.destination}
              </strong>
              <small>OSRM road route when available</small>
            </div>
          </div>

          <div className="temperature-control">
            <div className="temperature-control-heading">
              <div className="temperature-control-icon">
                <Thermometer size={20} />
              </div>
              <div>
                <h3>Target Temperature Control</h3>
                <p>Update the saved target for this vehicle.</p>
              </div>
            </div>

            {editing ? (
              <div className="temperature-edit-form">
                <label htmlFor="target-temperature">Target temperature (°C)</label>
                <input
                  id="target-temperature"
                  type="number"
                  min="-30"
                  max="20"
                  step="0.1"
                  value={editTemperature}
                  onChange={(event) => setEditTemperature(event.target.value)}
                />
                <button
                  className="monitoring-primary-btn"
                  onClick={saveTemperature}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save setting"}
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
                  <strong>{formatTemp(selectedVehicle.targetTemperature)}</strong>
                  <span>Current saved target</span>
                </div>
                <button
                  className="monitoring-primary-btn"
                  onClick={startEditing}
                >
                  <Thermometer size={16} /> Change target
                </button>
              </div>
            )}
          </div>

          <p className="monitoring-demo-note">
            <Activity size={15} />
            Demo mode: saving changes the backend target setting only. Current
            temperatures and GPS positions are simulated.
          </p>
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

// Demo destination coordinates used by the routing API.
const DESTINATIONS = {
  "CRYO-101": { lat: 28.6139, lng: 77.209 },
  "CRYO-102": { lat: 31.634, lng: 74.8723 },
  "CRYO-103": { lat: 26.9124, lng: 75.7873 },
  "CRYO-104": { lat: 30.7333, lng: 76.7794 },
};

export default Monitoring;
