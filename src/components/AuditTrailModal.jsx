import React from "react";
import { useSelector } from "react-redux";
import { History, X, Download } from "lucide-react";
import { exportToCSV } from "../utils/reportUtils";

export default function AuditTrailModal({ auditLogs: propLogs, onClose, onToast }) {
  const reduxLogs = useSelector((state) => state.auditLogs?.logs);
  const auditLogs = propLogs || reduxLogs || [];

  const handleExportCSV = () => {
    const rows = [
      ["Timestamp", "Actor", "Action Type", "Batch ID", "Details"],
      ...auditLogs.map((l) => [l.timestamp, l.actor, l.action, l.batchId, l.details]),
    ];
    exportToCSV(`GxP_Audit_Trail_${Date.now()}.csv`, rows);
    if (onToast) {
      onToast({
        type: "success",
        title: "Audit Log Exported",
        message: "GxP Audit trail CSV successfully downloaded.",
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title-group">
            <History className="modal-header__icon text-cyan" size={24} />
            <div>
              <h3>GxP Receiving Electronic Audit Trail</h3>
              <p>Immutable Event Sequence (21 CFR Part 11 Electronic Records)</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / System</th>
                  <th>Action</th>
                  <th>Batch Ref</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="mono text-muted">{log.timestamp}</td>
                    <td>
                      <span className="badge badge--actor">{log.actor}</span>
                    </td>
                    <td>
                      <span className={`badge badge--action-${log.type}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="mono text-cyan">{log.batchId}</td>
                    <td className="text-secondary">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleExportCSV}>
              <Download size={16} />
              Export Audit Trail (CSV)
            </button>
            <button type="button" className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
