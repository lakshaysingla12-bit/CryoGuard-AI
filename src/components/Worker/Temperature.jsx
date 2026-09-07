function Temperature() {
  return (
    <section className="dashboard-card temperature-card">

      <div className="section-header">
        <h2>Live Temperature (°C)</h2>

        <button className="temperature-edit-btn">
          Edit
        </button>
      </div>

      <div className="temperature-list">

        {/* Cold Room 2 */}
        <div className="temperature-row">
          <div className="temperature-info">
            <h3>Cold Room 2</h3>
            <strong className="normal">2.1°C</strong>
          </div>

          <div className="temperature-line">
            <svg viewBox="0 0 250 50" preserveAspectRatio="none">
              <polyline
                points="0,32 25,28 50,30 75,22 100,26 125,18 150,23 175,16 200,21 225,14 250,18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Cold Room 3 */}
        <div className="temperature-row">
          <div className="temperature-info">
            <h3>Cold Room 3</h3>
            <strong className="normal">3.4°C</strong>
          </div>

          <div className="temperature-line">
            <svg viewBox="0 0 250 50" preserveAspectRatio="none">
              <polyline
                points="0,25 25,29 50,24 75,27 100,20 125,25 150,19 175,22 200,17 225,21 250,18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Vehicle */}
        <div className="temperature-row">
          <div className="temperature-info">
            <h3>Vehicle TRK-09</h3>
            <strong className="warning-text">4.8°C</strong>
          </div>

          <div className="temperature-line warning-line">
            <svg viewBox="0 0 250 50" preserveAspectRatio="none">
              <polyline
                points="0,35 25,30 50,33 75,25 100,29 125,20 150,25 175,15 200,22 225,12 250,17"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

      </div>

      <div className="temperature-legend">
        <span>● Normal (0°C to 5°C)</span>
        <span>● Warning (5°C to 8°C)</span>
        <span>● Critical (&gt;8°C)</span>
      </div>

    </section>
  );
}

export default Temperature;