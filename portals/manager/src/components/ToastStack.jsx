import { useLive } from "../context/LiveDataContext";

// Pop-ups in the corner when a new alert arrives from the server.
function ToastStack() {
  const { toasts, dismissToast } = useLive();

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={"toast show alert-toast " + t.severity.toLowerCase()}>
          <div className="d-flex align-items-start gap-2 p-3">
            <i className={"bi " + (t.severity === "Critical" ? "bi-exclamation-octagon text-danger" : "bi-exclamation-triangle text-warning")}></i>
            <div className="flex-grow-1">
              <div className="fw-semibold">{t.title}</div>
              <small className="text-secondary">
                {t.vehicleId} · {t.message}
              </small>
            </div>
            <button className="btn-close btn-sm" aria-label="Close" onClick={() => dismissToast(t.id)}></button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
