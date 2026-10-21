import React, { useState } from "react";
import { AlertOctagon, ShieldAlert, X, FileWarning, Lock } from "lucide-react";
import { sound } from "../utils/soundFx";

export default function QuarantineModal({ consignment, onClose, onConfirm }) {
  const [reason, setReason] = useState(
    consignment.transitExcursionCount > 0
      ? "Thermal Excursion: Temperature exceeded upper specification limit during transit"
      : "Physical Packaging Compromised: Damaged dry-ice packaging or broken tamper seal"
  );
  const [capaCode, setCapaCode] = useState(`CAPA-DEV-${Date.now().toString().slice(-5)}`);
  const [quarantineBay, setQuarantineBay] = useState("Quarantine Isolation Vault Q-01 (Locked)");
  const [notifyQA, setNotifyQA] = useState(true);
  const [operatorPin, setOperatorPin] = useState("8841");
  const [notes, setNotes] = useState(
    consignment.transitExcursionCount > 0
      ? `Batch demonstrated ${consignment.transitExcursionCount} thermal breach(es). Temperature spiked to ${Math.max(...consignment.timeSeriesData.map(d => d.temp))}°C. Product integrity compromised.`
      : "Visual inspection revealed non-conformance. Batch segregated for QA investigation."
  );

  if (!consignment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.alert();
    onConfirm(consignment.id, reason, capaCode, quarantineBay, notes, notifyQA);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-dialog--danger" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header--quarantine">
          <div className="modal-header__title-group">
            <ShieldAlert className="modal-header__icon text-rose" size={24} />
            <div>
              <h3>Mandatory GxP Quarantine &amp; Batch Rejection</h3>
              <p>Segregate Non-Compliant Consignment under CAPA Protocol</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="modal-summary-card modal-summary-card--danger">
            <div className="modal-summary-card__row">
              <span className="label">Quarantined Batch ID:</span>
              <span className="value mono text-rose">{consignment.id}</span>
            </div>
            <div className="modal-summary-card__row">
              <span className="label">Pharmaceutical:</span>
              <span className="value">{consignment.drugName}</span>
            </div>
            <div className="modal-summary-card__row">
              <span className="label">Excursion Breaches:</span>
              <span className="value text-rose font-bold">
                {consignment.transitExcursionCount} Critical Excursion(s) Detected
              </span>
            </div>
            <div className="modal-summary-card__row">
              <span className="label">Delivery Carrier:</span>
              <span className="value">{consignment.carrierDriver} ({consignment.vehicleId})</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileWarning size={14} className="text-rose" />
              Non-Conformance Classification
            </label>
            <select
              className="form-select form-select--danger"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="Thermal Excursion: Temperature exceeded upper specification limit during transit">
                Thermal Excursion: Temperature exceeded upper limit
              </option>
              <option value="Thermal Excursion: Temperature dropped below minimum cryo threshold">
                Thermal Excursion: Temperature dropped below minimum threshold
              </option>
              <option value="Cryptographic Seal Discrepancy: Sensor payload checksum mismatch">
                Cryptographic Seal Discrepancy: Sensor checksum mismatch
              </option>
              <option value="Packaging Integrity Breach: Container seal breached or dry ice depleted">
                Packaging Integrity Breach: Container seal breached / dry ice depleted
              </option>
              <option value="Suspected Product Tampering: Physical inspection failure">
                Suspected Product Tampering: Physical inspection failure
              </option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CAPA Deviation Number</label>
              <input
                type="text"
                className="form-input mono"
                value={capaCode}
                onChange={(e) => setCapaCode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quarantine Isolation Vault</label>
              <select
                className="form-select"
                value={quarantineBay}
                onChange={(e) => setQuarantineBay(e.target.value)}
              >
                <option value="Quarantine Isolation Vault Q-01 (Locked)">
                  Quarantine Isolation Vault Q-01 (Locked)
                </option>
                <option value="Cold Quarantine Bay Q-02 (2-8°C Controlled)">
                  Cold Quarantine Bay Q-02 (2-8°C Controlled)
                </option>
                <option value="Ultra-Low Cryo Quarantine Chamber Q-Cryo">
                  Ultra-Low Cryo Quarantine Chamber Q-Cryo
                </option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quality Investigation / Root-Cause Notes</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail root cause rationale for permanent GxP audit trail..."
              required
            />
          </div>

          <div className="checkbox-stack">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={notifyQA}
                onChange={(e) => setNotifyQA(e.target.checked)}
              />
              <span>Trigger automated emergency dispatch to VP Quality Assurance &amp; Vendor.</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Dismiss
            </button>
            <button type="submit" className="btn-primary btn-primary--rose">
              <AlertOctagon size={16} />
              Enforce Batch Quarantine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
