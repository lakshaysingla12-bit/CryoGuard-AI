import { useLive } from "../context/LiveContext";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const statusLabel = { normal: "Normal", warning: "Warning", critical: "Critical", idle: "Idle" };

function Vehicles() {
  const { vehicles } = useLive();

  const onRoad = vehicles.filter((v) => v.status === "In Transit");
  const idle = vehicles.length - onRoad.length;
  const weakCooling = vehicles.filter((v) => v.status === "In Transit" && v.coolingHealth < 70).length;

  return (
    <>
      <PageHeader title="Vehicles" subtitle="Your refrigerated fleet and the health of each cooling unit" />

      <div className="row g-3 mb-4">
        <div className="col-md-4"><StatCard icon="bi-truck" color="info" value={onRoad.length} label="On the road" /></div>
        <div className="col-md-4"><StatCard icon="bi-p-square" color="secondary" value={idle} label="Parked / idle" /></div>
        <div className="col-md-4"><StatCard icon="bi-wrench-adjustable" color="warning" value={weakCooling} label="Cooling unit needs attention" /></div>
      </div>

      <div className="card-box">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Model</th>
                <th>Cargo</th>
                <th>Temp</th>
                <th style={{ width: 170 }}>Cooling health</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const barColor = v.coolingHealth >= 70 ? "bg-success" : v.coolingHealth >= 40 ? "bg-warning" : "bg-danger";
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="fw-semibold">{v.id}</div>
                      <small className="text-secondary">{v.plate}</small>
                    </td>
                    <td>{v.driver}</td>
                    <td>{v.model}</td>
                    <td>{v.cargo || "-"}</td>
                    <td>{v.status === "In Transit" ? v.temp + "°C" : "-"}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div className={"progress-bar " + barColor} style={{ width: v.coolingHealth + "%" }}></div>
                        </div>
                        <small>{v.coolingHealth}%</small>
                      </div>
                    </td>
                    <td><StatusBadge status={v.status === "Idle" ? "Idle" : statusLabel[v.tempStatus]} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Vehicles;
