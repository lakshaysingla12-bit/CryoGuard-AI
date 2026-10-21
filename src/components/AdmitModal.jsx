import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, X, Thermometer, Warehouse, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { sound } from "../utils/soundFx";

export default function AdmitModal({ consignment, onClose, onConfirm }) {
  const [location, setLocation] = useState(
    consignment.category === "Ultra-Cold Cryo"
      ? "Cryo-Vault Alpha (Ultra-Low -80°C Unit 01)"
      : consignment.category === "Refrigerated Biologics"
      ? "Main Pharmacy Cold Vault B (2°C - 8°C)"
      : "Ambient Plasma Depot (Controlled Room 20°C - 25°C)"
  );
  const [operatorPin, setOperatorPin] = useState("8841");
  const [notes, setNotes] = useState("All thermal intervals verified within acceptable release tolerances.");
  const [checks, setChecks] = useState({
    sealIntact: true,
    tempVerified: true,
    inspectionPassed: true,
  });

  if (!consignment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checks.sealIntact || !checks.tempVerified || !checks.inspectionPassed) {
      alert("Please certify all GxP compliance verifications before proceeding.");
      return;
    }

    // Trigger celebratory clinical clearance confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10b981", "#38bdf8", "#34d399", "#ffffff"],
      });
    } catch {
      // Ignore if unavailable
    }

    sound.success();
    onConfirm(consignment.id, location, notes, operatorPin);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header--admit">
          <div className="modal-header__title-group">
            <ShieldCheck className="modal-header__icon text-emerald" size={24} />
            <div>
              <h3>Execute GxP Intake Clearance</h3>
              <p>Admit Batch into Clinical Cold Storage Inventory</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="modal-summary-card">
            <div className="modal-summary-card__row">
              <span className="label">Batch Identifier:</span>
              <span className="value mono text-cyan">{consignment.id}</span>
            </div>
            <div className="modal-summary-card__row">
              <span className="label">Pharmaceutical:</span>
              <span className="value">{consignment.drugName}</span>
            </div>
            <div className="modal-summary-card__row">
              <span className="label">Validated Temp Band:</span>
              <span className="value text-emerald">
                {consignment.targetTempBand.min}°C to {consignment.targetTempBand.max}°C
              </span>
            </div>
            <div className="modal-summary-card__row">
              <span className="label">Arrival Reading:</span>
              <span className="value text-emerald">
                {consignment.currentTemp > 0 ? "+" : ""}{consignment.currentTemp}°C ({consignment.currentHumidity}% RH)
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Warehouse size={14} className="text-cyan" />
              Target Storage Vault Allocation
            </label>
            <select
              className="form-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="Cryo-Vault Alpha (Ultra-Low -80°C Unit 01)">
                Cryo-Vault Alpha (Ultra-Low -80°C Unit 01)
              </option>
              <option value="Cryo-Vault Beta (Ultra-Low -70°C Unit 02)">
                Cryo-Vault Beta (Ultra-Low -70°C Unit 02)
              </option>
              <option value="Main Pharmacy Cold Vault B (2°C - 8°C)">
                Main Pharmacy Cold Vault B (2°C - 8°C)
              </option>
              <option value="Biologics Storage Unit C-4 (2°C - 8°C)">
                Biologics Storage Unit C-4 (2°C - 8°C)
              </option>
              <option value="Ambient Plasma Depot (Controlled Room 20°C - 25°C)">
                Ambient Plasma Depot (Controlled Room 20°C - 25°C)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">GxP 21 CFR Part 11 Electronic Signature PIN</label>
            <div className="input-with-icon">
              <Lock size={15} className="input-icon" />
              <input
                type="password"
                className="form-input"
                value={operatorPin}
                onChange={(e) => setOperatorPin(e.target.value)}
                placeholder="Enter 4-digit Pharmacist PIN"
                maxLength={6}
                required
              />
            </div>
            <span className="form-hint">
              Authenticated Operator: Dr. Elena Rostova, PharmD (Chief Quality Inspector)
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Pharmacist Intake Notes / Batch Log</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add release observations..."
            />
          </div>

          <div className="checkbox-stack">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={checks.sealIntact}
                onChange={(e) => setChecks({ ...checks, sealIntact: e.target.checked })}
              />
              <span>Tamper-evident hardware seal intact; SHA-256 integrity verified.</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={checks.tempVerified}
                onChange={(e) => setChecks({ ...checks, tempVerified: e.target.checked })}
              />
              <span>In-transit thermal telemetry conforms to manufacturer specifications.</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={checks.inspectionPassed}
                onChange={(e) => setChecks({ ...checks, inspectionPassed: e.target.checked })}
              />
              <span>Secondary packaging, vials, and labeling undamaged upon dock receipt.</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-primary--emerald">
              <CheckCircle2 size={16} />
              Confirm &amp; Admit to Storage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
