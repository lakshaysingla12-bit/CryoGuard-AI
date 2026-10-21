
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";

const colors = {
  normal: "#4ade80",
  warning: "#fbbf24",
  critical: "#f87171",
};

// Approximate demo coordinates for the cities used in the seeded routes.
const cityCoordinates = {
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  delhi: [28.6139, 77.209],
  chandigarh: [30.7333, 76.7794],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  hyderabad: [17.385, 78.4867],
  bengaluru: [12.9716, 77.5946],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  indore: [22.7196, 75.8577],
  nagpur: [21.1458, 79.0882],
};

function resolveCoordinates(coordinates, city) {
  const lat = Number(coordinates?.lat);
  const lng = Number(coordinates?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  return cityCoordinates[city?.trim().toLowerCase()] || null;
}

function FitRoute({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions?.length) {
      map.fitBounds(positions, { padding: [40, 40], maxZoom: 8 });
    }
  }, [map, positions]);

  return null;
}

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

  const routePositions = useMemo(() => selected
    ? [
        resolveCoordinates(selected.originCoords, selected.origin),
        resolveCoordinates(selected.destCoords, selected.destination),
      ]
    : null, [
    selected?.originCoords?.lat,
    selected?.originCoords?.lng,
    selected?.origin,
    selected?.destCoords?.lat,
    selected?.destCoords?.lng,
    selected?.destination,
  ]);
  const hasRoute = routePositions?.every(Boolean);

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
        <>
          <FitRoute positions={routePositions} />
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: "#38bdf8",
              weight: 3,
              dashArray: "6 8",
            }}
          />
          {routePositions.map((position, index) => (
            <CircleMarker
              key={`${selected.id}-route-end-${index}`}
              center={position}
              radius={6}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: index === 0 ? "#22c55e" : "#38bdf8",
                fillOpacity: 1,
              }}
            >
              <Tooltip>{index === 0 ? `${selected.companyName || selected.sourceName || "Source"} · ${selected.origin}` : `${selected.facilityName || "Delivery point"} · ${selected.destination}`}</Tooltip>
            </CircleMarker>
          ))}
        </>
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
