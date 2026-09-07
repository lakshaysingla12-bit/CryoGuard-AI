import { Truck, MapPin, Clock } from "lucide-react";
import "./Shipments.css";

function Shipments() {
  return (
    <div className="shipments-page">

      <div className="shipments-header">
        <div>
          <h1>Active Shipments</h1>
          <p>Monitor shipments currently assigned to you.</p>
        </div>

        <span className="shipment-count">
          3 Active
        </span>
      </div>


      <div className="shipments-list">

        <div className="shipment-card">

          <div className="shipment-icon">
            <Truck size={22} />
          </div>

          <div className="shipment-info">
            <h3>Shipment #SHP-7821</h3>

            <p>
              <MapPin size={14} />
              Cold Room 2 → Distribution Center
            </p>

            <p>
              <Clock size={14} />
              In Progress
            </p>
          </div>

          <div className="shipment-right">
            <span className="shipment-status">
              In Progress
            </span>

            <button
  className="view-button"
  onClick={() => alert("Shipment #SHP-7821 details")}
>
  View Details
</button>
          </div>

        </div>


        <div className="shipment-card">

          <div className="shipment-icon">
            <Truck size={22} />
          </div>

          <div className="shipment-info">
            <h3>Shipment #SHP-7822</h3>

            <p>
              <MapPin size={14} />
              Dock Area 1 → Warehouse
            </p>

            <p>
              <Clock size={14} />
              In Progress
            </p>
          </div>

          <div className="shipment-right">
            <span className="shipment-status">
              In Progress
            </span>

           <button
  className="view-button"
  onClick={() => alert("Shipment #SHP-7821 details")}
>
  View Details
</button>
          </div>

        </div>


        <div className="shipment-card">

          <div className="shipment-icon">
            <Truck size={22} />
          </div>

          <div className="shipment-info">
            <h3>Shipment #SHP-7823</h3>

            <p>
              <MapPin size={14} />
              Loading Bay 3 → Distribution Center
            </p>

            <p>
              <Clock size={14} />
              In Progress
            </p>
          </div>

          <div className="shipment-right">
            <span className="shipment-status">
              In Progress
            </span>
<button
  className="view-button"
  onClick={() => alert("Shipment #SHP-7821 details")}
>
  View Details
</button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Shipments;