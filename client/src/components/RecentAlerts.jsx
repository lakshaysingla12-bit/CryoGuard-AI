// src/components/RecentAlerts.jsx
import React from 'react';
import { Bell, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { useCryoGuard } from '../context/CryoGuardContext.jsx';

export default function RecentAlerts() {
  const { alerts, acknowledgeAlert } = useCryoGuard();

  return (
    <div className="cg-card mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0 text-light fw-bold d-flex align-items-center gap-2">
          <Bell size={18} className="text-danger" /> Active Excursion Alerts
        </h5>
        <span className="small text-secondary">{alerts.length} Incidents</span>
      </div>

      <div className="d-flex flex-column gap-2">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'Critical';

          return (
            <div
              key={alert.id}
              className="p-3 rounded d-flex align-items-center justify-content-between flex-wrap gap-3"
              style={{
                backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <div className="mt-1">
                  {isCritical ? (
                    <AlertCircle size={18} className="text-danger" />
                  ) : (
                    <AlertTriangle size={18} className="text-warning" />
                  )}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="fw-bold text-light small">{alert.title}</span>
                    <span className={`cg-badge ${isCritical ? 'cg-badge-critical' : 'cg-badge-warning'}`}>
                      {alert.severity}
                    </span>
                    {alert.acknowledged && (
                      <span className="cg-sector-pill" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                  <div className="text-secondary small font-monospace">
                    Truck: <strong className="text-info">{alert.vehicleId}</strong> ({alert.cargo}) · {alert.time}
                  </div>
                  <div className="text-muted small mt-1">{alert.detail}</div>
                </div>
              </div>

              <div>
                {!alert.acknowledged && (
                  <button
                    className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    <Check size={14} /> Ack
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}