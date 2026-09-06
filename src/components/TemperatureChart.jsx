import {AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,ReferenceLine} from 'recharts'
import { temperatureSeries } from '../data/mockdata'

export default function TemperatureChart() {
  return (
    <div className="panel chart-panel">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">
            Temperature Trend (All Shipments)
          </h3>
          <p className="chart-subtitle">
            Temperature readings across active shipments
          </p>
        </div>
        <select className="chart-select">
          <option>Today</option>
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={temperatureSeries}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0
            }}
          >
            <defs>
              <linearGradient
                id="temperatureFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2dd4bf"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="#2dd4bf"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#1e2a3d"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#3d4f6b"
              tick={{
                fontSize: 11,
                fill: '#64748b'
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#3d4f6b"
              tick={{
                fontSize: 11,
                fill: '#64748b'
              }}
              axisLine={false}
              tickLine={false}
              unit="°"
            />
            <ReferenceLine
              y={8}
              stroke="#f87171"
              strokeDasharray="4 4"
              label={{
                value: 'Max Limit: 8°C',
                position: 'insideTopRight',
                fill: '#f87171',
                fontSize: 10
              }}
            />
            <Tooltip
              contentStyle={{
                background: '#161e2e',
                border: '1px solid #1e2a3d',
                borderRadius: 8,
                fontSize: 12
              }}
              labelStyle={{
                color: '#94a3b8'
              }}
              formatter={(value) => [`${value}°C`, 'Temperature']}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#2dd4bf"
              strokeWidth={2}
              fill="url(#temperatureFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}