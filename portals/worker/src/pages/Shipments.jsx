
import { useMemo, useState } from "react";
import { useWorker } from "../context/WorkerContext";
import LogoutButton from "../components/LogoutButton.jsx";
import "./Shipments.css";

const initialShipments = [
  {
    id: "SHP-1021",
    cargo: "Prime Cut Beef & Frozen Poultry",
    route: "Mumbai Central Hub → Pune Mega Cold Hub",
    vehicle: "TRK-01",
    minTemp: -22,
    maxTemp: -18,
    temperature: -18.2,
    started: "19 Oct at 08:55 PM",
    status: "In Transit",
  },
  {
    id: "SHP-1022",
    cargo: "COVID-19 mRNA Vaccines (Ultra-Cold)",
    route: "Serum Bio-Depot Pune → Delhi AIIMS Central",
    vehicle: "TRK-02",
    minTemp: -80,
    maxTemp: -60,
    temperature: -68.4,
    started: "19 Oct at 07:55 PM",
    status: "In Transit",
  },
  {
    id: "SHP-1023",
    cargo: "Artisan Gourmet Gelato & Ice Creams",
    route: "Amul Depot Anand → Surat Supermarket Hub",
    vehicle: "TRK-03",
    minTemp: -25,
    maxTemp: -18,
    temperature: -14.2,
    started: "19 Oct at 06:55 PM",
    status: "Critical",
  },
  {
    id: "SHP-1024",
    cargo: "Fresh Strawberries & Exotic Blueberries",
    route: "Mahabaleshwar Farms → Mumbai Domestic Terminal",
    vehicle: "TRK-04",
    minTemp: 1,
    maxTemp: 4,
    temperature: 5.1,
    started: "19 Oct at 05:55 PM",
    status: "Delayed",
  },
];

const filters = ["All", "In Transit", "Delayed", "Critical", "Delivered"];

