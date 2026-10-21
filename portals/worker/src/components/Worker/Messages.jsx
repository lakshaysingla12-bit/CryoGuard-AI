import { useEffect, useState } from "react";
import { User } from "lucide-react";
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
