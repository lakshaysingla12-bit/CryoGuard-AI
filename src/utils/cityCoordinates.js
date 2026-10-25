// Standard geo-coordinates for the major cold-chain hub cities across India
export const CITY_COORDINATES = {
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  hyderabad: [17.3850, 78.4867],
  delhi: [28.6139, 77.2090],
  nagpur: [21.1458, 79.0882],
  chandigarh: [30.7333, 76.7794],
  ahmedabad: [23.0225, 72.5714],
  lucknow: [26.8467, 80.9462],
  surat: [21.1702, 72.8311],
  bengaluru: [12.9716, 77.5946],
  jaipur: [26.9124, 75.7873],
  indore: [22.7196, 75.8577],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
};

export function getCityCoordinates(cityName) {
  if (!cityName) return [19.0760, 72.8777]; // Default Mumbai
  const clean = String(cityName).trim().toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key)) return coords;
  }
  return [19.0760, 72.8777];
}

export function calculateTruckCoordinates(originCoords, destCoords, progress = 35) {
  const p = Math.max(0.05, Math.min(0.95, (Number(progress) || 35) / 100));
  return [
    Number((originCoords[0] + (destCoords[0] - originCoords[0]) * p).toFixed(4)),
    Number((originCoords[1] + (destCoords[1] - originCoords[1]) * p).toFixed(4)),
  ];
}
