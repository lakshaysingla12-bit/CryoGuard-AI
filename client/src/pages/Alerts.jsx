import { useState } from "react";
import { api } from "../api/client";
import { useLive } from "../context/LiveContext.jsx";
import useFetch from "../context/useFetch.js";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { alertIcon, timeAgo } from "../utils";

const levels = ["All", "Critical", "Warning", "Success"];

function Alerts() {
  const { alertCount } = useLive();
  const [status, setStatus] = useState("open");
  const [level, setLevel] = useState("All");

  // reloads by itself when a new alert arrives or a filter changes
  const query = `/alerts?status=${status}` + (level !== "All" ? `&level=${level}` : "");
  const { data, loading, reload } = useFetch(query, [alertCount]);

  async function resolve(id) {
    await api(`/alerts/${id}/resolve`, { method: "PATCH" });
    reload();
  }

  return (
    <>
      <PageHeader title="Alerts" subtitle="Temperature, door and AI warnings from your fleet" />

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

          <div className="d-flex gap-2">
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
            <i className="bi bi-check-circle text-success me-2"></i>Nothing to show here.
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
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Alerts;
