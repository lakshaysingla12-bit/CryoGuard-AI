import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useLive } from "../context/LiveContext.jsx";
import useFetch from "../context/useFetch.js";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatsRow.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import FleetMap from "../components/LiveFleetMap.jsx";
import TeamSupervision from "../components/TeamSupervision.jsx";
import { alertIcon, timeAgo } from "../utils";
import { useAuth } from "../context/AuthContext.jsx";

function Dashboard() {
  const { user } = useAuth();
  const { vehicles, summary, tick, alertCount } = useLive();

  const alerts = useFetch("/alerts?status=open&limit=5", [alertCount]);
  const shipments = useFetch("/shipments", [tick]);

  if (!summary) return <p className="text-secondary">Loading dashboard...</p>;

  const inTransit = (shipments.data || []).filter((s) => s.status === "In Transit").slice(0, 5);
  const shipmentStatuses = [
    { label: "On track", value: summary.statusBreakdown["On track"] || 0, color: "#38bdf8" },
    { label: "Delayed", value: summary.statusBreakdown.Delayed || 0, color: "#fbbf24" },
    { label: "Temp excursion", value: summary.statusBreakdown["Temp excursion"] || 0, color: "#f87171" },
    { label: "Delivered", value: summary.statusBreakdown.Delivered || 0, color: "#4ade80" },
  ];
  const pieData = shipmentStatuses.filter((status) => status.value > 0);

  return (
    <>
      <PageHeader title="Dashboard" subtitle={user?.companyId ? `Cold-chain operations · ${user.companyName}` : "Live overview of your cold chain operations"} />

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
            icon="bi-thermometer-high"
            color="primary"
            value={vehicles.filter((vehicle) => vehicle.tempStatus === "warning" || vehicle.tempStatus === "critical").length}
            label="Vehicles Need Attention"
            note="Based on current sensor readings"
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

      <TeamSupervision />

      {/* ---------- shipments ---------- */}
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
                <Pie data={pieData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none">
                  {pieData.map((status) => <Cell key={status.label} fill={status.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f1520", border: "1px solid #1f2a3a", borderRadius: 8, color: "#e5e9f0" }}
                  labelStyle={{ color: "#e5e9f0" }}
                  itemStyle={{ color: "#e5e9f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="d-flex flex-wrap gap-3 justify-content-center small">
              {shipmentStatuses.map((status) => (
                <span key={status.label}>
                  <i className="bi bi-circle-fill me-1" style={{ color: status.color }} />
                  {status.label} ({status.value})
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
