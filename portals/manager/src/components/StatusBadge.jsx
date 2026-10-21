// Turns a status word into a coloured badge.
const colors = {
  Normal: "success",
  "In Transit": "info",
  Delivered: "success",
  Success: "success",
  Active: "success",
  Assigned: "secondary",
  "In Progress": "info",
  Completed: "success",
  Idle: "secondary",
  Warning: "warning",
  Delayed: "warning",
  Medium: "warning",
  Critical: "danger",
  High: "danger",
  Low: "success",
  "Low stock": "warning",
  "In stock": "success",
  "Needs review": "warning",
  Compliant: "success",
  "Non-compliant": "danger",
};

function StatusBadge({ status }) {
  const color = colors[status] || "secondary";
  return (
    <span className={`badge bg-${color}-subtle text-${color}-emphasis border border-${color}-subtle`}>
      {status}
    </span>
  );
}

export default StatusBadge;
