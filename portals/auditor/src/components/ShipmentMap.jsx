import React from "react";
import { Navigation } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import UnifiedTripMap from "../../../../src/components/UI/UnifiedTripMap";

export default function ShipmentMap({
  consignments = [],
  activeId,
  onSelect,
  theme: propTheme,
}) {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  const dockedCount = consignments.filter(
    (c) => c.isDocked || c.tripStatus === "COMPLETED" || String(c.eta || "").startsWith("Docked")
  ).length;

  const inTransitCount = consignments.length - dockedCount;

  return (
    <div className="map-container">
      <div className="map-container__header">
        <div className="map-container__title-group">
          <Navigation size={16} className="text-cyan" />
          <h3>Live Transport Radar & Fleet Route Map</h3>
        </div>
        <div className="map-container__meta">
          <span className="dock-stat text-emerald">
            {dockedCount} Docked
          </span>
          <span className="divider">·</span>
          <span className="transit-stat text-cyan">
            {inTransitCount} In-Transit
          </span>
        </div>
      </div>

      <div className="map-container__map-wrap" style={{ flex: 1, minHeight: 0, height: "100%", position: "relative" }}>
        <UnifiedTripMap
          trips={consignments}
          selectedId={activeId}
          onSelect={onSelect}
          height="100%"
          userRole="auditor"
          theme={theme}
        />
      </div>
    </div>
  );
}
