
import { useState } from "react";
import { VEHICLES, COMPLIANCE_REPORTS } from "../data/mockdata";
import "./Reports.css";

const initialReports = Array.from({ length: 6 }, (_, index) => {
  const vehicle = VEHICLES[index % VEHICLES.length];
  const existingReport = COMPLIANCE_REPORTS[index % COMPLIANCE_REPORTS.length];

  const isWithinRange =
    vehicle.temperature >= vehicle.minTemp &&
    vehicle.temperature <= vehicle.maxTemp;

  const status =
    isWithinRange && existingReport.status === "Compliant"
      ? "Compliant"
      : "Needs review";

  return {
    id: `RPT-${String(index + 1).padStart(3, "0")}`,
    shipmentId: vehicle.shipmentId,
    cargo: vehicle.cargo,
    route: vehicle.route,
    date: existingReport.date,
    minTemp: vehicle.minTemp,
    maxTemp: vehicle.maxTemp,
    reading: vehicle.temperature,
    status,
    auditor: existingReport.auditor,
  };
});

const emptyForm = {
  shipmentId: "",
  cargo: "",
  route: "",
  date: new Date().toISOString().slice(0, 10),
  minTemp: "",
  maxTemp: "",
  reading: "",
  auditor: "Rohit Kumar",
};

