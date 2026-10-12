// src/data/mockdata.js

export const CARGO_CATEGORIES = [
  'All Sectors',
  'Frozen Foods & Meat',
  'Dairy & Ice Cream',
  'Fresh Produce & Berries',
  'Pharmaceuticals & Vaccines',
  'Chemicals & Biologics'
];

export const INITIAL_STATS = [
  {
    id: 'active_shipments',
    title: 'Active Shipments',
    value: '128',
    change: '+12.6%',
    changeType: 'positive',
    subtext: 'vs yesterday',
    icon: 'Package',
    color: '#10b981'
  },
  {
    id: 'vehicles_on_road',
    title: 'Vehicles On Road',
    value: '36',
    change: '+4.2%',
    changeType: 'positive',
    subtext: '6 delayed',
    icon: 'Truck',
    color: '#06b6d4'
  },
  {
    id: 'temp_excursions',
    title: 'Temp Excursions',
    value: '3',
    change: '-25.0%',
    changeType: 'negative',
    subtext: '2 active warnings',
    icon: 'AlertTriangle',
    color: '#ef4444'
  },
  {
    id: 'fleet_compliance',
    title: 'HACCP/GDP Compliance',
    value: '99.4%',
    change: '+0.8%',
    changeType: 'positive',
    subtext: 'ISO & WHO aligned',
    icon: 'ShieldCheck',
    color: '#38bdf8'
  }
];

export const VEHICLES = [
  {
    id: 'TRK-01',
    shipmentId: 'SHP-1021',
    category: 'Frozen Foods & Meat',
    cargo: 'Prime Cut Beef & Frozen Poultry',
    driver: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    temperature: -18.2,
    targetTemp: -20.0,
    minTemp: -22.0,
    maxTemp: -18.0,
    humidity: 78,
    doorStatus: 'Closed',
    batteryLevel: 94,
    powerSource: 'Reefer Engine Active',
    reeferState: 'Cooling at 85%',
    route: 'Mumbai Central Hub → Pune Mega Cold Hub',
    eta: '1h 45m',
    distanceLeft: '112 km',
    lastPing: '2 mins ago',
    status: 'On Track',
    speed: '68 km/h',
    mapPos: { x: 38, y: 44 }
  },
  {
    id: 'TRK-02',
    shipmentId: 'SHP-1022',
    category: 'Pharmaceuticals & Vaccines',
    cargo: 'COVID-19 mRNA Vaccines (Ultra-Cold)',
    driver: 'Amit Verma',
    driverPhone: '+91 98111 22334',
    temperature: -68.4,
    targetTemp: -70.0,
    minTemp: -80.0,
    maxTemp: -60.0,
    humidity: 45,
    doorStatus: 'Closed',
    batteryLevel: 88,
    powerSource: 'Dry Ice Cryo-Freezer',
    reeferState: 'Cryo-Cooling Active',
    route: 'Serum Bio-Depot Pune → Delhi AIIMS Central',
    eta: '5h 15m',
    distanceLeft: '480 km',
    lastPing: 'Just now',
    status: 'On Track',
    speed: '74 km/h',
    mapPos: { x: 55, y: 32 }
  },
  {
    id: 'TRK-03',
    shipmentId: 'SHP-1023',
    category: 'Dairy & Ice Cream',
    cargo: 'Artisan Gourmet Gelato & Ice Creams',
    driver: 'Sunil Sharma',
    driverPhone: '+91 98222 33445',
    temperature: -14.2,
    targetTemp: -22.0,
    minTemp: -25.0,
    maxTemp: -18.0,
    humidity: 82,
    doorStatus: 'Door Ajar (14m)',
    batteryLevel: 62,
    powerSource: 'Auxiliary Battery Drain',
    reeferState: 'Compressor Struggling',
    route: 'Amul Depot Anand → Surat Supermarket Hub',
    eta: '45 mins',
    distanceLeft: '38 km',
    lastPing: '1 min ago',
    status: 'Critical',
    speed: '45 km/h',
    mapPos: { x: 48, y: 56 }
  },
  {
    id: 'TRK-04',
    shipmentId: 'SHP-1024',
    category: 'Fresh Produce & Berries',
    cargo: 'Fresh Strawberries & Exotic Blueberries',
    driver: 'Mohan Lal',
    driverPhone: '+91 98333 44556',
    temperature: 5.1,
    targetTemp: 2.0,
    minTemp: 1.0,
    maxTemp: 4.0,
    humidity: 91,
    doorStatus: 'Closed',
    batteryLevel: 79,
    powerSource: 'Electric Hybrid Unit',
    reeferState: 'Cooling at 95%',
    route: 'Mahabaleshwar Farms → Mumbai Domestic Terminal',
    eta: '2h 10m',
    distanceLeft: '145 km',
    lastPing: '3 mins ago',
    status: 'Warning',
    speed: '58 km/h',
    mapPos: { x: 62, y: 68 }
  }
];

