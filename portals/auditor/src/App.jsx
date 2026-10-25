import React, { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import ToastContainer from "./components/ToastContainer";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import { useTheme } from "./context/ThemeContext";
import {
  setActiveId,
  setKpiFilter,
  admitConsignment,
  quarantineConsignment,
  arriveAtGate,
  dockConsignment,
  addConsignment,
  appendAuditNote,
  updateProfile,
  addAuditLog,
  addNotification,
} from "./store";
import "./styles/index.css";

export default function App() {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  // Redux state
  const consignments = useSelector((state) => state.consignments.items);
  const activeId = useSelector((state) => state.consignments.activeId);
  const kpiFilter = useSelector((state) => state.consignments.kpiFilter);
  const profile = useSelector((state) => state.profile);
  const auditLogs = useSelector((state) => state.auditLogs.logs);

  // Local navigation & modal state
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [admitTarget, setAdmitTarget] = useState(null);
  const [quarantineTarget, setQuarantineTarget] = useState(null);
  const [grnTarget, setGrnTarget] = useState(null);
  const [isNewIntakeOpen, setIsNewIntakeOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);

  // Toasts (transient floating alerts, auto-dismissed after 3.5s)
  const [toasts, setToasts] = useState([]);

  // Welcome notice auto-dismisses after 3.2s so it never gets stuck on screen
  useEffect(() => {
    const initId = "init-welcome";
    setToasts([
      {
        id: initId,
        type: "info",
        title: "CryoGuard AI System Active",
        message: "Live Inward Cold-Chain Quality Verification Enforced.",
      },
    ]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== initId));
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    // 1. Archive in Redux notification center so it's always accessible in top bar
    dispatch(addNotification({ ...toast, id }));

    // 2. Display transient toast with guaranteed 3.5s auto-dismiss
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, [dispatch]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const logAudit = useCallback((action, batchId, details, actor) => {
    const actorName = actor || profile?.name || "Kabir Anand";
    dispatch(addAuditLog({ action, batchId, details, actor: actorName }));
  }, [dispatch, profile?.name]);

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

  const handleSelect = useCallback((id) => {
    dispatch(setActiveId(id));
  }, [dispatch]);

  const handleConfirmAdmit = (id, location, notes) => {
    dispatch(admitConsignment({ id, location, notes }));
    logAudit("BATCH_ACCEPTED_ADMITTED", id, `Accepted and admitted to ${location}. Quality release certified.`);
    addToast({
      type: "success",
      title: "Consignment Accepted & Admitted",
      message: `${id} cleared and released to ${location}.`,
    });
  };

  const handleConfirmQuarantine = (id, reason, capaCode, quarantineBay, notes, notifyQA) => {
    dispatch(quarantineConsignment({ id, reason, capaCode, quarantineBay, notes }));
    logAudit("BATCH_REJECTED_QUARANTINED", id, `Rejected & Quarantined under ${capaCode} (${quarantineBay}). Reason: ${reason}`);
    addToast({
      type: "error",
      title: "Batch Rejected & Quarantined",
      message: `${id} segregated under CAPA deviation ${capaCode}.`,
    });
  };

  const handleArriveAtGate = useCallback((id) => {
    const target = consignments.find((c) => c.id === id);
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    dispatch(arriveAtGate({ id }));
    logAudit("GEOFENCE_GATE_ARRIVAL", id, `Vehicle reached hospital receiving gate at ${nowTime}. Awaiting bay assignment.`);
    addToast({
      type: "info",
      title: "Vehicle Arrived at Facility Gate",
      message: `${target?.vehicleId || id} reached Pune Distribution Hub Gate B! Ready to authorize docking at receiving bay.`,
    });
  }, [consignments, dispatch, logAudit, addToast]);

  const handleDockCargo = useCallback((id) => {
    const target = consignments.find((c) => c.id === id);
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    dispatch(dockConsignment({ id, nowTime }));
    logAudit("TRANSPORT_DOCKED", id, `Vehicle docked at receiving bay (${nowTime}). Added to Intake Ledger.`);
    addToast({
      type: "success",
      title: "Cargo Docked at Hospital",
      message: `${target?.vehicleId || id} successfully docked at bay! Automatically transferred to Intake Ledger for QA disposition.`,
    });
  }, [consignments, dispatch, logAudit, addToast]);

  const handleAddConsignment = (newBatch) => {
    dispatch(addConsignment(newBatch));
    logAudit("NEW_CONSIGNMENT_INTAKE", newBatch.id, `Transport registered: ${newBatch.drugName} via ${newBatch.vehicleId}`);
    addToast({
      type: "success",
      title: "Consignment Registered",
      message: `${newBatch.id} added to today's receiving queue.`,
    });
  };

  const handleAddAuditNote = (id, noteText) => {
    dispatch(appendAuditNote({ id, noteText }));
    logAudit("PHARMACIST_NOTE_APPENDED", id, noteText);
  };

  const activeConsignment =
    consignments.find((c) => c.id === activeId) || consignments.find((c) => c.isToday !== false) || consignments[0] || null;

  if (isSignedOut) {
    return (
      <div className="signed-out-screen">
        <div className="signed-out-card">
          <div className="signed-out-card__mark">CG</div>
          <h1>Session ended</h1>
          <p>You have been logged out of the Cold Chain Portal.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
            <button type="button" onClick={() => setIsSignedOut(false)}>
              Return to portal
            </button>
            <a
              href="/"
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                background: "#22c8ef",
                color: "#0b101b",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Back to CryoGuard sign-in
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-layout ${isSidebarCollapsed ? "app-layout--sidebar-collapsed" : ""}`}>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        profile={profile}
      />

      <main className="main-content">
        <TopBar
          firmName={profile?.firmName}
          department={profile?.department}
          theme={theme}
          onToggleTheme={toggleTheme}
          onGlobalSearch={(q) => {
            if (q) {
              const match = consignments.find(
                (c) =>
                  c.id.toLowerCase().includes(q.toLowerCase()) ||
                  c.drugName.toLowerCase().includes(q.toLowerCase()) ||
                  c.vehicleId.toLowerCase().includes(q.toLowerCase()) ||
                  c.carrierDriver.toLowerCase().includes(q.toLowerCase())
              );
              if (match) dispatch(setActiveId(match.id));
            }
          }}
        />

        <div className="main-content__body">
          {activeView === "dashboard" && (
            <>
              <div className="dashboard-page-header">
                <h1>Dashboard</h1>
                <p>Live overview of your cold-chain operations</p>
              </div>

              <KPIStrip
                consignments={consignments}
                activeFilter={kpiFilter}
                onFilterChange={(filter) => dispatch(setKpiFilter(filter))}
              />

              <div className="content-grid">
                <div className="content-grid__map">
                  <ShipmentMap
                    consignments={consignments.filter((c) => c.isToday !== false)}
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

              <InspectionPanel
                consignment={activeConsignment}
                onOpenAdmit={(c) => setAdmitTarget(c)}
                onOpenQuarantine={(c) => setQuarantineTarget(c)}
                onPreviewGRN={(c) => setGrnTarget(c)}
                onAddAuditNote={handleAddAuditNote}
                onToast={addToast}
              />
            </>
          )}

          {activeView === "tracking" && (
            <LiveTrackingView
              consignments={consignments}
              activeId={activeId}
              onSelect={handleSelect}
              onDockCargo={handleDockCargo}
              onArriveAtGate={handleArriveAtGate}
              onNavigate={setActiveView}
              theme={theme}
            />
          )}

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

          {activeView === "reports" && (
            <GRNReportsView
              consignments={consignments}
              onPreviewGRN={(c) => setGrnTarget(c)}
              onToast={addToast}
            />
          )}

          {activeView === "profile" && (
            <ProfileView
              profile={profile}
              onUpdateProfile={(p) => dispatch(updateProfile(p))}
              onToast={addToast}
              onAddAuditLog={logAudit}
            />
          )}

          {activeView === "settings" && (
            <SettingsView
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={() => {
                localStorage.removeItem("cryoguard_demo_session");
                localStorage.removeItem("cryoguard_token");
                setIsSignedOut(true);
              }}
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
    </div>
  );
}
