
import { createContext, useContext, useState } from "react";
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
  const [worker, setWorker] = useState({
    name: "Rohit Kumar",
    email: "rohit@cryoguard.com",
    phone: "9876543210",
  });

  const [language, setLanguage] = useState("EN");
  const [assignments, setAssignments] = useState(initialAssignments);

  function updateWorker(details) {
    setWorker((previous) => ({
      ...previous,
      ...details,
    }));
  }

  function toggleLanguage() {
    setLanguage((previous) =>
      previous === "EN" ? "HI" : "EN"
    );
  }

  function completeAssignment(id) {
    setAssignments((previous) =>
      previous.map((assignment) =>
        assignment.id === id
          ? { ...assignment, status: "Completed" }
          : assignment
      )
    );
  }

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
        language,
        toggleLanguage,
        assignments,
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
