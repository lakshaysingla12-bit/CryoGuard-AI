import { useEffect, useState } from "react";
import { AlertTriangle, Send, User } from "lucide-react";
import { useWorker } from "../../context/WorkerContext";

function formatMessageTime(sentAt) {
  if (!sentAt) return "";
  const date = new Date(sentAt);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Messages() {
  const { worker } = useWorker();
  const [messages, setMessages] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [category, setCategory] = useState("Temperature");
  const [reportText, setReportText] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [sending, setSending] = useState(false);
  const [reportNotice, setReportNotice] = useState("");

  async function sendProblemReport(event) {
    event.preventDefault();
    const text = reportText.trim();
    if (!text || !worker?.id || sending) return;

    setSending(true);
    setReportNotice("");
    try {
      const report = {
        id: `RPT-${Date.now()}`,
        type: "worker_problem_report",
        category,
        workerId: worker.id,
        fromUserId: worker.id,
        fromName: worker.name || "Worker",
        toUserId: worker.companyManagerId || worker.companyManager?.id || "",
        companyId: worker.companyId || "",
        companyName: worker.companyName || "",
        shipmentId: shipmentId.trim(),
        message: text,
        sentAt: new Date().toISOString(),
        read: false,
      };
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (!response.ok) throw new Error("Could not send the report.");
      setReportText("");
      setShipmentId("");
      setReportNotice("Report sent to your company manager.");
    } catch {
      setReportNotice("Report could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!worker?.id) {
      setMessages([]);
      return undefined;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const query = new URLSearchParams({ workerId: worker.id, _: String(Date.now()) });
        const response = await fetch(`/api/messages?${query}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load manager messages.");

        const rows = await response.json();
        if (cancelled) return;

        const workerMessages = (Array.isArray(rows) ? rows : [])
          .filter((message) =>
            message.workerId === worker.id &&
            message.type !== "worker_problem_report" &&
            (!worker.companyId || !message.companyId || message.companyId === worker.companyId)
          )
          .sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0));

        setMessages(workerMessages);
      } catch {
        // Keep any already loaded messages visible if the API briefly disconnects.
      }
    };

    loadMessages();
    const timer = window.setInterval(loadMessages, 5000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") loadMessages();
    };
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [worker?.id, worker?.companyId]);

  const visibleMessages = showAll ? messages : messages.slice(0, 1);

  return (
    <section className="dashboard-card messages-card">
      <div className="section-header">
        <h2>Messages</h2>
        {messages.length > 1 && (
          <button type="button" onClick={() => setShowAll((value) => !value)}>
            {showAll ? "Show latest" : "View all"}
          </button>
        )}
      </div>

      <form className="worker-problem-report" onSubmit={sendProblemReport}>
        <div className="worker-report-heading">
          <AlertTriangle size={16} aria-hidden="true" />
          <strong>Report a problem</strong>
        </div>
        <label className="worker-report-label" htmlFor="worker-report-category">Problem type</label>
        <select id="worker-report-category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>Temperature</option>
          <option>Vehicle</option>
          <option>Cargo / shipment</option>
          <option>Safety</option>
          <option>Other</option>
        </select>
        <label className="worker-report-label" htmlFor="worker-report-shipment">Shipment ID (optional)</label>
        <input id="worker-report-shipment" value={shipmentId} onChange={(event) => setShipmentId(event.target.value)} maxLength={40} placeholder="e.g. SHP-1021" />
        <label className="worker-report-label" htmlFor="worker-report-message">What happened?</label>
        <textarea id="worker-report-message" value={reportText} onChange={(event) => setReportText(event.target.value)} maxLength={500} rows={3} required placeholder="Describe the issue so your manager can follow up…" />
        <div className="worker-report-footer">
          <span role="status" aria-live="polite">{reportNotice}</span>
          <button type="submit" disabled={sending || !reportText.trim()}>
            <Send size={14} aria-hidden="true" /> {sending ? "Sending…" : "Send report"}
          </button>
        </div>
      </form>

      {visibleMessages.length > 0 ? (
        visibleMessages.map((message) => (
          <div className="message-item" key={message.id}>
            <div className="message-icon">
              <User size={18} />
            </div>

            <div className="message-content">
              <h3>{message.fromName || worker.companyManagerName || "Manager"}</h3>
              <p>{message.message}</p>
            </div>

            <span className="message-time">{formatMessageTime(message.sentAt)}</span>
          </div>
        ))
      ) : (
        <p className="messages-empty">No messages from your manager yet.</p>
      )}
    </section>
  );
}

export default Messages;
