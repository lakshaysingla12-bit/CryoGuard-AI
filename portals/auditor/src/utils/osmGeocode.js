/**
 * OpenStreetMap & Street View Utilities
 * Provides reverse geocoding via OpenStreetMap Nominatim API,
 * coordinate formatting, and deep links for OpenStreetMap, Google Street View, and KartaView (OpenStreetView).
 */

// In-memory cache for reverse geocoded coordinates
const addressCache = new Map();

// Known cold-chain hub locations fallback for instant offline/zero-latency display
const KNOWN_LOCATIONS = {
  "18.5204,73.8567": "Pune Frozen Foods Distribution Hub · Inward Receiving Bay 01 (Hinjawadi, Pune)",
  "18.8360,73.2580": "Mumbai-Pune Expressway (Khalapur Toll Plaza Corridor)",
  "19.0760,72.8777": "Mumbai Frozen Foods Processing Plant (Kurla Industrial Hub, Mumbai)",
  "17.6599,75.9064": "Pune-Solapur Highway Sector 4 (Approaching Solapur)",
  "17.3850,78.4867": "Hyderabad Vaccine Dispatch Center (Gachibowli, Hyderabad)",
  "21.1702,72.8311": "Surat Cold-Chain Processing Depot (Surat GIDC, Gujarat)",
  "28.6139,77.2090": "Delhi Dairy Collection & Chilling Center (Patparganj, Delhi)",
};

/**
 * Generate official Street View & OpenStreetMap URLs
 */
export function getGoogleStreetViewUrl(lat, lng) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

export function getOpenStreetMapUrl(lat, lng, zoom = 18) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

export function getKartaViewUrl(lat, lng, zoom = 17) {
  // KartaView (formerly OpenStreetView) street imagery platform
  return `https://kartaview.org/map/@${lat},${lng},${zoom}z`;
}

export function formatGpsCoords(lat, lng) {
  if (typeof lat !== "number" || typeof lng !== "number") return "N/A";
  const latStr = `${Math.abs(lat).toFixed(5)}° ${lat >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(lng).toFixed(5)}° ${lng >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lngStr}`;
}

/**
 * Reverse geocode coordinate using OpenStreetMap Nominatim API
 * Falls back to known locations or coordinates if unavailable.
 */
export async function getOsmAddress(lat, lng) {
  if (!lat || !lng) return "Unknown Location";
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  if (addressCache.has(key)) {
    return addressCache.get(key);
  }

  // Check closest known location
  for (const [coordKey, name] of Object.entries(KNOWN_LOCATIONS)) {
    const [kLat, kLng] = coordKey.split(",").map(Number);
    if (Math.abs(kLat - lat) < 0.002 && Math.abs(kLng - lng) < 0.002) {
      addressCache.set(key, name);
      return name;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || "";
      const city = addr.city || addr.town || addr.county || "New York";
      const state = addr.state || "";
      const formatted = road ? `${road}, ${city} ${state}`.trim() : (data.display_name?.split(",").slice(0, 3).join(",") || "Manhattan, NY");
      
      addressCache.set(key, formatted);
      return formatted;
    }
  } catch {
    // Ignore network or abort errors, fallback gracefully
  }

  const fallback = `Manhattan Corridor (${formatGpsCoords(lat, lng)})`;
  addressCache.set(key, fallback);
  return fallback;
}
