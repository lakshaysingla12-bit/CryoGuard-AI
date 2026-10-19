import { useState } from "react";
import { api } from "../api/client";
import { useLive } from "../context/LiveContext.jsx";
import useFetch from "../context/useFetch.js";
import PageHeader from "../components/PageHeader.jsx";
import StatsRow from "../components/StatsRow.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { alertIcon, timeAgo } from "../utils";

const levels = ["All", "Critical", "Warning"];

function Alerts() {
  const { alertCount } = useLive();
  const [status, setStatus] = useState("open");
  const [level, setLevel] = useState("All");

  // reloads by itself when a new alert arrives or a filter changes
  const query = `/alerts?status=${status}` + (level !== "All" ? `&level=${level}` : "");
  const { data, loading, reload } = useFetch(query, [alertCount]);
  const { data: openAlertsData, reload: reloadOpenAlerts } = useFetch("/alerts?status=open", [alertCount]);
  const openAlerts = openAlertsData || [];
  const openCount = openAlerts.length;
  const criticalCount = openAlerts.filter((alert) => alert.level === "Critical").length;
  const warningCount = Math.max(0, openCount - criticalCount);

  async function resolve(id) {
    await api(`/alerts/${id}/resolve`, { method: "PATCH" });
    reload();
    reloadOpenAlerts();
  }

  return (
    <>
      <PageHeader title="Alerts" subtitle="Temperature, door and AI warnings from your fleet" />

      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-bell" color="info" value={openCount} label="Open alerts" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-exclamation-octagon" color="danger" value={criticalCount} label="Critical" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-exclamation-triangle" color="warning" value={warningCount} label="Warnings" />
        </div>
      </div>

      <div className="card-box">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-2">
          <div className="btn-group btn-group-sm">
            {["open", "resolved"].map((s) => (
              <button
                key={s}
                className={"btn " + (status === s ? "btn-info" : "btn-outline-secondary")}
                onClick={() => setStatus(s)}
              >
                {s === "open" ? "Open" : "Resolved"}
              </button>
            ))}
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="small text-secondary align-self-center">Severity</span>
            {levels.map((l) => (
              <button
                key={l}
                className={"btn btn-sm " + (level === l ? "btn-info" : "btn-outline-secondary")}
                onClick={() => setLevel(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {!loading && data?.length === 0 && (
          <p className="text-secondary text-center my-4">
            <i className="bi bi-check-circle text-success me-2"></i>
            {status === "open" ? "No open alerts. Everything looks good." : "No resolved alerts to show."}
          </p>
        )}

        {data?.map((a) => (
          <div className="alert-row" key={a.id}>
            <i className={"bi alert-icon " + alertIcon(a.level)}></i>

            <div className="flex-grow-1">
              <div className="fw-medium">{a.type}</div>
              <small className="text-secondary">
                {a.vehicleId} · {a.shipmentId} · {timeAgo(a.createdAt)}
              </small>
              <div className="small">{a.message}</div>
            </div>

            <StatusBadge status={a.level} />

            {!a.resolved && (
              <button className="btn btn-outline-info btn-sm" onClick={() => resolve(a.id)}>
                Mark resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Alerts;
