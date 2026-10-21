import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Thermometer, Droplets, Download, Sliders, AlertTriangle } from "lucide-react";
import { exportToCSV } from "../utils/cryptoUtils";
import { sound } from "../utils/soundFx";

function CustomTooltip({ active, payload, label, targetBand }) {
  if (!active || !payload || !payload.length) return null;
  const dp = payload[0].payload;
  const isBreach = dp.temp < targetBand.min || dp.temp > targetBand.max;
  const delta =
    dp.temp > targetBand.max
      ? `+${(dp.temp - targetBand.max).toFixed(1)}°C above max`
      : dp.temp < targetBand.min
      ? `-${(targetBand.min - dp.temp).toFixed(1)}°C below min`
      : "Within target threshold";

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__header">
        <span className="time mono">{label}</span>
        {isBreach ? (
          <span className="badge badge--breach">⚠ EXCURSION</span>
        ) : (
          <span className="badge badge--safe">✓ IN SPEC</span>
        )}
      </div>

      <div className="chart-tooltip__grid">
        <div className="row">
          <span className="lbl">Temperature:</span>
          <span className={`val mono ${isBreach ? "text-rose font-bold" : "text-cyan"}`}>
            {dp.temp > 0 ? "+" : ""}{dp.temp}°C
          </span>
        </div>
        <div className="row">
          <span className="lbl">Relative Humidity:</span>
          <span className="val mono text-secondary">{dp.humidity}% RH</span>
        </div>
        <div className="row">
          <span className="lbl">Variance:</span>
          <span className={`val ${isBreach ? "text-rose" : "text-emerald"}`}>{delta}</span>
        </div>
      </div>
    </div>
  );
}

