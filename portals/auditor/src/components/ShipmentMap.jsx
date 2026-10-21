import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Navigation,
  Focus,
  Camera,
} from "lucide-react";
import { sound } from "../utils/soundFx";
import StreetViewModal from "./StreetViewModal";

/* ── Custom marker icons ── */
function createMarkerIcon(color, label, isHospital = false) {
  const size = isHospital ? 28 : 22;
  const svg = isHospital
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">
        <defs>
          <filter id="glow-h" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#38bdf8" flood-opacity="0.6"/>
          </filter>
        </defs>
        <rect x="2" y="2" width="24" height="24" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" filter="url(#glow-h)"/>
        <path d="M14 7v14M7 14h14" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 22 22">
        <defs>
          <filter id="glow-v" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="${color}" flood-opacity="0.8"/>
          </filter>
        </defs>
        <circle cx="11" cy="11" r="9" fill="#0b1329" stroke="${color}" stroke-width="2.5" filter="url(#glow-v)"/>
        <circle cx="11" cy="11" r="4" fill="${color}"/>
       </svg>`;

  return L.divIcon({
    html: svg,
    className: "custom-leaflet-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

const hospitalIcon = createMarkerIcon("#38bdf8", "H", true);

function getVehicleIcon(consignment) {
  if (consignment.receiverDisposition === "QUARANTINED") {
    return createMarkerIcon("#f43f5e", "Q");
  }
  if (consignment.receiverDisposition === "ADMITTED") {
    return createMarkerIcon("#10b981", "A");
  }
  if (consignment.transitExcursionCount > 0) {
    return createMarkerIcon("#f59e0b", "!");
  }
  return createMarkerIcon("#38bdf8", "T");
}

function getRouteColor(consignment) {
  if (consignment.receiverDisposition === "QUARANTINED") return "#f43f5e";
  if (consignment.receiverDisposition === "ADMITTED") return "#10b981";
  if (consignment.transitExcursionCount > 0) return "#f59e0b";
  return "#38bdf8";
}

/* ── Camera fly controller ── */
function MapCameraController({ consignment }) {
  const map = useMap();
  useEffect(() => {
    if (consignment && consignment.gps) {
      map.flyTo([consignment.gps.lat, consignment.gps.lng], 14, {
        duration: 0.9,
      });
    }
  }, [consignment, map]);
  return null;
}

const HOSPITAL = { lat: 40.758, lng: -73.9855 };

function MapControlsOverlay({
  onCenterHospital,
  onResetView,
  onOpenStreetView,
}) {
  return (
    <div className="map-overlay-controls">
      <button
        type="button"
        className="map-ctrl-btn"
        onClick={onCenterHospital}
        title="Center on Metro General Hospital Bay 03"
      >
        <Navigation size={13} />
        <span>Bay 03</span>
      </button>

      <button
        type="button"
        className="map-ctrl-btn"
        onClick={onResetView}
        title="Reset zoom to fleet overview"
      >
        <Focus size={13} />
        <span>Overview</span>
      </button>

      <button
        type="button"
        className="map-ctrl-btn map-ctrl-btn--streetview"
        onClick={onOpenStreetView}
        title="Open Street View Camera & Waypoint HUD"
      >
        <Camera size={13} className="text-cyan" />
        <span>Street View</span>
      </button>
    </div>
  );
}

export default function ShipmentMap({
  consignments = [],
  activeId,
  onSelect,
  theme = "dark",
}) {
  const activeConsignment = consignments.find((c) => c.id === activeId) || null;
  const [streetViewTarget, setStreetViewTarget] = useState(null);

  const handleCenterHospital = () => {
    sound.click();
    const elem = document.querySelector(".leaflet-container");
    if (elem && elem._leaflet_map) {
      elem._leaflet_map.flyTo([HOSPITAL.lat, HOSPITAL.lng], 14, {
        duration: 0.8,
      });
    }
  };

  const handleResetView = () => {
    sound.click();
    const elem = document.querySelector(".leaflet-container");
    if (elem && elem._leaflet_map) {
      elem._leaflet_map.flyTo([40.755, -73.99], 12, { duration: 0.8 });
    }
  };

  const handleOpenActiveStreetView = () => {
    sound.click();
    if (activeConsignment && activeConsignment.gps) {
      setStreetViewTarget({
        lat: activeConsignment.gps.lat,
        lng: activeConsignment.gps.lng,
        consignment: activeConsignment,
        isHospital: false,
      });
    } else {
      setStreetViewTarget({
        lat: HOSPITAL.lat,
        lng: HOSPITAL.lng,
        consignment: null,
        isHospital: true,
      });
    }
  };

  const handleOpenConsignmentStreetView = (consignment) => {
    setStreetViewTarget({
      lat: consignment.gps.lat,
      lng: consignment.gps.lng,
      consignment,
      isHospital: false,
    });
  };

  return (
    <div className="map-container">
      <div className="map-container__header">
        <div className="map-container__title-group">
          <Navigation size={16} className="text-cyan" />
          <h3>Live Transport Radar</h3>
        </div>
        <div className="map-container__meta">
          <span className="dock-stat text-emerald">
            {
              consignments.filter(
                (c) =>
                  c.isDocked ||
                  c.eta.startsWith("Docked") ||
                  c.eta.startsWith("Arrived")
              ).length
            }{" "}
            Docked
          </span>
          <span className="divider">·</span>
          <span className="transit-stat text-cyan">
            {
              consignments.filter(
                (c) =>
                  !(
                    c.isDocked ||
                    c.eta.startsWith("Docked") ||
                    c.eta.startsWith("Arrived")
                  )
              ).length
            }{" "}
            In-Transit
          </span>
        </div>
      </div>

      <div className="map-container__map-wrap">
        <MapContainer
          center={[40.755, -73.99]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={true}
          whenReady={(mapInstance) => {
            mapInstance.target._container._leaflet_map = mapInstance.target;
          }}
        >
          {/* CARTO Dark Matter / Voyager OpenStreetMap tiles (never blocked with 403) */}
          <TileLayer
            key={theme}
            url={
              theme === "light"
                ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
          />

          <MapCameraController consignment={activeConsignment} />

          {/* Hospital Dock Marker */}
          <Marker position={[HOSPITAL.lat, HOSPITAL.lng]} icon={hospitalIcon}>
            <Popup className="dark-popup">
              <div className="popup-inner">
                <div className="popup-header text-cyan">
                  <strong>Metro General Hospital</strong>
                </div>
                <div className="popup-sub">
                  Department of Pharmacy &amp; Biomedical Quality Assurance · Bay 03
                </div>
                <div className="popup-tag text-emerald">Active Inward Receiving Gate</div>
                <button
                  type="button"
                  className="popup-streetview-btn"
                  style={{ marginTop: "8px", width: "100%" }}
                  onClick={() => {
                    sound.click();
                    setStreetViewTarget({
                      lat: HOSPITAL.lat,
                      lng: HOSPITAL.lng,
                      consignment: null,
                      isHospital: true,
                    });
                  }}
                >
                  <Camera size={12} />
                  <span>Open Street View at Bay 03</span>
                </button>
              </div>
            </Popup>
          </Marker>

          {/* Transports & Routes */}
          {consignments.map((c) => {
            const isSelected = activeId === c.id;
            const isDocked =
              c.isDocked ||
              c.eta.startsWith("Docked") ||
              c.eta.startsWith("Arrived");
            const inSpec =
              c.currentTemp >= c.targetTempBand.min &&
              c.currentTemp <= c.targetTempBand.max;

            return (
              <React.Fragment key={c.id}>
                {c.routeHistory && (
                  <Polyline
                    positions={c.routeHistory.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: getRouteColor(c),
                      weight: isSelected ? 3.5 : 2,
                      opacity: isSelected ? 0.95 : 0.45,
                      dashArray: isDocked ? null : "6 5",
                    }}
                  />
                )}

                {c.gps && (
                  <Marker
                    position={[c.gps.lat, c.gps.lng]}
                    icon={getVehicleIcon(c)}
                    eventHandlers={{
                      click: () => {
                        sound.click();
                        onSelect(c.id);
                      },
                    }}
                  >
                    <Popup className="dark-popup">
                      <div className="popup-inner">
                        <div className="popup-top">
                          <span className="mono font-bold text-cyan">{c.id}</span>
                          <span className="vehicle-id text-muted">({c.vehicleId})</span>
                        </div>
                        <div className="popup-drug">{c.drugName}</div>

                        {!isDocked && (
                          <div className="popup-eta-badge">
                            <span className="badge-title">
                              ⏱️ ETA: {c.etaMinutes || "14"} mins ({c.etaTimestamp || "01:25 AM"})
                            </span>
                            <span className="badge-sub">
                              {c.currentSpeedKmh || "48"} km/h · {c.remainingDistanceKm || "6.4"} km away
                            </span>
                          </div>
                        )}

                        <div className="popup-metric-row">
                          <span className="lbl">Cargo Temp:</span>
                          <span
                            className={`val mono font-bold ${
                              inSpec ? "text-emerald" : "text-rose"
                            }`}
                          >
                            {c.currentTemp > 0 ? "+" : ""}
                            {c.currentTemp}°C
                          </span>
                        </div>
                        <div className="popup-metric-row">
                          <span className="lbl">Status:</span>
                          <span className="val text-secondary">
                            {isDocked ? "Docked at Bay 03" : "In-Transit"}
                          </span>
                        </div>

                        <div className="popup-actions-grid">
                          <button
                            type="button"
                            className="popup-streetview-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.click();
                              handleOpenConsignmentStreetView(c);
                            }}
                            title="Open Street View & Waypoint HUD"
                          >
                            <Camera size={12} />
                            <span>Street View</span>
                          </button>
                          <button
                            type="button"
                            className="popup-inspect-btn"
                            onClick={() => {
                              sound.click();
                              onSelect(c.id);
                            }}
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>

        <MapControlsOverlay
          onCenterHospital={handleCenterHospital}
          onResetView={handleResetView}
          onOpenStreetView={handleOpenActiveStreetView}
        />
      </div>

      {streetViewTarget && (
        <StreetViewModal
          location={streetViewTarget}
          consignment={streetViewTarget.consignment}
          onClose={() => setStreetViewTarget(null)}
        />
      )}
    </div>
  );
}
