// Colours used by the charts and map (same as the CSS variables)
export const COLORS = {
  blue: "#38bdf8",
  green: "#4ade80",
  amber: "#fbbf24",
  red: "#f87171",
  grey: "#94a3b8",
  grid: "#1f2a3a",
  axis: "#64748b",
};

export const STATUS_COLOR = {
  Normal: COLORS.green,
  Warning: COLORS.amber,
  Critical: COLORS.red,
  Idle: COLORS.grey,
};

export function fmtClock(ms) {
  return new Date(ms).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function fmtDateTime(ms) {
  if (!ms) return "-";
  return new Date(ms).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });
}

export function timeAgo(ms) {
  const seconds = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes + " min ago";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours + " hr ago";
  return Math.round(hours / 24) + " d ago";
}

// minutes left until a given time, shown as "12 min" or "1 h 5 min"
export function fmtEta(ms) {
  const minutes = Math.round((ms - Date.now()) / 60000);
  if (minutes <= 0) return "due now";
  if (minutes < 60) return minutes + " min";
  return Math.floor(minutes / 60) + " h " + (minutes % 60) + " min";
}

// shared look for the Recharts tooltip
export const tooltipStyle = {
  contentStyle: { background: "#0f1623", border: "1px solid #1f2a3a", borderRadius: 8, fontSize: 13 },
  labelStyle: { color: "#94a3b8" },
};
