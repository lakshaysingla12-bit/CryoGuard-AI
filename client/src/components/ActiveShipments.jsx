import { activeShipments } from "../data/mockdata";
export default function ActiveShipments() {

  return (
    <div className="panel shipments-panel">

      <div className="shipments-header">
        <div>
          <h3>Active Shipments</h3>
          <p>Currently monitored shipments</p>
        </div>

        <button className="shipments-view">
          View All
        </button>
      </div>

      <div className="shipments-table">

        <div className="table-row table-heading">
          <span>Shipment</span>
          <span>Vehicle</span>
          <span>Route</span>
          <span>Temperature</span>
          <span>Status</span>
        </div>

        {activeShipments.map((shipment) => (
  <div className="table-row" key={shipment.id}>

    <span className="shipment-id">
      {shipment.id}
    </span>

    <span>{shipment.vehicle}</span>

    <span>{shipment.route}</span>

    <span>{shipment.temperature}</span>

    <span>
      <span
        className={`shipment-status ${shipment.status
          .toLowerCase()
          .replace(" ", "-")}`}
      >
        {shipment.status}
      </span>
    </span>

  </div>
))}

      </div>

    </div>
  );
}
