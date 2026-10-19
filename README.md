# CryoGuard AI

CryoGuard AI is a cold-chain logistics dashboard for monitoring temperature-controlled shipments, vehicles, alerts, and inventory. This repository contains the manager dashboard and a shared demo dataset intended to be consumed by the manager, worker, and auditor dashboards.

> **Demo project:** Data is stored in `db.json` and served locally with JSON Server. Sensor changes and live indicators are simulated for demonstration; this is not a production backend or real-time monitoring service.

## What’s included

- **Dashboard:** shipment and fleet summaries, current alerts, shipment status, and team supervision.
- **Shipments and vehicles:** shipment records, vehicle status, routes, and temperature limits.
- **Monitoring:** operational vehicle and temperature status.
- **Inventory:** temperature-controlled stock, storage locations, and low-stock indicators.
- **Alerts:** open and resolved cold-chain alerts.
- **Reports:** compliance report summaries.
- **Worker supervision:** assignments linked to workers and shipments; managers can send a message to a worker.
- **AI Predictions:** a placeholder page marked as in progress.
- **Theme:** light and dark display modes.

## Requirements

- Node.js and npm
- A terminal in the project directory

## Run locally

```bash
cd client
npm install
npm run dev
```

The development command starts both services:

- Vite dashboard: `http://localhost:5173`
- JSON Server API: `http://localhost:3001`

Keep the terminal running while using the dashboard. Open the Vite URL (or the forwarded **5173** port in Codespaces) in your browser. The Vite server proxies dashboard requests from `/api/*` to JSON Server on port `3001`; the browser does not call the forwarded API port directly. This avoids Codespaces cross-origin restrictions, so no `VITE_API_URL` file is needed for the manager dashboard.

To create a production bundle, run `npm run build` from `client/`; to preview it, run `npm run preview`.

## Shared data for the team

The shared dataset is at the repository root in [`db.json`](./db.json). The JSON Server process started by the manager project serves this file on port `3001`. Keep the API port private in Codespaces; the dashboard reaches it through the Vite proxy. Dashboards running in the same Codespace can use the same local JSON Server. A dashboard running in a different Codespace needs a server-side proxy configured to reach the shared API; a browser request directly to another private forwarded port will be blocked by Codespaces access controls.

## Demo data

The dataset includes 24 vehicles, shipments, alerts, inventory items, reports, and assignments; 12 users; 4 storage units; 120 temperature readings; and 2 supervisor messages. The data is seeded for demonstrations and can be reset by restoring `db.json` from version control.

Records are linked by IDs so each dashboard can display a consistent view:

| Relationship | Fields |
| --- | --- |
| Shipment ↔ vehicle | `shipment.vehicleId`, `vehicle.shipmentId` |
| Shipment ↔ worker | `shipment.workerId`, `assignment.workerId` |
| Shipment ↔ supervisor | `shipment.supervisorId`, `assignment.supervisorId` |
| Shipment ↔ auditor | `shipment.auditorId`, `report.auditorId` |
| Alert ↔ shipment and worker | `alert.shipmentId`, `alert.workerId` |
| Inventory ↔ storage location | `inventoryItem.unitId`, `storageUnit.id` |
| Temperature reading ↔ vehicle | `temperatureReading.vehicleId` |

Use the IDs as the shared contract between dashboards. For example, a worker dashboard should identify the signed-in worker with the same `workerId` used in `users`, `shipments`, `assignments`, and `messages`.

## API reference

JSON Server exposes the collections below. The manager client also provides a few derived endpoints, such as `/dashboard/summary`, `/inventory`, and `/vehicles/:id/telemetry`.

| Collection | Endpoint | Purpose |
| --- | --- | --- |
| Users | `/users` | Manager, worker, and auditor demo identities |
| Shipments | `/shipments` | Shipment status, routes, cargo, and temperature limits |
| Vehicles | `/vehicles` | Fleet state and latest sensor values |
| Assignments | `/assignments` | Worker tasks and manager supervision |
| Alerts | `/alerts` | Shipment and vehicle alerts |
| Messages | `/messages` | Supervisor-to-worker messages |
| Inventory | `/inventoryItems` | Stock quantity, minimum stock, and storage unit |
| Storage units | `/storageUnits` | Inventory storage locations |
| Reports | `/reports` | Compliance report records |
| Temperature readings | `/temperatureReadings` | Sensor history by vehicle and shipment |
| Settings | `/settings` | Demo dashboard settings |
| Cargo types | `/cargoTypes` | Supported cargo categories |
| Locations | `/locations` | Demo route and location options |

### Examples

Fetch shipments:

```js
const response = await fetch("/api/shipments");
if (!response.ok) throw new Error("Could not load shipments");
const shipments = await response.json();
```

Fetch the latest messages for one worker (replace `wrk-001` with that worker’s ID):

```js
const workerId = "wrk-001";
const response = await fetch(
  `/api/messages?workerId=${encodeURIComponent(workerId)}&_sort=sentAt&_order=desc`
);
if (!response.ok) throw new Error("Could not load supervisor messages");
const messages = await response.json();
```

Send a supervisor message:

```js
const response = await fetch("/api/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: `MSG-${Date.now()}`,
    workerId: "wrk-001",
    toUserId: "wrk-001",
    fromUserId: "mgr-001",
    fromName: "Aarav Sharma",
    message: "Please complete the temperature check before dispatch.",
    sentAt: new Date().toISOString(),
    read: false
  })
});
if (!response.ok) throw new Error("Could not send supervisor message");
```

## Project structure

```text
.
├── db.json                 # Shared JSON Server dataset
├── README.md
└── client/
    ├── src/
    │   ├── api/             # API client
    │   ├── components/      # Shared dashboard components
    │   ├── context/         # Authentication, theme, and live demo state
    │   ├── pages/           # Manager dashboard pages
    │   └── services/        # Dashboard data helpers
    └── package.json
```

## Troubleshooting

- **API requests fail:** confirm JSON Server is running on port `3001`, then open `/api/vehicles` through the Vite app to check the proxy. Restart Vite after changing `vite.config.js`.
- **A teammate sees different or empty data:** check that their Vite proxy points to the shared JSON Server and that worker or auditor IDs match the IDs in `db.json`.
- **A worker sees no supervisor messages:** request `/messages?workerId=<their-user-id>` and verify the manager sent a message to that same ID.
- **Changes to demo data do not appear:** refresh the dashboard and check that the JSON Server is still serving the repository’s root `db.json`.

## Limitations

- JSON Server is a local mock API. It has no production authentication, access control, or multi-user conflict handling.
- Live temperature changes are simulated in the dashboard; they do not come from physical sensors.
- AI Predictions is currently a placeholder and does not generate predictions.
