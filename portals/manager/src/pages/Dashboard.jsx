import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { setShipmentStatusFilter } from "../store/dashboardSlice.js";

const shipmentFilterOptions = ["All", "In Transit", "Delayed", "Critical", "Delivered"];

function Dashboard() {
  const { user } = useAuth();
  const { vehicles, summary, tick, alertCount } = useLive();
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const dispatch = useDispatch();
  const shipmentStatusFilter = useSelector((state) => state.dashboard.shipmentStatusFilter);

  const alerts = useFetch("/alerts?status=open&limit=5", [alertCount]);
  const shipments = useFetch("/shipments", [tick]);

  const inTransitVehicles = useMemo(() => {
    return (vehicles || []).filter((v) => {
      const st = String(v.status || v.tripStatus || "").trim().toLowerCase();
      if (st.includes("deliver") || st.includes("dock") || st.includes("complet") || st.includes("idle")) {
        return false;
      }
      return (
        st.includes("transit") ||
        st.includes("en route") ||
        st.includes("on track") ||
        (Number(v.progress || 0) > 0 && Number(v.progress || 0) < 100)
      );
    });
  }, [vehicles]);

  const selectedVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return (vehicles || []).find(
      (v) => v.id === selectedVehicleId || v.shipmentId === selectedVehicleId
    ) || null;
  }, [vehicles, selectedVehicleId]);

  if (!summary) return <p className="text-secondary">Loading dashboard...</p>;

  const inTransit = (shipments.data || []).filter((s) => s.status === "In Transit").slice(0, 5);
  const visibleShipments = (shipments.data || [])
    .filter((shipment) => shipmentStatusFilter === "All" || shipment.displayStatus === shipmentStatusFilter)
    .slice(0, 5);
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
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h5 className="card-title-text mb-0">Live Fleet Tracking</h5>
              <div className="d-flex gap-3 small">
                <span><i className="bi bi-circle-fill text-success me-1"></i>Normal</span>
                <span><i className="bi bi-circle-fill text-warning me-1"></i>Warning</span>
                <span><i className="bi bi-circle-fill text-danger me-1"></i>Critical</span>
              </div>
            </div>
            <FleetMap
              vehicles={inTransitVehicles}
              selectedId={selectedVehicleId}
              onSelect={setSelectedVehicleId}
              height={360}
            />
            {selectedVehicle && (
              <div
                className="mt-2 p-2 rounded d-flex align-items-center justify-content-between"
                style={{
                  background: "rgba(12, 26, 43, 0.95)",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  fontSize: "12px",
                }}
              >
                <div>
                  <span className="text-info fw-bold me-2">🚚 Isolated Vehicle:</span>
                  <span className="fw-bold text-light me-2">{selectedVehicle.id}</span>
                  <span className="text-secondary me-2">({selectedVehicle.cargo})</span>
                  <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-50 me-2">
                    {selectedVehicle.route}
                  </span>
                  <span className="text-light">
                    Temp: <strong>{selectedVehicle.temp ?? selectedVehicle.temperature}°C</strong> · Driver: {selectedVehicle.driver}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info py-0 px-2"
                  style={{ fontSize: "11px" }}
                  onClick={() => setSelectedVehicleId(null)}
                >
                  Show All Fleet ✕
                </button>
              </div>
            )}
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
              <h5 className="card-title-text mb-0">
                {shipmentStatusFilter === "In Transit" ? "Shipments On The Road" : "Shipments"}
              </h5>
              <div className="d-flex align-items-center gap-2 dashboard-shipment-controls">
                <select
                  className="form-select form-select-sm dashboard-shipment-filter"
                  aria-label="Filter dashboard shipments by status"
                  value={shipmentStatusFilter}
                  onChange={(event) => dispatch(setShipmentStatusFilter(event.target.value))}
                >
                  {shipmentFilterOptions.map((status) => (
                    <option key={status} value={status}>{status === "All" ? "All statuses" : status}</option>
                  ))}
                </select>
                <Link to="/shipments" className="text-decoration-none small dashboard-view-all">
                  View all <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </div>
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
                  {visibleShipments.map((s) => (
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
                  {visibleShipments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-secondary py-4">No shipments match this status.</td>
                    </tr>
                  )}
                  {visibleShipments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-secondary py-4">
                        No shipments match this status.
                      </td>
                    </tr>
                  )}
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
