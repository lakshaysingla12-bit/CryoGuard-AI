import { useLive } from "../context/LiveContext";

// Pop-up messages in the bottom right corner when a new alert arrives
function Toasts() {
  const { toasts, dismissToast } = useLive();

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={"toast-card " + (t.level === "Critical" ? "critical" : "warning")}>
          <i
            className={
              "bi me-2 " +
              (t.level === "Critical" ? "bi-exclamation-octagon text-danger" : "bi-exclamation-triangle text-warning")
            }
          ></i>
          <div className="flex-grow-1">
            <div className="fw-semibold">{t.type}</div>
            <small className="text-secondary">
              {t.vehicleId} · {t.message}
            </small>
          </div>
          <button className="btn-close btn-close-white btn-sm" onClick={() => dismissToast(t.id)}></button>
        </div>
      ))}
    </div>
  );
}

export default Toasts;
