import React from "react";
import { FileText, ShieldCheck, X } from "lucide-react";

export default function GRNPreviewModal({ consignment, onClose }) {
  if (!consignment) return null;

  const c = consignment;
  const isAdmitted = c.receiverDisposition === "ADMITTED";
  const isQuarantined = c.receiverDisposition === "QUARANTINED";

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
                <h2>{c.facilityName ? c.facilityName.toUpperCase() : "PUNE FROZEN FOODS DISTRIBUTION HUB"}</h2>
                <div className="sub">DEPARTMENT OF QUALITY ASSURANCE &amp; COLD-CHAIN RECEIVING</div>
                <div className="meta">Cold-Chain Quality Intake &amp; Regulatory Audit Portal</div>
              </div>
              <div className={`grn-sheet__stamp grn-sheet__stamp--${c.receiverDisposition.toLowerCase()}`}>
                {isAdmitted ? "CLEARED & ADMITTED" : isQuarantined ? "REJECTED & QUARANTINED" : "PENDING INSPECTION"}
              </div>
            </div>

            <div className="grn-sheet__meta-grid">
              <div><strong>Document Ref:</strong> GRN-{c.id}</div>
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
                <span>Intake Verification</span>
              </div>
              <div className="seal-status">
                Status: Telemetry reviewed against the validated temperature band
              </div>
            </div>

            <div className="grn-sheet__signatures">
              <div className="sig-block">
                <div className="sig-line">{c.auditor || "Kabir Anand, Lead Auditor"}</div>
                <div className="sig-role">Chief Quality Assurance Auditor &amp; Compliance Officer</div>
                <div className="sig-cert">Electronic Signature Verified (21 CFR Part 11)</div>
              </div>
              <div className="sig-block">
                <div className="sig-line">{c.carrierDriver}</div>
                <div className="sig-role">Logistics Carrier Driver / Fleet Custody</div>
                <div className="sig-cert">Inward Transfer Recorded at Dock</div>
              </div>
            </div>
          </div>

          <div className="modal-actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn-primary btn-primary--cyan" onClick={onClose}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
