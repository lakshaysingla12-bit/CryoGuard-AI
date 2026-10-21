
export const VEHICLES = [
  {
    id: "TRK-01",
    shipmentId: "SHP-1021",
    cargo: "COVID Vaccines",
    route: "Chandigarh → Delhi",
    minTemp: 2,
    maxTemp: 8,
    temperature: 4.2,
    humidity: 65,
    vibration: 0.3,
    status: "Normal",
  },
  {
    id: "TRK-02",
    shipmentId: "SHP-1022",
    cargo: "Frozen Foods",
    route: "Delhi → Mumbai",
    minTemp: -25,
    maxTemp: -18,
    temperature: -20.4,
    humidity: 60,
    vibration: 0.2,
    status: "Warning",
  },
  {
    id: "TRK-03",
    shipmentId: "SHP-1023",
    cargo: "Vaccine Vials",
    route: "Mumbai → Pune",
    minTemp: -80,
    maxTemp: -60,
    temperature: -55,
    humidity: 55,
    vibration: 0.4,
    status: "Critical",
  },
  {
    id: "TRK-04",
    shipmentId: "SHP-1024",
    cargo: "Dairy Products",
    route: "Pune → Chandigarh",
    minTemp: -25,
    maxTemp: -18,
    temperature: -21,
    humidity: 62,
    vibration: 0.2,
    status: "Normal",
  },
];

export const RECENT_ALERTS = [
  {
    id: "ALT-01",
    vehicleId: "TRK-03",
    title: "Temperature excursion",
    detail: "Temperature is above the permitted range.",
    severity: "Critical",
    acknowledged: false,
  },
  {
    id: "ALT-02",
    vehicleId: "TRK-02",
    title: "Temperature warning",
    detail: "Check the cooling unit.",
    severity: "Warning",
    acknowledged: false,
  },
  {
    id: "ALT-03",
    vehicleId: "TRK-01",
    title: "Door inspection",
    detail: "Inspect the cargo door.",
    severity: "Warning",
    acknowledged: true,
  },
  {
    id: "ALT-04",
    vehicleId: "TRK-04",
    title: "Routine status update",
    detail: "Vehicle status checked successfully.",
    severity: "Normal",
    acknowledged: true,
  },
];

export const TEMPERATURE_TREND_DATA = [
  { temp: 3.8 },
  { temp: 4.0 },
  { temp: 4.2 },
  { temp: 4.1 },
  { temp: 4.4 },
  { temp: 4.2 },
  { temp: 4.5 },
  { temp: 4.3 },
  { temp: 4.1 },
  { temp: 4.2 },
];

export const SYSTEM_USERS = [
  {
    id: "USR-01",
    name: "Vikram Malhotra",
    email: "manager@cryoguard.demo",
    role: "Manager",
    status: "Active",
  },
  {
    id: "USR-02",
    name: "Aman Sharma",
    email: "worker@cryoguard.demo",
    role: "Worker",
    status: "Active",
  },
  {
    id: "USR-03",
    name: "Priya Singh",
    email: "auditor@cryoguard.demo",
    role: "Auditor",
    status: "Active",
  },
];

export const COMPLIANCE_REPORTS = [
  {
    id: "RPT-001",
    title: "Temperature Compliance Report",
    date: "2026-10-15",
    auditor: "Priya Singh",
    status: "Compliant",
  },
  {
    id: "RPT-002",
    title: "Cold Storage Inspection",
    date: "2026-10-16",
    auditor: "Priya Singh",
    status: "Needs review",
  },
  {
    id: "RPT-003",
    title: "Vehicle Safety Report",
    date: "2026-10-17",
    auditor: "Priya Singh",
    status: "Compliant",
  },
];
