import React, { useState } from "react";
import { PlusCircle, Truck, ThermometerSnowflake, X, FileText } from "lucide-react";

export default function NewConsignmentModal({ onClose, onAdd }) {
  const [drugName, setDrugName] = useState("Pembrolizumab Monoclonal Antibody (Keytruda)");
  const [category, setCategory] = useState("Refrigerated Biologics");
  const [vehicleId, setVehicleId] = useState(`TRK-${Math.floor(1000 + Math.random() * 9000)}`);
  const [carrierDriver, setCarrierDriver] = useState("Dmitri Volkov (ThermoExpress)");
  const [origin, setOrigin] = useState("BioPharma Logistics East Terminal");
  const [tempMin, setTempMin] = useState(2.0);
  const [tempMax, setTempMax] = useState(8.0);
  const [currentTemp, setCurrentTemp] = useState(4.2);
  const [currentHumidity, setCurrentHumidity] = useState(41);
  const [eta, setEta] = useState("Arrived at Dock D");

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat === "Ultra-Cold Cryo") {
      setTempMin(-25.0);
      setTempMax(-15.0);
      setCurrentTemp(-18.4);
    } else if (cat === "Refrigerated Biologics") {
      setTempMin(2.0);
      setTempMax(8.0);
      setCurrentTemp(4.5);
    } else {
      setTempMin(20.0);
      setTempMax(25.0);
      setCurrentTemp(22.0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const batchId = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate baseline time-series
    const nowHour = new Date().getHours();
    const timeSeries = [];
    for (let i = 4; i >= 0; i--) {
      const h = ((nowHour - i) + 24) % 24;
      const timeStr = `${String(h).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`;
      // slight fluctuation
      const fluc = (Math.random() * 0.8 - 0.4);
      timeSeries.push({
        time: timeStr,
        temp: parseFloat((currentTemp + fluc).toFixed(1)),
        humidity: Math.round(currentHumidity + Math.random() * 4 - 2),
      });
    }

    const payload = {
      id: batchId,
      vehicleId,
      drugName,
      category,
      origin,
      targetTempBand: { min: parseFloat(tempMin), max: parseFloat(tempMax), unit: "°C" },
      currentTemp: parseFloat(currentTemp),
      currentHumidity: parseInt(currentHumidity, 10),
      eta,
      date: "2026-10-21",
      isToday: true,
      isDocked: eta.toLowerCase().includes("dock"),
      tripStatus: eta.toLowerCase().includes("dock") ? "COMPLETED" : "IN_TRANSIT",
      dockLocation: "Dock B",
      transitExcursionCount: 0,
      carrierDriver,
      receiverDisposition: "PENDING",
      gps: { lat: 40.7580 + (Math.random() * 0.01 - 0.005), lng: -73.9855 + (Math.random() * 0.01 - 0.005) },
      routeHistory: [
        { lat: 40.710, lng: -74.015 },
        { lat: 40.730, lng: -74.000 },
        { lat: 40.745, lng: -73.992 },
        { lat: 40.758, lng: -73.9855 },
      ],
      timeSeriesData: timeSeries,
    };

    onAdd(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title-group">
            <PlusCircle className="modal-header__icon text-cyan" size={24} />
            <div>
              <h3>Inward Transport Manifest Intake</h3>
              <p>Register New Arriving Consignment into Quality Ledger</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Drug Specification / Commercial Name</label>
              <input
                type="text"
                className="form-input"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Cold-Chain Class</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="Ultra-Cold Cryo">Ultra-Cold Cryo (-20°C / -80°C)</option>
                <option value="Refrigerated Biologics">Refrigerated Biologics (2°C - 8°C)</option>
                <option value="Ambient Blood Plasma">Ambient Blood Plasma (20°C - 25°C)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Transport Vehicle ID</label>
              <input
                type="text"
                className="form-input mono"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Carrier Logistics Driver</label>
              <input
                type="text"
                className="form-input"
                value={carrierDriver}
                onChange={(e) => setCarrierDriver(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Origin Distribution Hub</label>
              <input
                type="text"
                className="form-input"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Receiving Dock / ETA</label>
              <select
                className="form-select"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              >
                <option value="Arrived at Dock A">Arrived at Dock A</option>
                <option value="Arrived at Dock B">Arrived at Dock B</option>
                <option value="Arrived at Dock C">Arrived at Dock C</option>
                <option value="Arrived at Dock D">Arrived at Dock D</option>
                <option value="In Transit - 8 mins away">In Transit - 8 mins away</option>
                <option value="In Transit - 25 mins away">In Transit - 25 mins away</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Min Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-input mono"
                value={tempMin}
                onChange={(e) => setTempMin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Max Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-input mono"
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Live Arrival Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-input mono"
                value={currentTemp}
                onChange={(e) => setCurrentTemp(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Humidity (% RH)</label>
              <input
                type="number"
                className="form-input mono"
                value={currentHumidity}
                onChange={(e) => setCurrentHumidity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <PlusCircle size={16} />
              Register Inbound Consignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
