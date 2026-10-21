import { useLive } from "../context/LiveContext";

// Short-lived confirmations and operational alerts in the bottom-right corner.
function Toasts() {
  const { toasts, dismissToast } = useLive();

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-card ${t.kind || (t.level === "Critical" ? "critical" : "warning")}`} role="status">
          <i
            className={
              "bi me-2 " +
              (t.kind === "success" ? "bi-check-circle text-success" : t.kind === "error" || t.level === "Critical" ? "bi-exclamation-octagon text-danger" : t.kind === "info" ? "bi-info-circle text-info" : "bi-exclamation-triangle text-warning")
            }
          ></i>
          <div className="flex-grow-1">
            <div className="fw-semibold">{t.title || t.type || "Notification"}</div>
            <small className="text-secondary">{[t.vehicleId, t.message].filter(Boolean).join(" · ")}</small>
          </div>
          <button className="btn-close btn-close-white btn-sm" onClick={() => dismissToast(t.id)}></button>
        </div>
      ))}
    </div>
  );
}

export default Toasts;
