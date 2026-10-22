import { configureStore, createSlice } from "@reduxjs/toolkit";
import initialConsignments from "../data/mockConsignments";

// ── Consignments Slice ──
const consignmentsSlice = createSlice({
  name: "consignments",
  initialState: {
    items: initialConsignments,
    activeId: "BATCH-8821",
    kpiFilter: "ALL",
  },
  reducers: {
    setActiveId: (state, action) => {
      state.activeId = action.payload;
    },
    setKpiFilter: (state, action) => {
      state.kpiFilter = action.payload;
    },
    admitConsignment: (state, action) => {
      const { id, location, notes } = action.payload;
      const target = state.items.find((c) => c.id === id);
      if (target) {
        target.receiverDisposition = "ADMITTED";
        target.storageLocation = location;
        target.notes = notes;
      }
    },
    quarantineConsignment: (state, action) => {
      const { id, reason, capaCode, quarantineBay, notes } = action.payload;
      const target = state.items.find((c) => c.id === id);
      if (target) {
        target.receiverDisposition = "QUARANTINED";
        target.quarantineReason = reason;
        target.capaCode = capaCode;
        target.quarantineBay = quarantineBay;
        target.notes = notes;
      }
    },
    arriveAtGate: (state, action) => {
      const { id } = action.payload;
      const target = state.items.find((c) => c.id === id);
      if (target) {
        target.gateArrived = true;
        target.remainingDistanceKm = 0;
        target.currentSpeedKmh = 0;
        target.etaMinutes = 0;
        target.eta = "At Gate — Awaiting Dock Entry";
        target.gps = { lat: 40.7576, lng: -73.9858 };
      }
    },
    dockConsignment: (state, action) => {
      const { id, nowTime } = action.payload;
      const target = state.items.find((c) => c.id === id);
      if (target) {
        target.isDocked = true;
        target.gateArrived = true;
        target.tripStatus = "COMPLETED";
        target.dockLocation = target.dockLocation && !target.dockLocation.startsWith("Allocated") ? target.dockLocation : "Terminal · Dock D";
        target.dockArrivalTime = nowTime;
        target.eta = `Docked (${nowTime})`;
        target.remainingDistanceKm = 0;
        target.currentSpeedKmh = 0;
        target.gps = { lat: 40.758, lng: -73.9855 };
      }
    },
    addConsignment: (state, action) => {
      state.items.unshift(action.payload);
      state.activeId = action.payload.id;
    },
    appendAuditNote: (state, action) => {
      const { id, noteText } = action.payload;
      const target = state.items.find((c) => c.id === id);
      if (target) {
        target.notes = noteText;
      }
    },
  },
});

// ── Profile Slice ──
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    name: "Dr. Elena Rostova, PharmD",
    designation: "Chief Quality Inspector & Lead Pharmacist",
    username: "erostova_qa",
    userId: "UID-PQ-99412",
    firmName: "Metro General Hospital",
    department: "Department of Pharmacy & Biomedical Quality Assurance",
    hospitalAddress: "450 Medical Center Boulevard, New York, NY 10016",
    contactNo: "+1 (212) 555-0194",
    extension: "Ext. 4421 (Direct Quality Desk)",
    email: "e.rostova@metrogeneral.health",
    licenseNo: "LIC-PQ-99412 (NYS Certified)",
    terminalId: "TERM-01",
  },
  reducers: {
    updateProfile: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

// ── Audit Logs Slice ──
const auditLogsSlice = createSlice({
  name: "auditLogs",
  initialState: {
    logs: [
      {
        id: "log-1",
        timestamp: "2026-10-21 08:00:14 EST",
        actor: "CRYOGUARD_GATEWAY",
        type: "info",
        action: "TELEMETRY_INITIALIZED",
        batchId: "BATCH-8821",
        details: "Hardware data logger activated.",
      },
      {
        id: "log-2",
        timestamp: "2026-10-21 08:32:41 EST",
        actor: "SENSOR_MONITOR",
        type: "warning",
        action: "EXCURSION_RECORDED",
        batchId: "BATCH-7710",
        details: "Temperature reading spike 9.3°C above 8.0°C upper tolerance limit.",
      },
      {
        id: "log-3",
        timestamp: "2026-10-21 10:15:00 EST",
        actor: "Dr. Elena Rostova",
        type: "success",
        action: "BATCH_ADMITTED",
        batchId: "BATCH-6642",
        details: "Insulin Glargine admitted to Biologics Storage Unit C-4.",
      },
    ],
  },
  reducers: {
    addAuditLog: (state, action) => {
      const { action: act, batchId, details, actor = "Dr. Elena Rostova" } = action.payload;
      const now = new Date();
      const timestamp = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString()} EST`;
      state.logs.unshift({
        id: `log-${Date.now()}`,
        timestamp,
        actor,
        type: act.includes("ADMIT") ? "success" : act.includes("QUARANTINE") ? "error" : "info",
        action: act,
        batchId,
        details,
      });
    },
  },
});

// ── Notifications Slice ──
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [
      {
        id: "notif-1",
        type: "info",
        title: "CryoGuard AI System Active",
        message: "Live Inward Cold-Chain Quality Verification Enforced.",
        timestamp: "Just now",
        unread: true,
      },
    ],
  },
  reducers: {
    addNotification: (state, action) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const item = {
        id: action.payload.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: action.payload.type || "info",
        title: action.payload.title || "Notification",
        message: action.payload.message || "",
        timestamp: action.payload.timestamp || timeStr,
        unread: true,
      };
      state.items.unshift(item);
    },
    markAllRead: (state) => {
      state.items.forEach((item) => {
        item.unread = false;
      });
    },
    markRead: (state, action) => {
      const target = state.items.find((item) => item.id === action.payload);
      if (target) {
        target.unread = false;
      }
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  setActiveId,
  setKpiFilter,
  admitConsignment,
  quarantineConsignment,
  arriveAtGate,
  dockConsignment,
  addConsignment,
  appendAuditNote,
} = consignmentsSlice.actions;

export const { updateProfile } = profileSlice.actions;
export const { addAuditLog } = auditLogsSlice.actions;

export const {
  addNotification,
  markAllRead,
  markRead,
  removeNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

export const store = configureStore({
  reducer: {
    consignments: consignmentsSlice.reducer,
    profile: profileSlice.reducer,
    auditLogs: auditLogsSlice.reducer,
    notifications: notificationsSlice.reducer,
  },
});
