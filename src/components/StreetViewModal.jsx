import React, { useState, useEffect } from "react";
import {
  Camera,
  X,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Radio,
} from "lucide-react";
import {
  getGoogleStreetViewUrl,
  getOpenStreetMapUrl,
  getKartaViewUrl,
  formatGpsCoords,
  getOsmAddress,
} from "../utils/osmGeocode";
import { sound } from "../utils/soundFx";

export default function StreetViewModal({ location, consignment, onClose }) {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("Resolving OpenStreetMap street address...");

  const lat = location?.lat || consignment?.gps?.lat || 40.758;
  const lng = location?.lng || consignment?.gps?.lng || -73.9855;
  const isHospital = location?.isHospital || !consignment;

  useEffect(() => {
    let mounted = true;
    getOsmAddress(lat, lng).then((addr) => {
      if (mounted) setAddress(addr);
    });
    return () => {
      mounted = false;
    };
  }, [lat, lng]);

  const handleCopyCoords = () => {
    sound.click();
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gsvUrl = getGoogleStreetViewUrl(lat, lng);
  const osmUrl = getOpenStreetMapUrl(lat, lng);
  const kartaViewUrl = getKartaViewUrl(lat, lng);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog street-view-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title-group">
            <Camera className="modal-header__icon text-cyan" size={24} />
            <div>
              <h3>Open Street View &amp; Waypoint Inspector</h3>
              <p>
                {isHospital
                  ? "Metro General Hospital · Bay 03 Receiving Gate"
                  : `${consignment.id} (${consignment.vehicleId}) · Street Telemetry`}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Simulated Street-Level HUD / Panorama Viewport */}
          <div className="street-view-viewport">
            {/* Visual HUD Canvas / Perspective */}
            <div className="street-view-viewport__bg">
              <div className="street-grid-horizon" />
              <div className="street-center-crosshair">
                <div className="reticle-circle" />
                <div className="reticle-line reticle-line--h" />
                <div className="reticle-line reticle-line--v" />
              </div>

              {/* Waypoint Marker Banner in HUD */}
              <div className="street-hud-overlay">
                <div className="street-hud-badge">
                  <Radio size={12} className="animate-pulse text-cyan" />
                  <span>LIVE STREET RADAR · OPENSTREETMAP API</span>
                </div>
                <div className="street-hud-coords mono">
                  {formatGpsCoords(lat, lng)}
                </div>
              </div>

              <div className="street-hud-bottom">
                <div className="street-hud-road">
                  <MapPin size={14} className="text-cyan" />
                  <span>{address}</span>
                </div>
                <div className="street-hud-action">
                  <a
                    href={gsvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="street-pano-btn"
                    onClick={() => sound.click()}
                  >
                    <Eye size={13} />
                    <span>Launch 360° Street Panorama</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="street-metrics-grid">
            <div className="street-metric-card">
              <div className="lbl">Street Waypoint</div>
              <div className="val text-cyan font-bold">{address}</div>
              <div className="sub mono">{formatGpsCoords(lat, lng)}</div>
            </div>

            {!isHospital && consignment && (
              <>
                <div className="street-metric-card">
                  <div className="lbl">Cold-Chain Status</div>
                  <div
                    className={`val font-bold ${
                      consignment.transitExcursionCount === 0
                        ? "text-emerald"
                        : "text-rose"
                    }`}
                  >
                    {consignment.currentTemp > 0 ? "+" : ""}
                    {consignment.currentTemp}°C
                  </div>
                  <div className="sub">
                    {consignment.transitExcursionCount === 0
                      ? "Zero Excursions · In Spec"
                      : `${consignment.transitExcursionCount} Excursion(s) Recorded`}
                  </div>
                </div>

                <div className="street-metric-card">
                  <div className="lbl">Transit &amp; Speed</div>
                  <div className="val text-amber font-bold">
                    {consignment.isDocked
                      ? "Docked at Bay 03"
                      : `${consignment.currentSpeedKmh || "48"} km/h`}
                  </div>
                  <div className="sub">
                    {consignment.isDocked
                      ? "Cargo Secured"
                      : `ETA: ${consignment.etaMinutes || "14"} mins (${consignment.remainingDistanceKm || "6.4"} km)`}
                  </div>
                </div>
              </>
            )}

            {isHospital && (
              <div className="street-metric-card">
                <div className="lbl">Facility Role</div>
                <div className="val text-emerald font-bold">
                  Active Inward Receiving Gate
                </div>
                <div className="sub">
                  Pharmacy &amp; QA Biomedical Receiving Bay 03
                </div>
              </div>
            )}
          </div>

          {/* Open Street View & External APIs Integration Row */}
          <div className="street-api-integrations">
            <div className="street-api-integrations__title">
              Direct Street View &amp; OpenStreetMap API Services
            </div>
            <div className="street-api-buttons">
              <a
                href={gsvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-api-link btn-api-link--primary"
                onClick={() => sound.click()}
                title="Launch Google Street View 360° Panorama"
              >
                <Camera size={14} />
                <span>Google Street View 360°</span>
                <ExternalLink size={12} className="link-arrow" />
              </a>

              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-api-link"
                onClick={() => sound.click()}
                title="View coordinates on OpenStreetMap.org"
              >
                <MapPin size={14} className="text-cyan" />
                <span>OpenStreetMap.org Inspector</span>
                <ExternalLink size={12} className="link-arrow" />
              </a>

              <a
                href={kartaViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-api-link"
                onClick={() => sound.click()}
                title="View street imagery on KartaView (OpenStreetView)"
              >
                <Eye size={14} className="text-emerald" />
                <span>OpenStreetView (KartaView)</span>
                <ExternalLink size={12} className="link-arrow" />
              </a>

              <button
                type="button"
                className="btn-api-link"
                onClick={handleCopyCoords}
                title="Copy Lat, Lng to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald" />
                    <span className="text-emerald">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Coordinates</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-footer-info text-muted">
            <span>Powered by OpenStreetMap &amp; Street View Location Services</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
