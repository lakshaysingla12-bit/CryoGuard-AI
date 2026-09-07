import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { shipmentsByStatus } from "../data/mockdata";

function Shipments() {

  let total = 0;

  shipmentsByStatus.forEach((item) => {
    total += item.value;
  });

  return (
    <div className="panel donut-panel">

      <h3 className="donut-title">Shipments by Status</h3>

      <div className="donut-chart-wrap">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              data={shipmentsByStatus}
              dataKey="value"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              stroke="none"
            >
              {shipmentsByStatus.map((item) => (
                <Cell
                  key={item.name}
                  fill={item.color}
                />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>

        <div className="donut-center">
          <p className="donut-total">{total}</p>
          <p className="donut-total-label">Total</p>
        </div>

      </div>

      <div className="donut-legend">

        {shipmentsByStatus.map((item) => (
          <div className="donut-legend-item" key={item.name}>

            <span className="donut-legend-name">
              <span
                className="donut-legend-dot"
                style={{ background: item.color }}
              ></span>

              {item.name}
            </span>

            <span className="donut-legend-value">
              {item.value} ({item.pct})
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Shipments;