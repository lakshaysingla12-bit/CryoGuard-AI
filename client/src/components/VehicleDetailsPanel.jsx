// src/components/VehicleDetailsPanel.jsx
import React from 'react';
import { Truck, Thermometer, Wind, AlertOctagon, Zap, Shield, Phone } from 'lucide-react';
import { useCryoGuard } from '../context/CryoGuardContext.jsx';

export default function VehicleDetailsPanel() {
  const { selectedVehicle, boostCooling } = useCryoGuard();

  if (!selectedVehicle) {
    return (
      <div className="cg-card p-4 text-center text-muted">
        <Truck size={32} className="mb-2 text-secondary" />
        <p>Select a vehicle to inspect live telematics.</p>
      </div>
    );
  }

  const isExcursion = selectedVehicle.temperature > selectedVehicle.maxTemp || selectedVehicle.temperature < selectedVehicle.minTemp;

  return (
    <div className="cg-card">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: 'var(--cg-border)' }}>
        <div>
          <span className="small text-info fw-bold">{selectedVehicle.shipmentId}</span>
          <h5 className="mb-0 text-light fw-bold">{selectedVehicle.id}</h5>
        </div>
        <span className={`cg-badge cg-badge-${selectedVehicle.status.toLowerCase().replace(' ', '')}`}>
          {selectedVehicle.status}
        </span>
      </div>

      <p className="text-secondary small mb-2 fw-semibold">{selectedVehicle.cargo}</p>
      <span className="cg-sector-pill mb-3">{selectedVehicle.category}</span>

      {/* Telemetry Mini Cards */}
      <div className="row g-2 mb-3">
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(14,23,42,0.7)', border: '1px solid var(--cg-border)' }}>
            <Thermometer size={16} className="text-info mb-1" />
            <div className="fw-bold text-light small">{selectedVehicle.temperature}°C</div>
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Temp</div>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(14,23,42,0.7)', border: '1px solid var(--cg-border)' }}>
            <Wind size={16} className="text-info mb-1" />
            <div className="fw-bold text-light small">{selectedVehicle.humidity}%</div>
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Humidity</div>
          </div>
        </div>
        <div className="col-4">
          <div className="p-2 rounded text-center" style={{ backgroundColor: 'rgba(14,23,42,0.7)', border: '1px solid var(--cg-border)' }}>
            <Zap size={16} className="text-info mb-1" />
            <div className="fw-bold text-light small">{selectedVehicle.batteryLevel}%</div>
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Power</div>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="p-2 rounded mb-3" style={{ backgroundColor: 'rgba(14,23,42,0.5)', border: '1px solid var(--cg-border)' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="small text-light fw-bold">{selectedVehicle.driver}</div>
            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{selectedVehicle.driverPhone}</div>
          </div>
          <button 
            className="btn btn-sm btn-outline-info"
            onClick={() => alert(`Calling ${selectedVehicle.driver}...`)}
          >
            <Phone size={13} /> Call
          </button>
        </div>
      </div>

      {/* Action Button: Emergency Turbo Boost */}
      <button
        className={`btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2 ${isExcursion ? 'btn-danger' : 'btn-outline-warning'}`}
        onClick={() => boostCooling(selectedVehicle.id)}
      >
        <Zap size={16} /> Remote Turbo Boost Cooling (-0.4°C)
      </button>
    </div>
  );
}