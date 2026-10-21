import React, { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import KPIStrip from "./components/KPIStrip";
import ShipmentMap from "./components/ShipmentMap";
import IntakeLedger from "./components/IntakeLedger";
import InspectionPanel from "./components/InspectionPanel";
import LiveTrackingView from "./components/LiveTrackingView";
import IntakeLedgerView from "./components/IntakeLedgerView";
import GRNReportsView from "./components/GRNReportsView";
import AdmitModal from "./components/AdmitModal";
import QuarantineModal from "./components/QuarantineModal";
import NewConsignmentModal from "./components/NewConsignmentModal";
import GRNPreviewModal from "./components/GRNPreviewModal";
import AuditTrailModal from "./components/AuditTrailModal";
import UserProfileModal from "./components/UserProfileModal";
import ToastContainer from "./components/ToastContainer";
import initialConsignments from "./data/mockConsignments";
import { sound } from "./utils/soundFx";
import { clearDemoSession } from "../../../src/api/demoAuth.js";
import "./styles/index.css";

const cityCoordinates = {
  Ahmedabad: [23.0225, 72.5714], Bengaluru: [12.9716, 77.5946], Chandigarh: [30.7333, 76.7794],
  Delhi: [28.6139, 77.209], Hyderabad: [17.385, 78.4867], Indore: [22.7196, 75.8577],
  Jaipur: [26.9124, 75.7873], Lucknow: [26.8467, 80.9462], Mumbai: [19.076, 72.8777],
  Nagpur: [21.1458, 79.0882], Pune: [18.5204, 73.8567], Surat: [21.1702, 72.8311],
};

function shipmentForAuditor(row, readings) {
  const originCity = row.originCity || row.origin;
  const destinationCity = row.destinationCity || row.facilityName?.split(",").at(-1)?.trim();
  const routeHistory = [cityCoordinates[originCity], cityCoordinates[destinationCity]]
    .filter(Boolean)
    .map(([lat, lng]) => ({ lat, lng }));
  const timeSeriesData = readings
    .filter((reading) => reading.vehicleId === row.vehicleId)
    .map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temp: Number(reading.temperature),
      humidity: Number(reading.humidity || 0),
    }));
  const fallbackSeries = [{ time: "Latest", temp: Number(row.currentTemp), humidity: 0 }];
  const delivered = row.status === "Delivered";
  const eventDate = row.deliveryDate || row.expectedDeliveryDate || row.createdAt;
  const cityPoint = cityCoordinates[destinationCity] || cityCoordinates[row.destinationCity];

  return {
    id: row.id,
    companyId: row.companyId,
    companyName: row.companyName,
    companyManagerId: row.companyManagerId,
    companyManagerName: row.companyManagerName,
    sourceName: row.sourceName,
    sourceLocation: row.sourceLocation,
    facilityId: row.facilityId || row.destinationFacilityId || row.destinationOrganizationId || row.auditorId,
    facilityName: row.facilityName || row.destination,
    vehicleId: row.vehicleId,
    drugName: row.cargo,
    category: row.category || row.facilityType || "Cold-chain cargo",
    origin: row.sourceLocation || row.sourceName || originCity,
    date: eventDate ? String(eventDate).slice(0, 10) : "",
    isToday: eventDate ? String(eventDate).slice(0, 10) === new Date().toISOString().slice(0, 10) : false,
    isDocked: delivered,
    tripStatus: delivered ? "COMPLETED" : row.status === "Delayed" ? "DELAYED" : "IN_TRANSIT",
    dockLocation: row.facilityName || row.destination,
    tripStartTime: row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    dockArrivalTime: delivered && row.deliveryDate ? new Date(row.deliveryDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    tripDistanceKm: 0,
    averageSpeedKmh: 0,
    targetTempBand: { min: Number(row.minTemp), max: Number(row.maxTemp), unit: row.temperatureUnit || "°C" },
    currentTemp: Number(row.currentTemp),
    currentHumidity: 0,
    eta: delivered ? `Delivered ${row.deliveryDate || ""}` : `Expected ${row.expectedDeliveryDate || row.eta || ""}`,
    transitExcursionCount: Number(row.currentTemp) < Number(row.minTemp) || Number(row.currentTemp) > Number(row.maxTemp) ? 1 : 0,
    sha256Seal: `DEMO-SEAL-${row.id}`,
    carrierDriver: row.workerName || "Assigned worker",
    receiverDisposition: "PENDING",
    gps: cityPoint ? { lat: cityPoint[0], lng: cityPoint[1] } : null,
    routeHistory,
    timeSeriesData: timeSeriesData.length ? timeSeriesData : fallbackSeries,
  };
}

