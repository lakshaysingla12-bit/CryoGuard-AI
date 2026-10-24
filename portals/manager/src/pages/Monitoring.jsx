import { useState } from "react";
import { useLive } from "../context/LiveContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import FleetMap from "../components/LiveFleetMap.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import StatsRow from "../components/StatsRow.jsx";

const statusLabel = { normal: "Normal", warning: "Warning", critical: "Critical" };

function getTemperatureStatus(vehicle) {
  const status = String(vehicle.tempStatus || "").toLowerCase();
  if (statusLabel[status]) return status;

  const temperature = Number(vehicle.temp ?? vehicle.temperature);
  const min = Number(vehicle.minTemp);
  const max = Number(vehicle.maxTemp);
  if (Number.isFinite(temperature) && Number.isFinite(min) && Number.isFinite(max)) {
    return temperature < min || temperature > max ? "warning" : "normal";
  }
  return "normal";
}

function Monitoring() {
  const { vehicles } = useLive();
  const [selectedId, setSelectedId] = useState("TRK-01");

  const onRoad = vehicles
    .filter((v) => v.status === "In Transit")
    .sort((a, b) => {
      const priority = { critical: 0, warning: 1, normal: 2 };
      return (priority[getTemperatureStatus(a)] ?? 3) - (priority[getTemperatureStatus(b)] ?? 3);
    });
  const needsAttention = onRoad.filter((v) => ["warning", "critical"].includes(getTemperatureStatus(v))).length;
  const criticalCount = onRoad.filter((v) => getTemperatureStatus(v) === "critical").length;
  // if the selected truck finished its trip, fall back to the first one
  const selected = onRoad.find((v) => v.id === selectedId) || onRoad[0];
  const formattedSpeed = selected?.speed == null || selected.speed === ""
    ? "—"
    : `${String(selected.speed).replace(/\s*km\/h$/i, "")} km/h`;

  return (
    <>
      <PageHeader title="Live Monitoring" subtitle="Watch every vehicle and its sensors in real time" />

      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-truck" color="info" value={onRoad.length} label="Vehicles on the road" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-exclamation-triangle" color="warning" value={needsAttention} label="Need attention" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-thermometer-high" color="danger" value={criticalCount} label="Critical temperature" />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className="card-box h-100">
            <FleetMap vehicles={vehicles} selectedId={selected?.id} onSelect={setSelectedId} height={420} />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-box h-100 vehicle-list">
            <h5 className="card-title-text">Vehicles</h5>
            {onRoad.map((v) => (
              <button
                key={v.id}
                className={"vehicle-item" + (v.id === selected?.id ? " selected" : "")}
                onClick={() => setSelectedId(v.id)}
              >
                <div>
                  <div className="fw-semibold">{v.id}</div>
                  <small className="text-secondary">{v.cargo}</small>
                </div>
                <div className="text-end">
                  <div>{v.temp}°C</div>
                  <StatusBadge status={statusLabel[getTemperatureStatus(v)]} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="card-box">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h5 className="card-title-text mb-1">
                {selected.id} · {selected.cargo}
              </h5>
              <small className="text-secondary">
                {selected.origin} → {selected.destination} · Driver {selected.driver} · {selected.progress}% of trip done
              </small>
            </div>
            <StatusBadge status={statusLabel[getTemperatureStatus(selected)]} />
          </div>

          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="mini-stat"><small>Temperature</small><strong>{selected.temp}°C</strong></div>
            </div>
            <div className="col-6 col-md-3">
              <div className="mini-stat"><small>Humidity</small><strong>{selected.humidity}%</strong></div>
            </div>
            <div className="col-6 col-md-3">
              <div className="mini-stat"><small>Vibration</small><strong>{selected.vibration} g</strong></div>
            </div>
            <div className="col-6 col-md-3">
              <div className="mini-stat"><small>Speed</small><strong>{formattedSpeed}</strong></div>
            </div>
          </div>
        </div>
      )}
      {!selected && (
        <div className="card-box text-center text-secondary">
          No vehicles are currently on the road.
        </div>
      )}
    </>
  );
}

export default Monitoring;
