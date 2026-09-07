import { useState } from "react";
import {
  FileBarChart2,
  Truck,
  Thermometer,
  ClipboardCheck,
  X
} from "lucide-react";
import "./Reports.css";

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      title: "Shipment Report",
      description: "View today's shipment activity.",
      icon: Truck,
      details: [
        "Active Shipments: 3",
        "Completed Shipments: 12",
        "Delayed Shipments: 1"
      ]
    },
    {
      title: "Temperature Report",
      description: "Review cold-chain temperature records.",
      icon: Thermometer,
      details: [
        "Average Temperature: 4.2°C",
        "Safe Readings: 96%",
        "Temperature Alerts: 1"
      ]
    },
    {
      title: "Task Completion Report",
      description: "Check completed worker tasks.",
      icon: ClipboardCheck,
      details: [
        "Tasks Completed: 12",
        "Pending Tasks: 5",
        "Completion Rate: 92%"
      ]
    }
  ];

  return (
    <div className="reports-page">

      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p>Review cold-chain operations and performance reports.</p>
        </div>

        <div className="reports-icon">
          <FileBarChart2 size={22} />
        </div>
      </div>


      <section className="reports-grid">

        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <div className="report-card" key={report.title}>

              <div className="report-card-icon">
                <Icon size={22} />
              </div>

              <h2>{report.title}</h2>

              <p>{report.description}</p>

              <button
                className="report-button"
                onClick={() => setSelectedReport(report)}
              >
                View Report
              </button>

            </div>
          );
        })}

      </section>


      {/* Report Modal */}

      {selectedReport && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedReport(null)}
        >

          <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <h2>{selectedReport.title}</h2>
                <p>Report summary</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedReport(null)}
              >
                <X size={20} />
              </button>

            </div>


            <div className="modal-content">

              {selectedReport.details.map((detail, index) => (
                <div className="report-detail" key={index}>
                  {detail}
                </div>
              ))}

            </div>


            <div className="modal-footer">

              <button
                className="modal-done"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Reports;