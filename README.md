# CryoGuard AI

The existing landing page is the entry point for the manager, worker, and auditor portals. The login dialog checks the selected role and account ID/email against the shared demo dataset in `db.json`, then opens that account's portal and profile.

## Run locally

```sh
npm install
npm run dev
```

Vite serves the landing page and all three portal builds. JSON Server serves the shared demo dataset on port `3001`; Vite proxies its routes through `/api`.

## Demo login IDs

Choose a role on the landing page, then enter an ID or email from the dataset. Password authentication and account creation are not connected yet.

- Manager: `cmgr-001` or `arvind.kapoor.mcpe-001@cryoguard.demo`
- Worker: `wrk-mcpe-001-01` or `priya.singh.mcpe-001@cryoguard.demo`
- Auditor: `HSP-AIM-002` (AIIMS) or `FAC-HYD-002` (Hyderabad Vaccine Cold Chain Center)

Manager and worker portals use the matching company scope. An auditor signs in with the destination facility ID and sees consignments addressed to that facility.
