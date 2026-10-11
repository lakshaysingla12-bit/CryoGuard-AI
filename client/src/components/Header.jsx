// src/components/Header.jsx
import React from 'react';
import { Search, Bell, Shield, Radio, Activity } from 'lucide-react';
import { useCryoGuard } from '../context/CryoGuardContext.jsx';

export default function Header() {
  const { searchQuery, setSearchQuery, isSimulating, toggleSimulation, isBackendConnected } = useCryoGuard();

  return (
    <header className="top-navbar">
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          className="search-input"
          placeholder="Search cargo, truck ID, driver, destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="d-flex align-items-center gap-3">
        <button
          className={`btn btn-sm ${isSimulating ? 'btn-outline-info' : 'btn-outline-secondary'} d-flex align-items-center gap-2`}
          onClick={toggleSimulation}
          type="button"
        >
          <Radio size={14} className={isSimulating ? 'text-info' : 'text-muted'} />
          <span className="small">{isSimulating ? 'IoT Telematics: LIVE' : 'IoT Paused'}</span>
        </button>

        <span className="cg-sector-pill">
          <Shield size={13} /> Multi-Sector Cold Chain
        </span>

        <div className="d-flex align-items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(14,23,42,0.6)', border: '1px solid var(--cg-border)' }}>
          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
            VK
          </div>
          <div className="d-flex flex-column text-start">
            <span className="small fw-bold text-light">Vikram Malhotra</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cold-Chain Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
}