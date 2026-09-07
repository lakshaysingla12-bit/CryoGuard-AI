import { useState } from "react";
import {
  FileText,
  Truck,
  MapPin,
  ArrowRight,
  Clock,
  ArrowLeft
} from "lucide-react";

function Assignments() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const assignments = [
    {
      id: "SHP-7821",
      title: "Check Temperature – Shipment #SHP-7821",
      location: "Cold Room 2",
      due: "Due in 45m",
      type: "Temperature Check",
      icon: FileText,
      priority: "warning",
      description:
        "Check and record the current temperature of Shipment #SHP-7821."
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
        "Inspect the packaging and make sure the shipment is properly sealed."
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
        "Load Shipment #SHP-7823 safely and confirm that the cold-chain requirements are maintained."
    }
  ];

  // Show assignment details
  if (selectedAssignment) {
    const Icon = selectedAssignment.icon;

    return (
      <section className="dashboard-card assignments-card assignment-details">

        <button
          className="back-button"
          onClick={() => setSelectedAssignment(null)}
        >
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

          <div className="detail-description">
            <h3>Task Description</h3>
            <p>{selectedAssignment.description}</p>
          </div>

        </div>

        <button
          className="start-task-button"
          onClick={() => alert(`Starting ${selectedAssignment.type}`)}
        >
          Start Task
          <ArrowRight size={16} />
        </button>

      </section>
    );
  }

  return (
    <section className="dashboard-card assignments-card">

      <div className="section-header">
        <h2>
          {showAll ? "All Assignments" : "Today's Assignments"}
        </h2>

        <button
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : "View all"}
        </button>
      </div>


      <div className="assignment-list">

        {assignments.map((assignment) => {
          const Icon = assignment.icon;

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
              </div>

              <span className={`due ${assignment.priority}`}>
                {assignment.due}
              </span>

              <ArrowRight size={16} />

            </button>
          );
        })}

      </div>

    </section>
  );
}

export default Assignments;