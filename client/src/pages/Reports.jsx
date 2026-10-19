import { useState } from "react";
import { downloadFile } from "../api/client";
import useFetch from "../context/useFetch";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatsRow.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { ErrorMessage, Loading } from "../components/Loading.jsx";

function Reports() {
  const { data, loading, error } = useFetch("/reports");
  const [downloading, setDownloading] = useState("");
  const reports = data || [];
  const passed = reports.filter((report) => /passed|compliant/i.test(report.status || "")).length;
  const needsReview = reports.length - passed;

  async function download(report) {
    setDownloading(report.id);
    try {
      await downloadFile(
        `/reports/compliance/${report.id}`,
        `${report.id}-compliance.pdf`,
        report
      );
    } catch (err) {
      window.alert(err.message);
    } finally {
      setDownloading("");
    }
  }

  return (
    <>
      <PageHeader
        title="Compliance Reports"
        subtitle="Review audit results and download report copies"
      />

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard icon="bi-file-earmark-text" color="info" value={reports.length} label="Reports available" />
        </div>
        <div className="col-md-4">
          <StatCard icon="bi-patch-check" color="success" value={passed} label="Passed" />
        </div>
        <div className="col-md-4">
          <StatCard icon="bi-exclamation-triangle" color="warning" value={needsReview} label="Needs review" />
        </div>
      </div>

      <div className="card-box">
        <h2 className="card-title-text mb-3">Available reports</h2>
        {loading && !data ? <Loading /> : error && !data ? <ErrorMessage message={error} /> : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Date</th>
                  <th>Auditor</th>
                  <th>Result</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const isPassed = /passed|compliant/i.test(report.status || "");
                  return (
                    <tr key={report.id}>
                      <td>
                        <div className="fw-semibold">{report.title}</div>
                        <small className="text-secondary">{report.id}</small>
                      </td>
                      <td>{report.date ? new Date(`${report.date}T00:00:00`).toLocaleDateString() : "—"}</td>
                      <td>{report.auditor || "—"}</td>
                      <td><StatusBadge status={isPassed ? "Compliant" : "Needs review"} /></td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-info btn-sm"
                          disabled={downloading === report.id}
                          onClick={() => download(report)}
                        >
                          <i className="bi bi-download me-1"></i>
                          {downloading === report.id ? "Preparing…" : "Download PDF"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && reports.length === 0 && (
              <p className="text-secondary text-center mt-3 mb-0">No reports are available yet.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Reports;
