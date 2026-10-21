
import { createContext, useContext, useEffect, useState } from "react";
import { FileText, Truck } from "lucide-react";

const WorkerContext = createContext(null);

const initialAssignments = [
  {
    id: "SHP-7821",
    title: "Check Temperature – Shipment #SHP-7821",
    location: "Cold Room 2",
    due: "Due in 45m",
    type: "Temperature Check",
    icon: FileText,
    priority: "warning",
    description:
      "Check and record the current temperature of Shipment #SHP-7821.",
    status: "Pending",
  },
  {
    id: "SHP-7822",
    title: "Inspect Packaging – Shipment #SHP-7822",
    location: "Dock Area 1",
    due: "Due in 1h 30m",
    type: "Packaging Inspection",
    icon: Truck,
    priority: "",
    description:
      "Inspect the packaging and make sure the shipment is properly sealed.",
    status: "Pending",
  },
  {
    id: "SHP-7823",
    title: "Load Shipment – #SHP-7823",
    location: "Loading Bay 3",
    due: "Due in 2h",
    type: "Shipment Loading",
    icon: Truck,
    priority: "",
    description:
      "Load Shipment #SHP-7823 safely and maintain cold-chain requirements.",
    status: "Pending",
  },
  {
    id: "SHP-7824",
    title: "Verify Storage Conditions – SHP-7824",
    location: "Cold Room 1",
    due: "Due in 3h",
    type: "Storage Inspection",
    icon: FileText,
    priority: "",
    description:
      "Inspect storage conditions and verify the shipment is stored correctly.",
    status: "Pending",
  },
  {
    id: "SHP-7825",
    title: "Confirm Dispatch – SHP-7825",
    location: "Loading Bay 2",
    due: "Due in 4h",
    type: "Dispatch Check",
    icon: Truck,
    priority: "",
    description:
      "Verify shipment details and confirm it is ready for dispatch.",
    status: "Pending",
  },
];

export function WorkerProvider({ children }) {
  const [worker, setWorker] = useState(() => {
    try {
      const session = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
      if (String(session?.role || "").toLowerCase() === "worker") return { phone: "", ...session.user };
    } catch {
      // Keep a local preview profile when no portal login exists.
    }
    return { name: "Rohit Kumar", email: "rohit@cryoguard.com", phone: "9876543210" };
  });

  const hasDemoWorker = Boolean(worker?.id && worker?.companyId);
  const [assignments, setAssignments] = useState(() => hasDemoWorker ? [] : initialAssignments);

  useEffect(() => {
    if (!worker?.id || !worker?.companyId) return;
    let cancelled = false;
    const loadAssignments = () => fetch(`/api/assignments?workerId=${encodeURIComponent(worker.id)}&companyId=${encodeURIComponent(worker.companyId)}&_=${Date.now()}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load assigned tasks.")))
      .then((rows) => {
        if (cancelled) return;
        setAssignments(rows.filter((row) => row.workerId === worker.id && row.companyId === worker.companyId).map((row) => ({
          ...row,
          title: row.task || row.title || `Task for ${row.shipmentId}`,
          location: row.facilityName || row.location || row.originCity || "Assigned route",
          due: row.dueAt ? `Due ${row.dueAt}` : row.due || "No due time set",
          type: row.task || row.type || "Shipment task",
          description: row.description || `${row.task || "Complete the assigned task"} for ${row.shipmentId}.`,
          status: row.status || "Assigned",
        })));
      })
      .catch(() => {});
    loadAssignments();
    const timer = window.setInterval(loadAssignments, 5000);
    const refreshOnFocus = () => { if (document.visibilityState === "visible") loadAssignments(); };
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", refreshOnFocus); };
  }, [worker?.id, worker?.companyId]);

  function updateWorker(details) {
    setWorker((previous) => ({
      ...previous,
      ...details,
    }));
    try {
      const session = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
      if (String(session?.role || "").toLowerCase() === "worker") {
        localStorage.setItem("cryoguard_demo_session", JSON.stringify({
          ...session,
          user: { ...session.user, ...details },
        }));
      }
    } catch {
      // Profile changes still apply to the current page if storage is unavailable.
    }
  }

  async function setAssignmentStatus(id, status) {
    const task = assignments.find((assignment) => assignment.id === id);
    if (task && hasDemoWorker) {
      const response = await fetch(`/api/assignments/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(status === "Completed" ? { completedAt: new Date().toISOString() } : {}) }),
      });
      if (!response.ok) throw new Error("Could not save task status.");
    }
    setAssignments((previous) =>
      previous.map((assignment) =>
        assignment.id === id
          ? { ...assignment, status }
          : assignment
      )
    );
  }

  const startAssignment = (id) => setAssignmentStatus(id, "In Progress");
  const completeAssignment = (id) => setAssignmentStatus(id, "Completed");

  const pendingTasks = assignments.filter(
    (task) => task.status !== "Completed"
  ).length;

  const completedTasks = assignments.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <WorkerContext.Provider
      value={{
        worker,
        updateWorker,
        assignments,
        startAssignment,
        completeAssignment,
        pendingTasks,
        completedTasks,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorker() {
  const context = useContext(WorkerContext);

  if (context === null) {
    throw new Error("useWorker must be used inside WorkerProvider");
  }

  return context;
}
