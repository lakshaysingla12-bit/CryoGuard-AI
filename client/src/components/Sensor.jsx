import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, fmtClock, tooltipStyle } from "../utils/format";

// One line chart for a single sensor value (temperature, humidity, vibration).
// If safeMin / safeMax are given, the safe range is shaded green.
function SensorChart({ title, data, dataKey, color, unit, safeMin, safeMax, height = 200 }) {
  const hasRange = safeMin !== undefined && safeMax !== undefined;

  const domain = hasRange
    ? [(min) => Math.floor(Math.min(min, safeMin) - 1), (max) => Math.ceil(Math.max(max, safeMax) + 1)]
    : ["auto", "auto"];

  return (
    <div className="card-box h-100">
      <div className="card-title-text">{title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          {hasRange && <ReferenceArea y1={safeMin} y2={safeMax} fill={COLORS.green} fillOpacity={0.08} />}
          <XAxis dataKey="t" tickFormatter={fmtClock} stroke={COLORS.axis} fontSize={12} minTickGap={50} />
          <YAxis stroke={COLORS.axis} fontSize={12} unit={unit} domain={domain} />
          <Tooltip {...tooltipStyle} labelFormatter={fmtClock} formatter={(v) => v + unit} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SensorChart;
