import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from "react-leaflet";

const colors = {
  normal: "#4ade80",
  warning: "#fbbf24",
  critical: "#f87171",
};

// Live map. Markers move by themselves whenever new vehicle data arrives.
function LiveFleetMap({ vehicles, selectedId, onSelect, height = 380 }) {
  const onRoad = vehicles.filter((v) => v.status === "In Transit");
  const selected = onRoad.find((v) => v.id === selectedId);

  return (
    <MapContainer
      center={[29.6, 76.4]}
      zoom={7}
      scrollWheelZoom={false}
      style={{ height, borderRadius: 12 }}
    >
      <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

      {/* route line of the selected vehicle */}
      {selected && (
        <Polyline
          positions={[
            [selected.originCoords.lat, selected.originCoords.lng],
            [selected.destCoords.lat, selected.destCoords.lng],
          ]}
          pathOptions={{ color: "#38bdf8", weight: 2, dashArray: "6 8" }}
        />
      )}

      {onRoad.map((v) => (
        <CircleMarker
          key={v.id}
          center={[v.lat, v.lng]}
          radius={v.id === selectedId ? 11 : 8}
          pathOptions={{
            color: v.id === selectedId ? "#ffffff" : colors[v.tempStatus],
            fillColor: colors[v.tempStatus],
            fillOpacity: 0.9,
            weight: v.id === selectedId ? 3 : 2,
          }}
          eventHandlers={{ click: () => onSelect && onSelect(v.id) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{v.id}</strong> · {v.temp}°C
            <br />
            {v.cargo}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default LiveFleetMap;
