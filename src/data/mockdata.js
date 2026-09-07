export const statCards = [
  {
    id: 1,
    icon: "Package",
    value: "128",
    label: "Active Shipments",
    sub: "12.6% vs yesterday",
    trend: "+12.6%",
    trendDirection: "up",
    tone: "ok"
  },
  {
    id: 2,
    icon: "Truck",
    value: "36",
    label: "Vehicles On Road",
    sub: "6 currently delayed",
    trend: "+4.2%",
    trendDirection: "up",
    tone: "info"
  },
  {
    id: 3,
    icon: "Thermometer",
    value: "3",
    label: "Temperature Alerts",
    sub: "2 critical alerts",
    trend: "+2",
    trendDirection: "up",
    tone: "crit"
  },
  {
    id: 4,
    icon: "BrainCircuit",
    value: "87%",
    label: "AI Predictions",
    sub: "Prediction accuracy",
    trend: "+5.1%",
    trendDirection: "up",
    tone: "info"
  },
  {
    id: 5,
    icon: "Clock",
    value: "94.8%",
    label: "On-Time Delivery",
    sub: "Compared to last week",
    trend: "+1.8%",
    trendDirection: "up",
    tone: "ok"
  }
]

// data for temperature chart
export const temperatureSeries = [
  { time: '00:00', temp: 4 },
  { time: '02:00', temp: 5 },
  { time: '04:00', temp: 4 },
  { time: '06:00', temp: 6 },
  { time: '08:00', temp: 5 },
  { time: '10:00', temp: 7 },
  { time: '12:00', temp: 6 },
  { time: '14:00', temp: 8 },
  { time: '16:00', temp: 7 },
  { time: '18:00', temp: 5 },
  { time: '20:00', temp: 4 },
  { time: '22:00', temp: 6 }
]

// recent alerts
export const recentAlerts = [
  {
    id: 1,
    title: "Temperature above limit",
    truck: "TRK-021",
    time: "2 min ago",
    tone: "crit"
  },
  {
    id: 2,
    title: "Vehicle door opened",
    truck: "TRK-014",
    time: "8 min ago",
    tone: "warn"
  },
  {
    id: 3,
    title: "Shipment delivered",
    truck: "TRK-008",
    time: "15 min ago",
    tone: "ok"
  }
]

//  live fleet map
export const fleetMarkers = [
  {
    id: "TRK-021",
    x: "25%",
    y: "35%",
    status: "normal"
  },
  {
    id: "TRK-014",
    x: "48%",
    y: "50%",
    status: "warning"
  },
  {
    id: "TRK-008",
    x: "70%",
    y: "30%",
    status: "normal"
  },
  {
    id: "TRK-032",
    x: "62%",
    y: "70%",
    status: "critical"
  },
  {
    id: "TRK-019",
    x: "82%",
    y: "65%",
    status: "normal"
  }
]

// Shipments
export const shipmentsByStatus = [
  {
    name: "In Transit",
    value: 68,
    pct: "53%",
    color: "#38bdf8"
  },
  {
    name: "Delivered",
    value: 42,
    pct: "33%",
    color: "#22c55e"
  },
  {
    name: "Delayed",
    value: 12,
    pct: "9%",
    color: "#eab308"
  },
  {
    name: "At Risk",
    value: 6,
    pct: "5%",
    color: "#ef4444"
  }
];

// active shipments
export const activeShipments = [
  {
    id: "SHP-1024",
    vehicle: "TRK-021",
    route: "Chandigarh → Delhi",
    temperature: "8.4°C",
    status: "Critical"
  },
  {
    id: "SHP-1025",
    vehicle: "TRK-014",
    route: "Delhi → Jaipur",
    temperature: "6.2°C",
    status: "Warning"
  },
  {
    id: "SHP-1026",
    vehicle: "TRK-008",
    route: "Chandigarh → Amritsar",
    temperature: "4.8°C",
    status: "On Track"
  },
  {
    id: "SHP-1027",
    vehicle: "TRK-032",
    route: "Delhi → Lucknow",
    temperature: "7.1°C",
    status: "On Track"
  }
];

// fleet health
export const selectedVehicle = {
  truckId: "TRK-021",
  driver: "Rahul Sharma",
  status: "Critical",
  route: "Chandigarh → Delhi",
  cargo: "Frozen Vaccines",
  eta: "2h 15m",
  distanceLeft: "142 km",
  temperature: "8.4°C",
  humidity: "68%",
  battery: "82%",
  riskScore: "78%"
};