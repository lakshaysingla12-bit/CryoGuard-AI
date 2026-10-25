import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCityCoordinates } from "../../utils/cityCoordinates";
import {
  getRoadRoute,
  snapTruckToRoad,
  splitRoadRoute,
} from "../../utils/routeGeometry";

// ── Custom Leaflet Icons ──

function createTruckIcon(tempStatus = "normal", label = "", isSelected = false) {
  const color =
    tempStatus === "critical"
      ? "#ef4444"
      : tempStatus === "warning"
      ? "#f59e0b"
      : "#22c55e";

  const size = isSelected ? 42 : 36;
  const iconSize = isSelected ? 22 : 19;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div style="position: absolute; inset: -4px; border-radius: 50%; background: ${color}; opacity: ${isSelected ? 0.45 : 0.2}; animation: pulse 2s infinite;"></div>
      <div style="position: relative; width: ${size}px; height: ${size}px; border-radius: 50%; background: #0b1329; border: ${isSelected ? "3px" : "2.5px"} solid ${isSelected ? "#38bdf8" : color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); color: #f8fafc; transition: transform 0.2s ease;">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? "#38bdf8" : color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z"/>
          <circle cx="17" cy="18" r="2" fill="${color}"/>
          <circle cx="7" cy="18" r="2" fill="${color}"/>
        </svg>
      </div>
      ${
        label
          ? `<div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #0f172a; color: ${isSelected ? "#38bdf8" : color}; border: 1px solid ${isSelected ? "#38bdf8" : color}; border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6); pointer-events: none;">${label}</div>`
          : ""
      }
    </div>
  `;

  return L.divIcon({
    html,
    className: "cryo-truck-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

function createPortalPinIcon(type = "sender", label = "") {
  const isSender = type === "sender";
  const color = isSender ? "#10b981" : "#06b6d4";
  const badgeText = isSender ? "SENDER" : "RECEIVER";

  const svgIcon = isSender
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 21V3l6 4v14"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12M6 12h12"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>`;

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 32px; height: 32px; border-radius: 8px; background: #090e1a; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        ${svgIcon}
      </div>
      <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #090e1a; color: ${color}; border: 1px solid ${color}; border-radius: 4px; padding: 1px 5px; font-size: 9px; font-weight: 800; white-space: nowrap; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.5); pointer-events: none;">
        ${badgeText}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "cryo-portal-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -22],
  });
}

// ── Camera Controller to smooth-fit the selected route ──
function MapLifecycleManager({ bounds, defaultCenter }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => {
      map.invalidateSize();
      if (bounds && Array.isArray(bounds) && bounds.length >= 2) {
        try {
          const valid = bounds.filter(
            (b) => Array.isArray(b) && Number.isFinite(b[0]) && Number.isFinite(b[1])
          );
          if (valid.length >= 2) {
            map.fitBounds(valid, { padding: [45, 45], maxZoom: 9, animate: false });
          }
        } catch {
          // ignore
        }
      }
    }, 350);

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);

  useEffect(() => {
    if (!bounds || !Array.isArray(bounds) || bounds.length < 2) return;
    try {
      const valid = bounds.filter(
        (b) => Array.isArray(b) && Number.isFinite(b[0]) && Number.isFinite(b[1])
      );
      if (valid.length >= 2) {
        map.invalidateSize();
        map.fitBounds(valid, { padding: [45, 45], maxZoom: 9, duration: 0.6 });
      }
    } catch {
      // ignore
    }
  }, [map, bounds]);

  return null;
}

