import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, downloadFile } from "../api/client";
import { useLive } from "../context/LiveContext";
import { useAuth } from "../context/AuthContext";
import useFetch from "../context/useFetch";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import { formatDateTime } from "../utils";

const filters = ["All", "In Transit", "Delayed", "Critical", "Delivered"];

function Shipments() {
  const { user } = useAuth();
  const { tick, vehicles } = useLive();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") || "";

  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const { data, loading, reload } = useFetch("/shipments", [tick]);

  const text = search.toLowerCase();
  const list = (data || [])
    .filter((s) => filter === "All" || s.displayStatus === filter)
    .filter(
      (s) =>
        !text ||
        [s.id, s.cargo, s.origin, s.destination, s.vehicleId].some((field) =>
          field.toLowerCase().includes(text)
        )
    );

  const canCreate = user.role === "Manager" || user.role === "Dispatcher";
  const hasIdleVehicle = vehicles.some((v) => v.status === "Idle");

  return (
    <>
      <PageHeader title="Shipments" subtitle="Every temperature-sensitive route, from pickup to delivery">
        {canCreate && (
          <button className="btn btn-info btn-sm" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg me-1"></i>New Shipment
          </button>
        )}
      </PageHeader>

      <div className="card-box">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
          <div className="d-flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={"btn btn-sm " + (filter === f ? "btn-info" : "btn-outline-secondary")}
              >
                {f}
              </button>
            ))}
          </div>

          <input
            className="form-control form-control-sm w-auto"
            placeholder="Filter by id, cargo, city..."
            value={search}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})}
          />
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Cargo</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Safe range</th>
                <th>Temp now</th>
                <th>Started</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.id}</td>
                  <td>{s.cargo}</td>
                  <td>{s.origin} → {s.destination}</td>
                  <td>{s.vehicleId}</td>
                  <td>{s.minTemp}° to {s.maxTemp}°C</td>
                  <td>{s.currentTemp !== null ? s.currentTemp + "°C" : "-"}</td>
                  <td>{formatDateTime(s.createdAt)}</td>
                  <td><StatusBadge status={s.displayStatus} /></td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      title="Download compliance report"
                      onClick={() => downloadFile(`/reports/compliance/${s.id}`, `${s.id}-compliance.pdf`)}
                    >
                      <i className="bi bi-file-earmark-pdf"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && list.length === 0 && (
            <p className="text-secondary text-center mt-4 mb-0">No shipments match your filters.</p>
          )}
        </div>
      </div>

      {showForm && (
        <NewShipmentForm
          hasIdleVehicle={hasIdleVehicle}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}
    </>
  );
}

function NewShipmentForm({ hasIdleVehicle, onClose, onCreated }) {
  const { vehicles } = useLive();
  const options = useFetch("/options");

  const [form, setForm] = useState({
    cargo: "COVID Vaccines",
    origin: "Chandigarh",
    destination: "Delhi",
    vehicleId: "",
    minTemp: 2,
    maxTemp: 8,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const idleVehicles = vehicles.filter((v) => v.status === "Idle");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // picking a cargo fills in its normal temperature range
  function handleCargoChange(e) {
    const type = options.data.cargoTypes.find((c) => c.name === e.target.value);
    setForm({ ...form, cargo: type.name, minTemp: type.min, maxTemp: type.max });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/shipments/create", { method: "POST", body: form });
      onCreated();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title="New Shipment" onClose={onClose}>
      {!options.data ? (
        <p className="text-secondary">Loading...</p>
      ) : !hasIdleVehicle ? (
        <p className="text-secondary mb-0">
          All vehicles are on the road right now. Try again when one finishes its trip.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="form-label">Cargo</label>
          <select className="form-select mb-3" value={form.cargo} onChange={handleCargoChange}>
            {options.data.cargoTypes.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">From</label>
              <select className="form-select" name="origin" value={form.origin} onChange={handleChange}>
                {options.data.locations.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="col">
              <label className="form-label">To</label>
              <select className="form-select" name="destination" value={form.destination} onChange={handleChange}>
                {options.data.locations.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <label className="form-label">Vehicle</label>
          <select className="form-select mb-3" name="vehicleId" value={form.vehicleId} onChange={handleChange} required>
            <option value="">Select a free vehicle</option>
            {idleVehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.id} · {v.driver}</option>
            ))}
          </select>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Min temp (°C)</label>
              <input type="number" className="form-control" name="minTemp" value={form.minTemp} onChange={handleChange} />
            </div>
            <div className="col">
              <label className="form-label">Max temp (°C)</label>
              <input type="number" className="form-control" name="maxTemp" value={form.maxTemp} onChange={handleChange} />
            </div>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-info" disabled={busy}>{busy ? "Creating..." : "Start shipment"}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default Shipments;
