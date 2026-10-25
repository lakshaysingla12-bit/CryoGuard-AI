import staticRoutes from "./staticRoutes.json";
import { getCityCoordinates } from "./cityCoordinates";

const routeMemoryCache = new Map();

function cleanCityName(name) {
  if (!name) return "";
  const s = String(name).toLowerCase();
  for (const city of [
    "mumbai",
    "pune",
    "hyderabad",
    "delhi",
    "nagpur",
    "chandigarh",
    "ahmedabad",
    "lucknow",
    "surat",
    "bengaluru",
    "jaipur",
    "indore",
  ]) {
    if (s.includes(city)) return city;
  }
  return "";
}

/**
 * Get highway road coordinates connecting origin and destination
 */
export function getRoadRoute(originCity, destCity, originCoords, destCoords) {
  const oKey = cleanCityName(originCity);
  const dKey = cleanCityName(destCity);

  if (oKey && dKey && oKey !== dKey) {
    const directKey = `${oKey}_${dKey}`;
    const reverseKey = `${dKey}_${oKey}`;

    if (staticRoutes[directKey]) {
      return staticRoutes[directKey];
    }
    if (staticRoutes[reverseKey]) {
      return [...staticRoutes[reverseKey]].reverse();
    }
  }

  // Fallback: 5 smooth intermediate highway corridor points
  const o = originCoords || getCityCoordinates(originCity);
  const d = destCoords || getCityCoordinates(destCity);
  const pts = [];
  const count = 8;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Introduce slight natural arc to simulate highway curve
    const arc = Math.sin(t * Math.PI) * 0.08;
    pts.push([
      Number((o[0] + (d[0] - o[0]) * t + arc * 0.5).toFixed(5)),
      Number((o[1] + (d[1] - o[1]) * t + arc).toFixed(5)),
    ]);
  }
  return pts;
}

/**
 * Snaps a given truck coordinate or progress % directly onto the actual road route
 */
export function snapTruckToRoad(routePoints, fallbackCoords, progress = 35) {
  if (!routePoints || routePoints.length === 0) {
    return fallbackCoords || [18.798, 73.367];
  }

  // 1. If progress is provided, calculate the exact road waypoint
  if (typeof progress === "number" && progress >= 0 && progress <= 100) {
    const p = Math.max(0.04, Math.min(0.96, progress / 100));
    const targetIdx = Math.round(p * (routePoints.length - 1));
    return routePoints[targetIdx] || routePoints[0];
  }

  // 2. If fallbackCoords provided, find closest highway waypoint
  if (Array.isArray(fallbackCoords) && fallbackCoords.length === 2) {
    let closest = routePoints[0];
    let minDist = Infinity;
    for (const pt of routePoints) {
      const d = Math.hypot(pt[0] - fallbackCoords[0], pt[1] - fallbackCoords[1]);
      if (d < minDist) {
        minDist = d;
        closest = pt;
      }
    }
    return closest;
  }

  return routePoints[Math.floor(routePoints.length / 2)];
}

/**
 * Splits road route into traversed (Solid) and remaining (Dashed) segments
 */
export function splitRoadRoute(routePoints, truckCoords) {
  if (!routePoints || routePoints.length < 2) {
    return { traversed: routePoints || [], remaining: [] };
  }
  if (!truckCoords) {
    return { traversed: routePoints, remaining: [] };
  }

  let closestIdx = 0;
  let minDist = Infinity;
  for (let i = 0; i < routePoints.length; i++) {
    const pt = routePoints[i];
    const d = Math.hypot(pt[0] - truckCoords[0], pt[1] - truckCoords[1]);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }

  const traversed = [...routePoints.slice(0, closestIdx + 1)];
  const remaining = [truckCoords, ...routePoints.slice(closestIdx + 1)];

  return { traversed, remaining };
}
