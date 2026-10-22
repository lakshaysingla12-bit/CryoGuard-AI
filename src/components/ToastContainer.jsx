import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 size={18} className="toast__icon toast__icon--success" />,
          warning: <AlertTriangle size={18} className="toast__icon toast__icon--warning" />,
          error: <AlertOctagon size={18} className="toast__icon toast__icon--error" />,
          info: <Info size={18} className="toast__icon toast__icon--info" />,
        };

        return (
          <div key={t.id} className={`toast toast--${t.type || "info"}`}>
            {icons[t.type] || icons.info}
            <div className="toast__content">
              {t.title && <div className="toast__title">{t.title}</div>}
              <div className="toast__message">{t.message}</div>
            </div>
            <button
              type="button"
              className="toast__close-btn"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              title="Dismiss"
            >
              <X size={14} />
            </button>
            <div className="toast__progress-bar" />
          </div>
        );
      })}
    </div>
  );
}
