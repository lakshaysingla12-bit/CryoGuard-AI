import { Link } from "react-router-dom";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLive } from "../context/LiveContext.jsx";
import useFetch from "../context/useFetch.js";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import FleetMap from "../components/FleetMap.jsx";
import { alertIcon, formatTime, timeAgo } from "../utils";

const tooltipStyle = {
  background: "#0f1520",
  border: "1px solid #1f2a3a",
  borderRadius: 8,
  fontSize: 13,
};

const pieColors = {
  "On track": "#38bdf8",
  Delayed: "#fbbf24",
  "Temp excursion": "#f87171",
  Delivered: "#4ade80",
};

function Dashboard() {
  const { vehicles, summary, trend, tick, alertCount } = useLive();

  const alerts = useFetch("/alerts?status=open&limit=5", [alertCount]);
  const ai = useFetch("/ai/overview", [tick]);
  const shipments = useFetch("/shipments", [tick]);

  if (!summary) return <p className="text-secondary">Loading dashboard...</p>;

  const topRisk = ai.data?.[0];
  const trendData = trend.map((p) => ({ ...p, time: formatTime(p.ts) }));
  const pieData = Object.entries(summary.statusBreakdown)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const inTransit = (shipments.data || []).filter((s) => s.status === "In Transit").slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview of your cold chain operations" />

      {/* ---------- summary cards ---------- */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl">
          <StatCard
            icon="bi-box-seam"
            color="success"
            value={summary.activeShipments}
            label="Active Shipments"
            note={`${summary.deliveredCount} delivered so far`}
          />
        </div>
        <div className="col-sm-6 col-xl">
          <StatCard
            icon="bi-truck"
            color="info"
            value={`${summary.vehiclesOnRoad}/${summary.totalVehicles}`}
            label="Vehicles On Road"
            note={`${summary.delayed} currently delayed`}
          />
        </div>
        <div className="col-sm-6 col-xl">
          <StatCard
            icon="bi-thermometer-half"
            color="danger"
            value={summary.openAlerts}
            label="Open Alerts"
            note={`${summary.criticalAlerts} critical`}
          />
        </div>
        <div className="col-sm-6 col-xl">
          <StatCard
            icon="bi-cpu"
            color="primary"
            value={(ai.data || []).filter((a) => a.risk === "High").length}
            label="Vehicles At Risk"
            note="AI forecast for the next 2 hours"
          />
        </div>
        <div className="col-sm-6 col-xl">
          <StatCard
            icon="bi-clock-history"
            color="success"
            value={summary.onTimePercent + "%"}
            label="On-Time Delivery"
            note="Based on delivered shipments"
          />
        </div>
      </div>

      {/* ---------- map and alerts ---------- */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card-box h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title-text mb-0">Live Fleet Tracking</h5>
              <div className="d-flex gap-3 small">
                <span><i className="bi bi-circle-fill text-success me-1"></i>Normal</span>
                <span><i className="bi bi-circle-fill text-warning me-1"></i>Warning</span>
                <span><i className="bi bi-circle-fill text-danger me-1"></i>Critical</span>
              </div>
            </div>
            <FleetMap vehicles={vehicles} height={360} />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-box h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title-text mb-0">Recent Alerts</h5>
              <Link to="/alerts" className="text-decoration-none small">View all</Link>
            </div>

            {alerts.data?.length === 0 && (
              <p className="text-secondary mt-4 text-center">No open alerts. All clear.</p>
            )}

            {alerts.data?.map((a) => (
              <div className="alert-row" key={a.id}>
                <i className={"bi alert-icon " + alertIcon(a.level)}></i>
                <div className="flex-grow-1">
                  <div>{a.type}</div>
                  <small className="text-secondary">{a.vehicleId} · {timeAgo(a.createdAt)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- trend and AI ---------- */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card-box h-100">
            <h5 className="card-title-text mb-1">Temperature Trend (Chilled Shipments)</h5>
            <p className="text-secondary small mb-3">Average and hottest vehicle, updated every 5 seconds</p>

            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2a3a" vertical={false} />
                <XAxis dataKey="time" stroke="#8b98a9" fontSize={12} minTickGap={40} />
                <YAxis
                  stroke="#8b98a9"
                  fontSize={12}
                  unit="°"
                  domain={[0, (max) => Math.max(10, Math.ceil(max + 1))]}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine
                  y={8}
                  stroke="#f87171"
                  strokeDasharray="5 5"
                  label={{ value: "Max limit: 8°C", fill: "#f87171", fontSize: 12, position: "insideTopRight" }}
                />
                <Area type="monotone" dataKey="avg" name="Average" stroke="#38bdf8" strokeWidth={2} fill="url(#avgFill)" />
                <Line type="monotone" dataKey="max" name="Hottest" stroke="#fbbf24" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-box h-100">
            <h5 className="card-title-text">
              <i className="bi bi-cpu text-info me-2"></i>AI Prediction
            </h5>

            {topRisk && topRisk.risk !== "Low" ? (
              <>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <strong>{topRisk.vehicleId}</strong>
                  <StatusBadge status={topRisk.risk} />
                </div>
                <p className="text-secondary">{topRisk.summary}</p>
                <Link to="/ai" className="btn btn-outline-info btn-sm">See full analysis</Link>
              </>
            ) : (
              <p className="text-secondary">
                <i className="bi bi-check-circle text-success me-2"></i>
                No cooling problems expected in the next 2 hours.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- shipments and status chart ---------- */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card-box h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title-text mb-0">Shipments On The Road</h5>
              <Link to="/shipments" className="text-decoration-none small">View all</Link>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Route</th>
                    <th>Temp</th>
                    <th style={{ width: 160 }}>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inTransit.map((s) => (
                    <tr key={s.id}>
                      <td>
                        {s.id}
                        <div className="text-secondary small">{s.cargo}</div>
                      </td>
                      <td>{s.origin} → {s.destination}</td>
                      <td>{s.currentTemp}°C</td>
                      <td>
                        <div className="progress" style={{ height: 6 }}>
                          <div className="progress-bar bg-info" style={{ width: s.progress + "%" }}></div>
                        </div>
                      </td>
                      <td><StatusBadge status={s.displayStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-box h-100">
            <h5 className="card-title-text">Shipment Status</h5>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none">
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={pieColors[d.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            <div className="d-flex flex-wrap gap-3 justify-content-center small">
              {pieData.map((d) => (
                <span key={d.name}>
                  <i className="bi bi-circle-fill me-1" style={{ color: pieColors[d.name] }}></i>
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
