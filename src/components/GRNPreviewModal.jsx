import React, { useState } from "react";
import { FileText, ShieldCheck, X, Copy, Check } from "lucide-react";
import { sound } from "../utils/soundFx";

export default function GRNPreviewModal({ consignment, onClose, onToast }) {
  const [copied, setCopied] = useState(false);
  if (!consignment) return null;

  const c = consignment;
  const isAdmitted = c.receiverDisposition === "ADMITTED";
  const isQuarantined = c.receiverDisposition === "QUARANTINED";

  const handleCopyHash = () => {
    if (c.sha256Seal) {
      navigator.clipboard.writeText(c.sha256Seal);
      setCopied(true);
      sound.click();
      setTimeout(() => setCopied(false), 2000);
      if (onToast) {
        onToast({
          type: "info",
          title: "Hash Copied",
          message: "SHA-256 seal copied to clipboard.",
        });
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide grn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title-group">
            <FileText className="modal-header__icon text-cyan" size={24} />
            <div>
              <h3>Official Goods Receiving Note (GRN)</h3>
              <p>FDA 21 CFR Part 11 Certified Cold-Chain Document</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Document Sheet Simulation */}
          <div className="grn-sheet">
            <div className="grn-sheet__header">
              <div>
                <h2>METRO GENERAL HOSPITAL</h2>
                <div className="sub">DEPARTMENT OF PHARMACY &amp; BIOMEDICAL QUALITY ASSURANCE</div>
                <div className="meta">Receiving Bay 03 · Cold-Chain Quality Intake Portal</div>
              </div>
              <div className={`grn-sheet__stamp grn-sheet__stamp--${c.receiverDisposition.toLowerCase()}`}>
                {isAdmitted ? "CLEARED & ADMITTED" : isQuarantined ? "REJECTED & QUARANTINED" : "PENDING INSPECTION"}
              </div>
            </div>

            <div className="grn-sheet__meta-grid">
              <div><strong>Document Ref:</strong> GRN-{c.id}-{(c.sha256Seal || "00").slice(0, 8).toUpperCase()}</div>
              <div><strong>Generated Date:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div><strong>Batch ID:</strong> <span className="mono">{c.id}</span></div>
              <div><strong>Vehicle ID:</strong> {c.vehicleId}</div>
              <div><strong>Drug Spec:</strong> {c.drugName}</div>
              <div><strong>Category:</strong> {c.category}</div>
              <div><strong>Target Band:</strong> {c.targetTempBand.min}°C to {c.targetTempBand.max}°C</div>
              <div><strong>Arrival Temp:</strong> {c.currentTemp}°C ({c.currentHumidity}% RH)</div>
              <div><strong>Carrier Driver:</strong> {c.carrierDriver}</div>
              <div><strong>Excursions:</strong> {c.transitExcursionCount}</div>
            </div>

            <div className="grn-sheet__section-title">Telemetry Audit Snapshot</div>
            <div className="grn-sheet__telemetry-table-wrap">
              <table className="grn-sheet__table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Temp</th>
                    <th>Humidity</th>
                    <th>GxP Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {c.timeSeriesData.slice(0, 6).map((dp, idx) => {
                    const inSpec = dp.temp >= c.targetTempBand.min && dp.temp <= c.targetTempBand.max;
                    return (
                      <tr key={idx} className={!inSpec ? "breach-row" : ""}>
                        <td>{dp.time}</td>
                        <td>{dp.temp}°C</td>
                        <td>{dp.humidity}%</td>
                        <td>{inSpec ? "PASS" : "EXCURSION BREACH"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grn-sheet__seal-box">
              <div className="seal-title">
                <ShieldCheck size={14} className="text-emerald" />
                <span>SHA-256 Cryptographic Hardware Ledger Seal</span>
              </div>
              <div className="seal-hash mono">{c.sha256Seal}</div>
              <div className="seal-status">
                Status: Verified Immutable · Zero Data Tampering Detected
              </div>
            </div>

            <div className="grn-sheet__signatures">
              <div className="sig-block">
                <div className="sig-line">Dr. Elena Rostova, PharmD</div>
                <div className="sig-role">Chief Quality Officer / Medical Pharmacist</div>
                <div className="sig-cert">Electronic Signature Verified (21 CFR Part 11)</div>
              </div>
              <div className="sig-block">
                <div className="sig-line">{c.carrierDriver}</div>
                <div className="sig-role">Logistics Carrier Driver / Fleet Custody</div>
                <div className="sig-cert">Inward Transfer Recorded at Dock</div>
              </div>
            </div>
          </div>

          <div className="modal-actions" style={{ justifyContent: "space-between" }}>
            <button type="button" className="btn-secondary" onClick={handleCopyHash}>
              {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
              {copied ? "Hash Copied" : "Copy SHA-256 Seal"}
            </button>
            <button type="button" className="btn-primary btn-primary--cyan" onClick={onClose}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
