import React from "react";
import UnifiedTripMap from "../../../../src/components/UI/UnifiedTripMap";

export default function LiveFleetMap({
  vehicles = [],
  selectedId,
  onSelect,
  height = 380,
}) {
  return (
    <UnifiedTripMap
      trips={vehicles}
      selectedId={selectedId}
      onSelect={onSelect}
      height={typeof height === "number" ? `${height}px` : height}
      userRole="manager"
    />
  );
}
