# CryoGuard AI — Predictive Cold-Chain Intelligence & Multi-Tier Integrity Platform

[![Platform](https://img.shields.io/badge/Platform-React_19_|_Vite_8-38BDF8?style=for-the-badge&logo=react)](https://react.dev/)
[![Routing](https://img.shields.io/badge/Maps-Leaflet_|_Highway_Corridors-00F0FF?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![GxP Compliance](https://img.shields.io/badge/GxP-SHA--256_Audit_Trail-10B981?style=for-the-badge)](https://en.wikipedia.org/wiki/Good_practice)
[![PID](https://img.shields.io/badge/Project_ID-PID:_006-F59E0B?style=for-the-badge)]()

> **CryoGuard AI** is an enterprise-grade, end-to-end cold-chain logistics telemetry and quality assurance platform. It unifies **Fleet Logistics Managers**, **In-Cab Highway Drivers**, and **Hospital / Facility Receiving Auditors** into a synchronized real-time network, replacing retrospective USB temperature loggers with predictive alerts and tamper-proof GxP compliance.

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [The Problem We Solve](#-the-problem-we-solve)
- [System Architecture](#-system-architecture)
- [Core Portals & Responsibilities](#-core-portals--responsibilities)
  - [1. Fleet Manager Command Portal (Akshita)](#1-fleet-manager-command-portal-akshita)
  - [2. Receiving Auditor & Quality Gate Portal (Lakshay)](#2-receiving-auditor--quality-gate-portal-lakshay)
  - [3. Ground Worker / In-Cab Cockpit (Yashika)](#3-ground-worker--in-cab-cockpit-yashika)
  - [4. Central Platform Gateway & Landing Hub](#4-central-platform-gateway--landing-hub)
- [Highway Geometry & Collision-Free Radar](#-highway-geometry--collision-free-radar)
- [GxP Compliance, Security & Audit Trail](#-gxp-compliance-security--audit-trail)
- [Tech Stack](#-tech-stack)
- [Quickstart & Local Installation](#-quickstart--local-installation)
- [Pre-Configured Demo Credentials](#-pre-configured-demo-credentials)
- [Project Metadata & Team Breakdown](#-project-metadata--team-breakdown)

---

## 🌍 Executive Overview

In temperature-sensitive supply chains (pharmaceuticals, mRNA vaccines, biological samples, and perishable food), cooling failures on long-haul highway routes cause catastrophic losses. Traditional monitoring relies on passive USB temperature loggers that are only analyzed **after** delivery at the destination dock—when compromised cargo is already ruined beyond rescue.

**CryoGuard AI** transforms cold-chain logistics from an **"autopsy of spoiled shipments"** into an **active, predictive defense system**:
- **Continuous IoT Multi-Sensor Telemetry**: Streams temperature, humidity, road vibration, and speed in real time.
- **Predictive Breach Forecasting**: Machine-learning heuristics detect micro-trends (e.g. door seal leaks, compressor strain) up to 45 minutes before thermal tolerance thresholds are exceeded.
- **Realistic Road Routing**: Replaces straight-line approximations with true highway road curves (e.g., NH48 Mumbai–Pune expressway) and anti-collision vehicle spacing.
- **Paperless GxP Quality Gates**: Dockside inspectors can review complete journey curves, execute 1-click **Accept** or **Quarantine** workflows, record CAPA deviations, and export tamper-evident SHA-256 Goods Receipt Notes (GRN).

---

## ⚠️ The Problem We Solve

| Critical Challenge | Industry Reality | CryoGuard AI Solution |
| :--- | :--- | :--- |
| **Global Wastage** | **$35+ Billion** in pharmaceuticals and perishables spoil annually during transit. | 24/7 automated alerts notify drivers and dispatch teams before temperature deviations spoil cargo. |
| **Vaccine Degradation** | Up to **50% of sensitive vaccines** (WHO estimate) spoil due to broken cold chains. | Real-time monitoring across standard and ultra-cold ranges (`-80°C` to `+8°C`) with instant excursion warnings. |
| **"Autopsy" Logging** | USB loggers only disclose temperature spikes after cargo is unloaded at the dock. | Live telemetry streaming and predictive AI risk alerts projected directly in cab and dispatch. |
| **Audit & Paperwork Gaps**| Paper clipboards smudge, get lost, or suffer retrospective falsification. | Digital cryptographic SHA-256 audit trails and 1-click official GRN and Ledger PDF exports. |

---

## 🏗️ System Architecture

CryoGuard AI operates as a unified multi-portal system sharing a centralized telemetry engine and role-isolated security layer:

```
                                 ┌────────────────────────────────────────────────────────┐
                                 │                CryoGuard AI Front Door                 │
                                 │       (Role-Based Security & Real-Time Gateway)       │
                                 └───────────┬────────────────┬───────────────────────────┘
                                             │                │
                    ┌────────────────────────┼────────────────┴────────────────────────┐
                    │                        │                                         │
                    ▼                        ▼                                         ▼
       ┌────────────────────────┐┌────────────────────────┐      ┌─────────────────────────────┐
       │  Fleet Manager Portal  ││  Ground Worker Cockpit │      │  Receiving Auditor Portal   │
       │     (Lead: Akshita)    ││     (Lead: Yashika)    │      │      (Lead: Lakshay)        │
       ├────────────────────────┤├────────────────────────┤      ├─────────────────────────────┤
       │ • Live Fleet Map       ││ • In-Cab Dark Cockpit  │      │ • Inbound Transport Radar   │
       │ • Route Corridor Zoom  ││ • Real Road Guidance   │      │ • Temperature History Curve │
       │ • Diagnostics & Alerts ││ • Assigned Cargo List  │      │ • Accept / Quarantine Gate  │
       │ • Dispatch Supervision ││ • Digital Checklists   │      │ • Cryptographic SHA-256 Log │
       │ • Capacity Balancing   ││ • Two-Way Chat Channel │      │ • 1-Click Official GRN PDF  │
       └────────────┬───────────┘└───────────┬────────────┘      └──────────────┬──────────────┘
                    │                        │                                  │
                    └────────────────────────┼──────────────────────────────────┘
                                             │
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │    Unified Telemetry & Data Engine           │
                      │  • Curvature Road Polyline Interpolator      │
                      │  • Smart Vehicle Anti-Collision Spacing      │
                      │  • Multi-Sensor Stream (Temp/Hum/Vibe/Speed) │
                      │  • SQLite / json-server Live Persistence     │
                      └──────────────────────────────────────────────┘
```

---

## 🚀 Core Portals & Responsibilities

### 1. Fleet Manager Command Portal *(Akshita)*
- **High-Resolution Highway Fleet Radar**: Real-time Leaflet map displaying active transport trucks along realistic road corridors. Trucks in the same transit corridor utilize dynamic offset spacing to prevent visual collision.
- **Single-Truck Route Isolation**: Clicking any truck immediately focuses the camera onto its exact origin-to-destination corridor, suppressing unrelated traffic and expanding vehicle telemetry.
- **Multi-Sensor Environmental Diagnostics**:
  - **Temperature**: Live cargo chamber monitoring with color-coded tags (*Green Normal, Yellow Warning, Red Critical*).
  - **Humidity**: Detects door seal leakages and ambient moisture spikes.
  - **Road Vibration**: Identifies rough road conditions and potential mechanical reefer distress.
  - **Speed & Telematics**: Tracks vehicle speed against scheduled arrival timelines.
- **Dispatch Ledger & Consignment Management**: Comprehensive records of dispatched batches, vehicle availability, and fleet capacity across regional logistics depots.

### 2. Receiving Auditor & Quality Gate Portal *(Lakshay)*
- **Inbound Transport Radar**: Real-time awareness of approaching consignments hours prior to physical dock arrival, separating vehicles in transit from docked shipments.
- **Thermal Timeline Drilldown**: One-click historical graph of hourly temperatures across every journey checkpoint (05:00, 06:00, 07:00, 08:00) with in-specification compliance tags.
- **1-Click Dockside Decision Workflow**:
  - **Accept & Admit**: Clears verified consignments for transfer to internal warehouse cold rooms.
  - **Quarantine**: Immediately flags compromised batches, initiates CAPA deviation code entry, and assigns quarantine bay locations.
- **Cryptographic SHA-256 Audit Records**: Every inspection and status change generates a unique cryptographic hash fingerprint, ensuring tamper-evident chain of custody.
- **1-Click Official GxP PDF Generation**: Generates publication-quality Goods Receipt Notes (GRN) and Master Ledger Reports with company stamps, audit hashes, and authorized signatures.

### 3. Ground Worker / In-Cab Cockpit *(Yashika)*
- **Driver-Focused Dark Cockpit**: Built specifically for in-cab tablet and mobile use, featuring high-contrast typography, large numerical readouts, and zero clutter.
- **Gamified Performance Rating (92% Score)**: Incentivizes disciplined handling based on on-time departure, pre-trip checklist completion, and cold-chain compliance.
- **Turn-by-Turn Road Guidance**: Visualizes departure hubs, hospital intake bays, live progress percentages, remaining distance (km), and dynamic estimated arrival time.
- **Vehicle-Specific Cargo Directory**: Drivers exclusively see their assigned shipments (e.g. `SHP-1021`, `SHP-1033`, `SHP-1045`), target temperature setpoints (`-22°C` to `-18°C`), and consignment lot numbers.
- **Digital SOP Execution & Dispatch Chat**: Step-by-step pre-trip cooling verifications, container door seal checks, and integrated messaging with dispatch managers.

### 4. Central Platform Gateway & Landing Hub
- **Live AI Prediction Simulation**: Visitors immediately experience an interactive simulation of active shipment `TRK-1042`, displaying current temperature (`7.2°C`), safe tolerance boundaries, and predictive breach forecasts (~45 min early warning).
- **1-Click Role Testing**: Allows evaluators and stakeholders to seamlessly toggle between Manager Arvind, Driver Priya, and Auditor Kabir without manual credential entry.
- **Tenant Isolation**: Strict role-based authentication segregates logistics providers (`MCPE-001`) from destination hospital facilities (`FAC-PUN-001`).

---

## 🛣️ Highway Geometry & Collision-Free Radar

Unlike traditional tracking tools that render straight lines ("as the crow flies") between cities, CryoGuard AI implements high-fidelity geographic route polylines:
1. **Realistic Curvature Paths**: Pre-calculated and dynamically interpolated waypoint sequences that follow actual highway infrastructure (e.g. the winding mountain ghats of NH48 between Mumbai and Pune, Pune–Hyderabad, Delhi–Nagpur).
2. **Anti-Collision Marker Displacement**: When multiple reefer trucks travel along identical highway corridors, an orthogonal displacement offset algorithm separates marker icons by `~0.015°` latitude/longitude, guaranteeing that every vehicle remains individually clickable.
3. **Coordinated Multi-Portal State**: Route isolation selected by a manager or auditor updates the map camera, polyline highlight, and telemetry panels synchronously.

---

## 🛡️ GxP Compliance, Security & Audit Trail

CryoGuard AI incorporates regulatory design principles tailored for life sciences and clinical logistics:
- **Tamper-Evident SHA-256 Hashing**: Each ledger record and sensor snapshot is fingerprinted using cryptographic hashing. Any modification to temperature logs invalidates the checksum.
- **21 CFR Part 11 / EU Annex 11 Alignment**: Strict digital signature workflows for quarantine overrides, audit trail logging, and CAPA incident classification.
- **Role-Based Access Control (RBAC)**: Distinct permission tiers separating administrative fleet supervision, cab execution, and clinical quarantine approval.

---

## 💻 Tech Stack

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (Multi-Page Portal Architecture)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + React Context API
- **Maps & Geospatial**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) + [MapLibre GL](https://maplibre.org/)
- **UI & Styling**: Pure Modular CSS with dark/light theme tokens, Bootstrap 5 UI utilities, Lucide React & FontAwesome Icons
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF) + `jspdf-autotable`

### Backend & Telemetry
- **API & Mock Server**: [json-server](https://github.com/typicode/json-server) watching `db.json` with RESTful route mapping
- **Orchestration**: `concurrently` for synchronized frontend and backend development execution
- **Security**: Client-side SHA-256 cryptographic hashing and role-isolated session storage

---

## ⚡ Quickstart & Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (v9.0.0 or higher)

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/lakshaysingla12-bit/CryoGuard-AI.git
   cd CryoGuard-AI
   ```

2. **Checkout the Demo Branch**:
   ```bash
   git checkout demo
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Launch the Development Platform**:
   ```bash
   npm run dev
   ```

5. **Access the Portals**:
   - **Platform Landing Hub**: [http://localhost:5173/](http://localhost:5173/)
   - **Fleet Manager Command (Akshita)**: [http://localhost:5173/portals/manager/](http://localhost:5173/portals/manager/)
   - **Ground Worker Cockpit (Yashika)**: [http://localhost:5173/portals/worker/](http://localhost:5173/portals/worker/)
   - **Receiving Auditor Gate (Lakshay)**: [http://localhost:5173/portals/auditor/](http://localhost:5173/portals/auditor/)
   - **Telemetry API**: [http://localhost:3001/](http://localhost:3001/)

---

## 🔑 Pre-Configured Demo Credentials

All pre-configured accounts use the password: **`password123`** *(Quick-fill shortcuts are also accessible on the login modal)*.

| Role | Portal Focus | Email / ID | Password | Representative | Facility / Fleet | Assigned Route / Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Fleet Manager** | **Manager Portal** *(Akshita)* | `manager@cryoguard.demo`<br>*(or `cmgr-001`)* | `password123` | **Arvind Kapoor** | Mumbai Coastal Protein Exports (`MCPE-001`) | Mumbai Regional Hub; full fleet oversight & corridor tracking |
| **Ground Worker** | **Worker Portal** *(Yashika)* | `worker@cryoguard.demo`<br>*(or `wrk-001`)* | `password123` | **Priya Singh** | Reefer Vehicle `TRK-01` | Mumbai → Pune Corridor (NH48); in-cab navigation & tasks |
| **Receiving Auditor** | **Auditor Portal** *(Lakshay)* | `auditor@cryoguard.demo`<br>*(or `aud-001`)* | `password123` | **Kabir Anand** | Pune Frozen Foods Distribution Hub (`FAC-PUN-001`) | Receiving Bay Dock; inbound radar, ledger inspection & GRN |
| **Clinical Auditor** | **Auditor Portal** *(Lakshay)* | `auditor2@cryoguard.demo`<br>*(or `HSP-AIM-002`)* | `password123` | **Dr. R. Sharma** | AIIMS Super-Specialty Medical Center | Pharmaceutical & Vaccine cold-chain verification |

---

## 👥 Project Metadata & Team Breakdown

- **Project Title**: CryoGuard AI — Predictive Cold-Chain Logistics & Quality Assurance Platform
- **Project ID**: `PID: 006`
- **Domain**: IoT Logistics, Real-Time Sensor Telematics & Healthcare GxP Compliance
- **Presentation Deck**: Available in `C:\Projects\CryoGuard-Presentation\CryoGuard_AI_Presentation.pptx`

### Team Members & Portal Responsibilities
| Team Member | Roll No. / Student ID | Portal Responsibility |
| :--- | :--- | :--- |
| **Akshita Kaushik** | `2510990763` | **Manager Portal** (Fleet Operations, Highway Radar & Dispatch) |
| **Lakshay Singla** | `2510990792` | **Auditor Portal** (Receiving Dock, GxP Ledger & Quality Gate) |
| **Yashika Gupta** | `2510990781` | **Worker Portal** (In-Cab Driver Cockpit, Navigation & Tasks) |

---

<p align="center">
  <b>CryoGuard AI</b> — <i>Protecting every cold-chain shipment before it's too late.</i>
</p>
