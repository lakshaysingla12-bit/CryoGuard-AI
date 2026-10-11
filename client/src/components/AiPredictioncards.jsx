// src/components/AiPredictioncards.jsx
import React from 'react';
import { BrainCircuit, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { useCryoGuard } from '../context/CryoGuardContext.jsx';

export default function AiPredictioncards() {
  const { aiPrediction, boostCooling, selectedVehicle } = useCryoGuard();

  const data = aiPrediction || {
    riskScore: '78%',
    status: 'High Spoilage Risk',
    targetTruck: 'TRK-03',
    projectedTime: '24 mins until irreversible damage',
    recommendation: 'Trigger Remote Turbo Boost Cooling and reroute to nearest Surat cold hub.'
  };

  return (
    <div className="cg-card mb-4" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <BrainCircuit size={20} />
          </div>
          <div>
            <h5 className="mb-0 text-light fw-bold">CryoGuard AI Predictive Risk Model</h5>
            <span className="text-secondary small">Thermal drift machine learning analysis</span>
          </div>
        </div>
        <span className="cg-badge cg-badge-warning">{data.status}</span>
      </div>

      <div className="row g-3 align-items-center">
        <div className="col-12 col-md-3 text-center border-end" style={{ borderColor: 'var(--cg-border)' }}>
          <div className="display-6 fw-bold text-warning mb-0">{data.riskScore}</div>
          <div className="text-muted small">AI Spoilage Probability</div>
        </div>

        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center gap-2 mb-1">
            <AlertTriangle size={15} className="text-warning" />
            <strong className="text-light small">Target Vehicle: {data.targetTruck}</strong>
          </div>
          <p className="text-secondary small mb-1">{data.projectedTime}</p>
          <div className="p-2 rounded small" style={{ backgroundColor: 'rgba(14, 23, 42, 0.6)', border: '1px solid var(--cg-border)', color: '#cbd5e1' }}>
            <strong>Action Recommended:</strong> {data.recommendation}
          </div>
        </div>

        <div className="col-12 col-md-3">
          <button
            className="btn btn-warning text-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => {
              boostCooling(data.targetTruck);
              alert(`AI Turbo Boost Dispatched to ${data.targetTruck}! Cooling increased.`);
            }}
          >
            <Zap size={16} /> Execute AI Fix
          </button>
        </div>
      </div>
    </div>
  );
}