/**
 * Master Inbound Cold-Chain Consignments Dataset
 * Receiver Portal: Pune Frozen Foods Distribution Hub (Pune)
 * All incoming shipments arrive at the same Receiver Facility from various Senders.
 */

const RECEIVER_FACILITY = {
  facilityId: "FAC-PUN-001",
  facilityName: "Pune Frozen Foods Distribution Hub",
  destinationCity: "Pune",
  destination: "Pune Frozen Foods Distribution Hub, Pune",
  gps: { lat: 18.5204, lng: 73.8567 },
};

const todayISO = new Date().toISOString().slice(0, 10);
const yesterdayISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const mockConsignments = [
  // ── 1. ACTIVE LIVE CARGO: Mumbai → Pune (Priya Singh in TRK-01) ──
  {
    id: "SHP-1021",
    vehicleId: "TRK-01",
    drugName: "Frozen Salmon and Poultry",
    category: "Frozen Foods & Meat",
    origin: "Mumbai Frozen Foods Processing Plant, Mumbai",
    destination: RECEIVER_FACILITY.destination,
    originCity: "Mumbai",
    destinationCity: RECEIVER_FACILITY.destinationCity,
    companyName: "Mumbai Coastal Protein Exports",
    facilityName: RECEIVER_FACILITY.facilityName,
    facilityId: RECEIVER_FACILITY.facilityId,
    date: todayISO,
    isToday: true,
    isDocked: false,
    tripStatus: "IN_TRANSIT",
    dockLocation: "Allocated: Pune Bay 02 · Dock D",
    tripStartTime: "06:30 AM",
    dockArrivalTime: "",
    tripDistanceKm: 148.0,
    averageSpeedKmh: 48,
    targetTempBand: { min: -22.0, max: -18.0, unit: "°C" },
    currentTemp: -19.6,
    currentHumidity: 48,
    eta: "In Transit — ETA: 1h 15m (35 km remaining)",
    transitExcursionCount: 0,
    carrierDriver: "Priya Singh (MCPE Fleet)",
    auditor: "Kabir Anand",
    receiverDisposition: "PENDING",
    gps: { lat: 18.836, lng: 73.258 }, // truck on Mumbai-Pune expressway
    senderGps: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    receiverGps: RECEIVER_FACILITY.gps, // Pune
    routeHistory: [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 18.9800, lng: 73.0200 },
      { lat: 18.8360, lng: 73.2580 },
      { lat: 18.6500, lng: 73.6500 },
      { lat: 18.5204, lng: 73.8567 },
    ],
    timeSeriesData: [
      { time: "06:30", temp: -20.4, humidity: 46 },
      { time: "07:00", temp: -20.1, humidity: 47 },
      { time: "07:30", temp: -19.8, humidity: 48 },
      { time: "08:00", temp: -19.6, humidity: 48 },
    ],
  },

  // ── 2. ACTIVE LIVE CARGO: Hyderabad → Pune (Rohan Mehta in TRK-02) ──
  {
    id: "SHP-1022",
    vehicleId: "TRK-02",
    drugName: "COVID-19 mRNA Vaccine Vials (Lot #HDPU-994)",
    category: "Ultra-Cold Biologics",
    origin: "Hyderabad Vaccine Dispatch Center, Hyderabad",
    destination: RECEIVER_FACILITY.destination,
    originCity: "Hyderabad",
    destinationCity: RECEIVER_FACILITY.destinationCity,
    companyName: "Hyderabad Pharma Biotech Ltd.",
    facilityName: RECEIVER_FACILITY.facilityName,
    facilityId: RECEIVER_FACILITY.facilityId,
    date: todayISO,
    isToday: true,
    isDocked: false,
    tripStatus: "IN_TRANSIT",
    dockLocation: "Allocated: Pune Bay 01 · Dock A",
    tripStartTime: "05:00 AM",
    dockArrivalTime: "",
    tripDistanceKm: 560.0,
    averageSpeedKmh: 64,
    targetTempBand: { min: -80.0, max: -60.0, unit: "°C" },
    currentTemp: -68.6,
    currentHumidity: 28,
    eta: "In Transit — ETA: 3h 45m (Approaching Solapur)",
    transitExcursionCount: 0,
    carrierDriver: "Rohan Mehta (BioPharma Express)",
    auditor: "Kabir Anand",
    receiverDisposition: "PENDING",
    gps: { lat: 17.6599, lng: 75.9064 }, // near Solapur on Hyderabad-Pune route
    senderGps: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    receiverGps: RECEIVER_FACILITY.gps, // Pune
    routeHistory: [
      { lat: 17.3850, lng: 78.4867 },
      { lat: 17.5000, lng: 77.1000 },
      { lat: 17.6599, lng: 75.9064 },
      { lat: 18.1500, lng: 74.8000 },
      { lat: 18.5204, lng: 73.8567 },
    ],
    timeSeriesData: [
      { time: "05:00", temp: -71.2, humidity: 25 },
      { time: "06:00", temp: -70.4, humidity: 26 },
      { time: "07:00", temp: -69.2, humidity: 27 },
      { time: "08:00", temp: -68.6, humidity: 28 },
    ],
  },

  // ── 3. DOCKED & COMPLETED TODAY: Surat → Pune (Kunal Bhatia in TRK-13) ──
  {
    id: "SHP-1033",
    vehicleId: "TRK-13",
    drugName: "Frozen Salmon and Poultry (Batch #MCPE-1033)",
    category: "Frozen Foods & Meat",
    origin: "Surat Cold-Chain Processing Depot, Surat",
    destination: RECEIVER_FACILITY.destination,
    originCity: "Surat",
    destinationCity: RECEIVER_FACILITY.destinationCity,
    companyName: "Surat Cold-Chain Logistics Ltd.",
    facilityName: RECEIVER_FACILITY.facilityName,
    facilityId: RECEIVER_FACILITY.facilityId,
    date: todayISO,
    isToday: true,
    isDocked: true,
    tripStatus: "COMPLETED",
    dockLocation: "Pune Bay 01 · Dock B",
    tripStartTime: "04:00 AM",
    dockArrivalTime: "08:15 AM",
    tripDistanceKm: 395.0,
    averageSpeedKmh: 54,
    targetTempBand: { min: -22.0, max: -18.0, unit: "°C" },
    currentTemp: -19.8,
    currentHumidity: 45,
    eta: "Docked at Receiving Bay 01",
    transitExcursionCount: 0,
    carrierDriver: "Kunal Bhatia (MCPE Express)",
    auditor: "Kabir Anand",
    receiverDisposition: "ADMITTED",
    storageLocation: "Deep Freeze Unit Alpha-02 (-20°C Vault)",
    gps: { lat: 18.5204, lng: 73.8567 }, // at Pune receiver hub
    senderGps: { lat: 21.1702, lng: 72.8311 }, // Surat
    receiverGps: RECEIVER_FACILITY.gps, // Pune
    routeHistory: [
      { lat: 21.1702, lng: 72.8311 },
      { lat: 20.0000, lng: 72.9000 },
      { lat: 19.0760, lng: 72.8777 },
      { lat: 18.5204, lng: 73.8567 },
    ],
    timeSeriesData: [
      { time: "04:30", temp: -21.0, humidity: 44 },
      { time: "05:30", temp: -20.5, humidity: 45 },
      { time: "06:30", temp: -20.1, humidity: 45 },
      { time: "07:30", temp: -19.9, humidity: 45 },
      { time: "08:15", temp: -19.8, humidity: 45 },
    ],
  },

  // ── 4. DOCKED & COMPLETED TODAY: Delhi → Pune (Amit Verma in TRK-03) ──
  {
    id: "SHP-1023",
    vehicleId: "TRK-03",
    drugName: "Dairy and Premium Gelato (Lot #DFDC-1023)",
    category: "Frozen Dairy",
    origin: "Delhi Dairy Collection & Chilling Center, Delhi",
    destination: RECEIVER_FACILITY.destination,
    originCity: "Delhi",
    destinationCity: RECEIVER_FACILITY.destinationCity,
    companyName: "Delhi Fresh Dairy Cooperative",
    facilityName: RECEIVER_FACILITY.facilityName,
    facilityId: RECEIVER_FACILITY.facilityId,
    date: todayISO,
    isToday: true,
    isDocked: true,
    tripStatus: "COMPLETED",
    dockLocation: "Pune Bay 02 · Dock B",
    tripStartTime: "Yesterday 06:00 AM",
    dockArrivalTime: "Today 07:30 AM",
    tripDistanceKm: 1420.0,
    averageSpeedKmh: 62,
    targetTempBand: { min: -25.0, max: -18.0, unit: "°C" },
    currentTemp: -19.4,
    currentHumidity: 42,
    eta: "Docked at Receiving Bay 02",
    transitExcursionCount: 0,
    carrierDriver: "Amit Verma (DairyLink Logistics)",
    auditor: "Kabir Anand",
    receiverDisposition: "ADMITTED",
    storageLocation: "Central Deep Freeze Vault D-12",
    gps: { lat: 18.5204, lng: 73.8567 }, // at Pune receiver hub
    senderGps: { lat: 28.6139, lng: 77.2090 }, // Delhi
    receiverGps: RECEIVER_FACILITY.gps, // Pune
    routeHistory: [
      { lat: 28.6139, lng: 77.2090 },
      { lat: 24.5000, lng: 75.5000 },
      { lat: 21.0000, lng: 74.5000 },
      { lat: 18.5204, lng: 73.8567 },
    ],
    timeSeriesData: [
      { time: "07:00", temp: -22.5, humidity: 40 },
      { time: "11:00", temp: -21.4, humidity: 41 },
      { time: "15:00", temp: -20.2, humidity: 42 },
      { time: "07:30", temp: -19.4, humidity: 42 },
    ],
  },

  // ── 5. QUARANTINED DEVIATION: Ahmedabad → Pune (Vikram Rao in TRK-05) ──
  {
    id: "SHP-1025",
    vehicleId: "TRK-05",
    drugName: "Frozen Salmon and Poultry (Batch #AFF-1025)",
    category: "Frozen Foods & Meat",
    origin: "Ahmedabad Frozen Foods Plant, Ahmedabad",
    destination: RECEIVER_FACILITY.destination,
    originCity: "Ahmedabad",
    destinationCity: RECEIVER_FACILITY.destinationCity,
    companyName: "Ahmedabad Frozen Foods Pvt. Ltd.",
    facilityName: RECEIVER_FACILITY.facilityName,
    facilityId: RECEIVER_FACILITY.facilityId,
    date: yesterdayISO,
    isToday: false,
    isDocked: true,
    tripStatus: "COMPLETED",
    dockLocation: "Pune Bay 03 · Quarantine Bay",
    tripStartTime: "Yesterday 05:00 AM",
    dockArrivalTime: "Yesterday 04:30 PM",
    tripDistanceKm: 660.0,
    averageSpeedKmh: 58,
    targetTempBand: { min: -22.0, max: -18.0, unit: "°C" },
    currentTemp: -14.1,
    currentHumidity: 58,
    eta: "Archived & Quarantined",
    transitExcursionCount: 2,
    carrierDriver: "Vikram Rao (Express Freight)",
    auditor: "Kabir Anand",
    receiverDisposition: "QUARANTINED",
    quarantineReason: "Critical Thermal Excursion: Temperature breached upper limit (-18°C) reaching -14.1°C during transit.",
    capaCode: "CAPA-DEV-2026-088",
    quarantineBay: "Quarantine Bio-Chamber Q-01",
    gps: { lat: 18.5204, lng: 73.8567 }, // at Pune receiver hub (quarantined)
    senderGps: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
    receiverGps: RECEIVER_FACILITY.gps, // Pune
    routeHistory: [
      { lat: 23.0225, lng: 72.5714 },
      { lat: 21.1702, lng: 72.8311 },
      { lat: 19.5000, lng: 73.2000 },
      { lat: 18.5204, lng: 73.8567 },
    ],
    timeSeriesData: [
      { time: "06:00", temp: -19.5, humidity: 46 },
      { time: "09:00", temp: -18.2, humidity: 48 },
      { time: "12:00", temp: -16.4, humidity: 52 },
      { time: "14:00", temp: -14.1, humidity: 58 },
    ],
  },

  // ── 6. COMPLETED & ADMITTED: Chandigarh → Pune (Neha Kapoor in TRK-04) ──
  {
    id: "SHP-1024",
    vehicleId: "TRK-04",
    drugName: "Fresh Berries & Chilled Produce",
    category: "Fresh Produce",
    origin: "Chandigarh Produce Packing Center, Chandigarh",
    destination: RECEIVER_FACILITY.destination,
    originCity: "Chandigarh",
    destinationCity: RECEIVER_FACILITY.destinationCity,
    companyName: "Chandigarh Green Harvest Produce Co.",
    facilityName: RECEIVER_FACILITY.facilityName,
    facilityId: RECEIVER_FACILITY.facilityId,
    date: yesterdayISO,
    isToday: false,
    isDocked: true,
    tripStatus: "COMPLETED",
    dockLocation: "Pune Bay 01 · Dock C",
    tripStartTime: "Yesterday 04:00 AM",
    dockArrivalTime: "Yesterday 08:30 PM",
    tripDistanceKm: 1680.0,
    averageSpeedKmh: 65,
    targetTempBand: { min: 1.0, max: 4.0, unit: "°C" },
    currentTemp: 2.8,
    currentHumidity: 48,
    eta: "Archived & Released",
    transitExcursionCount: 0,
    carrierDriver: "Neha Kapoor (ProduceLink)",
    auditor: "Kabir Anand",
    receiverDisposition: "ADMITTED",
    storageLocation: "Chilled Produce Cooler Unit B-04",
    gps: { lat: 18.5204, lng: 73.8567 }, // at Pune receiver hub
    senderGps: { lat: 30.7333, lng: 76.7794 }, // Chandigarh
    receiverGps: RECEIVER_FACILITY.gps, // Pune
    routeHistory: [
      { lat: 30.7333, lng: 76.7794 },
      { lat: 26.5000, lng: 75.8000 },
      { lat: 22.0000, lng: 74.0000 },
      { lat: 18.5204, lng: 73.8567 },
    ],
    timeSeriesData: [
      { time: "06:00", temp: 2.2, humidity: 50 },
      { time: "10:00", temp: 2.5, humidity: 49 },
      { time: "14:00", temp: 2.9, humidity: 48 },
      { time: "20:30", temp: 2.8, humidity: 48 },
    ],
  },
];

export default mockConsignments;
