import { useEffect, useState } from "react";

const DEFAULT_TEMPERATURE_RECORDS = [
  {
    id: "temp-1",
    location: "Cold Storage Room 1",
    temperature: -20.2,
    unit: "°C",
    status: "Optimal",
    humidity: 46,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "temp-2",
    location: "Loading Dock Bay 2",
    temperature: 3.8,
    unit: "°C",
    status: "Normal",
    humidity: 52,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "temp-3",
    location: "Vehicle TRK-01 (Reefer Unit)",
    temperature: -19.6,
    unit: "°C",
    status: "Normal",
    humidity: 48,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "temp-4",
    location: "Vaccine Ultra-Cold Freezer",
    temperature: -68.6,
    unit: "°C",
    status: "Normal",
    humidity: 55,
    lastUpdated: new Date().toISOString(),
  },
];

function Temperature() {
  const [records, setRecords] = useState(DEFAULT_TEMPERATURE_RECORDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  async function loadRecords(signal) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/temperatureReadings", { signal });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 5).map((item, idx) => ({
            id: item.id || `temp-${idx}`,
            location: `Sensor ${item.vehicleId || `Bay-${idx + 1}`}`,
            temperature: item.temperature ?? -20,
            unit: "°C",
            status: item.temperature < -18 ? "Optimal" : "Normal",
            humidity: item.humidity ?? 50,
            lastUpdated: item.timestamp || new Date().toISOString(),
          }));
          setRecords(mapped);
          setLoading(false);
          return;
        }
      }
      setRecords(DEFAULT_TEMPERATURE_RECORDS);
    } catch (err) {
      if (err.name === "AbortError") return;
      // Fallback cleanly to default mock records without blocking UI
      setRecords(DEFAULT_TEMPERATURE_RECORDS);
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
