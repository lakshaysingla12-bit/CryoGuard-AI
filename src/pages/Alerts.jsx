import { AlertTriangle, Thermometer, Truck, MapPin } from "lucide-react";
import "./Alerts.css";

function Alerts() {
  const alerts = [
    {
      id: 1,
      title: "Temperature above safe limit",
      shipment: "SHP-7821",
      location: "Cold Room 2",
      time: "10 minutes ago",
      type: "Critical"
    },
    {
      id: 2,
      title: "Shipment inspection pending",
      shipment: "SHP-7822",
      location: "Dock Area 1",
      time: "35 minutes ago",
      type: "Warning"
    },
    {
      id: 3,
      title: "Cold-chain connection unstable",
      shipment: "SHP-7823",
      location: "Loading Bay 3",
      time: "1 hour ago",
      type: "Warning"
    }
  ];

  const handleAcknowledge = (title) => {
    alert(`Alert acknowledged: ${title}`);
  };

  return (
    <div className="alerts-page">

      <div className="alerts-header">
        <div>
          <h1>Alerts</h1>
          <p>Review and respond to cold-chain alerts.</p>
        </div>

        <span className="alerts-count">
          {alerts.length} Active
        </span>
      </div>


      <div className="alerts-list">

        {alerts.map((alert) => (
          <div className="alert-card" key={alert.id}>

            <div className={`alert-icon ${alert.type.toLowerCase()}`}>
              {alert.type === "Critical" ? (
                <Thermometer size={22} />
              ) : (
                <AlertTriangle size={22} />
              )}
            </div>


            <div className="alert-info">

              <div className="alert-title-row">
                <h3>{alert.title}</h3>

                <span className={`alert-badge ${alert.type.toLowerCase()}`}>
                  {alert.type}
                </span>
              </div>

              <p>
                <Truck size={14} />
                Shipment #{alert.shipment}
              </p>

              <p>
                <MapPin size={14} />
                {alert.location}
              </p>

              <span className="alert-time">
                {alert.time}
              </span>

            </div>


            <button
              className="acknowledge-button"
              onClick={() => handleAcknowledge(alert.title)}
            >
              Acknowledge
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Alerts;