export default function App() {
  let portalUser = null;
  try {
    const session = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
    if (String(session?.role || "").toLowerCase() === "auditor") portalUser = session.user;
  } catch {
    portalUser = null;
  }
  const [consignments, setConsignments] = useState(() => portalUser ? [] : initialConsignments);
  const [consignmentsLoading, setConsignmentsLoading] = useState(Boolean(portalUser?.facilityId));
  const [consignmentsError, setConsignmentsError] = useState("");
  const [activeId, setActiveId] = useState("BATCH-8821");
  const [activeView, setActiveView] = useState("dashboard");
  const [kpiFilter, setKpiFilter] = useState("ALL");

  // Theme state: "dark" (default) | "light"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cryoguard_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cryoguard_theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    sound.click();
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Modals state
  const [admitTarget, setAdmitTarget] = useState(null);
  const [quarantineTarget, setQuarantineTarget] = useState(null);
  const [grnTarget, setGrnTarget] = useState(null);
  const [isNewIntakeOpen, setIsNewIntakeOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => ({
    name: portalUser?.name || "Dr. Elena Rostova, PharmD",
    designation: portalUser ? `${portalUser.facilityType || "Facility"} Auditor` : "Chief Quality Inspector & Lead Pharmacist",
    username: portalUser?.email?.split("@")[0] || "erostova_qa",
    userId: portalUser?.facilityId || "UID-PQ-99412",
    firmName: portalUser?.facilityName || portalUser?.hospitalName || "Metro General Hospital",
    department: portalUser?.team || "Department of Pharmacy & Biomedical Quality Assurance",
    hospitalAddress: [portalUser?.location, portalUser?.facilityName].filter(Boolean).join(" · ") || "450 Medical Center Boulevard, Receiving Bay 03, New York, NY 10016",
    contactNo: portalUser?.phone || "+1 (212) 555-0194",
    extension: "Receiving facility auditor",
    email: portalUser?.email || "e.rostova@metrogeneral.health",
    licenseNo: portalUser?.facilityId || "LIC-PQ-99412",
    terminalId: portalUser?.facilityId || "BAY03-TERM-01",
  }));

  useEffect(() => {
    if (!portalUser?.facilityId) return;
    let cancelled = false;
    setConsignmentsLoading(true);
    setConsignmentsError("");
    Promise.all([
      fetch(`/api/shipments?facilityId=${encodeURIComponent(portalUser.facilityId)}`).then((response) => {
        if (!response.ok) throw new Error(`Shipments request failed (${response.status}).`);
        return response.json();
      }),
      fetch("/api/temperatureReadings").then((response) => {
        if (!response.ok) throw new Error(`Temperature data request failed (${response.status}).`);
        return response.json();
      }),
    ])
      .then(([shipments, readings]) => {
        if (cancelled) return;
        const facilityShipments = shipments.filter((shipment) =>
          [shipment.facilityId, shipment.destinationFacilityId, shipment.destinationOrganizationId, shipment.auditorId]
            .some((id) => String(id || "") === String(portalUser.facilityId)),
        );
        const rows = facilityShipments.map((shipment) => ({
          ...shipmentForAuditor(shipment, readings),
          companyId: shipment.companyId,
          companyName: shipment.companyName,
          companyManagerId: shipment.companyManagerId,
          companyManagerName: shipment.companyManagerName,
          sourceName: shipment.sourceName,
          sourceLocation: shipment.sourceLocation,
          facilityId: shipment.facilityId || shipment.destinationFacilityId || shipment.destinationOrganizationId || shipment.auditorId,
          facilityName: shipment.facilityName || shipment.destination,
          auditorId: portalUser.id,
          auditorName: portalUser.name,
        }));
        setConsignments(rows);
        setActiveId(rows[0]?.id || "");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Could not load this facility's consignments:", error);
        setConsignmentsError(error.message || "Could not load this facility's shipments.");
      })
      .finally(() => {
        if (!cancelled) setConsignmentsLoading(false);
      });
    return () => { cancelled = true; };
  }, [portalUser?.facilityId]);

  // Toasts
  const [toasts, setToasts] = useState([
    {
      id: "init-1",
      type: "info",
      title: "CryoGuard AI System Active",
      message: "Receiving Bay 03 Live Inward Cold-Chain Verification Enforced.",
    },
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "log-1",
      timestamp: "2026-10-21 08:00:14 EST",
      actor: "CRYOGUARD_GATEWAY",
      type: "info",
      action: "TELEMETRY_INITIALIZED",
      batchId: "BATCH-8821",
      details: "Hardware data logger activated with SHA-256 seal.",
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
      actor: portalUser?.name || "Facility Auditor",
      type: "success",
      action: "BATCH_ADMITTED",
      batchId: "BATCH-6642",
      details: "Insulin Glargine admitted to Biologics Storage Unit C-4.",
    },
  ]);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addAuditLog = useCallback((action, batchId, details, actor = portalUser?.name || "Facility Auditor") => {
    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString()} EST`;
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp,
        actor,
        type: action.includes("ADMIT") ? "success" : action.includes("QUARANTINE") ? "error" : "info",
        action,
        batchId,
        details,
      },
      ...prev,
    ]);
  }, []);

  // Keyboard shortcut '/' for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        const searchInput = document.querySelector(".topbar__search-box input");
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Batch selection
  const handleSelect = useCallback((id) => {
    setActiveId(id);
  }, []);

  // Execution: Admit to storage (Accept)
  const handleConfirmAdmit = (id, location, notes, pin) => {
    setConsignments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              receiverDisposition: "ADMITTED",
              storageLocation: location,
              notes,
            }
          : c
      )
    );
    addAuditLog("BATCH_ACCEPTED_ADMITTED", id, `Accepted and admitted to ${location}. Authenticated with PIN.`);
    addToast({
      type: "success",
      title: "Consignment Accepted & Admitted",
      message: `${id} cleared and released to ${location}.`,
    });
  };

  // Execution: Quarantine batch (Reject)
  const handleConfirmQuarantine = (id, reason, capaCode, quarantineBay, notes, notifyQA) => {
    setConsignments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              receiverDisposition: "QUARANTINED",
              quarantineReason: reason,
              capaCode,
              quarantineBay,
              notes,
            }
          : c
      )
    );
    addAuditLog("BATCH_REJECTED_QUARANTINED", id, `Rejected & Quarantined under ${capaCode} (${quarantineBay}). Reason: ${reason}`);
    addToast({
      type: "error",
      title: "Batch Rejected & Quarantined",
      message: `${id} segregated under CAPA deviation ${capaCode}.`,
    });
  };

  // Handle Cargo Docking from Live Tracking -> Automatically add to Intake Ledger
  const handleDockCargo = useCallback((id) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            isDocked: true,
            tripStatus: "COMPLETED",
            dockLocation: "Bay 03 · Dock D",
            dockArrivalTime: nowTime,
            eta: `Docked at Bay 03 (${nowTime})`,
            gps: { lat: 40.758, lng: -73.9855 },
          };
        }
        return c;
      })
    );
    addAuditLog("TRANSPORT_DOCKED", id, `Vehicle docked at Bay 03 at ${nowTime}. Automatically added to Intake Ledger.`);
    addToast({
      type: "success",
      title: "Cargo Docked at Bay 03",
      message: `${id} has docked! Automatically added to Intake Ledger for quality disposition.`,
    });
  }, [addAuditLog, addToast]);

  // Add new consignment
  const handleAddConsignment = (newBatch) => {
    setConsignments((prev) => [newBatch, ...prev]);
    setActiveId(newBatch.id);
    addAuditLog("NEW_CONSIGNMENT_INTAKE", newBatch.id, `Transport registered: ${newBatch.drugName} via ${newBatch.vehicleId}`);
    addToast({
      type: "success",
      title: "Consignment Registered",
      message: `${newBatch.id} added to today's receiving queue.`,
    });
  };

  // Add audit note
  const handleAddAuditNote = (id, noteText) => {
    setConsignments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: noteText } : c))
    );
    addAuditLog("PHARMACIST_NOTE_APPENDED", id, noteText);
  };

  const handleSubmitAuditReport = async (consignment, review) => {
    const shipment = consignments.find((entry) => entry.id === consignment.id);
    if (!shipment || !portalUser?.facilityId || shipment.facilityId !== portalUser.facilityId) {
      throw new Error("This shipment is not assigned to your facility.");
    }
    const temperatureWithinRange = review.temperatureAtDelivery >= shipment.targetTempBand.min && review.temperatureAtDelivery <= shipment.targetTempBand.max;
    const status = temperatureWithinRange && review.qualityCondition === "Good" && review.packagingCondition === "Intact" ? "Passed" : "Needs review";
    const report = {
      id: `RPT-${Date.now()}`,
      title: `Delivery audit · ${shipment.id}`,
      shipmentId: shipment.id,
      companyId: shipment.companyId,
      companyName: shipment.companyName,
      companyManagerId: shipment.companyManagerId,
      companyManagerName: shipment.companyManagerName,
      sourceName: shipment.sourceName,
      facilityId: shipment.facilityId,
      facilityName: shipment.facilityName,
      auditorId: portalUser.id,
      auditor: portalUser.name,
      temperatureAtDelivery: review.temperatureAtDelivery,
      temperatureUnit: "°C",
      temperatureWithinRange,
      qualityCondition: review.qualityCondition,
      packagingCondition: review.packagingCondition,
      auditNotes: review.auditNotes,
      status,
      auditedAt: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
    };
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error("Could not send the delivery review. Please try again.");
    addToast({
      type: status === "Passed" ? "success" : "warning",
      title: "Review sent to manager",
      message: `${shipment.id} · ${status} · ${shipment.companyName || "Source company"}`,
    });
    addAuditLog("DELIVERY_REVIEW_SENT", shipment.id, `${status}; ${review.temperatureAtDelivery}°C; quality ${review.qualityCondition}; packaging ${review.packagingCondition}.`);
  };

  const activeConsignment =
    consignments.find((c) => c.id === activeId) || consignments.find((c) => c.isToday !== false) || consignments[0] || null;

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* ── SIDEBAR: CryoGuard AI Logo + 4 Buttons + User Profile ── */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <main className="main-content">
        {/* ── MAIN TOP BAR: Firm Name + Search Bar + Time + Theme Toggle ── */}
        <TopBar
          department={userProfile.department}
          firmName={userProfile.firmName}
          facilityId={userProfile.userId}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLogout={() => {
            clearDemoSession();
            window.location.assign("/");
          }}
          onGlobalSearch={(q) => {
            if (q) {
              const match = consignments.find(
                (c) =>
                  c.id.toLowerCase().includes(q.toLowerCase()) ||
                  c.drugName.toLowerCase().includes(q.toLowerCase()) ||
                  c.vehicleId.toLowerCase().includes(q.toLowerCase()) ||
                  c.carrierDriver.toLowerCase().includes(q.toLowerCase())
              );
              if (match) setActiveId(match.id);
            }
          }}
        />

        <div className="main-content__body">
          {/* ───────────────────────────────────────────────────────────
              DASHBOARD VIEW
              1. 4 Cards (Inbound Assignments, Cleared & Admitted, Rejected & Quarantined, Thermal Compliance)
              2. Middle: Map live tracking (left) & Master intake ledger (right - ONLY today's cargos)
              3. Bottom: Telemetry (left downward) & Thermal cargo info (right downward)
             ─────────────────────────────────────────────────────────── */}
          {activeView === "dashboard" && (
            <>
              {/* Row 1: 4 KPI Cards */}
              <KPIStrip
                consignments={consignments}
                activeFilter={kpiFilter}
                onFilterChange={setKpiFilter}
              />

              {/* Row 2: Map Live Tracking (Left) & Master Intake Ledger (Right - Only Today's Cargos) */}
              <div className="content-grid">
                <div className="content-grid__map">
                  <ShipmentMap
                    consignments={consignments}
                    activeId={activeId}
                    onSelect={handleSelect}
                    theme={theme}
                  />
                </div>
                <div className="content-grid__ledger">
                  <IntakeLedger
                    consignments={consignments}
                    activeId={activeId}
                    onSelect={handleSelect}
                    filterType={kpiFilter}
                  />
                </div>
              </div>

              {/* Row 3: Downward Dual-Pane: Telemetry (Left) & Thermal Cargo Info (Right) */}
              {consignmentsLoading ? (
                <div className="dashboard-card" role="status">Loading shipments for {userProfile.firmName}…</div>
              ) : consignmentsError ? (
                <div className="dashboard-card" role="alert">Shipment data could not load: {consignmentsError}</div>
              ) : consignments.length === 0 ? (
                <div className="dashboard-card" role="status">No shipments are currently linked to {userProfile.firmName} ({portalUser?.facilityId}).</div>
              ) : null}
              <InspectionPanel
                consignment={activeConsignment}
                onOpenAdmit={(c) => setAdmitTarget(c)}
                onOpenQuarantine={(c) => setQuarantineTarget(c)}
                onPreviewGRN={(c) => setGrnTarget(c)}
                onAddAuditNote={handleAddAuditNote}
                onSubmitAuditReport={handleSubmitAuditReport}
                onToast={addToast}
                theme={theme}
              />
            </>
          )}

          {/* ───────────────────────────────────────────────────────────
              DEDICATED VIEW 2: LIVE TRACKING
              ETA added with every live cargo not reached yet!
             ─────────────────────────────────────────────────────────── */}
          {activeView === "tracking" && (
            <LiveTrackingView
              consignments={consignments}
              activeId={activeId}
              onSelect={handleSelect}
              onDockCargo={handleDockCargo}
              theme={theme}
            />
          )}

          {/* ───────────────────────────────────────────────────────────
              DEDICATED VIEW 3: INTAKE LEDGER
              - Completed trips only
              - Mark as accepted or rejected
              - Auto-docked cargo integration
              - Whole trip summary PDF button
              - Calendar date & range selector (Default: Today only)
              - Download Ledger Report (all entries) PDF button
             ─────────────────────────────────────────────────────────── */}
          {activeView === "ledger" && (
            <IntakeLedgerView
              consignments={consignments}
              activeId={activeId}
              onSelect={handleSelect}
              onOpenAdmit={(c) => setAdmitTarget(c)}
              onOpenQuarantine={(c) => setQuarantineTarget(c)}
              onToast={addToast}
            />
          )}

          {/* ── DEDICATED VIEW 4: GRN REPORT ── */}
          {activeView === "reports" && (
            <GRNReportsView
              consignments={consignments}
              onPreviewGRN={(c) => setGrnTarget(c)}
              onToast={addToast}
            />
          )}
        </div>
      </main>

      {/* ── MODALS ── */}
      {admitTarget && (
        <AdmitModal
          consignment={admitTarget}
          onClose={() => setAdmitTarget(null)}
          onConfirm={handleConfirmAdmit}
        />
      )}

      {quarantineTarget && (
        <QuarantineModal
          consignment={quarantineTarget}
          onClose={() => setQuarantineTarget(null)}
          onConfirm={handleConfirmQuarantine}
        />
      )}

      {isNewIntakeOpen && (
        <NewConsignmentModal
          onClose={() => setIsNewIntakeOpen(false)}
          onAdd={handleAddConsignment}
        />
      )}

      {grnTarget && (
        <GRNPreviewModal
          consignment={grnTarget}
          onClose={() => setGrnTarget(null)}
          onToast={addToast}
        />
      )}

      {isAuditTrailOpen && (
        <AuditTrailModal
          auditLogs={auditLogs}
          onClose={() => setIsAuditTrailOpen(false)}
          onToast={addToast}
        />
      )}

      {/* ── USER OFFICER PROFILE & HOSPITAL FACILITY MODAL ── */}
      {isProfileModalOpen && (
        <UserProfileModal
          profile={userProfile}
          onUpdateProfile={(updated) => setUserProfile(updated)}
          onClose={() => setIsProfileModalOpen(false)}
          onToast={addToast}
          onAddAuditLog={addAuditLog}
        />
      )}
    </div>
  );
}
