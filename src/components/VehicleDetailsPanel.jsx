import {
  X,
  Phone,
  Thermometer,
  Droplets,
  BatteryMedium
} from "lucide-react";

import { selectedVehicle } from "../data/mockdata";

export default function VehicleDetailsPanel({
  vehicle = selectedVehicle,
  onClose
}) {
  return (
    <div className="panel vehicle-panel">

      <div className="vehicle-panel-header">

        <div className="vehicle-panel-title-group">
          <span className="panel-status-dot"></span>
          <h3 className="vehicle-panel-title">
            Vehicle Details
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="panel-close-btn"
          >
            <X size={16} />
          </button>
        )}

      </div>

      <div className="vehicle-panel-body">

        <span className="status-pill">
          {vehicle.status}
        </span>

        <div className="vehicle-row-split">

          <div>
            <p className="eyebrow">Truck ID</p>
            <p className="field-value field-value--mono">
              {vehicle.truckId}
            </p>
          </div>

          <div className="field-align-right">
            <p className="eyebrow">Driver</p>

            <div className="driver-row">
              <span className="field-value">
                {vehicle.driver}
              </span>

              <span className="driver-call-btn">
                <Phone size={13} />
              </span>
            </div>
          </div>

        </div>

        <div>
          <p className="eyebrow">Route</p>
          <p className="field-value-block">
            {vehicle.route}
          </p>
        </div>

        <div>
          <p className="eyebrow">Cargo</p>
          <p className="field-value-block">
            {vehicle.cargo}
          </p>
        </div>

        <div className="vehicle-grid-2">

          <div>
            <p className="eyebrow">ETA</p>
            <p className="field-value-ok">
              {vehicle.eta}
            </p>
          </div>

          <div>
            <p className="eyebrow">Distance Left</p>
            <p className="field-value-block">
              {vehicle.distanceLeft}
            </p>
          </div>

        </div>

        <div className="metrics-grid">

          <Metric
            icon={Thermometer}
            label="Temperature"
            value={vehicle.temperature}
          />

          <Metric
            icon={Droplets}
            label="Humidity"
            value={vehicle.humidity}
          />

          <Metric
            icon={BatteryMedium}
            label="Battery"
            value={vehicle.battery}
          />

        </div>

        <div className="risk-row">
          <p className="eyebrow">AI Risk Score</p>
          <span className="risk-badge">
            {vehicle.riskScore}
          </span>
        </div>

      </div>

    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric-card">
      <Icon size={14} />
      <p className="metric-value">{value}</p>
      <p className="metric-label">{label}</p>
    </div>
  );
}