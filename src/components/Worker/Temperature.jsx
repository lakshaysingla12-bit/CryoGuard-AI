function Temperature() {
  return (
    <section className="dashboard-card temperature-card">

      <div className="section-header">
        <h2>Live Temperature (°C)</h2>
        <button>View details</button>
      </div>

      <div className="temperature-list">

        <div className="temperature-row">
          <h3>Cold Room 2</h3>
          <strong className="normal">2.1°C</strong>
          <div className="temperature-line">~~~~~~~~</div>
        </div>

        <div className="temperature-row">
          <h3>Cold Room 3</h3>
          <strong className="normal">3.4°C</strong>
          <div className="temperature-line">~~~~~~~~</div>
        </div>

        <div className="temperature-row">
          <h3>Vehicle TRK-09</h3>
          <strong className="warning-text">4.8°C</strong>
          <div className="temperature-line warning-line">~~~~~~~~</div>
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