export default function TemperatureChart({ consignment, onToast, theme = "dark" }) {
  const [metricMode, setMetricMode] = useState("temp"); // "temp" | "humidity" | "dual"
  const [filterMode, setFilterMode] = useState("all"); // "all" | "excursions"

  if (!consignment) return null;

  const isLight = theme === "light";
  const gridStroke = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.05)";
  const axisStroke = isLight ? "rgba(15, 23, 42, 0.12)" : "rgba(255, 255, 255, 0.08)";
  const tickColor = isLight ? "#475569" : "#64748b";

  const c = consignment;
  const { min, max } = c.targetTempBand;

  // Enrich data
  let chartData = c.timeSeriesData.map((dp) => ({
    ...dp,
    excursion: dp.temp < min || dp.temp > max,
    specMin: min,
    specMax: max,
  }));

  if (filterMode === "excursions") {
    // Show data around excursions
    const excursionTimes = new Set(
      chartData.filter(d => d.excursion).map(d => d.time)
    );
    if (excursionTimes.size > 0) {
      chartData = chartData.filter(d => d.excursion || Math.abs(d.temp - max) < 2);
    }
  }

  const allTemps = chartData.map((d) => d.temp);
  const yMin = Math.floor(Math.min(min, ...allTemps) - 2);
  const yMax = Math.ceil(Math.max(max, ...allTemps) + 2);
  const hasExcursion = chartData.some((d) => d.excursion);

  const handleExportCSV = () => {
    sound.click();
    const rows = [
      ["Timestamp", "Temperature (°C)", "Humidity (%)", "Min Limit (°C)", "Max Limit (°C)", "Compliance State"],
      ...chartData.map((d) => [
        d.time,
        d.temp,
        d.humidity,
        min,
        max,
        d.excursion ? "CRITICAL EXCURSION" : "IN-SPEC PASS",
      ])
    ];
    exportToCSV(`Telemetry_${c.id}_${Date.now()}.csv`, rows);
    if (onToast) {
      onToast({
        type: "success",
        title: "Telemetry Data Exported",
        message: `Sensor time-series CSV downloaded for ${c.id}.`,
      });
    }
  };

  return (
    <div className="temp-chart">
      <div className="temp-chart__header">
        <div className="temp-chart__title-group">
          <Thermometer size={16} className="text-cyan" />
          <h3>Thermal Telemetry Stream Analysis</h3>
        </div>

        <div className="temp-chart__controls">
          {/* Mode Switcher */}
          <div className="btn-group-toggle">
            <button
              className={`btn-toggle ${metricMode === "temp" ? "btn-toggle--active" : ""}`}
              onClick={() => {
                sound.click();
                setMetricMode("temp");
              }}
              title="Show Temperature Trend"
            >
              Temp (°C)
            </button>
            <button
              className={`btn-toggle ${metricMode === "humidity" ? "btn-toggle--active" : ""}`}
              onClick={() => {
                sound.click();
                setMetricMode("humidity");
              }}
              title="Show Humidity Trend"
            >
              Humidity (%)
            </button>
            <button
              className={`btn-toggle ${metricMode === "dual" ? "btn-toggle--active" : ""}`}
              onClick={() => {
                sound.click();
                setMetricMode("dual");
              }}
              title="Combined Overlay"
            >
              Dual Axis
            </button>
          </div>

          {/* Export Button */}
          <button
            className="btn-secondary btn-xs"
            onClick={handleExportCSV}
            title="Download CSV raw readings"
          >
            <Download size={12} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Legend & Target Threshold Bar */}
      <div className="temp-chart__subbar">
        <div className="spec-indicator">
          <span className="spec-indicator__dot" />
          <span>Validated Band: <strong>{min}°C to {max}°C</strong></span>
        </div>
        {hasExcursion && (
          <div className="excursion-alert-badge">
            <AlertTriangle size={12} />
            <span>Excursion Event Recorded</span>
          </div>
        )}
      </div>

      <div className="temp-chart__body">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 16, left: -14, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isLight ? "#0284c7" : "#38bdf8"} stopOpacity={isLight ? 0.20 : 0.25} />
                <stop offset="95%" stopColor={isLight ? "#0284c7" : "#38bdf8"} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isLight ? "#16a34a" : "#34d399"} stopOpacity={isLight ? 0.16 : 0.20} />
                <stop offset="95%" stopColor={isLight ? "#16a34a" : "#34d399"} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridStroke}
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: axisStroke }}
            />

            <YAxis
              yAxisId="left"
              domain={[yMin, yMax]}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}°`}
            />

            {metricMode === "dual" && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: isLight ? "#16a34a" : "#34d399", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
            )}

            <Tooltip content={<CustomTooltip targetBand={c.targetTempBand} />} />

            {/* Target Spec Band Background */}
            <ReferenceArea
              yAxisId="left"
              y1={min}
              y2={max}
              fill={isLight ? "#16a34a" : "#34d399"}
              fillOpacity={0.07}
              stroke={isLight ? "#16a34a" : "#34d399"}
              strokeOpacity={0.22}
              strokeDasharray="4 3"
            />

            <ReferenceLine
              yAxisId="left"
              y={max}
              stroke={isLight ? "#16a34a" : "#34d399"}
              strokeDasharray="4 3"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              yAxisId="left"
              y={min}
              stroke={isLight ? "#16a34a" : "#34d399"}
              strokeDasharray="4 3"
              strokeOpacity={0.4}
            />

            {/* Temperature Area/Line */}
            {(metricMode === "temp" || metricMode === "dual") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                name="Temperature"
                stroke={isLight ? "#0284c7" : "#38bdf8"}
                strokeWidth={2}
                fill="url(#tempGradient)"
                dot={(props) => {
                  const { cx, cy, payload, index } = props;
                  const isExcursion = payload.excursion;
                  return (
                    <circle
                      key={`point-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isExcursion ? 5.5 : 3}
                      fill={isExcursion ? "#f43f5e" : "#38bdf8"}
                      stroke={isExcursion ? "#ffffff" : "#0f172a"}
                      strokeWidth={isExcursion ? 2 : 1.5}
                    />
                  );
                }}
                activeDot={{
                  r: 6,
                  stroke: "#38bdf8",
                  strokeWidth: 2,
                  fill: "#030814",
                }}
              />
            )}

            {/* Humidity Line */}
            {(metricMode === "humidity" || metricMode === "dual") && (
              <Area
                yAxisId={metricMode === "dual" ? "right" : "left"}
                type="monotone"
                dataKey="humidity"
                name="Humidity"
                stroke="#10b981"
                strokeWidth={1.8}
                fill="url(#humidityGradient)"
                dot={{ r: 2.5, fill: "#10b981" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