export const RECENT_ALERTS = [
  {
    id: 'ALT-901',
    vehicleId: 'TRK-03',
    cargo: 'Gourmet Gelato & Ice Creams',
    title: 'High Temp Excursion: -14.2°C (Limit: -18°C)',
    detail: 'Gelato melting threshold exceeded. Door seal breach detected on Amul-Surat corridor.',
    time: '2 mins ago',
    severity: 'Critical',
    acknowledged: false
  },
  {
    id: 'ALT-902',
    vehicleId: 'TRK-04',
    cargo: 'Fresh Berries & Exotic Fruits',
    title: 'Warm Temp Drift: +5.1°C (Max: +4.0°C)',
    detail: 'Elevated temperature risk in fresh produce bay. Recommend emergency turbo cooling.',
    time: '12 mins ago',
    severity: 'Warning',
    acknowledged: false
  }
];

export const AI_PREDICTIONS = {
  riskScore: '78%',
  status: 'High Spoilage Risk',
  targetTruck: 'TRK-03',
  projectedTime: '24 mins until irreversible damage',
  recommendation: 'Trigger Remote Turbo Boost Cooling and reroute to nearest Surat cold hub.'
};

export const TEMPERATURE_TREND_DATA = [
  { time: '00:00', temp: -18.5, ideal: -20.0 },
  { time: '04:00', temp: -19.0, ideal: -20.0 },
  { time: '08:00', temp: -17.8, ideal: -20.0 },
  { time: '12:00', temp: -16.2, ideal: -20.0 },
  { time: '16:00', temp: -14.2, ideal: -20.0 },
  { time: '20:00', temp: -18.0, ideal: -20.0 }
];

export const INVENTORY_ITEMS = [
  {
    id: 'INV-101',
    batchNo: 'BAT-FZ-9821',
    name: 'Atlantic Salmon Fillets',
    type: 'Seafood',
    category: 'Frozen Foods & Meat',
    units: 3500,
    unitType: 'kg',
    requiredTemp: '-22°C to -18°C',
    currentTemp: -19.4,
    currentStorage: 'Mumbai Cold Hub - Vault 4',
    expiry: '2026-12-15'
  },
  {
    id: 'INV-102',
    batchNo: 'BAT-BIO-4412',
    name: 'mRNA Vaccine Vials',
    type: 'Vaccines',
    category: 'Pharmaceuticals & Vaccines',
    units: 12000,
    unitType: 'vials',
    requiredTemp: '-80°C to -60°C',
    currentTemp: -68.4,
    currentStorage: 'Pune Bio-Depot Cryo-Room',
    expiry: '2026-11-20'
  }
];

export const COMPLIANCE_REPORTS = [
  {
    id: 'REP-2026-01',
    title: 'HACCP Q3 Multi-Sector Cold Chain Audit',
    date: '2026-09-28',
    status: 'Passed (99.4%)',
    auditor: 'ISO 22000 Authority'
  }
];

export const SYSTEM_USERS = [
  {
    id: 'USR-01',
    name: 'Vikram Malhotra',
    role: 'HACCP Master Quality Lead',
    badge: 'HACCP & GDP Master Lead',
    email: 'vikram.m@cryoguard.io',
    phone: '+91 98765 00001',
    assignedZone: 'West Corridor (MH/GJ)',
    status: 'Active On-Duty'
  },
  {
    id: 'USR-02',
    name: 'Rajesh Kumar',
    role: 'Senior Cold-Chain Reefer Driver',
    badge: 'Certified Temp-Logistics Handler',
    email: 'rajesh.k@cryoguard.io',
    phone: '+91 98765 43210',
    assignedZone: 'Mumbai-Pune Corridor',
    status: 'In Transit'
  }
];