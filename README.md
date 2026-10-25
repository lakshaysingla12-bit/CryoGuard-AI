# CryoGuard AI — Connected Cold-Chain Platform

CryoGuard AI is an unbroken end-to-end cold-chain logistics monitoring and quality compliance platform connecting **Company Managers**, **Fleet Drivers/Workers**, and **Hospital/Facility Receiving Auditors** with shared telemetry and route guidance.

## Run Locally

```sh
npm install
npm run dev
```

Vite serves the landing page and all three portal builds. JSON Server serves the shared demo dataset from `db.json` on port `3001`; Vite proxies its routes through `/api`.

## 3 Core Demo Accounts

All demo accounts use the standard password: **`password123`**. Quick-fill buttons are also available directly on the Sign-In dialog.

| Role | Demo ID / Email | Password | Name | Entity / Facility | Location & Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Manager** | `manager@cryoguard.demo`<br>*(or `cmgr-001`)* | `password123` | Arvind Kapoor | **Mumbai Coastal Protein Exports** | Mumbai dispatch hub; oversees fleet & shipments |
| **Worker** | `worker@cryoguard.demo`<br>*(or `wrk-001`)* | `password123` | Priya Singh | **TRK-01 (Reefer Truck)** | Mumbai → Pune route; live temp setpoint & navigation |
| **Auditor** | `auditor@cryoguard.demo`<br>*(or `aud-001` / `FAC-PUN-001`)* | `password123` | Kabir Anand | **Pune Frozen Foods Distribution Hub** | Receiving portal in Pune; verifies & admits incoming TRK-01 |

*(Additional demo auditor for AIIMS Delhi: `auditor2@cryoguard.demo` / `HSP-AIM-002`)*

## Live Dynamic Sign Up & Authentication

- **Sign In**: Select role, enter email/ID and password.
- **Sign Up**:
  - Choose between **Manager** and **Auditor**.
  - **Manager signup**: Asks for Full Name, Email, Password, Company Name, Operating City, and Dispatch Hub.
  - **Auditor signup**: Asks for Full Name, Email, Password, Destination Facility/Hospital Name, Facility Type, Destination City, and Quality License Number.
  - Accounts are registered and dynamically persisted, granting instant access to the corresponding portal.

## Unified Multi-Portal Route Map

All three portals share the same geographical telemetry system:
- **🏢 Sender Portal**: Shows the dispatch plant / source hub.
- **🏥 Receiver Portal**: Shows the destination hospital or receiving facility.
- **Dashed Route Polyline**: Connects the sender and receiver facilities.
- **🚚 Demo Truck Icon**: Rendered at the vehicle's live coordinates in between the route, with live temperature color coding, pulsing indicators, and interactive telemetry popups (Vehicle ID, Cargo, Speed, Driver, Temp, ETA).
