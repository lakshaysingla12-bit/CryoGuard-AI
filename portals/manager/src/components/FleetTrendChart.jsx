import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, fmtClock, tooltipStyle } from "../utils/format";

// Fleet average temperature over the last few minutes.
// Chilled cargo (2 to 8°C) and frozen cargo (-18°C or colder) are shown separately,
// because averaging them together would be meaningless.
function FleetTrendChart({ trend, mode }) {
  const limit = mode === "chilled" ? 8 : -18;

  const data = trend
    .map((p) => ({ t: p.t, average: p[mode + "Avg"], warmest: p[mode + "Max"] }))
    .filter((p) => p.average !== null);

  return (
    <ResponsiveContainer width="100%" height={270}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="t" tickFormatter={fmtClock} stroke={COLORS.axis} fontSize={12} minTickGap={50} />
        <YAxis
          stroke={COLORS.axis}
          fontSize={12}
          unit="°"
          domain={[(min) => Math.floor(Math.min(min, limit) - 1), (max) => Math.ceil(Math.max(max, limit) + 1)]}
        />
        <Tooltip {...tooltipStyle} labelFormatter={fmtClock} formatter={(v) => v.toFixed(1) + "°C"} />
        <ReferenceLine
          y={limit}
          stroke={COLORS.red}
          strokeDasharray="5 4"
          label={{ value: `Max limit ${limit}°C`, fill: COLORS.red, fontSize: 12, position: "insideTopRight" }}
        />
        <Line type="monotone" dataKey="average" name="Fleet average" stroke={COLORS.blue} strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="warmest" name="Warmest vehicle" stroke={COLORS.amber} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default FleetTrendChart;
