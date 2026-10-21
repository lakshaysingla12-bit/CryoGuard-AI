// Summary card at the top of a page. color: success, info, danger, warning, primary
function StatsRow({ icon, color = "info", value, label, note }) {
  return (
    <div className="card-box stats-card h-100">
      <div className="d-flex align-items-center gap-3">
        <span className={"stat-icon text-" + color}>
          <i className={"bi " + icon}></i>
        </span>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
      {note && <small className="text-secondary d-block mt-3">{note}</small>}
    </div>
  );
}

export default StatsRow;
