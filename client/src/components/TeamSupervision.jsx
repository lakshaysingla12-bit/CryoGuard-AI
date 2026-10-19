import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import useFetch from "../context/useFetch.js";
import { useLive } from "../context/LiveContext.jsx";
import Modal from "./Modal.jsx";
import StatusBadge from "./StatusBadge.jsx";

function TeamSupervision() {
  const { tick } = useLive();
  const { data: users } = useFetch("/users");
  const { data: assignments } = useFetch("/assignments", [tick]);
  const { data: shipments } = useFetch("/shipments", [tick]);
  const { data: messages, reload: reloadMessages } = useFetch("/messages");
  const [messagingWorker, setMessagingWorker] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);

  if (!users || !assignments || !shipments) {
    return (
      <div className="card-box mb-4">
        <h5 className="card-title-text mb-0">Team Supervision</h5>
        <p className="text-secondary small mt-3 mb-0">Loading worker assignments…</p>
      </div>
    );
  }

  const manager = users.find((user) => user.role === "Manager");
  const workers = users.filter((user) => user.role === "Worker");
  const teamAssignments = assignments.filter((assignment) =>
    !manager || assignment.supervisorId === manager.id
  );
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
  }).filter((row) => row.assigned.length > 0);

  const activeCount = rows.reduce((total, row) => total + row.active.length, 0);
  const attentionCount = rows.reduce((total, row) => total + row.attention, 0);

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
          message: text,
          sentAt: new Date().toISOString(),
          read: false,
        },
      });
      await reloadMessages();
      setMessagingWorker(null);
      setMessageText("");
    } catch (error) {
      setMessageError(error.message || "Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
    <section className="card-box mb-4" aria-labelledby="team-supervision-title">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h5 id="team-supervision-title" className="card-title-text mb-1">Team Supervision</h5>
          <p className="text-secondary small mb-0">
            {rows.length} workers · {activeCount} active assignments · {attentionCount} shipments need attention
          </p>
        </div>
        <Link to="/users" className="text-decoration-none small">Manage workers</Link>
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Assignments</th>
              <th>Completed</th>
              <th>Needs attention</th>
              <th>Current task</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ worker, assigned, completed, active, attention }) => {
              const progress = assigned.length ? Math.round((completed / assigned.length) * 100) : 0;
              const nextTask = active[0];
              const latestMessage = messages?.filter((entry) => entry.workerId === worker.id)
                .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
              return (
                <tr key={worker.id}>
                  <td>
                    <div className="fw-semibold">{worker.name}</div>
                    <small className="text-secondary">{worker.location || worker.team || "Worker"}</small>
                    <div><small className="text-secondary">{latestMessage ? `Last message: ${latestMessage.message}` : "No supervisor message yet"}</small></div>
                  </td>
                  <td>{active.length} active <span className="text-secondary">/ {assigned.length} total</span></td>
                  <td style={{ minWidth: 130 }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: 6 }}>
                        <div className="progress-bar bg-success" style={{ width: `${progress}%` }} />
                      </div>
                      <small className="num">{progress}%</small>
                    </div>
                  </td>
                  <td>
                    {attention > 0 ? (
                      <span><StatusBadge status="Warning" /> <small className="text-secondary">{attention}</small></span>
                    ) : <span className="text-secondary">None</span>}
                  </td>
                  <td>
                    {nextTask ? (
                      <>
                        <div>{nextTask.task}</div>
                        <small className="text-secondary">{nextTask.shipmentId}</small>
                      </>
                    ) : <span className="text-secondary">No open tasks</span>}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-info btn-sm me-2"
                      onClick={() => { setMessagingWorker(worker); setMessageText(""); setMessageError(""); }}
                    >
                      Message
                    </button>
                    <Link className="btn btn-outline-secondary btn-sm" to={`/shipments?q=${encodeURIComponent(worker.name)}`}>
                      View shipments
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-secondary text-center mt-3 mb-0">No worker assignments are linked to this supervisor yet.</p>}
      </div>
    </section>
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
