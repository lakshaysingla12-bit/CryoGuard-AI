import { useWorker } from "../../context/WorkerContext";
import { useState } from "react";
import {
  FileText,
  Truck,
  MapPin,
  ArrowRight,
  Clock,
  ArrowLeft,
  CheckCircle,
  Play,
} from "lucide-react";

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
      "Load the shipment safely and maintain cold-chain requirements.",
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
      "Inspect the storage conditions and verify that the shipment is stored correctly.",
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
      "Verify shipment details and confirm that the shipment is ready for dispatch.",
    status: "Pending",
  },
];

function Assignments() {
  const { assignments, startAssignment, completeAssignment } = useWorker();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [activeTask, setActiveTask] = useState(false);

  const visibleAssignments = showAll
    ? assignments
    : assignments.slice(0, 3);

  async function startTask() {
    try {
      if (selectedAssignment.status !== "In Progress") {
        await startAssignment(selectedAssignment.id);
        setSelectedAssignment((previous) => ({ ...previous, status: "In Progress" }));
      }
      setActiveTask(true);
    } catch (error) {
      window.alert(error.message || "Could not start this task.");
    }
  }

async function completeTask() {
  try {
    await completeAssignment(selectedAssignment.id);

  setSelectedAssignment((previous) => ({
    ...previous,
    status: "Completed",
  }));

  setActiveTask(false);
  } catch (error) {
    window.alert(error.message || "Could not save task completion.");
  }
}

  function goBack() {
    setSelectedAssignment(null);
    setActiveTask(false);
  }

  // Task work screen
  if (selectedAssignment && activeTask) {
    const Icon = selectedAssignment.icon || FileText;

    return (
      <section className="dashboard-card assignments-card assignment-details">
        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={16} />
          Back to assignments
        </button>

        <div className="details-header">
          <div className="assignment-icon">
            <Icon size={22} />
          </div>

          <div>
            <h2>Working on Task</h2>
            <p>{selectedAssignment.id}</p>
          </div>
        </div>

        <div className="details-content">
          <h3>{selectedAssignment.title}</h3>

          <div className="detail-row">
            <MapPin size={17} />
            <div>
              <span>Location</span>
              <strong>{selectedAssignment.location}</strong>
            </div>
          </div>

          <div className="detail-row">
            <Clock size={17} />
            <div>
              <span>Deadline</span>
              <strong>{selectedAssignment.due}</strong>
            </div>
          </div>

          <div className="detail-description">
            <h3>Task Instructions</h3>
            <p>{selectedAssignment.description}</p>
          </div>

          <div className="detail-row">
            <CheckCircle size={17} />
            <div>
              <span>Current status</span>
              <strong>{selectedAssignment.status}</strong>
            </div>
          </div>
        </div>

        {selectedAssignment.status !== "Completed" ? (
          <button
            className="start-task-button"
            onClick={completeTask}
          >
            <CheckCircle size={17} />
            Mark as Completed
          </button>
        ) : (
          <p role="status">
            <CheckCircle size={17} /> Task completed successfully.
          </p>
        )}
      </section>
    );
  }

  // Task details screen
  if (selectedAssignment) {
    const Icon = selectedAssignment.icon || FileText;

    return (
      <section className="dashboard-card assignments-card assignment-details">
        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={16} />
          Back to assignments
        </button>

        <div className="details-header">
          <div className="assignment-icon">
            <Icon size={22} />
          </div>

          <div>
            <h2>{selectedAssignment.type}</h2>
            <p>Shipment #{selectedAssignment.id}</p>
          </div>
        </div>

        <div className="details-content">
          <div className="detail-row">
            <MapPin size={17} />
            <div>
              <span>Location</span>
              <strong>{selectedAssignment.location}</strong>
            </div>
          </div>

          <div className="detail-row">
            <Clock size={17} />
            <div>
              <span>Due</span>
              <strong>{selectedAssignment.due}</strong>
            </div>
          </div>

          <div className="detail-row">
            <CheckCircle size={17} />
            <div>
              <span>Status</span>
              <strong>{selectedAssignment.status}</strong>
            </div>
          </div>

          <div className="detail-description">
            <h3>Task Description</h3>
            <p>{selectedAssignment.description}</p>
          </div>
        </div>

        {selectedAssignment.status !== "Completed" && (
          <button className="start-task-button" onClick={startTask}>
            Start Task
            <Play size={16} />
          </button>
        )}
      </section>
    );
  }

  // Assignments list
  return (
    <section className="dashboard-card assignments-card">
      <div className="section-header">
        <h2>
          {showAll ? "All Assignments" : "Today's Assignments"}
        </h2>

        <button
          onClick={() => setShowAll((previous) => !previous)}
        >
          {showAll ? "Show less" : "View all"}
        </button>
      </div>

      <div className="assignment-list">
        {visibleAssignments.map((assignment) => {
          const Icon = assignment.icon || FileText;

          return (
            <button
              className="assignment-item"
              key={assignment.id}
              onClick={() => setSelectedAssignment(assignment)}
            >
              <div className="assignment-icon">
                <Icon size={20} />
              </div>

              <div className="assignment-info">
                <h3>{assignment.title}</h3>

                <p>
                  <MapPin size={12} />
                  {assignment.location}
                </p>

                <span>{assignment.status}</span>
              </div>

              <span className={`due ${assignment.priority}`}>
                {assignment.due}
              </span>

              <ArrowRight size={16} />
            </button>
          );
        })}
      </div>

      <p className="assignment-count">
        {assignments.length} total assignments ·{" "}
        {assignments.filter((task) => task.status === "Completed").length} completed
      </p>
    </section>
  );
}

export default Assignments;
