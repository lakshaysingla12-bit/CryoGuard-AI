import React, { useState } from "react";
import {
  Truck,
  AlertTriangle,
  Thermometer,
  CheckCircle2,
  Wifi,
  BatteryCharging,
  Radio,
  Lock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import ShipmentMap from "./ShipmentMap";
import { useTheme } from "../context/ThemeContext";

export default function LiveTrackingView({
  consignments = [],
  activeId,
  onSelect,
  onDockCargo,
  onArriveAtGate,
  onNavigate,
  theme: propTheme,
}) {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  const [filter, setFilter] = useState("all");

  const isDockedCheck = (c) =>
    c.isDocked ||
    (c.eta &&
      (c.eta.startsWith("Docked") ||
        c.eta.startsWith("Completed")));

  const isAtGateCheck = (c) => Boolean(c.gateArrived && !isDockedCheck(c));

  const inTransitCount = consignments.filter((c) => !isDockedCheck(c)).length;
  const attentionCount = consignments.filter(
    (c) => c.transitExcursionCount > 0 || c.receiverDisposition === "QUARANTINED"
  ).length;
  const criticalTempCount = consignments.filter(
    (c) =>
      c.currentTemp < c.targetTempBand?.min ||
      c.currentTemp > c.targetTempBand?.max
  ).length;

  const filteredConsignments = consignments.filter((c) => {
    const isCompleted = isDockedCheck(c);
    if (filter === "intransit") return !isCompleted;
    if (filter === "docked") return isCompleted;
    if (filter === "attention")
      return (
        c.transitExcursionCount > 0 || c.receiverDisposition === "QUARANTINED"
      );
    return true;
  });

  const activeConsignment =
    consignments.find((c) => c.id === activeId) ||
    filteredConsignments.find((c) => !isDockedCheck(c)) ||
    filteredConsignments[0] ||
    consignments[0] ||
    null;

  const isSelectedDocked = activeConsignment ? isDockedCheck(activeConsignment) : false;
  const isSelectedAtGate = activeConsignment ? isAtGateCheck(activeConsignment) : false;
  const isSelectedInSpec = activeConsignment
    ? activeConsignment.currentTemp >= activeConsignment.targetTempBand?.min &&
      activeConsignment.currentTemp <= activeConsignment.targetTempBand?.max
    : true;

  const tripProgress = isSelectedDocked
    ? 100
    : isSelectedAtGate
    ? 98
    : activeConsignment?.etaMinutes
    ? Math.max(18, Math.min(92, 100 - activeConsignment.etaMinutes * 2.5))
    : 18;

  return (
    <div className="monitoring-view">
      {/* ── 1. Page Header ── */}
      <div className="monitoring-header">
        <h1>Live Monitoring</h1>
        <p>Watch every vehicle and its sensors in real time</p>
      </div>

      {/* ── 2. Top Stats Strip: Exactly 3 KPI cards matching screenshot ── */}
      <div className="monitoring-stats-strip">
        <div className="monitoring-stat-card">
          <div className="stat-icon-wrap stat-icon-wrap--cyan">
            <Truck size={22} className="text-cyan" />
          </div>
          <div className="stat-info">
            <div className="stat-val">{inTransitCount}</div>
            <div className="stat-lbl">Vehicles on the road</div>
          </div>
        </div>

        <div className="monitoring-stat-card">
          <div className="stat-icon-wrap stat-icon-wrap--amber">
            <AlertTriangle size={22} className="text-amber" />
          </div>
          <div className="stat-info">
            <div className="stat-val">{attentionCount}</div>
            <div className="stat-lbl">Need attention</div>
          </div>
        </div>

        <div className="monitoring-stat-card">
          <div className="stat-icon-wrap stat-icon-wrap--rose">
            <Thermometer size={22} className="text-rose" />
          </div>
          <div className="stat-info">
            <div className="stat-val">{criticalTempCount}</div>
            <div className="stat-lbl">Critical temperature</div>
          </div>
        </div>
      </div>

      {/* ── 3. Middle Main Grid: Map on Left (65%), Vehicles on Right (35%) ── */}
      <div className="monitoring-main-grid">
        {/* Left: Interactive Tracking Map */}
        <div className="monitoring-map-card">
          <ShipmentMap
            consignments={filteredConsignments}
            activeId={activeConsignment?.id}
            onSelect={onSelect}
            theme={theme}
          />
        </div>

        {/* Right: Live Vehicles List */}
        <div className="vehicles-panel">
          <div className="vehicles-panel__header">
            <h3>Vehicles</h3>
            <div className="vehicles-panel__filter-chips">
              <button
                type="button"
                className={`filter-chip filter-chip--all ${filter === "all" ? "filter-chip--active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({consignments.length})
              </button>
              <button
                type="button"
                className={`filter-chip filter-chip--intransit ${filter === "intransit" ? "filter-chip--active" : ""}`}
                onClick={() => setFilter("intransit")}
              >
                In-Transit ({inTransitCount})
              </button>
              <button
                type="button"
                className={`filter-chip filter-chip--docked ${filter === "docked" ? "filter-chip--active" : ""}`}
                onClick={() => setFilter("docked")}
              >
                Docked ({consignments.length - inTransitCount})
              </button>
            </div>
          </div>

          <div className="vehicles-panel__list">
            {filteredConsignments.map((c) => {
              const isActive = c.id === activeConsignment?.id;
              const isDocked = isDockedCheck(c);
              const isAtGate = isAtGateCheck(c);
              const inSpec =
                c.currentTemp >= c.targetTempBand?.min &&
                c.currentTemp <= c.targetTempBand?.max;
              const hasExcursion = c.transitExcursionCount > 0;

              return (
                <div
                  key={c.id}
                  className={`vehicle-card ${isActive ? "vehicle-card--active" : ""} ${
                    hasExcursion ? "vehicle-card--excursion" : ""
                  }`}
                  onClick={() => onSelect(c.id)}
                >
                  <div className="vehicle-card__row-top">
                    <span className="vehicle-card__id">{c.vehicleId}</span>
                    <div className="vehicle-card__temp-group">
                      <span
                        className={`vehicle-card__temp mono ${
                          inSpec ? "text-emerald" : "text-rose"
                        }`}
                      >
                        {c.currentTemp > 0 ? "+" : ""}
                        {c.currentTemp}°C
                      </span>
                      <span
                        className={`vehicle-card__badge ${
                          isDocked
                            ? "badge--docked"
                            : isAtGate
                            ? "badge--gate"
                            : hasExcursion
                            ? "badge--critical"
                            : "badge--intransit"
                        }`}
                      >
                        {isDocked ? "Docked" : isAtGate ? "At Gate" : hasExcursion ? "Excursion" : "En Route"}
                      </span>
                    </div>
                  </div>
                  <div className="vehicle-card__row-bottom">
                    <span className="vehicle-card__cargo">{c.drugName}</span>
                    <span className="vehicle-card__loc-tag">
                      {isDocked
                        ? "Docked"
                        : isAtGate
                        ? "Gate B"
                        : `${c.etaMinutes || 14}m ETA`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Section: Selected Shipment Details below Map and Vehicles ── */}
      {activeConsignment && (
        <div className="monitoring-detail-panel">
          <div className="detail-header">
            <div className="detail-title-group">
              <h2>
                {activeConsignment.vehicleId} · {activeConsignment.drugName}
              </h2>
              <div className="detail-subtitle">
                <span>{activeConsignment.origin}</span>
                <span className="route-arrow">→</span>
                <span>
                  {isSelectedDocked
                    ? activeConsignment.dockLocation || "Pune Terminal · Bay 01"
                    : isSelectedAtGate
                    ? "Pune Facility Gate B (Perimeter)"
                    : activeConsignment.facilityName || "Pune Frozen Foods Distribution Hub"}
                </span>
                <span className="dot-divider">·</span>
                <span>Driver {activeConsignment.carrierDriver}</span>
                <span className="dot-divider">·</span>
                <span className="text-cyan font-bold">
                  {isSelectedDocked
                    ? "100% Completed (Docked at Hospital)"
                    : isSelectedAtGate
                    ? "Arrived at Gate (Geofence Verified)"
                    : `${tripProgress}% of trip done (${activeConsignment.etaMinutes ? `${activeConsignment.etaMinutes}m ETA` : "En Route"} · ${activeConsignment.remainingDistanceKm || "6.4"} km left)`}
                </span>
              </div>
            </div>

            <div className="detail-actions">
              {/* Dynamic Status Pill */}
              <span
                className={`detail-status-pill ${
                  isSelectedDocked
                    ? "pill--docked"
                    : isSelectedAtGate
                    ? "pill--gate"
                    : isSelectedInSpec
                    ? "pill--intransit"
                    : "pill--critical"
                }`}
              >
                {isSelectedDocked
                  ? `Docked at ${activeConsignment.dockLocation || "Terminal Bay"}`
                  : isSelectedAtGate
                  ? "At Hospital Gate B · Ready to Dock"
                  : isSelectedInSpec
                  ? `En Route (${activeConsignment.remainingDistanceKm || "6.4"} km away)`
                  : "Critical Temp Excursion"}
              </span>

              {/* ── Realistic 3-Stage Docking Workflow ── */}
              {isSelectedDocked ? (
                /* State 3: Already Docked -> Quick link to inspect in Intake Ledger */
                onNavigate && (
                  <button
                    type="button"
                    className="btn-view-ledger"
                    onClick={() => onNavigate("ledger")}
                    title="View this consignment in Intake Ledger for quality inspection & release"
                  >
                    <ExternalLink size={14} />
                    <span>View in Intake Ledger</span>
                  </button>
                )
              ) : isSelectedAtGate ? (
                /* State 2: Arrived at Gate -> Can now authorize bay entry and dock! */
                <button
                  type="button"
                  className="btn-dock-cargo btn-dock-ready"
                  onClick={() => onDockCargo && onDockCargo(activeConsignment.id)}
                  title="Authorize gate entry and dock vehicle at designated receiving bay"
                >
                  <CheckCircle2 size={15} />
                  <span>Authorize & Dock at Bay ({activeConsignment.dockLocation ? activeConsignment.dockLocation.replace("Allocated: ", "") : "Dock D"})</span>
                </button>
              ) : (
                /* State 1: En Route on road -> Cannot dock yet! Provide Gate Arrival simulation */
                <div className="en-route-actions">
                  <button
                    type="button"
                    className="btn-dock-locked"
                    disabled
                    title={`Cannot dock yet: Vehicle is currently ${activeConsignment.remainingDistanceKm || "6.4"} km away on the road.`}
                  >
                    <Lock size={13} />
                    <span>Docking Locked (En Route)</span>
                  </button>

                  {onArriveAtGate && (
                    <button
                      type="button"
                      className="btn-gate-arrival"
                      onClick={() => onArriveAtGate(activeConsignment.id)}
                      title="Simulate vehicle reaching Pune Hub Gate B"
                    >
                      <MapPin size={13} className="text-cyan animate-pulse" />
                      <span>Simulate Gate Arrival</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4 Sensor Telemetry Tiles */}
          <div className="detail-metrics-grid">
            {/* 1. Temperature */}
            <div className="metric-tile">
              <div className="metric-tile__lbl">Temperature</div>
              <div
                className={`metric-tile__val ${
                  isSelectedInSpec ? "text-emerald" : "text-rose"
                }`}
              >
                {activeConsignment.currentTemp > 0 ? "+" : ""}
                {activeConsignment.currentTemp}°C
              </div>
              <div className="metric-tile__sub">
                Target: {activeConsignment.targetTempBand?.min}° to{" "}
                {activeConsignment.targetTempBand?.max}°C
              </div>
            </div>

            {/* 2. Humidity */}
            <div className="metric-tile">
              <div className="metric-tile__lbl">Humidity</div>
              <div className="metric-tile__val">
                {activeConsignment.currentHumidity}%
              </div>
              <div className="metric-tile__sub">Relative Humidity (Safe Band)</div>
            </div>

            {/* 3. Vibration */}
            <div className="metric-tile">
              <div className="metric-tile__lbl">Vibration</div>
              <div className="metric-tile__val text-cyan">
                {isSelectedDocked || isSelectedAtGate ? "0.02 g" : "0.12 g"}
              </div>
              <div className="metric-tile__sub">
                {isSelectedDocked || isSelectedAtGate ? "Stationary (No Shock)" : "Normal 3-Axis Shock"}
              </div>
            </div>

            {/* 4. Speed */}
            <div className="metric-tile">
              <div className="metric-tile__lbl">Speed</div>
              <div className="metric-tile__val text-cyan">
                {isSelectedDocked || isSelectedAtGate ? "0 km/h" : `${activeConsignment.currentSpeedKmh || 48} km/h`}
              </div>
              <div className="metric-tile__sub">
                {isSelectedDocked
                  ? "Docked · Stationary"
                  : isSelectedAtGate
                  ? "At Hospital Gate B (Stationary)"
                  : `${activeConsignment.remainingDistanceKm || "6.4"} km to Hospital`}
              </div>
            </div>
          </div>

          {/* Telemetry Status Bar */}
          <div className="detail-footer-telemetry">
            <div className="telemetry-badges">
              <span className="telemetry-badge">
                <Wifi size={13} className="text-emerald" />
                <span>IoT 5G Gateway Active</span>
              </span>
              <span className="telemetry-badge">
                <BatteryCharging size={13} className="text-cyan" />
                <span>Sensor Battery 98%</span>
              </span>
              <span className="telemetry-badge">
                <Radio size={13} className="text-emerald animate-pulse" />
                <span>Live Telemetry Stream (1s ping)</span>
              </span>
            </div>
            <div className="telemetry-id mono">
              BATCH ID: {activeConsignment.id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
