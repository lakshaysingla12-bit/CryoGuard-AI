
import { useEffect, useState } from "react";

function Temperature() {
  const [temperatures, setTemperatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadTemperatures() {
    setLoading(true);
    setError("");

    // Simulate an asynchronous API request
    const timer = setTimeout(() => {
      try {
        setTemperatures([
          {
            name: "Cold Room 2",
            value: 2.1,
            points:
              "0,32 25,28 50,30 75,22 100,26 125,18 150,23 175,16 200,21 225,14 250,18",
          },
          {
            name: "Cold Room 3",
            value: 3.4,
            points:
              "0,25 25,29 50,24 75,27 100,20 125,25 150,19 175,22 200,17 225,21 250,18",
          },
          {
            name: "Vehicle TRK-09",
            value: 4.8,
            points:
              "0,35 25,30 50,33 75,25 100,29 125,20 150,25 175,15 200,22 225,12 250,17",
          },
        ]);

        setLoading(false);
      } catch {
        setError("Unable to load temperature data.");
        setLoading(false);
      }
    }, 1000);

    return timer;
  }

  useEffect(() => {
    const timer = loadTemperatures();

    return () => clearTimeout(timer);
  }, []);

  function handleRetry() {
    loadTemperatures();
  }

  return (
    <section className="dashboard-card temperature-card">
      <div className="section-header">
        <h2>Live Temperature (°C)</h2>
        <button
          className="temperature-edit-btn"
          onClick={handleRetry}
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
          <button onClick={handleRetry}>Try Again</button>
        </div>
      ) : (
        <>
          <div className="temperature-list">
            {temperatures.map((item) => {
              const isWarning = item.value >= 5;

              return (
                <div className="temperature-row" key={item.name}>
                  <div className="temperature-info">
                    <h3>{item.name}</h3>
                    <strong
                      className={isWarning ? "warning-text" : "normal"}
                    >
                      {item.value.toFixed(1)}°C
                    </strong>
                  </div>

                  <div
                    className={`temperature-line ${
                      isWarning ? "warning-line" : ""
                    }`}
                  >
                    <svg
                      viewBox="0 0 250 50"
                      preserveAspectRatio="none"
                      aria-label={`${item.name} temperature trend`}
                    >
                      <polyline
                        points={item.points}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="temperature-legend">
            <span>● Normal (0°C to 5°C)</span>
            <span>● Warning (5°C to 8°C)</span>
            <span>● Critical (&gt;8°C)</span>
          </div>
        </>
      )}
    </section>
  );
}

export default Temperature;
