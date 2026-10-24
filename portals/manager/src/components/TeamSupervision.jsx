import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import useFetch from "../context/useFetch.js";
import { useLive } from "../context/LiveContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "./Modal.jsx";
import StatusBadge from "./StatusBadge.jsx";

function TeamSupervision() {
  const { user: manager } = useAuth();
  const { tick, showToast } = useLive();
  const { data: users } = useFetch("/users");
  const { data: assignments, reload: reloadAssignments } = useFetch("/assignments", [tick]);
  const { data: shipments } = useFetch("/shipments", [tick]);
  const { data: messages, reload: reloadMessages } = useFetch("/messages", [tick]);
  const [messagingWorker, setMessagingWorker] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);
  const [taskDialog, setTaskDialog] = useState(null);
  const [taskForm, setTaskForm] = useState({ task: "", shipmentId: "", dueAt: "", priority: "Normal", status: "Assigned" });
  const [taskError, setTaskError] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  if (!users || !assignments || !shipments) {
    return (
      <div className="card-box mb-4">
        <h5 className="card-title-text mb-0">Team Supervision</h5>
        <p className="text-secondary small mt-3 mb-0">Loading worker assignments…</p>
      </div>
    );
  }

  const workers = users.filter((user) => user.role === "Worker");
  const teamAssignments = manager?.companyId
    ? assignments.filter((assignment) => assignment.companyId === manager.companyId || assignment.supervisorId === manager.id)
    : assignments;
  const shipmentById = new Map(shipments.map((shipment) => [shipment.id, shipment]));
  const rows = workers.map((worker) => {
    const assigned = teamAssignments.filter((assignment) => assignment.workerId === worker.id);
    const completed = assigned.filter((assignment) => assignment.status === "Completed").length;
    const active = assigned.filter((assignment) => assignment.status !== "Completed");
    const attention = assigned.filter((assignment) => {
      const shipment = shipmentById.get(assignment.shipmentId);
      return shipment?.displayStatus === "Delayed" || shipment?.displayStatus === "Critical";
    }).length;

    return { worker, assigned, completed, active, attention };
  });

  const activeCount = rows.reduce((total, row) => total + row.active.length, 0);
  const attentionCount = rows.reduce((total, row) => total + row.attention, 0);

  function openTaskDialog(worker, assignment = null) {
    setTaskDialog({ worker, assignment });
    setTaskForm({
      task: assignment?.task || "",
      shipmentId: assignment?.shipmentId || "",
      dueAt: assignment?.dueAt || "",
      priority: assignment?.priority || "Normal",
      status: assignment?.status || "Assigned",
    });
    setTaskError("");
  }

  async function saveTask(event) {
    event.preventDefault();
    if (!taskDialog || !taskForm.task.trim()) return;
    setSavingTask(true);
    setTaskError("");
    const shipment = shipments.find((entry) => entry.id === taskForm.shipmentId);
    const payload = {
      task: taskForm.task.trim(),
      workerId: taskDialog.worker.id,
      workerName: taskDialog.worker.name,
      supervisorId: manager?.id || "mgr-001",
      companyId: shipment?.companyId || manager?.companyId || taskDialog.worker.companyId || "",
      companyName: shipment?.companyName || manager?.companyName || taskDialog.worker.companyName || "",
      companyManagerId: manager?.id || "mgr-001",
      companyManagerName: manager?.name || "Aarav Sharma",
      auditorId: shipment?.auditorId || "",
      hospitalId: shipment?.hospitalId || "",
      hospitalName: shipment?.hospitalName || "",
      facilityId: shipment?.facilityId || "",
      facilityName: shipment?.facilityName || "",
      shipmentId: shipment?.id || "",
      vehicleId: shipment?.vehicleId || "",
      dueAt: taskForm.dueAt.trim(),
      priority: taskForm.priority,
      status: taskForm.status,
    };
    try {
      if (taskDialog.assignment) {
        await api(`/assignments/${encodeURIComponent(taskDialog.assignment.id)}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await api("/assignments", {
          method: "POST",
          body: { id: `ASN-${Date.now()}`, ...payload },
        });
      }
      await reloadAssignments();
      setTaskDialog(null);
      showToast({ title: taskDialog.assignment ? "Task updated" : "Task assigned", message: `${payload.task} · ${taskDialog.worker.name}`, kind: "success" });
    } catch (error) {
      setTaskError(error.message || "Task could not be saved. Please try again.");
      showToast({ title: "Could not save task", message: error.message, kind: "error" });
    } finally {
      setSavingTask(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = messageText.trim();
    if (!text || !messagingWorker) return;

    setSending(true);
    setMessageError("");
    try {
      await api("/messages", {
        method: "POST",
        body: {
          id: `MSG-${Date.now()}`,
          workerId: messagingWorker.id,
          toUserId: messagingWorker.id,
          fromUserId: manager?.id || "mgr-001",
          fromName: manager?.name || "Supervisor",
          companyId: manager?.companyId || messagingWorker.companyId || "",
          companyName: manager?.companyName || messagingWorker.companyName || "",
          message: text,
          sentAt: new Date().toISOString(),
          read: false,
        },
      });
      await reloadMessages();
      setMessagingWorker(null);
      setMessageText("");
      showToast({ title: "Message sent", message: `Your note was sent to ${messagingWorker.name}.`, kind: "success" });
    } catch (error) {
      setMessageError(error.message || "Message could not be sent. Please try again.");
      showToast({ title: "Could not send message", message: error.message, kind: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
    <section className="card-box mb-4" aria-labelledby="team-supervision-title">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h5 id="team-supervision-title" className="card-title-text mb-1">Driver &amp; Worker Supervision</h5>
          <p className="text-secondary small mb-0">
            {rows.length} drivers · {activeCount} active tasks · {attentionCount} tasks linked to shipments that need attention
          </p>
        </div>
        <Link to="/users" className="btn btn-outline-info manage-workers-button">
          <i className="bi bi-people me-2" aria-hidden="true" />Manage workers
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0 supervision-table">
          <colgroup>
            <col className="supervision-col-worker" />
            <col className="supervision-col-tasks" />
            <col className="supervision-col-progress" />
            <col className="supervision-col-attention" />
            <col className="supervision-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Driver / worker</th>
              <th>Tasks</th>
              <th>Completion</th>
              <th>Needs attention</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ worker, assigned, completed, active, attention }) => {
              const progress = assigned.length ? Math.round((completed / assigned.length) * 100) : 0;
              const latestMessage = messages?.filter((entry) => entry.workerId === worker.id && entry.type !== "worker_problem_report")
                .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
              return (
                <tr key={worker.id}>
                  <td>
                    <div className="fw-semibold">{worker.name}</div>
                    <small className="d-block text-secondary">{worker.location || worker.team || "Worker"}</small>
                    <details className="worker-description-disclosure">
                      <summary><i className="bi bi-person-lines-fill" aria-hidden="true" /> Worker details</summary>
                      <div className="worker-description-content">
                        <div><strong>Worker ID:</strong> {worker.id}</div>
                        <div><strong>Supervisor message:</strong> {latestMessage?.message || "No supervisor message yet"}</div>
                      </div>
                    </details>
                  </td>
                  <td>{active.length} active <span className="text-secondary">/ {assigned.length} total</span></td>
                  <td className="supervision-attention-cell">
                    <div className="d-flex justify-content-between gap-2 mb-1">
                      <small className="text-secondary">{completed}/{assigned.length} complete</small>
                      <small className="num">{progress}%</small>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                        <div className="progress-bar bg-success" style={{ width: `${progress}%` }} />
                    </div>
                  </td>
                  <td className="supervision-actions-cell">
                    {attention > 0 ? (
                      <span><StatusBadge status="Warning" /> <small className="text-secondary">{attention}</small></span>
                    ) : <span className="text-secondary">None</span>}
                  </td>
                  <td>
                    <div className="d-grid gap-2 supervision-actions">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => openTaskDialog(worker)}
                      >
                        Assign task
                      </button>
                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() => { setMessagingWorker(worker); setMessageText(""); setMessageError(""); }}
                      >
                        Message
                      </button>
                      <Link className="btn btn-outline-secondary btn-sm" to={`/workers/${encodeURIComponent(worker.id)}`}>
                        View tasks
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-secondary text-center mt-3 mb-0">No worker assignments are linked to this supervisor yet.</p>}
      </div>
    </section>
    {taskDialog && (
      <Modal
        title={`${taskDialog.assignment ? "Edit" : "Assign"} task · ${taskDialog.worker.name}`}
        onClose={() => !savingTask && setTaskDialog(null)}
      >
        <form onSubmit={saveTask}>
          <label className="form-label" htmlFor="supervisor-task">Task</label>
          <input
            id="supervisor-task"
            className="form-control mb-3"
            maxLength={120}
            required
            value={taskForm.task}
            onChange={(event) => setTaskForm({ ...taskForm, task: event.target.value })}
            placeholder="e.g. Confirm cargo seal"
          />
          <label className="form-label" htmlFor="task-shipment">Related shipment (optional)</label>
          <select
            id="task-shipment"
            className="form-select mb-3"
            value={taskForm.shipmentId}
            onChange={(event) => setTaskForm({ ...taskForm, shipmentId: event.target.value })}
          >
            <option value="">No shipment linked</option>
            {shipments.filter((shipment) => shipment.workerId === taskDialog.worker.id).map((shipment) => (
              <option key={shipment.id} value={shipment.id}>
                {shipment.id} · {shipment.origin} → {shipment.destination} · {shipment.displayStatus}
              </option>
            ))}
          </select>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="task-due">Due</label>
              <input
                id="task-due"
                className="form-control"
                maxLength={40}
                value={taskForm.dueAt}
                onChange={(event) => setTaskForm({ ...taskForm, dueAt: event.target.value })}
                placeholder="e.g. 1h 30m"
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-select"
                value={taskForm.priority}
                onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
              >
                <option>Normal</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          {taskDialog.assignment && (
            <>
              <label className="form-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="form-select mb-3"
                value={taskForm.status}
                onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
              >
                <option>Assigned</option><option>In Progress</option><option>Completed</option>
              </select>
            </>
          )}
          {taskError && <div className="text-danger small mb-3" role="alert">{taskError}</div>}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setTaskDialog(null)} disabled={savingTask}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingTask || !taskForm.task.trim()}>
              {savingTask ? "Saving…" : taskDialog.assignment ? "Save changes" : "Assign task"}
            </button>
          </div>
        </form>
      </Modal>
    )}
    {messagingWorker && (
      <Modal title={`Message ${messagingWorker.name}`} onClose={() => !sending && setMessagingWorker(null)}>
        <form onSubmit={sendMessage}>
          <label className="form-label" htmlFor="supervisor-message">Supervisor message</label>
          <textarea
            id="supervisor-message"
            className="form-control"
            rows="4"
            maxLength={500}
            required
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Write a short update or instruction…"
          />
          {messageError && <div className="text-danger small mt-2" role="alert">{messageError}</div>}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setMessagingWorker(null)} disabled={sending}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={sending || !messageText.trim()}>
              {sending ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </Modal>
    )}
    </>
  );
}

export default TeamSupervision;
