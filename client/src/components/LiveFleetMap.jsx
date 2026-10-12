
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
} from "react-leaflet";

const colors = {
  normal: "#4ade80",
  warning: "#fbbf24",
  critical: "#f87171",
};

function LiveFleetMap({
  vehicles = [],
  selectedId,
  onSelect,
  height = 380,
}) {
  const onRoad = vehicles.filter(
    (v) =>
      v.status === "In Transit" &&
      Number.isFinite(Number(v.lat)) &&
      v.lat !== null &&
      v.lat !== "" &&
      Number.isFinite(Number(v.lng)) &&
      v.lng !== null &&
      v.lng !== ""
  );

  const selected = onRoad.find((v) => v.id === selectedId);

  const hasRoute =
    selected?.originCoords &&
    selected?.destCoords &&
    Number.isFinite(Number(selected.originCoords.lat)) &&
    Number.isFinite(Number(selected.originCoords.lng)) &&
    Number.isFinite(Number(selected.destCoords.lat)) &&
    Number.isFinite(Number(selected.destCoords.lng));

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

      {selected && hasRoute && (
        <Polyline
          positions={[
            [
              Number(selected.originCoords.lat),
              Number(selected.originCoords.lng),
            ],
            [
              Number(selected.destCoords.lat),
              Number(selected.destCoords.lng),
            ],
          ]}
          pathOptions={{
            color: "#38bdf8",
            weight: 2,
            dashArray: "6 8",
          }}
        />
      )}

      {onRoad.map((v) => (
        <CircleMarker
          key={v.id}
          center={[Number(v.lat), Number(v.lng)]}
          radius={v.id === selectedId ? 11 : 8}
          pathOptions={{
            color:
              v.id === selectedId
                ? "#ffffff"
                : colors[v.tempStatus] || colors.normal,
            fillColor: colors[v.tempStatus] || colors.normal,
            fillOpacity: 0.9,
            weight: v.id === selectedId ? 3 : 2,
          }}
          eventHandlers={{
            click: () => onSelect && onSelect(v.id),
          }}
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
