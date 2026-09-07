import { useState } from "react";
import {
  Thermometer,
  Truck,
  MapPin,
  Activity
} from "lucide-react";

import "./Monitoring.css";

function Monitoring() {

  const [shipments, setShipments] = useState([
    {
      id: "SHP-7821",
      temperature: 4.2,
      location: "Cold Room 2"
    },
    {
      id: "SHP-7822",
      temperature: 5.1,
      location: "Dock Area 1"
    },
    {
      id: "SHP-7823",
      temperature: 8.7,
      location: "Loading Bay 3"
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [newTemperature, setNewTemperature] = useState("");

  const updateTemperature = (id) => {

    const temperature = parseFloat(newTemperature);

    if (isNaN(temperature)) {
      alert("Please enter a valid temperature.");
      return;
    }

    setShipments(
      shipments.map((shipment) =>
        shipment.id === id
          ? { ...shipment, temperature }
          : shipment
      )
    );

    setEditingId(null);
    setNewTemperature("");
  };


  const getStatus = (temperature) => {
    if (temperature >= 2 && temperature <= 8) {
      return "Normal";
    }

    return "Warning";
  };


  return (
    <div className="monitoring-page">

      {/* Header */}

      <div className="monitoring-header">
        <div>
          <h1>Monitoring</h1>
          <p>Cold-chain temperature monitoring.</p>
        </div>

        <div className="monitoring-live">
          <span></span>
          Live
        </div>
      </div>


      {/* Summary */}

      <section className="monitoring-summary">

        <div className="monitoring-summary-card">
          <div className="monitoring-icon">
            <Truck size={20} />
          </div>

          <div>
            <span>Active Shipments</span>
            <strong>{shipments.length}</strong>
          </div>
        </div>


        <div className="monitoring-summary-card">
          <div className="monitoring-icon">
            <Thermometer size={20} />
          </div>

          <div>
            <span>Normal Temperature</span>

            <strong>
              {
                shipments.filter(
                  (item) => getStatus(item.temperature) === "Normal"
                ).length
              }
            </strong>
          </div>
        </div>


        <div className="monitoring-summary-card">
          <div className="monitoring-icon warning-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Temperature Alerts</span>

            <strong>
              {
                shipments.filter(
                  (item) => getStatus(item.temperature) === "Warning"
                ).length
              }
            </strong>
          </div>
        </div>

      </section>


      {/* Monitoring Table */}

      <section className="monitoring-card">

        <div className="monitoring-card-header">
          <h2>Live Shipment Monitoring</h2>
          <p>Workers can update the current temperature.</p>
        </div>


        <div className="monitoring-table">

          <div className="monitoring-table-header">
            <span>Shipment</span>
            <span>Temperature</span>
            <span>Location</span>
            <span>Status</span>
          </div>


          {shipments.map((shipment) => {

            const status = getStatus(shipment.temperature);

            return (
              <div
                className="monitoring-row"
                key={shipment.id}
              >

                {/* Shipment */}

                <div className="shipment-name">
                  <Truck size={17} />
                  <strong>{shipment.id}</strong>
                </div>


                {/* Temperature */}

                <div className="temperature-value">

                  {editingId === shipment.id ? (

                    <div className="temperature-edit">

                      <input
                        type="number"
                        step="0.1"
                        value={newTemperature}
                        onChange={(e) =>
                          setNewTemperature(e.target.value)
                        }
                        placeholder="°C"
                      />

                      <button
                        onClick={() =>
                          updateTemperature(shipment.id)
                        }
                      >
                        Update
                      </button>

                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setEditingId(null);
                          setNewTemperature("");
                        }}
                      >
                        Cancel
                      </button>

                    </div>

                  ) : (

                    <button
                      className="temperature-button"
                      onClick={() => {
                        setEditingId(shipment.id);
                        setNewTemperature(
                          shipment.temperature
                        );
                      }}
                    >
                      <Thermometer size={15} />

                      {shipment.temperature}°C
                    </button>

                  )}

                </div>


                {/* Location */}

                <div className="location-value">
                  <MapPin size={15} />
                  {shipment.location}
                </div>


                {/* Status */}

                <span
                  className={`monitoring-status ${status.toLowerCase()}`}
                >
                  {status}
                </span>

              </div>
            );
          })}

        </div>

      </section>

    </div>
  );
}

export default Monitoring;