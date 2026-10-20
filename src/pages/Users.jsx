
import { useMemo, useState } from "react";
import "./Users.css";

const initialShipments = [
  {
    id: "SHP-1021",
    product: "Prime Cut Beef & Frozen Poultry",
    vehicle: "TRK-01",
    status: "In Transit",
    destination: "Pune Mega Cold Hub",
    history: [
      {
        location: "Mumbai Central Hub",
        event: "Pickup completed",
        date: "2026-10-19",
        time: "08:55 AM",
        temperature: -20.4,
        status: "Completed",
      },
      {
        location: "Pune Distribution Centre",
        event: "Transit checkpoint",
        date: "2026-10-19",
        time: "12:30 PM",
        temperature: -19.8,
        status: "Completed",
      },
      {
        location: "Pune Mega Cold Hub",
        event: "Expected destination",
        date: "",
        time: "",
        temperature: null,
        status: "Upcoming",
      },
    ],
  },
  {
    id: "SHP-1022",
    product: "COVID-19 mRNA Vaccines",
    vehicle: "TRK-02",
    status: "In Transit",
    destination: "Delhi AIIMS Central",
    history: [
      {
        location: "Serum Bio-Depot Pune",
        event: "Pickup completed",
        date: "2026-10-19",
        time: "07:55 PM",
        temperature: -68.4,
        status: "Completed",
      },
      {
        location: "Delhi AIIMS Central",
        event: "Final delivery",
        date: "",
        time: "",
        temperature: null,
        status: "Upcoming",
      },
    ],
  },
  {
    id: "SHP-1023",
    product: "Artisan Gourmet Gelato & Ice Creams",
    vehicle: "TRK-03",
    status: "Delayed",
    destination: "Surat Supermarket Hub",
    history: [
      {
        location: "Amul Depot Anand",
        event: "Pickup completed",
        date: "2026-10-19",
        time: "06:55 PM",
        temperature: -20.5,
        status: "Completed",
      },
      {
        location: "Surat Supermarket Hub",
        event: "Delivery pending",
        date: "",
        time: "",
        temperature: null,
        status: "Upcoming",
      },
    ],
  },
  {
    id: "SHP-1024",
    product: "Fresh Strawberries & Exotic Blueberries",
    vehicle: "TRK-04",
    status: "Delivered",
    destination: "Mumbai Domestic Terminal",
    history: [
      {
        location: "Mahabaleshwar Farms",
        event: "Pickup completed",
        date: "2026-10-19",
        time: "05:55 AM",
        temperature: 2.5,
        status: "Completed",
      },
      {
        location: "Mumbai Domestic Terminal",
        event: "Delivery confirmed",
        date: "2026-10-19",
        time: "11:40 AM",
        temperature: 3.2,
        status: "Completed",
      },
    ],
  },
];

