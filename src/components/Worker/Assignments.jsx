import { FileText, Truck, MapPin, ArrowRight } from "lucide-react";

function Assignments() {
  return (
    <section className="dashboard-card assignments-card">
      <div className="section-header">
        <h2>Today's Assignments</h2>
        <button>View all</button>
      </div>

      <div className="assignment-list">

        <div className="assignment-item">
          <div className="assignment-icon">
            <FileText size={20} />
          </div>

          <div className="assignment-info">
            <h3>Check Temperature – Shipment #SHP-7821</h3>
            <p>
              <MapPin size={12} />
              Cold Room 2
            </p>
          </div>

          <span className="due warning">Due in 45m</span>
          <ArrowRight size={16} />
        </div>

        <div className="assignment-item">
          <div className="assignment-icon">
            <Truck size={20} />
          </div>

          <div className="assignment-info">
            <h3>Inspect Packaging – Shipment #SHP-7822</h3>
            <p>
              <MapPin size={12} />
              Dock Area 1
            </p>
          </div>

          <span className="due">Due in 1h 30m</span>
          <ArrowRight size={16} />
        </div>

        <div className="assignment-item">
          <div className="assignment-icon">
            <Truck size={20} />
          </div>

          <div className="assignment-info">
            <h3>Load Shipment – #SHP-7823</h3>
            <p>
              <MapPin size={12} />
              Loading Bay 3
            </p>
          </div>

          <span className="due">Due in 2h</span>
          <ArrowRight size={16} />
        </div>

      </div>
    </section>
  );
}

export default Assignments;