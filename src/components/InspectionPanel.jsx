import React, { useState } from "react";
import {
  CheckCircle2,
  AlertOctagon,
  FileText,
  User,
  Truck,
  Thermometer,
  Package,
  Activity,
  MessageSquare,
  Droplets,
  FlaskConical
} from "lucide-react";

export default function InspectionPanel({
  consignment,
  onOpenAdmit,
  onOpenQuarantine,
  onPreviewGRN,
  onAddAuditNote,
  onToast,
}) {
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!consignment) {
    return (
      <div className="empty-state" id="inspection-hub">
        <FlaskConical size={36} className="text-cyan mb-2" />
        <div className="empty-state__title">No Cargo Selected for Inspection</div>
        <div className="empty-state__desc">
          Select any arriving consignment from the Master Intake Ledger or the Live Tracking map above
          to inspect chronological telemetry and thermal cargo specifications.
        </div>
      </div>
    );
  }

  const c = consignment;
  const isLocked = c.receiverDisposition !== "PENDING";
  const isAdmitted = c.receiverDisposition === "ADMITTED";
  const isQuarantined = c.receiverDisposition === "QUARANTINED";

  const isInSpec =
    c.currentTemp >= c.targetTempBand.min &&
    c.currentTemp <= c.targetTempBand.max;

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (onAddAuditNote) {
      onAddAuditNote(c.id, noteText);
    }
    setNoteText("");
    setShowNoteInput(false);
    if (onToast) {
      onToast({
        type: "success",
        title: "Audit Note Saved",
        message: "Observation permanently recorded in GxP audit log.",
      });
    }
  };

  return (
    <div className="inspection-panel" id="inspection-hub">
      {/* ───────────────────────────────────────────────────────────
          LEFT DOWNWARD: TELEMETRY
          ─────────────────────────────────────────────────────────── */}
      <div className="panel-card panel-card--telemetry">
        <div className="panel-card__header">
          <div className="panel-card__title-group">
            <span className="icon text-cyan">📡</span>
            <div>
              <h3>Telemetry</h3>
              <p className="subtitle">Chronological Thermal Stream</p>
            </div>
          </div>
          <span className="panel-card__batch-pill mono">{c.id}</span>
        </div>

        {/* Sensor telemetry: retain the original nine checkpoint log, without a graph. */}
        <div className="telemetry-table-section">
          <div className="section-subhead">
            <span>In-Transit Sensor Log ({c.timeSeriesData.length} checkpoints)</span>
            <span className="text-muted mono">Spec: {c.targetTempBand.min}°C to {c.targetTempBand.max}°C</span>
          </div>

          <div className="telemetry-scroll">
            <table className="telemetry-stream">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Cargo Temp</th>
                  <th>Humidity</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                {c.timeSeriesData.map((dp, i) => {
                  const inSpec =
                    dp.temp >= c.targetTempBand.min &&
                    dp.temp <= c.targetTempBand.max;
                  return (
                    <tr key={i} className={!inSpec ? "excursion-row" : ""}>
                      <td className="mono">{dp.time}</td>
                      <td className="mono font-bold">
                        {dp.temp > 0 ? "+" : ""}{dp.temp}°C
                      </td>
                      <td className="mono">{dp.humidity}% RH</td>
                      <td>
                        {inSpec ? (
                          <span className="condition-flag condition-flag--ok">
                            ✓ In-Spec
                          </span>
                        ) : (
                          <span className="condition-flag condition-flag--warn">
                            ⚠ EXCURSION
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          RIGHT DOWNWARD: THERMAL CARGO INFO
          (Driver name, vehicle number, cargo product name, live temp)
          ─────────────────────────────────────────────────────────── */}
      <div className="panel-card panel-card--custody">
        <div className="panel-card__header">
          <div className="panel-card__title-group">
            <span className="icon text-emerald">❄️</span>
            <div>
              <h3>Thermal Cargo Info</h3>
              <p className="subtitle">Driver, Vehicle, Live Temp &amp; Intake Disposition Hub</p>
            </div>
          </div>
          <span
            className={`badge ${
              isAdmitted
                ? "badge--admitted"
                : isQuarantined
                ? "badge--quarantined"
                : "badge--pending"
            }`}
          >
            {isAdmitted ? "✓ Admitted" : isQuarantined ? "✕ Quarantined" : "Pending Inspection"}
          </span>
        </div>

        {/* ── Key Highlight Card: Product, Vehicle, Driver & Live Temp ── */}
        <div className="cargo-highlight-card">
          <div className="cargo-highlight-top">
            {/* Cargo Product Name */}
            <div className="cargo-item cargo-item--product">
              <div className="item-label">
                <Package size={14} className="text-cyan" />
                <span>Cargo Product Name</span>
              </div>
              <div className="item-value product-name">{c.drugName}</div>
              <div className="item-sub">Batch: <span className="mono text-cyan">{c.id}</span> · {c.category}</div>
            </div>

            {/* Live Temp */}
            <div className={`cargo-item cargo-item--temp ${isInSpec ? "in-spec" : "out-of-spec"}`}>
              <div className="item-label">
                <Thermometer size={14} className={isInSpec ? "text-emerald" : "text-rose"} />
                <span>Live Temp</span>
              </div>
              <div className="item-value live-temp-val mono">
                {c.currentTemp > 0 ? "+" : ""}{c.currentTemp}°C
              </div>
              <div className="item-sub">
                Target: {c.targetTempBand.min}° to {c.targetTempBand.max}°{c.targetTempBand.unit}
              </div>
            </div>
          </div>

          <div className="cargo-highlight-bottom">
            {/* Driver Name */}
            <div className="cargo-detail-chip">
              <User size={15} className="text-cyan" />
              <div>
                <span className="chip-label">Driver Name</span>
                <span className="chip-value">{c.carrierDriver}</span>
              </div>
            </div>

            {/* Vehicle Number */}
            <div className="cargo-detail-chip">
              <Truck size={15} className="text-emerald" />
              <div>
                <span className="chip-label">Vehicle Number</span>
                <span className="chip-value mono">{c.vehicleId}</span>
              </div>
            </div>

            {/* Excursions */}
            <div className="cargo-detail-chip">
              <Activity size={15} className={c.transitExcursionCount > 0 ? "text-rose" : "text-emerald"} />
              <div>
                <span className="chip-label">Excursions</span>
                <span className={`chip-value ${c.transitExcursionCount > 0 ? "text-rose font-bold" : "text-emerald"}`}>
                  {c.transitExcursionCount === 0 ? "0 Breaches" : `${c.transitExcursionCount} Breach(es)`}
                </span>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="cargo-detail-chip">
              <Droplets size={15} className="text-cyan" />
              <div>
                <span className="chip-label">Live Humidity</span>
                <span className="chip-value mono">{c.currentHumidity}% RH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Custody Sign-off Stamp */}
        <div className="custody-sign-off">
          <CheckCircle2 size={20} className="check-icon text-emerald" />
          <div className="text-group">
            <div className="pharmacist-name">
              Dr. Elena Rostova, PharmD · Chief Quality Inspector
            </div>
            <div className="pharmacist-sub">
              Electronic Signature Verified under FDA 21 CFR Part 11 Electronic Records
            </div>
          </div>
        </div>

        {/* Pharmacist Audit Notes if present */}
        {c.notes && (
          <div className="pharmacist-note-box">
            <div className="note-title">Quality Inspector Audit Log:</div>
            <div className="note-body">{c.notes}</div>
          </div>
        )}

        {/* Disposition Actions */}
        <div className="disposition-actions">
          {isLocked ? (
            <div
              className={`disposition-locked disposition-locked--${c.receiverDisposition.toLowerCase()}`}
            >
              <div className="locked-left">
                {isAdmitted ? (
                  <CheckCircle2 size={20} className="text-emerald" />
                ) : (
                  <AlertOctagon size={20} className="text-rose" />
                )}
                <div>
                  <div className="locked-title">
                    Consignment {c.receiverDisposition} — Intake Disposition Locked
                  </div>
                  <div className="locked-sub">
                    {isAdmitted
                      ? `Stored in: ${c.storageLocation || "Main Cold Vault B"}`
                      : `Segregated under CAPA: ${c.capaCode || "CAPA-DEV-10882"} (${c.quarantineBay || "Quarantine Vault Q-01"})`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="action-buttons-row">
              <button
                className="btn-disposition btn-disposition--admit"
                onClick={() => onOpenAdmit(c)}
              >
                <CheckCircle2 size={16} />
                <span>Admit Consignment to Main Cold Storage</span>
              </button>

              <button
                className="btn-disposition btn-disposition--quarantine"
                onClick={() => onOpenQuarantine(c)}
              >
                <AlertOctagon size={16} />
                <span>Quarantine &amp; Reject Batch</span>
              </button>
            </div>
          )}

          <div className="secondary-actions-strip">
            <button
              className="btn-grn"
              onClick={() => onPreviewGRN(c)}
            >
              <FileText size={16} />
              <span>Generate Official GxP Goods Receiving Note (GRN)</span>
            </button>

            {!showNoteInput && (
              <button
                className="btn-secondary btn-sm"
                onClick={() => setShowNoteInput(true)}
              >
                <MessageSquare size={14} />
                <span>Add Audit Note</span>
              </button>
            )}
          </div>

          {showNoteInput && (
            <form onSubmit={handleSaveNote} className="audit-note-form">
              <input
                type="text"
                placeholder="Enter pharmacist observation for permanent audit log..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary btn-xs">
                Save Note
              </button>
              <button
                type="button"
                className="btn-secondary btn-xs"
                onClick={() => setShowNoteInput(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
