import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLive } from "../context/LiveContext.jsx";
import useFetch from "../context/useFetch.js";
import PageHeader from "../components/PageHeader.jsx";
import FleetMap from "../components/FleetMap.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatTime } from "../utils";

const metrics = {
  temp: { label: "Temperature", unit: "°C", color: "#38bdf8" },
  humidity: { label: "Humidity", unit: "%", color: "#a78bfa" },
  vibration: { label: "Vibration", unit: "g", color: "#fbbf24" },
};

const statusLabel = { normal: "Normal", warning: "Warning", critical: "Critical" };

function Monitoring() {
  const { vehicles, tick } = useLive();
  const [selectedId, setSelectedId] = useState("TRK-014");
  const [metric, setMetric] = useState("temp");

  const onRoad = vehicles.filter((v) => v.status === "In Transit");
  // if the selected truck finished its trip, fall back to the first one
  const selected = onRoad.find((v) => v.id === selectedId) || onRoad[0];

  const readings = useFetch(selected ? `/vehicles/${selected.id}/telemetry?limit=40` : "/vehicles", [tick, selected?.id]);
  const chartData = Array.isArray(readings.data) && selected
    ? readings.data.map((r) => ({ ...r, time: formatTime(r.ts) }))
    : [];

  const m = metrics[metric];

  return (
    <>
      <PageHeader title="Live Monitoring" subtitle="Watch every vehicle and its sensors in real time" />

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
                  <StatusBadge status={statusLabel[v.tempStatus]} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="card-box">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h5 className="card-title-text mb-1">
                {selected.id} · {selected.cargo}
              </h5>
              <small className="text-secondary">
                {selected.origin} → {selected.destination} · Driver {selected.driver} · {selected.progress}% of trip done
              </small>
            </div>

            <div className="btn-group btn-group-sm">
              {Object.entries(metrics).map(([key, info]) => (
                <button
                  key={key}
                  className={"btn " + (metric === key ? "btn-info" : "btn-outline-secondary")}
                  onClick={() => setMetric(key)}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3"><div className="mini-stat"><small>Temperature</small><strong>{selected.temp}°C</strong></div></div>
            <div className="col-6 col-md-3"><div className="mini-stat"><small>Humidity</small><strong>{selected.humidity}%</strong></div></div>
            <div className="col-6 col-md-3"><div className="mini-stat"><small>Vibration</small><strong>{selected.vibration} g</strong></div></div>
            <div className="col-6 col-md-3"><div className="mini-stat"><small>Speed</small><strong>{selected.speed} km/h</strong></div></div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#1f2a3a" vertical={false} />
              <XAxis dataKey="time" stroke="#8b98a9" fontSize={12} minTickGap={40} />
              <YAxis stroke="#8b98a9" fontSize={12} domain={metric === "temp" ? [(min) => Math.floor(min - 1), (max) => Math.ceil(max + 1)] : [0, "auto"]} unit={m.unit} allowDecimals={metric !== "temp"} />
              <Tooltip contentStyle={{ background: "#0f1520", border: "1px solid #1f2a3a", borderRadius: 8 }} />
              {metric === "temp" && (
                <>
                  <ReferenceLine y={selected.maxTemp} stroke="#f87171" strokeDasharray="5 5" />
                  <ReferenceLine y={selected.minTemp} stroke="#f87171" strokeDasharray="5 5" />
                </>
              )}
              <Line type="linear" dataKey={metric} name={m.label} stroke={m.color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

export default Monitoring;