function Users() {
  const [shipments, setShipments] = useState(initialShipments);
  const [selectedId, setSelectedId] = useState("SHP-1021");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCheckpointForm, setShowCheckpointForm] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [checkpoint, setCheckpoint] = useState({
    location: "",
    event: "",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    temperature: "",
    status: "Completed",
  });

  const selectedShipment = shipments.find(
    (shipment) => shipment.id === selectedId
  );

  const filteredShipments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const matchesSearch = [
        shipment.id,
        shipment.product,
        shipment.vehicle,
        shipment.destination,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesFilter =
        filter === "All" || shipment.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [shipments, search, filter]);

  const completedStops = selectedShipment.history.filter(
    (stop) => stop.status === "Completed"
  ).length;

  const updateCheckpoint = (event) => {
    const { name, value } = event.target;

    setCheckpoint((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addCheckpoint = (event) => {
    event.preventDefault();
    setFormError("");
    setMessage("");

    const location = checkpoint.location.trim();
    const eventName = checkpoint.event.trim();

    if (!location || !eventName || !checkpoint.date || !checkpoint.time) {
      setFormError("Please complete all required checkpoint fields.");
      return;
    }

    const temperature =
      checkpoint.temperature === ""
        ? null
        : Number(checkpoint.temperature);

    if (
      temperature !== null &&
      (!Number.isFinite(temperature) || temperature < -273.15 || temperature > 1000)
    ) {
      setFormError("Enter a valid temperature between -273.15°C and 1000°C.");
      return;
    }

    const selectedDateTime = new Date(
      `${checkpoint.date}T${checkpoint.time}:00`
    );

    if (
      Number.isNaN(selectedDateTime.getTime()) ||
      selectedDateTime.getTime() > Date.now()
    ) {
      setFormError("Checkpoint date and time cannot be in the future.");
      return;
    }

    const newStop = {
      location,
      event: eventName,
      date: checkpoint.date,
      time: new Date(
        `${checkpoint.date}T${checkpoint.time}:00`
      ).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      temperature,
      status: checkpoint.status,
    };

    setShipments((previous) =>
      previous.map((shipment) => {
        if (shipment.id !== selectedId) return shipment;

        const updatedHistory = [
          ...shipment.history.filter((stop) => stop.status !== "Upcoming"),
          newStop,
        ];

        if (checkpoint.status !== "Delivered") {
          updatedHistory.push({
            location: shipment.destination,
            event: "Expected destination",
            date: "",
            time: "",
            temperature: null,
            status: "Upcoming",
          });
        }

        return {
          ...shipment,
          history: updatedHistory,
          status:
            checkpoint.status === "Delivered"
              ? "Delivered"
              : checkpoint.status === "Delayed"
                ? "Delayed"
                : "In Transit",
        };
      })
    );

    if (checkpoint.status === "Delivered") {
      setMessage("Delivery recorded successfully.");
    } else {
      setMessage("Checkpoint added successfully.");
    }

    setCheckpoint({
      location: "",
      event: "",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      temperature: "",
      status: "Completed",
    });

    setShowCheckpointForm(false);
  };

  return (
    <div className="delivery-page">
      <header className="delivery-header">
        <div>
          <p className="delivery-eyebrow">CRYOGUARD / WORKER PORTAL</p>
          <h1>Delivery Tracking</h1>
          <p className="delivery-subtitle">
            Track product locations, checkpoints, temperatures and delivery times.
          </p>
        </div>

        <div className="delivery-profile">
          <div className="delivery-avatar">R</div>
          <div>
            <strong>Rohit Kumar</strong>
            <span>Worker</span>
          </div>
        </div>
      </header>

      <section className="delivery-stats">
        <article className="delivery-stat">
          <span>Total Shipments</span>
          <strong>{shipments.length}</strong>
        </article>

        <article className="delivery-stat">
          <span>In Transit</span>
          <strong>
            {shipments.filter((s) => s.status === "In Transit").length}
          </strong>
        </article>

        <article className="delivery-stat">
          <span>Delayed</span>
          <strong>
            {shipments.filter((s) => s.status === "Delayed").length}
          </strong>
        </article>

        <article className="delivery-stat">
          <span>Delivered</span>
          <strong>
            {shipments.filter((s) => s.status === "Delivered").length}
          </strong>
        </article>
      </section>

      <section className="delivery-panel">
        <div className="delivery-toolbar">
          <div>
            <h2>Shipment Journey</h2>
            <p>Select a shipment to view its recorded route history.</p>
          </div>

          <button
            className="delivery-primary-btn"
            type="button"
            onClick={() => {
              setShowCheckpointForm((previous) => !previous);
              setMessage("");
              setFormError("");
            }}
          >
            {showCheckpointForm ? "Cancel" : "+ Add Checkpoint"}
          </button>
        </div>

        <div className="delivery-controls">
          <input
            type="search"
            placeholder="Search shipment, product, vehicle or destination..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search shipments"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter by delivery status"
          >
            <option value="All">All statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Delayed">Delayed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {message && (
          <p className="delivery-success" role="status">
            {message}
          </p>
        )}

        {showCheckpointForm && (
          <form className="checkpoint-form" onSubmit={addCheckpoint}>
            <h3>Add a location checkpoint</h3>
            <p>
              Selected shipment: <strong>{selectedId}</strong>
            </p>

            <label>
              Shipment
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {shipments.map((shipment) => (
                  <option key={shipment.id} value={shipment.id}>
                    {shipment.id} — {shipment.product}
                  </option>
                ))}
              </select>
            </label>

            <div className="checkpoint-grid">
              <label>
                Location
                <input
                  name="location"
                  value={checkpoint.location}
                  onChange={updateCheckpoint}
                  placeholder="e.g. Chandigarh Cold Store"
                  required
                />
              </label>

              <label>
                Activity
                <input
                  name="event"
                  value={checkpoint.event}
                  onChange={updateCheckpoint}
                  placeholder="e.g. Arrived at warehouse"
                  required
                />
              </label>

              <label>
                Date
                <input
                  type="date"
                  name="date"
                  value={checkpoint.date}
                  onChange={updateCheckpoint}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>

              <label>
                Time
                <input
                  type="time"
                  name="time"
                  value={checkpoint.time}
                  onChange={updateCheckpoint}
                  required
                />
              </label>

              <label>
                Temperature (°C)
                <input
                  type="number"
                  step="any"
                  name="temperature"
                  value={checkpoint.temperature}
                  onChange={updateCheckpoint}
                  placeholder="Optional"
                />
              </label>

              <label>
                Checkpoint status
                <select
                  name="status"
                  value={checkpoint.status}
                  onChange={updateCheckpoint}
                >
                  <option value="Completed">Checkpoint completed</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </label>
            </div>

            {formError && (
              <p className="delivery-error" role="alert">
                {formError}
              </p>
            )}

            <button className="delivery-primary-btn" type="submit">
              Save Checkpoint
            </button>
          </form>
        )}

        <div className="delivery-layout">
          <aside className="delivery-shipment-list">
            <h3>Shipments ({filteredShipments.length})</h3>

            {filteredShipments.map((shipment) => (
              <button
                type="button"
                key={shipment.id}
                className={`delivery-shipment-option ${
                  selectedId === shipment.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedId(shipment.id);
                  setMessage("");
                }}
              >
                <span className="shipment-option-id">{shipment.id}</span>
                <strong>{shipment.product}</strong>
                <span>{shipment.vehicle} · {shipment.destination}</span>
                <span
                  className={`delivery-status status-${shipment.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {shipment.status}
                </span>
              </button>
            ))}

            {filteredShipments.length === 0 && (
              <p className="delivery-empty">No matching shipments found.</p>
            )}
          </aside>

          {selectedShipment ? (
            <section className="delivery-detail">
              <div className="delivery-detail-heading">
                <div>
                  <span className="shipment-option-id">
                    {selectedShipment.id}
                  </span>
                  <h2>{selectedShipment.product}</h2>
                  <p>
                    Vehicle: {selectedShipment.vehicle}
                  </p>
                </div>

                <span
                  className={`delivery-status status-${selectedShipment.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {selectedShipment.status}
                </span>
              </div>

              <div className="delivery-destination">
                <span>Final destination</span>
                <strong>{selectedShipment.destination}</strong>
                <span>
                  {completedStops} recorded checkpoint
                  {completedStops === 1 ? "" : "s"}
                </span>
              </div>

              <h3 className="journey-heading">Location & Time History</h3>

              <div className="journey-timeline">
                {selectedShipment.history.map((stop, index) => (
                  <article
                    className="journey-stop"
                    key={`${stop.location}-${index}`}
                  >
                    <div className="journey-marker">
                      {stop.status === "Completed" ? "✓" : "•"}
                    </div>

                    <div className="journey-stop-content">
                      <div className="journey-stop-heading">
                        <div>
                          <h4>{stop.location}</h4>
                          <p>{stop.event}</p>
                        </div>

                        <span
                          className={`delivery-status status-${stop.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {stop.status}
                        </span>
                      </div>

                      {stop.date && stop.time ? (
                        <p className="journey-time">
                          {new Date(`${stop.date}T00:00:00`).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}{" "}
                          · {stop.time}
                        </p>
                      ) : (
                        <p className="journey-time">Awaiting arrival record</p>
                      )}

                      {stop.temperature !== null && (
                        <span className="journey-temperature">
                          Temperature: {stop.temperature}°C
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {selectedShipment.status !== "Delivered" && (
                <p className="delivery-note">
                  Add a checkpoint when the shipment reaches another location.
                  Record the actual arrival time and temperature.
                </p>
              )}
            </section>
          ) : (
            <div className="delivery-detail delivery-empty">
              Select a shipment to view its journey.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Users;
