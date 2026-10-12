import { useState } from "react";
import { downloadFile } from "../api/client";
import useFetch from "../context/useFetch";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatsRow.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDateTime } from "../utils";
function Reports() {
  const { data } = useFetch("/reports");
  const [downloading, setDownloading] = useState("");

  async function download(id) {
    setDownloading(id);
    try {
      await downloadFile(`/reports/compliance/${id}`, `${id}-compliance.pdf`);
    } catch (err) {
      alert(err.message);
    }
    setDownloading("");
  }  
const list = (data || []).map((s) => ({
  ...s,
  stats: {
    readings: s.stats?.readings ?? 0,
    min: s.stats?.min ?? s.minTemp ?? 0,
    max: s.stats?.max ?? s.maxTemp ?? 0,
    compliant: s.stats?.compliant ?? true,
    compliantPercent: s.stats?.compliantPercent ?? 100,
  },
}));

const delivered = list.filter((s) => s.status === "Delivered");
const compliant = delivered.filter((s) => s.stats.compliant).length;
  return (
    <>
      <PageHeader
        title="Compliance Reports"
        subtitle="Download a PDF proving the cargo stayed in its safe temperature range"
      />

      <div className="row g-3 mb-4">
        <div className="col-md-4"><StatCard icon="bi-file-earmark-text" color="info" value={list.length} label="Reports available" /></div>
        <div className="col-md-4"><StatCard icon="bi-patch-check" color="success" value={compliant} label="Fully compliant deliveries" /></div>
        <div className="col-md-4"><StatCard icon="bi-exclamation-triangle" color="warning" value={delivered.length - compliant} label="Deliveries with excursions" /></div>
      </div>

      <div className="card-box">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Cargo</th>
                <th>Route</th>
                <th>Date</th>
                <th>Readings</th>
                <th>Min / Max</th>
                <th>In range</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.id}</td>
                  <td>{s.cargo}</td>
                  <td>{s.origin} → {s.destination}</td>
                  <td>{formatDateTime(s.createdAt)}</td>
                  <td>{s.stats.readings}</td>
                  <td>{s.stats.min}° / {s.stats.max}°</td>
                  <td>{s.stats.compliantPercent}%</td>
                  <td>
                    {s.status === "Delivered" ? (
                      <StatusBadge status={s.stats.compliant ? "Compliant" : "Non-compliant"} />
                    ) : (
                      <StatusBadge status="In Transit" />
                    )}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-info btn-sm"
                      disabled={downloading === s.id}
                      onClick={() => download(s.id)}
                    >
                      <i className="bi bi-download me-1"></i>
                      {downloading === s.id ? "..." : "PDF"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Reports;
