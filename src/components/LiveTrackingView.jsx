import React, { useState } from "react";
import {
  Truck,
  Navigation,
  Activity,
  Wifi,
  BatteryCharging,
  Clock,
  Compass,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Timer
} from "lucide-react";
import ShipmentMap from "./ShipmentMap";
import { sound } from "../utils/soundFx";

export default function LiveTrackingView({
  consignments,
  activeId,
  onSelect,
  onDockCargo, // Callback when in-transit cargo reaches dock
  theme = "dark",
}) {
  const [filter, setFilter] = useState("all");

  const filteredConsignments = consignments.filter((c) => {
    const isCompleted = c.isDocked || c.eta.startsWith("Docked") || c.eta.startsWith("Completed");
    if (filter === "intransit") return !isCompleted;
    if (filter === "docked") return isCompleted;
    if (filter === "excursion") return c.transitExcursionCount > 0;
    return true;
  });

  const activeConsignment = consignments.find((c) => c.id === activeId) || null;

  const inTransitCount = consignments.filter(
    (c) => !(c.isDocked || c.eta.startsWith("Docked") || c.eta.startsWith("Completed"))
  ).length;

  const dockedCount = consignments.filter(
    (c) => c.isDocked || c.eta.startsWith("Docked") || c.eta.startsWith("Completed")
  ).length;

  return (
    <div className="tracking-view">
      {/* Fleet Stats Banner */}
      <div className="tracking-banner">
        <div className="tracking-banner__item">
          <Truck size={20} className="text-cyan" />
          <div>
            <div className="title">Active Cold Fleet</div>
            <div className="val">{consignments.length} Monitored Transports</div>
          </div>
        </div>
        <div className="tracking-banner__item">
          <Navigation size={20} className="text-emerald" />
          <div>
            <div className="title">Dock Proximity</div>
            <div className="val">
              {dockedCount} Docked · {inTransitCount} In-Transit
            </div>
          </div>
        </div>
        <div className="tracking-banner__item">
          <Activity size={20} className={consignments.some(c => c.transitExcursionCount > 0) ? "text-rose" : "text-emerald"} />
          <div>
            <div className="title">Telemetry Integrity</div>
            <div className="val">
              {consignments.reduce((acc, c) => acc + c.transitExcursionCount, 0)} Active Breach(es)
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Fleet List, Right Full Map */}
      <div className="tracking-grid">
        <div className="tracking-sidebar">
          <div className="tracking-sidebar__filter">
            <button
              className={`filter-chip ${filter === "all" ? "filter-chip--active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({consignments.length})
            </button>
            <button
              className={`filter-chip ${filter === "intransit" ? "filter-chip--active" : ""}`}
              onClick={() => setFilter("intransit")}
            >
              In Transit ({inTransitCount})
            </button>
            <button
              className={`filter-chip ${filter === "docked" ? "filter-chip--active" : ""}`}
              onClick={() => setFilter("docked")}
            >
              Docked ({dockedCount})
            </button>
            <button
              className={`filter-chip ${filter === "excursion" ? "filter-chip--active" : ""}`}
              onClick={() => setFilter("excursion")}
            >
              Breaches ({consignments.filter(c => c.transitExcursionCount > 0).length})
            </button>
          </div>

          <div className="tracking-card-list">
            {filteredConsignments.map((c) => {
              const isActive = c.id === activeId;
              const hasExcursion = c.transitExcursionCount > 0;
              const isDocked = c.isDocked || c.eta.startsWith("Docked") || c.eta.startsWith("Completed");
              const inSpec =
                c.currentTemp >= c.targetTempBand.min &&
                c.currentTemp <= c.targetTempBand.max;

              return (
                <div
                  key={c.id}
                  className={`fleet-card ${isActive ? "fleet-card--active" : ""} ${
                    hasExcursion ? "fleet-card--breach" : ""
                  } ${!isDocked ? "fleet-card--intransit" : ""}`}
                  onClick={() => {
                    sound.click();
                    onSelect(c.id);
                  }}
                >
                  <div className="fleet-card__header">
                    <div>
                      <span className="fleet-card__batch mono">{c.id}</span>
                      <span className="fleet-card__vehicle">{c.vehicleId}</span>
                    </div>
                    <span
                      className={`badge ${
                        c.receiverDisposition === "ADMITTED"
                          ? "badge--admitted"
                          : c.receiverDisposition === "QUARANTINED"
                          ? "badge--quarantined"
                          : isDocked
                          ? "badge--safe"
                          : "badge--pending"
                      }`}
                    >
                      {isDocked
                        ? c.receiverDisposition === "PENDING"
                          ? "Docked · Ready for Intake"
                          : c.receiverDisposition
                        : "In-Transit"}
                    </span>
                  </div>

                  <div className="fleet-card__drug">{c.drugName}</div>

                  {/* ─────────────────────────────────────────────────────────────
                      ETA SECTION FOR EVERY LIVE CARGO NOT REACHED YET
                      ───────────────────────────────────────────────────────────── */}
                  {!isDocked && (
                    <div className="live-eta-box">
                      <div className="live-eta-header">
                        <div className="live-eta-title">
                          <Timer size={14} className="text-cyan animate-pulse" />
                          <span>Estimated Time of Arrival (ETA)</span>
                        </div>
                        <span className="live-eta-countdown mono font-bold text-cyan">
                          {c.etaMinutes ? `${c.etaMinutes} mins` : "12 mins"}
                        </span>
                      </div>

                      <div className="live-eta-details">
                        <div className="eta-detail-item">
                          <Clock size={12} className="text-muted" />
                          <span>Arrival: <strong className="mono text-primary">{c.etaTimestamp || "01:25 AM"}</strong></span>
                        </div>
                        <div className="eta-detail-item">
                          <Compass size={12} className="text-muted" />
                          <span>Distance: <strong className="mono text-primary">{c.remainingDistanceKm || "6.4"} km</strong></span>
                        </div>
                        <div className="eta-detail-item">
                          <Activity size={12} className="text-muted" />
                          <span>Speed: <strong className="mono text-primary">{c.currentSpeedKmh || "48"} km/h</strong></span>
                        </div>
                      </div>

                      <div className="live-eta-progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.max(25, 100 - (c.etaMinutes ? c.etaMinutes * 2.5 : 30))}%`,
                          }}
                        />
                      </div>

                      <div className="dock-cargo-action">
                        <button
                          className="btn-dock-simulate"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.success();
                            if (onDockCargo) onDockCargo(c.id);
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Dock at Bay 03 (Auto-Add to Intake Ledger)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="fleet-card__metrics">
                    <div className="metric">
                      <span className="label">Cargo Temp</span>
                      <span
                        className={`value mono ${
                          inSpec ? "text-emerald" : "text-rose font-bold"
                        }`}
                      >
                        {c.currentTemp > 0 ? "+" : ""}
                        {c.currentTemp}°C
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">Target Band</span>
                      <span className="value mono text-muted">
                        {c.targetTempBand.min}° to {c.targetTempBand.max}°
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">Humidity</span>
                      <span className="value mono">{c.currentHumidity}%</span>
                    </div>
                  </div>

                  <div className="fleet-card__footer">
                    <span className="eta text-cyan">
                      {isDocked ? "📍 Docked at Bay 03" : `📍 En Route — ${c.etaMinutes ? `${c.etaMinutes}m ETA` : "12m ETA"}`}
                    </span>
                    <div className="telemetry-pings">
                      <Wifi size={13} className="text-emerald" title="IoT 5G Gateway Active" />
                      <BatteryCharging size={13} className="text-cyan" title="Sensor Battery 98%" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tracking-map-panel">
          <ShipmentMap
            consignments={filteredConsignments}
            activeId={activeId}
            onSelect={onSelect}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
