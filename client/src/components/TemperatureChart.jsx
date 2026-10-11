// src/components/TemperatureChart.jsx
import React from 'react';
import { Activity } from 'lucide-react';
import { useCryoGuard } from '../context/CryoGuardContext.jsx';

export default function TemperatureChart() {
  const { tempTrendData, selectedVehicle } = useCryoGuard();

  const data = tempTrendData || [
    { time: '00:00', temp: -18.5, ideal: -20.0 },
    { time: '04:00', temp: -19.0, ideal: -20.0 },
    { time: '08:00', temp: -17.8, ideal: -20.0 },
    { time: '12:00', temp: -16.2, ideal: -20.0 },
    { time: '16:00', temp: -14.2, ideal: -20.0 },
    { time: '20:00', temp: -18.0, ideal: -20.0 }
  ];

  return (
    <div className="cg-card mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0 text-light fw-bold d-flex align-items-center gap-2">
            <Activity size={18} className="text-info" /> 24-Hour Temperature Telemetry Trend
          </h5>
          <span className="text-secondary small">
            Monitoring {selectedVehicle?.id || 'Fleet'} ({selectedVehicle?.cargo || 'Cold-Chain'})
          </span>
        </div>
        <div className="d-flex align-items-center gap-3 small text-secondary">
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: '12px', height: '3px', background: '#38bdf8', display: 'inline-block' }}></span> Actual Temp
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: '12px', height: '3px', background: '#10b981', display: 'inline-block' }}></span> Ideal Threshold
          </span>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div style={{ height: '180px', width: '100%' }}>
        <svg viewBox="0 0 600 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Grid lines */}
          <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

          {/* Ideal line (Green) */}
          <line x1="30" y1="95" x2="570" y2="95" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />

          {/* Actual line (Cyan) */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            points="50,90 140,94 230,82 320,68 410,48 500,85"
          />

          {/* Data Points */}
          {[
            { x: 50, y: 90, val: '-18.5°C' },
            { x: 140, y: 94, val: '-19.0°C' },
            { x: 230, y: 82, val: '-17.8°C' },
            { x: 320, y: 68, val: '-16.2°C' },
            { x: 410, y: 48, val: '-14.2°C (Peak)' },
            { x: 500, y: 85, val: '-18.0°C' },
          ].map((pt, idx) => (
            <g key={idx}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#070d18" stroke="#00e5ff" strokeWidth="2" />
              <text x={pt.x} y={pt.y - 10} fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                {pt.val}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}