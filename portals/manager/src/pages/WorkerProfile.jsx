import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import StatsRow from "../components/StatsRow.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import WorkerTasksPanel from "../components/WorkerTasksPanel.jsx";
import useFetch from "../context/useFetch.js";
import { useLive } from "../context/LiveContext.jsx";
import { formatDateTime } from "../utils";

function WorkerProfile() {
  const { workerId } = useParams();
  const { tick } = useLive();
  const { data: users } = useFetch("/users");
  const { data: shipments, loading } = useFetch("/shipments", [tick]);
  const { data: alerts } = useFetch("/alerts", [tick]);

  if (!users || !shipments) {
    return <div className="card-box text-secondary">Loading driver profile…</div>;
  }

  const worker = users.find((entry) => entry.id === workerId && entry.role === "Worker");
  if (!worker) {
    return (
      <div className="card-box">
        <h2 className="page-title">Driver not found</h2>
        <Link to="/" className="btn btn-outline-secondary btn-sm mt-2">Back to dashboard</Link>
      </div>
    );
  }

  const workerShipments = shipments
    .filter((shipment) => shipment.workerId === worker.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const workerReports = (alerts || [])
    .filter((alert) => alert.source === "worker_report" && alert.workerId === worker.id)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const shipmentCounts = {
    total: workerShipments.length,
    inTransit: workerShipments.filter((shipment) => shipment.displayStatus === "In Transit").length,
    delivered: workerShipments.filter((shipment) => shipment.displayStatus === "Delivered").length,
    attention: workerShipments.filter((shipment) => ["Delayed", "Critical"].includes(shipment.displayStatus)).length,
  };

  return (
    <>
      <PageHeader title={worker.name} subtitle={`Driver profile · ${worker.location || worker.team || "Cold Chain Operations"}`}>
        <Link to="/" className="btn btn-outline-secondary btn-sm">Back to dashboard</Link>
      </PageHeader>

      <div className="card-box mb-4 d-flex flex-wrap align-items-center gap-3">
        <div className="rounded-circle bg-info-subtle text-info-emphasis d-flex align-items-center justify-content-center fw-bold" style={{ width: 52, height: 52 }}>
          {worker.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="fw-semibold">{worker.name}</div>
          <div className="small text-secondary">{worker.id} · {worker.email}</div>
        </div>
        <div className="ms-auto"><StatusBadge status={worker.status || "Active"} /></div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div className="col"><StatsRow icon="bi-box-seam" color="primary" value={shipmentCounts.total} label="Total shipments" /></div>
        <div className="col"><StatsRow icon="bi-truck" color="info" value={shipmentCounts.inTransit} label="In transit" /></div>
        <div className="col"><StatsRow icon="bi-check-circle" color="success" value={shipmentCounts.delivered} label="Delivered" /></div>
        <div className="col"><StatsRow icon="bi-exclamation-triangle" color="warning" value={shipmentCounts.attention} label="Needs attention" /></div>
      </div>

      <WorkerTasksPanel workerId={worker.id} />

      <section className="worker-reports-panel mb-4" aria-labelledby="worker-profile-reports-title">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h5 id="worker-profile-reports-title" className="card-title-text mb-0">Issues reported by {worker.name}</h5>
          <span className="badge rounded-pill text-bg-warning">{workerReports.length}</span>
        </div>
        {workerReports.length ? (
          <div className="worker-reports-list">
            {workerReports.map((report) => (
              <article className="worker-report-row" key={report.id}>
                <div className="worker-report-mark" aria-hidden="true"><i className="bi bi-exclamation-triangle" /></div>
                <div className="worker-report-copy">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <strong>{report.type || "Problem report"}</strong>
                    {report.shipmentId && <span className="small text-secondary">{report.shipmentId}</span>}
                  </div>
                  <p className="mb-1">{report.message}</p>
                  <small className="text-secondary">{report.createdAt ? new Date(report.createdAt).toLocaleString() : "Time unavailable"}</small>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="text-secondary small mb-0">This worker has not reported an issue.</p>}
      </section>

      <section className="card-box" aria-labelledby="driver-shipments-title">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h5 id="driver-shipments-title" className="card-title-text mb-1">{worker.name}’s shipments</h5>
            <p className="text-secondary small mb-0">Shipments assigned to this driver</p>
          </div>
          <Link to={`/shipments?q=${encodeURIComponent(worker.name)}`} className="small text-decoration-none">Open shipments page</Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Cargo</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Started</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workerShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="fw-semibold">{shipment.id}</td>
                  <td>{shipment.cargo}</td>
                  <td>
                    <span>{shipment.companyName || shipment.sourceName || shipment.origin} → {shipment.destination}</span>
                    <small className="d-block text-secondary">Source: {shipment.sourceName || "Dispatch location"} · {shipment.originCity || shipment.origin}</small>
                    <small className="d-block text-secondary">Company ID: {shipment.companyId || "—"} · Manager: {shipment.companyManagerName || "—"}</small>
                    {shipment.facilityId && <small className="d-block text-secondary">Facility ID: {shipment.facilityId}</small>}
                    {shipment.facilityId && <small className="d-block text-secondary">Receiving auditor: {shipment.auditorName || "Unassigned"}</small>}
                  </td>
                  <td>{shipment.vehicleId}</td>
                  <td>{formatDateTime(shipment.createdAt)}</td>
                  <td><StatusBadge status={shipment.displayStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && workerShipments.length === 0 && (
            <p className="text-secondary text-center mt-3 mb-0">No shipments assigned to {worker.name}.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default WorkerProfile;