function UnifiedTripMapInner({
  trips = [],
  selectedId,
  onSelect,
  height = "380px",
  style = {},
  theme = "dark",
  userRole = "manager",
}) {
  // Normalize trip structure and compute authentic road routes
  const normalizedTrips = useMemo(() => {
    return trips.map((t, index) => {
      const id = t.id || t.shipmentId || t.vehicleId;
      const vehicleId = t.vehicleId || t.id;
      const originCity = t.originCity || t.origin?.split("·").pop()?.trim() || t.origin || "Mumbai";
      const destCity =
        t.destinationCity ||
        t.destCity ||
        t.destination?.split(",").pop()?.trim() ||
        t.destination ||
        "Pune";

      const originCoords = t.senderGps
        ? [t.senderGps.lat, t.senderGps.lng]
        : getCityCoordinates(originCity);

      const destCoords = t.receiverGps
        ? [t.receiverGps.lat, t.receiverGps.lng]
        : getCityCoordinates(destCity);

      // Get real road route (via OSRM / static highway coordinates)
      const roadRoute = getRoadRoute(originCity, destCity, originCoords, destCoords);

      const isDocked = Boolean(
        t.isDocked ||
        t.progress >= 99 ||
        t.tripStatus === "COMPLETED" ||
        t.status === "Delivered" ||
        String(t.eta || "").toLowerCase().includes("dock")
      );

      // Snap truck directly onto the highway route according to its actual progress
      let truckCoords = null;
      if (isDocked) {
        const bayOffsets = [
          [0.012, 0.010],
          [0.012, -0.010],
          [-0.012, 0.010],
          [-0.012, -0.010],
          [0.016, 0.000],
          [-0.016, 0.000],
        ];
        const offset = bayOffsets[index % bayOffsets.length];
        truckCoords = [destCoords[0] + offset[0], destCoords[1] + offset[1]];
      } else {
        const rawCoords = t.lat && t.lng ? [Number(t.lat), Number(t.lng)] : null;
        const progress = Number(t.progress) || 35;
        truckCoords = snapTruckToRoad(roadRoute, rawCoords, progress);
      }

      // Check temperature status
      const currentTemp = Number(t.currentTemp ?? t.temperature ?? t.temp ?? 4.0);
      const minTemp = Number(t.minTemp ?? t.targetTempBand?.min ?? 2);
      const maxTemp = Number(t.maxTemp ?? t.targetTempBand?.max ?? 8);
      let tempStatus = "normal";
      if (currentTemp < minTemp - 2 || currentTemp > maxTemp + 2) {
        tempStatus = "critical";
      } else if (currentTemp < minTemp || currentTemp > maxTemp) {
        tempStatus = "warning";
      }

      return {
        ...t,
        tripKey: id,
        vehicleId,
        cargo: t.cargo || t.drugName || "Cold-chain cargo",
        driver: t.driver || t.carrierDriver || t.workerName || "Priya Singh",
        originCity,
        destCity,
        sourceName: t.sourceName || t.companyName || `${originCity} Dispatch Hub`,
        facilityName: t.facilityName || t.destination || `${destCity} Receiving Facility`,
        originCoords,
        destCoords,
        roadRoute,
        truckCoords,
        currentTemp,
        minTemp,
        maxTemp,
        tempStatus,
        speed: t.speed || "48 km/h",
        progress: t.progress || 35,
        eta: t.eta || "In Transit",
        isDocked,
      };
    });
  }, [trips]);

  const [internalSelectedId, setInternalSelectedId] = useState(selectedId || null);
  const [isIsolated, setIsIsolated] = useState(Boolean(selectedId));

  useEffect(() => {
    if (selectedId !== undefined && selectedId !== null) {
      setInternalSelectedId(selectedId);
      setIsIsolated(true);
    } else if (selectedId === null) {
      setInternalSelectedId(null);
      setIsIsolated(false);
    }
  }, [selectedId]);

  const selectedTrip = useMemo(() => {
    if (!normalizedTrips.length) return null;
    if (!internalSelectedId) return null;
    return (
      normalizedTrips.find(
        (t) =>
          t.tripKey === internalSelectedId ||
          t.id === internalSelectedId ||
          t.vehicleId === internalSelectedId
      ) || null
    );
  }, [normalizedTrips, internalSelectedId]);

  // When isolated, render ONLY the selected trip. Otherwise render all trips.
  const tripsToRender = isIsolated && selectedTrip ? [selectedTrip] : normalizedTrips;

  // Anti-collision spacing pass: guarantees trucks never overlap on screen and are individually clickable
  const spacedTripsToRender = useMemo(() => {
    if (!tripsToRender || tripsToRender.length === 0) return [];
    if (tripsToRender.length === 1) return tripsToRender;

    const items = tripsToRender.map((t) => ({ ...t, truckCoords: [...t.truckCoords] }));
    const threshold = 0.055; // ~6km separation

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i].truckCoords;
        const b = items[j].truckCoords;
        if (!a || !b) continue;

        const dLat = b[0] - a[0];
        const dLng = b[1] - a[1];
        const dist = Math.hypot(dLat, dLng);

        if (dist < threshold) {
          const overlap = threshold - dist;
          let nx = dist > 0.0005 ? dLng / dist : 1;
          let ny = dist > 0.0005 ? dLat / dist : 0;

          // Perpendicular lateral shift
          const perpX = -ny;
          const perpY = nx;

          items[i].truckCoords = [
            Number((a[0] - perpY * (overlap * 0.65)).toFixed(5)),
            Number((a[1] - perpX * (overlap * 0.65)).toFixed(5)),
          ];
          items[j].truckCoords = [
            Number((b[0] + perpY * (overlap * 0.65)).toFixed(5)),
            Number((b[1] + perpX * (overlap * 0.65)).toFixed(5)),
          ];
        }
      }
    }
    return items;
  }, [tripsToRender]);

  // Find common receiver facility if role is auditor or shared
  const commonReceiver = useMemo(() => {
    if (!normalizedTrips.length) return null;
    const first = normalizedTrips[0];
    return {
      destCoords: first.destCoords,
      destCity: first.destCity,
      facilityName: first.facilityName,
    };
  }, [normalizedTrips]);

  // Smart default center directly focused on active shipments
  const defaultCenter = useMemo(() => {
    if (selectedTrip) {
      const o = selectedTrip.originCoords;
      const d = selectedTrip.destCoords;
      if (o && d) return [(o[0] + d[0]) / 2, (o[1] + d[1]) / 2];
      if (selectedTrip.truckCoords) return selectedTrip.truckCoords;
    }
    if (normalizedTrips.length > 0) {
      const first = normalizedTrips[0];
      const o = first.originCoords;
      const d = first.destCoords;
      if (o && d) return [(o[0] + d[0]) / 2, (o[1] + d[1]) / 2];
    }
    return [18.798, 73.367]; // Mumbai-Pune expressway midpoint
  }, [selectedTrip, normalizedTrips]);

  const routeBounds = useMemo(() => {
    if (isIsolated && selectedTrip) {
      const pts = selectedTrip.roadRoute;
      return pts && pts.length >= 2 ? pts : [selectedTrip.originCoords, selectedTrip.destCoords];
    }
    if (spacedTripsToRender.length > 0) {
      const coords = spacedTripsToRender
        .map((t) => t.truckCoords)
        .filter((c) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]));
      if (commonReceiver?.destCoords) coords.push(commonReceiver.destCoords);
      return coords.length >= 2 ? coords : null;
    }
    return null;
  }, [isIsolated, selectedTrip, spacedTripsToRender, commonReceiver]);

  const handleTruckClick = (t) => {
    const key = t.tripKey || t.id || t.vehicleId;
    setInternalSelectedId(key);
    setIsIsolated(true);
    if (onSelect) onSelect(key);
  };

  const handleShowAll = () => {
    setIsIsolated(false);
    setInternalSelectedId(null);
    if (onSelect) onSelect(null);
  };

  return (
    <div
      className={`cryoguard-unified-map theme-${theme}`}
      data-theme={theme}
      style={{
        width: "100%",
        height: height,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(56, 189, 248, 0.15)",
        ...style,
      }}
    >
      <style>{`
        .cryoguard-unified-map:not(.theme-light) .leaflet-tile-pane,
        .cryoguard-unified-map.theme-dark .leaflet-tile-pane {
          filter: invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9) !important;
        }
        .cryoguard-unified-map.theme-light .leaflet-tile-pane {
          filter: none !important;
        }
        .cryoguard-unified-map .leaflet-control-zoom {
          border: 1px solid rgba(56, 189, 248, 0.3) !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
        }
        .cryoguard-unified-map .leaflet-control-zoom a {
          background-color: #0c1a2b !important;
          color: #38bdf8 !important;
          border-bottom: 1px solid rgba(56, 189, 248, 0.2) !important;
        }
        .cryoguard-unified-map .leaflet-control-zoom a:hover {
          background-color: #152942 !important;
          color: #7dd3fc !important;
        }
        .cryoguard-unified-map .leaflet-control-attribution {
          background: rgba(12, 26, 43, 0.8) !important;
          color: #64748b !important;
          font-size: 10px !important;
          border-radius: 4px;
          margin: 4px;
        }
        .cryoguard-unified-map .leaflet-control-attribution a {
          color: #38bdf8 !important;
        }
        .cryoguard-unified-map .leaflet-popup-content-wrapper {
          background: #0b1329 !important;
          color: #f1f5f9 !important;
          border: 1px solid rgba(56, 189, 248, 0.4) !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7) !important;
        }
        .cryoguard-unified-map .leaflet-popup-tip {
          background: #0b1329 !important;
        }
        .cryoguard-unified-map .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
      `}</style>
      {/* Isolation Control Overlay Badge */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(11, 19, 41, 0.9)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "8px",
          padding: "5px 10px",
          fontSize: "11px",
          color: "#e2e8f0",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6)",
          pointerEvents: "auto",
        }}
      >
        {isIsolated && selectedTrip ? (
          <>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#38bdf8",
                  boxShadow: "0 0 8px #38bdf8",
                  display: "inline-block",
                }}
              />
              <strong>{selectedTrip.vehicleId} Isolated</strong> ({selectedTrip.originCity} → {selectedTrip.destCity})
            </span>
            <button
              type="button"
              onClick={handleShowAll}
              style={{
                background: "rgba(56, 189, 248, 0.16)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "5px",
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: "700",
                padding: "2px 8px",
                cursor: "pointer",
              }}
              title="Click to view all vehicles across the fleet"
            >
              Show All Fleet ({normalizedTrips.length}) ✕
            </button>
          </>
        ) : (
          <span style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🚚</span> Showing All Vehicles ({normalizedTrips.length}) · Click any truck to isolate
          </span>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={8}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", background: "#0c1a2b" }}
      >
        {/* OpenStreetMap Tile Layer - 100% Reliable Worldwide */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapLifecycleManager
          bounds={routeBounds}
          defaultCenter={defaultCenter}
        />

        {/* Render Authentic Highway Route Lines for all trips being displayed */}
        {spacedTripsToRender.map((t) => {
          const isSelected = selectedTrip?.tripKey === t.tripKey;
          const routePts = t.roadRoute;
          if (!routePts || routePts.length < 2) return null;

          if (isSelected) {
            const { traversed, remaining } = splitRoadRoute(routePts, t.truckCoords);
            return (
              <React.Fragment key={`route-${t.tripKey || t.vehicleId}`}>
                {/* Contrast underlay */}
                <Polyline
                  positions={routePts}
                  pathOptions={{
                    color: "#030712",
                    weight: 8,
                    opacity: 0.7,
                  }}
                />
                {/* Traversed solid road route (Origin up to Truck) */}
                {traversed.length >= 2 && (
                  <Polyline
                    positions={traversed}
                    pathOptions={{
                      color:
                        t.tempStatus === "critical"
                          ? "#ef4444"
                          : t.tempStatus === "warning"
                          ? "#f59e0b"
                          : "#00e5ff",
                      weight: 5.5,
                      opacity: 0.95,
                    }}
                  />
                )}
                {/* Remaining dashed road route (Truck to Destination) */}
                {remaining.length >= 2 && (
                  <Polyline
                    positions={remaining}
                    pathOptions={{
                      color:
                        t.tempStatus === "critical"
                          ? "#ef4444"
                          : t.tempStatus === "warning"
                          ? "#f59e0b"
                          : "#38bdf8",
                      weight: 4,
                      dashArray: "7, 10",
                      opacity: 0.9,
                    }}
                  />
                )}
              </React.Fragment>
            );
          }

          // Non-selected fleet route (subtle dashed highway line for each in-transit truck)
          return (
            <Polyline
              key={`route-fleet-${t.tripKey || t.vehicleId}`}
              positions={routePts}
              eventHandlers={{
                click: () => handleTruckClick(t),
              }}
              pathOptions={{
                color:
                  t.tempStatus === "critical"
                    ? "#ef4444"
                    : t.tempStatus === "warning"
                    ? "#f59e0b"
                    : "#38bdf8",
                weight: 3.5,
                dashArray: "6, 8",
                opacity: 0.6,
              }}
            >
              <Tooltip sticky>
                🚚 {t.vehicleId}: {t.originCity} → {t.destCity} ({t.cargo}) · Click to isolate
              </Tooltip>
            </Polyline>
          );
        })}

        {/* When a specific trip is selected: render dedicated Sender & Receiver Pins */}
        {selectedTrip && (
          <>
            {/* Sender Pin */}
            <Marker
              position={selectedTrip.originCoords}
              icon={createPortalPinIcon("sender", selectedTrip.originCity)}
            >
              <Popup>
                <div style={{ color: "#f8fafc", fontSize: "12px", minWidth: "190px" }}>
                  <div style={{ fontWeight: 800, color: "#10b981", fontSize: "13px", marginBottom: "6px" }}>
                    🏢 Sender Portal (Dispatch)
                  </div>
                  <div><strong style={{ color: "#94a3b8" }}>Facility:</strong> {selectedTrip.sourceName}</div>
                  <div><strong style={{ color: "#94a3b8" }}>Origin:</strong> {selectedTrip.originCity}</div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]}>
                🏢 Sender: {selectedTrip.sourceName} ({selectedTrip.originCity})
              </Tooltip>
            </Marker>

            {/* Receiver Pin */}
            <Marker
              position={selectedTrip.destCoords}
              icon={createPortalPinIcon("receiver", selectedTrip.destCity)}
            >
              <Popup>
                <div style={{ color: "#f8fafc", fontSize: "12px", minWidth: "190px" }}>
                  <div style={{ fontWeight: 800, color: "#38bdf8", fontSize: "13px", marginBottom: "6px" }}>
                    🏥 Receiver Portal (Intake)
                  </div>
                  <div><strong style={{ color: "#94a3b8" }}>Facility:</strong> {selectedTrip.facilityName}</div>
                  <div><strong style={{ color: "#94a3b8" }}>Destination:</strong> {selectedTrip.destCity}</div>
                  <div><strong style={{ color: "#94a3b8" }}>Expected ETA:</strong> {selectedTrip.eta}</div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]}>
                🏥 Receiver: {selectedTrip.facilityName} ({selectedTrip.destCity})
              </Tooltip>
            </Marker>
          </>
        )}

        {/* If no single trip is isolated, show the common Receiver Portal Pin (Pune) so destination is always visible */}
        {!selectedTrip && commonReceiver && (
          <Marker
            position={commonReceiver.destCoords}
            icon={createPortalPinIcon("receiver", commonReceiver.destCity)}
          >
            <Popup>
              <div style={{ color: "#f8fafc", fontSize: "12px", minWidth: "190px" }}>
                <div style={{ fontWeight: 800, color: "#38bdf8", fontSize: "13px", marginBottom: "6px" }}>
                  🏥 Central Receiving Hub (Intake)
                </div>
                <div><strong style={{ color: "#94a3b8" }}>Facility:</strong> {commonReceiver.facilityName}</div>
                <div><strong style={{ color: "#94a3b8" }}>Destination Hub:</strong> {commonReceiver.destCity}</div>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]}>
              🏥 Central Receiving: {commonReceiver.facilityName} ({commonReceiver.destCity})
            </Tooltip>
          </Marker>
        )}

        {/* Render Trucks: When isolated, ONLY the selected truck appears! When not isolated, all appear. */}
        {spacedTripsToRender.map((t) => {
          const isSelected = selectedTrip?.tripKey === t.tripKey;
          return (
            <Marker
              key={t.tripKey || t.vehicleId}
              position={t.truckCoords}
              zIndexOffset={isSelected ? 1000 : 200}
              riseOnHover={true}
              icon={createTruckIcon(
                t.tempStatus,
                `${t.vehicleId} · ${t.currentTemp}°C`,
                isSelected
              )}
              eventHandlers={{
                click: () => handleTruckClick(t),
              }}
            >
              <Popup>
                <div style={{ color: "#f8fafc", fontSize: "12px", minWidth: "220px" }}>
                  <div style={{ fontWeight: 800, color: "#f8fafc", fontSize: "14px", borderBottom: "1px solid rgba(56, 189, 248, 0.25)", paddingBottom: "4px", marginBottom: "6px" }}>
                    🚚 Vehicle {t.vehicleId}
                  </div>
                  <div><strong style={{ color: "#94a3b8" }}>Cargo:</strong> {t.cargo}</div>
                  <div><strong style={{ color: "#94a3b8" }}>Driver:</strong> {t.driver}</div>
                  <div><strong style={{ color: "#94a3b8" }}>Live Temperature:</strong> <span style={{ fontWeight: 700, color: t.tempStatus === "critical" ? "#ef4444" : t.tempStatus === "warning" ? "#f59e0b" : "#10b981" }}>{t.currentTemp}°C</span> (Band: {t.minTemp}°C to {t.maxTemp}°C)</div>
                  <div><strong style={{ color: "#94a3b8" }}>Route:</strong> {t.originCity} → {t.destCity}</div>
                  <div><strong style={{ color: "#94a3b8" }}>Status:</strong> {t.eta}</div>
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#38bdf8", fontWeight: 600 }}>
                    {isSelected ? "Route currently isolated on map" : "Click to isolate this truck & route"}
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -18]}>
                <strong>{t.vehicleId}</strong> ({t.cargo}) · {t.currentTemp}°C
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MapErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: "100%",
            height: this.props.height || "380px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0b1329",
            border: "1px solid #1e293b",
            borderRadius: "12px",
            color: "#94a3b8",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🗺️</div>
          <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
            Map View Temporarily Unavailable
          </div>
          <div style={{ fontSize: "12px", maxWidth: "420px", marginBottom: "16px", color: "#64748b" }}>
            {this.state.error?.message || "An unexpected error occurred while rendering the interactive route map."}
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: "#0284c7",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry Loading Map
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UnifiedTripMap(props) {
  return (
    <MapErrorBoundary height={props.height}>
      <UnifiedTripMapInner {...props} />
    </MapErrorBoundary>
  );
}
