import { useState } from "react";
import { api } from "../api/client.js";
import useFetch from "../context/useFetch.js";
import { useLive } from "../context/LiveContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "./Modal.jsx";
import StatusBadge from "./StatusBadge.jsx";

function WorkerTasksPanel({ workerId }) {
  const { user: manager } = useAuth();
  const { tick, showToast } = useLive();
  const { data: users } = useFetch("/users");
  const { data: assignments, reload: reloadAssignments } = useFetch("/assignments", [tick]);
  const { data: shipments } = useFetch("/shipments", [tick]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ task: "", shipmentId: "", dueAt: "", priority: "Normal", status: "Assigned" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!users || !assignments || !shipments) return null;

  const worker = users.find((entry) => entry.id === workerId && entry.role === "Worker");
  if (!worker) return null;

  const workerTasks = assignments
    .filter((assignment) => assignment.workerId === worker.id)
    .sort((a, b) => Number(a.status === "Completed") - Number(b.status === "Completed"));
  const activeTaskCount = workerTasks.filter((assignment) => assignment.status !== "Completed").length;
  const workerShipments = shipments.filter((shipment) => shipment.workerId === worker.id);
  const shipmentById = new Map(workerShipments.map((shipment) => [shipment.id, shipment]));

  function openTask(assignment = null) {
    setEditing(assignment || {});
    setForm({
      task: assignment?.task || "",
      shipmentId: assignment?.shipmentId || "",
      dueAt: assignment?.dueAt || "",
      priority: assignment?.priority || "Normal",
      status: assignment?.status || "Assigned",
    });
    setError("");
  }

  async function saveTask(event) {
    event.preventDefault();
    if (!form.task.trim()) return;
    setSaving(true);
    setError("");
    const shipment = workerShipments.find((entry) => entry.id === form.shipmentId);
    const payload = {
      task: form.task.trim(),
      workerId: worker.id,
      workerName: worker.name,
      supervisorId: manager?.id || "mgr-001",
      companyId: shipment?.companyId || manager?.companyId || worker.companyId || "",
      companyName: shipment?.companyName || manager?.companyName || worker.companyName || "",
      companyManagerId: manager?.id || "mgr-001",
      companyManagerName: manager?.name || "Aarav Sharma",
      auditorId: shipment?.auditorId || "",
      hospitalId: shipment?.hospitalId || "",
      hospitalName: shipment?.hospitalName || "",
      facilityId: shipment?.facilityId || "",
      facilityName: shipment?.facilityName || "",
      shipmentId: shipment?.id || "",
      vehicleId: shipment?.vehicleId || "",
      dueAt: form.dueAt.trim(),
      priority: form.priority,
      status: form.status,
    };
    try {
      if (editing.id) {
        await api(`/assignments/${encodeURIComponent(editing.id)}`, { method: "PATCH", body: payload });
      } else {
        await api("/assignments", { method: "POST", body: { id: `ASN-${Date.now()}`, ...payload } });
      }
      await reloadAssignments();
      setEditing(null);
      showToast({ title: editing.id ? "Task updated" : "Task assigned", message: `${payload.task} · ${worker.name}`, kind: "success" });
    } catch (saveError) {
      setError(saveError.message || "Task could not be saved. Please try again.");
      showToast({ title: "Could not save task", message: saveError.message, kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card-box mb-4" aria-labelledby="worker-tasks-title">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h5 id="worker-tasks-title" className="card-title-text mb-1">{worker.name} · Assigned tasks</h5>
          <p className="text-secondary small mb-0">
            {workerTasks.length} total · {activeTaskCount} active · {workerTasks.length - activeTaskCount} completed
          </p>
        </div>
        <button className="btn btn-info btn-sm" onClick={() => openTask()}>
          <i className="bi bi-plus-lg me-1" />Assign task
        </button>
      </div>

      {workerTasks.length ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          {workerTasks.map((assignment) => {
            const shipment = shipmentById.get(assignment.shipmentId);
            return (
              <div className="col" key={assignment.id}>
                <article className="border border-secondary-subtle rounded-3 p-3 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <div className="fw-semibold">{assignment.task}</div>
                    <StatusBadge status={assignment.status} />
                  </div>
                  <div className="small text-secondary mb-3">
                    {assignment.shipmentId ? (
                      <>
                        <div className="text-body">{assignment.shipmentId}</div>
                        {shipment && <div>{shipment.origin} → {shipment.destination}</div>}
                      </>
                    ) : <div>No shipment linked</div>}
                  </div>
                  <div className="mt-auto pt-2 border-top border-secondary-subtle d-flex justify-content-between align-items-center gap-2">
                    <small className="text-secondary">
                      {assignment.vehicleId || "No vehicle"}
                      {assignment.dueAt ? ` · Due ${assignment.dueAt}` : ""}
                      {assignment.priority ? ` · ${assignment.priority}` : ""}
                    </small>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => openTask(assignment)}>Edit</button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-secondary border-top pt-3 mb-0">No tasks assigned to {worker.name} yet.</p>
      )}

      {editing && (
        <Modal
          title={`${editing.id ? "Edit" : "Assign"} task · ${worker.name}`}
          onClose={() => !saving && setEditing(null)}
        >
          <form onSubmit={saveTask}>
            <label className="form-label" htmlFor="shipment-worker-task">Task</label>
            <input
              id="shipment-worker-task"
              className="form-control mb-3"
              maxLength={120}
              required
              value={form.task}
              onChange={(event) => setForm({ ...form, task: event.target.value })}
              placeholder="e.g. Confirm cargo seal"
            />
            <label className="form-label" htmlFor="shipment-task-link">Related shipment (optional)</label>
            <select
              id="shipment-task-link"
              className="form-select mb-3"
              value={form.shipmentId}
              onChange={(event) => setForm({ ...form, shipmentId: event.target.value })}
            >
              <option value="">No shipment linked</option>
              {workerShipments.map((shipment) => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.id} · {shipment.origin} → {shipment.destination} · {shipment.displayStatus}
                </option>
              ))}
            </select>
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label" htmlFor="shipment-task-due">Due</label>
                <input
                  id="shipment-task-due"
                  className="form-control"
                  maxLength={40}
                  value={form.dueAt}
                  onChange={(event) => setForm({ ...form, dueAt: event.target.value })}
                  placeholder="e.g. 1h 30m"
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label" htmlFor="shipment-task-priority">Priority</label>
                <select
                  id="shipment-task-priority"
                  className="form-select"
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                >
                  <option>Normal</option><option>Medium</option><option>High</option>
                </select>
              </div>
            </div>
            {editing.id && (
              <>
                <label className="form-label" htmlFor="shipment-task-status">Status</label>
                <select
                  id="shipment-task-status"
                  className="form-select mb-3"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  <option>Assigned</option><option>In Progress</option><option>Completed</option>
                </select>
              </>
            )}
            {error && <div className="text-danger small mb-3" role="alert">{error}</div>}
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !form.task.trim()}>
                {saving ? "Saving…" : editing.id ? "Save changes" : "Assign task"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

export default WorkerTasksPanel;
