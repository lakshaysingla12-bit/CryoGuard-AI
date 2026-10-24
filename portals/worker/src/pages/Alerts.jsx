
import { useState } from "react";
import { api } from "../api/client";
import { useLive } from "../context/LiveContext.jsx";
import useFetch from "../context/useFetch.js";
import PageHeader from "../components/Alerts/PageHeader.jsx";
import StatusBadge from "../components/Alerts/StatusBadge.jsx";
import "./Alerts.css";
import LogoutButton from "../components/LogoutButton.jsx";
import { useWorker } from "../context/WorkerContext.jsx";

const levels = ["All", "Critical", "Warning"];

function WorkerAlerts() {
  const { alertCount } = useLive();
  const { worker } = useWorker();

  const [level, setLevel] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    type: "Temperature",
    level: "Warning",
    vehicleId: "",
    shipmentId: "",
    description: "",
  });

  // Workers can view open alerts and report issues.
  const { data, loading, reload } = useFetch(
    "/alerts?status=open",
    [alertCount]
  );

  const alerts = (data || []).filter(
    (alert) => level === "All" || alert.level === level
  );

  const criticalCount = (data || []).filter(
    (alert) => alert.level === "Critical"
  ).length;


async function reportIssue(e) {
  e.preventDefault();
  setMessage("");

  if (!form.description.trim()) {
    setMessage("Please describe the issue.");
    return;
  }

  setSubmitting(true);

  try {
    await api("/alerts", {
      method: "POST",
      body: {
        id: `ALT-${Date.now()}`,
        source: "worker_report",
        workerId: worker?.id || "",
        workerName: worker?.name || "Worker",
        companyId: worker?.companyId || "",
        companyName: worker?.companyName || "",
        type: form.type,
        level: form.level,
        vehicleId: form.vehicleId.trim(),
        shipmentId: form.shipmentId.trim(),
        message: form.description.trim(),
        createdAt: new Date().toISOString(),
        resolved: false,
      },
    });

    setMessage("Issue reported successfully!");

    setForm({
      type: "Temperature",
      level: "Warning",
      vehicleId: "",
      shipmentId: "",
      description: "",
    });

    setShowForm(false);

    // Refresh the Open Alerts list after saving.
    await reload();
    setLevel("All");
  } catch (error) {
    console.error("Unable to report issue:", error);
    setMessage("Unable to report the issue. Please try again.");
  } finally {
    setSubmitting(false);
  }
}


  return (
    <div className="alerts-page worker-alerts-page">
      <PageHeader
        title="My Alerts"
        subtitle="View shipment warnings and report issues that need attention."
      ><LogoutButton /></PageHeader>

      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-4">
          <div className="card-box">
            <div className="text-secondary small">Open alerts</div>
            <h3 className="mb-0">{data?.length ?? 0}</h3>
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="card-box">
            <div className="text-secondary small">Critical alerts</div>
            <h3 className="mb-0 text-danger">{criticalCount}</h3>
          </div>
        </div>

        <div className="col-sm-12 col-xl-4">
          <div className="card-box d-flex align-items-center justify-content-between gap-2">
            <div>
              <div className="fw-semibold">Found an issue?</div>
              <small className="text-secondary">
                Report it to your manager.
              </small>
            </div>

            <button
              className="btn btn-info"
              onClick={() => {
                setShowForm(!showForm);
                setMessage("");
              }}
            >
              {showForm ? "Cancel" : "+ Report Issue"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className="alert alert-info"
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      {showForm && (
        <div className="card-box mb-3">
          <h5 className="mb-3">Report a Shipment Issue</h5>

          <form onSubmit={reportIssue}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Issue type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="Temperature">Temperature problem</option>
                  <option value="Door">Door issue</option>
                  <option value="Vehicle">Vehicle problem</option>
                  <option value="Shipment">Shipment issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Severity</label>
                <select
                  className="form-select"
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: e.target.value })
                  }
                >
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Vehicle ID (if applicable)
                </label>
                <input
                  className="form-control"
                  value={form.vehicleId}
                  onChange={(e) =>
                    setForm({ ...form, vehicleId: e.target.value })
                  }
                  placeholder="Enter vehicle ID"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Shipment ID (if applicable)
                </label>
                <input
                  className="form-control"
                  value={form.shipmentId}
                  onChange={(e) =>
                    setForm({ ...form, shipmentId: e.target.value })
                  }
                  placeholder="Enter shipment ID"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Describe the issue</label>
                <textarea
                  className="form-control"
                  rows="4"
                  required
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe what happened, where, and when..."
                />
              </div>

              <div className="col-12">
                <button
                  className="btn btn-info"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="card-box">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h5 className="mb-1">Open Alerts</h5>
            <small className="text-secondary">
              Do not ignore critical cold-chain warnings.
            </small>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {levels.map((item) => (
              <button
                key={item}
                className={
                  "btn btn-sm " +
                  (level === item
                    ? "btn-info"
                    : "btn-outline-secondary")
                }
                onClick={() => setLevel(item)}
              >
                {item}
              </button>
            ))}

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={reload}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-secondary text-center my-4">
            Loading alerts...
          </p>
        )}

        {!loading && alerts.length === 0 && (
          <p className="text-secondary text-center my-4">
            <i className="bi bi-check-circle text-success me-2"></i>
            No alerts found for this filter.
          </p>
        )}

        {alerts.map((alert) => (
          <div className="alert-row" key={alert.id}>
            <i
              className={
                "bi alert-icon " +
                (alert.level === "Critical"
                  ? "bi-exclamation-octagon text-danger"
                  : "bi-exclamation-triangle text-warning")
              }
            ></i>

            <div className="flex-grow-1">
              <div className="fw-semibold">{alert.type}</div>

              <small className="text-secondary">
                {alert.vehicleId || "No vehicle ID"}{" "}
                · {alert.shipmentId || "No shipment ID"}
              </small>

              <div className="small mt-1">{alert.message}</div>
            </div>

            <StatusBadge status={alert.level} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkerAlerts;
