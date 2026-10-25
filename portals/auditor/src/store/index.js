import { configureStore, createSlice } from "@reduxjs/toolkit";
import initialConsignments from "../data/mockConsignments";

// ── Consignments Slice ──
const consignmentsSlice = createSlice({
  name: "consignments",
  initialState: {
    items: initialConsignments,
    activeId: "SHP-1021",
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
        target.eta = "At Pune Gate B — Awaiting Dock Entry";
        target.gps = { lat: 18.5204, lng: 73.8567 };
      }
    },
    dockConsignment: (state, action) => {
      const { id, nowTime } = action.payload;
      const target = state.items.find((c) => c.id === id);
      if (target) {
        target.isDocked = true;
        target.gateArrived = true;
        target.tripStatus = "COMPLETED";
        target.dockLocation = target.dockLocation && !target.dockLocation.startsWith("Allocated") ? target.dockLocation : "Pune Terminal · Bay 01";
        target.dockArrivalTime = nowTime;
        target.eta = `Docked (${nowTime})`;
        target.remainingDistanceKm = 0;
        target.currentSpeedKmh = 0;
        target.gps = { lat: 18.5204, lng: 73.8567 };
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

let portalUser = null;
try {
  const session = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
  if (String(session?.role || "").toLowerCase() === "auditor") portalUser = session.user;
} catch {
  portalUser = null;
}

const defaultProfile = {
  name: portalUser?.name || "Kabir Anand",
  designation: portalUser ? `${portalUser.facilityType || "Facility"} Quality Auditor` : "Lead Quality Assurance Auditor",
  username: portalUser?.email?.split("@")[0] || "kabir_anand",
  userId: portalUser?.facilityId || portalUser?.id || "aud-001",
  firmName: portalUser?.facilityName || "Pune Frozen Foods Distribution Hub",
  department: "Quality Assurance & Inward Cold-Chain Verification",
  hospitalAddress: [portalUser?.location, portalUser?.facilityName].filter(Boolean).join(" · ") || "Plot 42, Hinjawadi Phase II, Pune, Maharashtra 411057",
  contactNo: portalUser?.phone || "+91 98230 45678",
  extension: "Ext. 4021 (Intake Quality Desk)",
  email: portalUser?.email || "auditor@cryoguard.demo",
  licenseNo: portalUser?.facilityId ? `LIC-${portalUser.facilityId}` : "LIC-MH-PUN-001 (FSSAI/GxP Certified)",
  terminalId: portalUser?.facilityId ? `${portalUser.facilityId}-TERM-01` : "FAC-PUN-001-TERM-01",
};

// ── Profile Slice ──
const profileSlice = createSlice({
  name: "profile",
  initialState: defaultProfile,
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
        batchId: "SHP-1021",
        details: "Hardware data logger activated on TRK-01 (Mumbai → Pune).",
      },
      {
        id: "log-2",
        timestamp: "2026-10-22 08:32:41 IST",
        actor: "SENSOR_MONITOR",
        type: "warning",
        action: "EXCURSION_RECORDED",
        batchId: "SHP-1025",
        details: "Temperature reading spike -14.1°C above -18.0°C upper tolerance limit.",
      },
      {
        id: "log-3",
        timestamp: "2026-10-22 10:15:00 IST",
        actor: "Kabir Anand",
        type: "success",
        action: "BATCH_ADMITTED",
        batchId: "SHP-1033",
        details: "Frozen Salmon and Poultry admitted to Deep Freeze Unit Alpha-02.",
      },
    ],
  },
  reducers: {
    addAuditLog: (state, action) => {
      const { action: act, batchId, details, actor = "Kabir Anand" } = action.payload;
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