function Shipments() {
  const { worker } = useWorker();
  const [shipments, setShipments] = useState(initialShipments);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    cargo: "",
    route: "",
    vehicle: "",
    minTemp: "",
    maxTemp: "",
    temperature: "",
  });

  const counts = useMemo(
    () => ({
      total: shipments.length,
      transit: shipments.filter((s) => s.status === "In Transit").length,
      delayed: shipments.filter((s) => s.status === "Delayed").length,
      critical: shipments.filter((s) => s.status === "Critical").length,
      delivered: shipments.filter((s) => s.status === "Delivered").length,
    }),
    [shipments]
  );

  const visibleShipments = useMemo(() => {
    const query = search.toLowerCase().trim();

    return shipments.filter((shipment) => {
      const matchesFilter =
        activeFilter === "All" || shipment.status === activeFilter;

      const matchesSearch = [
        shipment.id,
        shipment.cargo,
        shipment.route,
        shipment.vehicle,
        shipment.status,
      ].some((value) => value.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [shipments, activeFilter, search]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddShipment = (event) => {
    event.preventDefault();
    setError("");

    const minTemp = Number(form.minTemp);
    const maxTemp = Number(form.maxTemp);
    const temperature = Number(form.temperature);

    if (
      !form.cargo.trim() ||
      !form.route.trim() ||
      !form.vehicle.trim() ||
      form.minTemp === "" ||
      form.maxTemp === "" ||
      form.temperature === ""
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (
      !Number.isFinite(minTemp) ||
      !Number.isFinite(maxTemp) ||
      !Number.isFinite(temperature) ||
      minTemp >= maxTemp
    ) {
      setError("Enter valid temperatures. Minimum must be less than maximum.");
      return;
    }

    const nextNumber =
      shipments.reduce((max, shipment) => {
        const match = shipment.id.match(/\d+$/);
        return Math.max(max, match ? Number(match[0]) : 0);
      }, 1020) + 1;

    const status =
      temperature < minTemp || temperature > maxTemp
        ? "Critical"
        : "In Transit";

    const newShipment = {
      id: `SHP-${nextNumber}`,
      cargo: form.cargo.trim(),
      route: form.route.trim(),
      vehicle: form.vehicle.trim().toUpperCase(),
      minTemp,
      maxTemp,
      temperature,
      started: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      status,
    };

    setShipments((previous) => [newShipment, ...previous]);
    setForm({
      cargo: "",
      route: "",
      vehicle: "",
      minTemp: "",
      maxTemp: "",
      temperature: "",
    });
    setShowForm(false);
    setActiveFilter("All");
    setSearch("");
  };

  const handleDownload = (shipment) => {
    const text = [
      "CRYOGUARD - SHIPMENT DETAILS",
      "----------------------------",
      `Shipment ID: ${shipment.id}`,
      `Cargo: ${shipment.cargo}`,
      `Route: ${shipment.route}`,
      `Vehicle: ${shipment.vehicle}`,
      `Safe temperature range: ${shipment.minTemp}°C to ${shipment.maxTemp}°C`,
      `Current temperature: ${shipment.temperature}°C`,
      `Status: ${shipment.status}`,
      `Started: ${shipment.started}`,
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `${shipment.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="shipments-page">
      <header className="shipments-topbar">
        <div className="shipment-search top-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search shipments, vehicles, locations..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search shipments"
          />
        </div>

        <div className="shipments-user">
          {/* <button
            type="button"
            className="topbar-icon"
            aria-label="Notifications"
            title="Notifications"
          >
            ♧
            <span className="notification-dot">2</span>
          </button> */}
          <div className="user-avatar">{worker.name?.[0] || "W"}</div>
          <div>
            <strong>{worker.name}</strong>
            <span>Worker Portal</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="shipments-title-row">
        <div>
          <h1>Shipments</h1>
          <p>Every temperature-sensitive route, from pickup to delivery</p>
        </div>

        
      </div>

      <section className="shipment-stats">
        <article className="shipment-stat">
          <div className="stat-icon blue">⬡</div>
          <div>
            <strong>{counts.total}</strong>
            <span>Total shipments</span>
          </div>
        </article>

        <article className="shipment-stat">
          <div className="stat-icon cyan">▱</div>
          <div>
            <strong>{counts.transit}</strong>
            <span>In transit</span>
          </div>
        </article>

        <article className="shipment-stat">
          <div className="stat-icon yellow">◷</div>
          <div>
            <strong>{counts.delayed}</strong>
            <span>Delayed</span>
          </div>
        </article>

        <article className="shipment-stat">
          <div className="stat-icon red">⚠</div>
          <div>
            <strong>{counts.critical}</strong>
            <span>Critical</span>
          </div>
        </article>

        <article className="shipment-stat">
          <div className="stat-icon green">✓</div>
          <div>
            <strong>{counts.delivered}</strong>
            <span>Delivered</span>
          </div>
        </article>
      </section>



      <section className="shipment-table-card">
        <div className="shipment-table-toolbar">
          <div className="shipment-filters">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={`shipment-filter ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="shipment-search table-search">
            <input
              type="search"
              placeholder="Filter by id, cargo, city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Filter shipments"
            />
          </div>
        </div>

        <div className="shipment-table-scroll">
          <table className="shipment-table">
            <thead>
              <tr>
                <th>SHIPMENT</th>
                <th>CARGO</th>
                <th>ROUTE</th>
                <th>VEHICLE</th>
                <th>SAFE RANGE</th>
                <th>TEMP NOW</th>
                <th>STARTED</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {visibleShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="shipment-id-cell">{shipment.id}</td>
                  <td className="shipment-cargo-cell">{shipment.cargo}</td>
                  <td className="shipment-route-cell">{shipment.route}</td>
                  <td>{shipment.vehicle}</td>
                  <td>
                    {shipment.minTemp}° to {shipment.maxTemp}°C
                  </td>
                  <td
                    className={
                      shipment.temperature < shipment.minTemp ||
                      shipment.temperature > shipment.maxTemp
                        ? "temperature-alert"
                        : ""
                    }
                  >
                    {shipment.temperature}°C
                  </td>
                  <td>{shipment.started}</td>
                  <td>
                    <span
                      className={`shipment-status status-${shipment.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {shipment.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="shipment-download-btn"
                      title={`Download ${shipment.id}`}
                      aria-label={`Download ${shipment.id}`}
                      onClick={() => handleDownload(shipment)}
                    >
                      ⇩
                    </button>
                  </td>
                </tr>
              ))}

              {visibleShipments.length === 0 && (
                <tr>
                  <td colSpan="9" className="shipment-empty">
                    No shipments match your search or selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="shipment-table-footer">
          Showing {visibleShipments.length} of {shipments.length} shipments
        </div>
      </section>
    </div>
  );
}

export default Shipments;
