
import { useEffect, useState } from "react";


const API_URL = "https://dummyjson.com/c/ac2f-52e1-47cf-9f6b";

function Temperature() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  async function loadRecords(signal) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, { signal });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid API data");
      }

      setRecords(data);

      setSelectedRecord((previous) =>
        previous
          ? data.find((item) => item.id === previous.id) ?? null
          : null
      );
    } catch (err) {
      if (err.name === "AbortError") return;

      setError("Unable to load temperature data. Please try again.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadRecords(controller.signal);

    return () => controller.abort();
  }, []);

  function handleRefresh() {
    loadRecords();
  }

  return (
    <section className="dashboard-card temperature-card">
      <div className="section-header">
        <h2>Live Temperature (°C)</h2>

        <button
          type="button"
          className="temperature-edit-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p role="status">Loading temperature data...</p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="temperature-list">
            {records.map((record) => (
              <button
                type="button"
                className="temperature-row"
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                aria-label={`View details for ${record.location}`}
              >
                <div className="temperature-info">
                  <h3>{record.location}</h3>

                  <strong className="normal">
                    {record.temperature} {record.unit}
                  </strong>
                </div>

                <div className="temperature-line">
                  <span>View details →</span>
                </div>
              </button>
            ))}
          </div>

          {selectedRecord && (
            <div
              className="temperature-details"
              role="dialog"
              aria-modal="true"
              aria-labelledby="temperature-detail-title"
            >
              <div className="temperature-details-header">
                <h3 id="temperature-detail-title">
                  {selectedRecord.location}
                </h3>

                <button
                  type="button"
                  className="temperature-close-icon"
                  onClick={() => setSelectedRecord(null)}
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>

              <div className="temperature-detail-row">
                <span>Temperature</span>
                <strong>
                  {selectedRecord.temperature} {selectedRecord.unit}
                </strong>
              </div>

              <div className="temperature-detail-row">
                <span>Status</span>
                <strong>{selectedRecord.status}</strong>
              </div>

              <div className="temperature-detail-row">
                <span>Humidity</span>
                <strong>{selectedRecord.humidity}%</strong>
              </div>

              <div className="temperature-detail-row">
                <span>Last updated</span>
                <strong>
                  {selectedRecord.lastUpdated
                    ? new Date(
                        selectedRecord.lastUpdated
                      ).toLocaleString()
                    : "Not available"}
                </strong>
              </div>

              <button
                type="button"
                className="temperature-close-btn"
                onClick={() => setSelectedRecord(null)}
              >
                Close details
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Temperature;
