
import { useMemo } from "react";
import { VEHICLES, COMPLIANCE_REPORTS } from "../data/mockdata";
import "./Reports.css";

function Reports() {
  const reports = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const original = COMPLIANCE_REPORTS[index % COMPLIANCE_REPORTS.length];
      const vehicle = VEHICLES[index % VEHICLES.length];

      const compliant =
        vehicle.temperature >= vehicle.minTemp &&
        vehicle.temperature <= vehicle.maxTemp;

      return {
        ...original,
        id: `RPT-${String(index + 1).padStart(3, "0")}`,
        shipmentId: vehicle.shipmentId,
        vehicleId: vehicle.id,
        cargo: vehicle.cargo,
        route: vehicle.route,
        minTemp: vehicle.minTemp,
        maxTemp: vehicle.maxTemp,
        temperature: vehicle.temperature,
        status: compliant ? original.status : "Needs review",
        date: original.date,
      };
    });
  }, []);

  const compliantCount = reports.filter(
    (report) =>
      report.temperature >= report.minTemp &&
      report.temperature <= report.maxTemp &&
      report.status === "Compliant"
  ).length;

  const reviewCount = reports.length - compliantCount;

  function downloadReport(report) {
    const content = [
      "CRYOGUARD - COMPLIANCE REPORT",
      `Report ID: ${report.id}`,
      `Shipment: ${report.shipmentId}`,
      `Vehicle: ${report.vehicleId}`,
      `Cargo: ${report.cargo}`,
      `Route: ${report.route}`,
      `Date: ${report.date}`,
      `Permitted temperature: ${report.minTemp}°C to ${report.maxTemp}°C`,
      `Recorded temperature: ${report.temperature}°C`,
      `Status: ${report.status}`,
      `Auditor: Rohit`,
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <p className="reports-eyebrow">CRYOGUARD / AUDIT CENTER</p>
          <h1>Compliance Reports</h1>
          <p className="reports-subtitle">
            Review shipment compliance and temperature records.
          </p>
        </div>

        <div className="reports-profile">
          <div className="reports-avatar">R</div>
          <div>
            <strong>Rohit</strong>
            <span>Auditor</span>
          </div>
        </div>
      </header>

      <section className="reports-stats">
        <article className="report-stat">
          <span className="report-stat-icon blue">▤</span>
          <div>
            <p>Total Reports</p>
            <h2>{reports.length}</h2>
            <span>Available for review</span>
          </div>
        </article>

        <article className="report-stat">
          <span className="report-stat-icon green">✓</span>
          <div>
            <p>Compliant Reports</p>
            <h2>{compliantCount}</h2>
            <span>Within permitted range</span>
          </div>
        </article>

        <article className="report-stat">
          <span className="report-stat-icon orange">!</span>
          <div>
            <p>Needs Review</p>
            <h2>{reviewCount}</h2>
            <span>Requires attention</span>
          </div>
        </article>
      </section>

      <section className="reports-table-card">
        <div className="reports-table-heading">
          <div>
            <h2>Report Records</h2>
            <p>Shipment audit and temperature compliance details</p>
          </div>
          <span className="reports-count">{reports.length} reports</span>
        </div>

        <div className="reports-table-scroll">
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
              {reports.map((report) => {
                const inRange =
                  report.temperature >= report.minTemp &&
                  report.temperature <= report.maxTemp;

                const isCompliant =
                  inRange && report.status === "Compliant";

                return (
                  <tr key={report.id}>
                    <td><strong>{report.id}</strong></td>
                    <td>
                      <strong>{report.shipmentId}</strong>
                      <span className="report-secondary">{report.cargo}</span>
                    </td>
                    <td>{report.route}</td>
                    <td>{report.date}</td>
                    <td>{report.minTemp}°C to {report.maxTemp}°C</td>
                    <td>
                      <strong>{report.temperature}°C</strong>
                    </td>
                    <td>
                      <span className={`report-status ${isCompliant ? "passed" : "review"}`}>
                        {isCompliant ? "Compliant" : "Needs review"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="report-download"
                        onClick={() => downloadReport(report)}
                        title="Download report"
                      >
                        ↓ Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="reports-footer">
          Showing {reports.length} report records
        </div>
      </section>
    </div>
  );
}

export default Reports;
