// src/components/Shipments.jsx
import React from 'react';
import { Truck, MapPin, ChevronRight } from 'lucide-react';
import { useCryoGuard } from '../context/CryoGuardContext.jsx';

export default function Shipments() {
  const { filteredVehicles, selectedVehicle, selectVehicle } = useCryoGuard();

  return (
    <div className="cg-card mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0 text-light fw-bold d-flex align-items-center gap-2">
            <Truck size={18} className="text-info" /> Active Cold-Chain Shipments
          </h5>
          <span className="text-secondary small">Click any shipment to inspect real-time sensor telematics</span>
        </div>
        <span className="small text-muted">{filteredVehicles.length} Vehicles in Transit</span>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
          <thead>
            <tr className="text-secondary small border-bottom" style={{ borderColor: 'var(--cg-border)' }}>
              <th>ID / ROUTE</th>
              <th>CARGO / SECTOR</th>
              <th>TEMPERATURE</th>
              <th>DRIVER</th>
              <th>ETA / DISTANCE</th>
              <th className="text-end">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              const isExcursion = v.temperature > v.maxTemp || v.temperature < v.minTemp;

              return (
                <tr
                  key={v.id}
                  onClick={() => selectVehicle(v)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: 'var(--cg-border)'
                  }}
                >
                  <td>
                    <div className="fw-bold text-info font-monospace">{v.id}</div>
                    <div className="small text-secondary d-flex align-items-center gap-1">
                      <MapPin size={12} className="text-muted" /> {v.route}
                    </div>
                  </td>
                  <td>
                    <div className="text-light fw-semibold small">{v.cargo}</div>
                    <span className="cg-sector-pill">{v.category}</span>
                  </td>
                  <td>
                    <span
                      className="font-monospace fw-bold"
                      style={{ color: isExcursion ? '#ef4444' : '#38bdf8', fontSize: '0.95rem' }}
                    >
                      {v.temperature > 0 ? `+${v.temperature}°C` : `${v.temperature}°C`}
                    </span>
                    <div className="text-muted small">Req: {v.minTemp}°C to {v.maxTemp}°C</div>
                  </td>
                  <td>
                    <div className="text-light small fw-medium">{v.driver}</div>
                    <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{v.driverPhone}</div>
                  </td>
                  <td>
                    <div className="text-success small fw-bold">{v.eta}</div>
                    <div className="text-muted small">{v.distanceLeft}</div>
                  </td>
                  <td className="text-end">
                    <span className={`cg-badge cg-badge-${v.status.toLowerCase().replace(' ', '')}`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}