function Reports() {
  const [reports, setReports] = useState(initialReports);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const compliantCount = reports.filter(
    (report) => report.status === "Compliant"
  ).length;

  const reviewCount = reports.length - compliantCount;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


const handleAddReport = (event) => {
  event.preventDefault();
  setFormError("");

  const shipmentId = formData.shipmentId.trim();
  const cargo = formData.cargo.trim();
  const route = formData.route.trim();

  const minTemp = Number(formData.minTemp);
  const maxTemp = Number(formData.maxTemp);
  const reading = Number(formData.reading);

  // 1. Required fields
  if (
    !shipmentId ||
    !cargo ||
    !route ||
    !formData.date ||
    formData.minTemp === "" ||
    formData.maxTemp === "" ||
    formData.reading === ""
  ) {
    setFormError("Please fill in all fields.");
    return;
  }

  // 2. Shipment ID format
  if (!/^SHP-\d{4,}$/.test(shipmentId)) {
    setFormError("Shipment ID must look like SHP-1027.");
    return;
  }

  // 3. Date validation
  const selectedDate = new Date(`${formData.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(selectedDate.getTime())) {
    setFormError("Please enter a valid report date.");
    return;
  }

  if (selectedDate > today) {
    setFormError("Report date cannot be in the future.");
    return;
  }

  // 4. Numeric validation
  if (
    !Number.isFinite(minTemp) ||
    !Number.isFinite(maxTemp) ||
    !Number.isFinite(reading)
  ) {
    setFormError("Please enter valid numeric temperature values.");
    return;
  }

  // 5. Temperature range validation
  if (minTemp >= maxTemp) {
    setFormError(
      "Minimum temperature must be less than maximum temperature."
    );
    return;
  }

  // 6. Basic plausible temperature limits
  if (
    minTemp < -273.15 ||
    maxTemp > 1000 ||
    reading < -273.15 ||
    reading > 1000
  ) {
    setFormError(
      "Temperature values must be between -273.15°C and 1000°C."
    );
    return;
  }

  // 7. Calculate compliance from the permitted range
  const isWithinRange = reading >= minTemp && reading <= maxTemp;

  const nextNumber =
    reports.reduce((max, report) => {
      const match = report.id.match(/(\d+)$/);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 0) + 1;

  const newReport = {
    id: `RPT-${String(nextNumber).padStart(3, "0")}`,
    shipmentId,
    cargo,
    route,
    date: formData.date,
    minTemp,
    maxTemp,
    reading,
    status: isWithinRange ? "Compliant" : "Needs review",
    auditor: "Rohit Kumar",
  };

  setReports((previous) => [newReport, ...previous]);

  setFormData({
    ...emptyForm,
    date: new Date().toISOString().slice(0, 10),
  });

  setShowForm(false);
  setFormError("");
};


  const handleDownload = (report) => {
    const reportText = [
      "CRYOGUARD - COMPLIANCE REPORT",
      "--------------------------------",
      `Report ID: ${report.id}`,
      `Shipment ID: ${report.shipmentId}`,
      `Cargo: ${report.cargo}`,
      `Route: ${report.route}`,
      `Date: ${report.date}`,
      `Permitted temperature: ${report.minTemp}°C to ${report.maxTemp}°C`,
      `Recorded temperature: ${report.reading}°C`,
      `Result: ${report.status}`,
      `Reviewed by: ${report.auditor || "Not assigned"}`,
    ].join("\n");

    const blob = new Blob([reportText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${report.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div className="reports-heading">
          <p className="reports-eyebrow">CRYOGUARD / AUDIT CENTER</p>
          <h1>Compliance Reports</h1>
          <p className="reports-subtitle">
            Review shipment compliance and temperature records.
          </p>
        </div>

        <div className="reports-profile">
          <div className="profile-avatar">R</div>
          <div>
            <strong>Rohit Kumar</strong>
            <span>Worker</span>
          </div>
        </div>
      </header>

      <section className="reports-summary">
        <article className="summary-card">
          <div className="summary-icon total-icon">▤</div>
          <div>
            <p>Total Reports</p>
            <h2>{reports.length}</h2>
            <span>Available for review</span>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon compliant-icon">✓</div>
          <div>
            <p>Compliant Reports</p>
            <h2>{compliantCount}</h2>
            <span>Within permitted range</span>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon review-icon">!</div>
          <div>
            <p>Needs Review</p>
            <h2>{reviewCount}</h2>
            <span>Requires attention</span>
          </div>
        </article>
      </section>

      <section className="report-records">
        <div className="records-header">
          <div>
            <h2>Report Records</h2>
            <p>Shipment audit and temperature compliance details</p>
          </div>

          <div className="records-actions">
            <span className="report-count">
              {reports.length} {reports.length === 1 ? "report" : "reports"}
            </span>

            <button
              type="button"
              className="add-report-btn"
              onClick={() => {
                setShowForm((previous) => !previous);
                setFormError("");
              }}
            >
              {showForm ? "− Cancel" : "+ Add Report"}
            </button>
          </div>
        </div>

        {showForm && (
          <form className="add-report-form" onSubmit={handleAddReport}>
            <div className="form-heading">
              <h3>Add New Report</h3>
              <p>Enter the shipment and temperature details below.</p>
            </div>

            <div className="form-grid">
              <label>
                Shipment ID
                <input
                  name="shipmentId"
                  value={formData.shipmentId}
                  onChange={handleChange}
                  placeholder="e.g. SHP-1027"
                  required
                />
              </label>

              <label>
                Cargo Name
                <input
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  placeholder="e.g. Medical Supplies"
                  required
                />
              </label>

              <label>
                Route
                <input
                  name="route"
                  value={formData.route}
                  onChange={handleChange}
                  placeholder="e.g. Delhi → Chandigarh"
                  required
                />
              </label>

              <label>
                Report Date
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Minimum Temperature (°C)
                <input
                  type="number"
                  step="any"
                  name="minTemp"
                  value={formData.minTemp}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  required
                />
              </label>

              <label>
                Maximum Temperature (°C)
                <input
                  type="number"
                  step="any"
                  name="maxTemp"
                  value={formData.maxTemp}
                  onChange={handleChange}
                  placeholder="e.g. 8"
                  required
                />
              </label>

              <label>
                Recorded Temperature (°C)
                <input
                  type="number"
                  step="any"
                  name="reading"
                  value={formData.reading}
                  onChange={handleChange}
                  placeholder="e.g. 4.2"
                  required
                />
              </label>
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => {
                setShowForm(false);
                setFormError("");
              }}>
                Cancel
              </button>

              <button type="submit" className="save-report-btn">
                Save Report
              </button>
            </div>
          </form>
        )}

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>SHIPMENT / CARGO</th>
                <th>ROUTE</th>
                <th>DATE</th>
                <th>TEMP. RANGE</th>
                <th>READING</th>
                <th>RESULT</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="report-id">{report.id}</td>

                  <td>
                    <strong className="shipment-id">
                      {report.shipmentId}
                    </strong>
                    <span className="cargo-name">{report.cargo}</span>
                  </td>

                  <td>{report.route}</td>
                  <td>{report.date}</td>

                  <td>
                    {report.minTemp}°C to {report.maxTemp}°C
                  </td>

                  <td className="reading-value">{report.reading}°C</td>

                  <td>
                    <span
                      className={`status-badge ${
                        report.status === "Compliant"
                          ? "status-compliant"
                          : "status-review"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="download-btn"
                      onClick={() => handleDownload(report)}
                    >
                      ↓ Download
                    </button>
                  </td>
                </tr>
              ))}

              {reports.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-reports">
                    No reports yet. Select “Add Report” to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Reports;
