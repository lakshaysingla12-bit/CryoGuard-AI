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