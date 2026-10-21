import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, downloadFile } from "../api/client";
import { useLive } from "../context/LiveContext";
import { useAuth } from "../context/AuthContext";
import useFetch from "../context/useFetch";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import StatsRow from "../components/StatsRow.jsx";
import { formatDateTime } from "../utils";

function formatDeliveryDate(value) {
  if (!value) return "Date not set";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

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
        [s.id, s.cargo, s.origin, s.sourceName, s.companyName, s.destination, s.facilityId, s.vehicleId, s.workerName, s.workerId].some((field) =>
          String(field || "").toLowerCase().includes(text)
        )
    );

  const canCreate = user.role === "Manager" || user.role === "Dispatcher";
  const hasIdleVehicle = vehicles.some((v) => v.status === "Idle");
  const shipmentCounts = {
    total: (data || []).length,
    inTransit: (data || []).filter((s) => s.displayStatus === "In Transit").length,
    delayed: (data || []).filter((s) => s.displayStatus === "Delayed").length,
    critical: (data || []).filter((s) => s.displayStatus === "Critical").length,
    delivered: (data || []).filter((s) => s.displayStatus === "Delivered").length,
  };

  return (
    <>
      <PageHeader title="Shipments" subtitle="Every temperature-sensitive route, from pickup to delivery">
        {canCreate && (
          <button className="btn btn-info btn-sm" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg me-1"></i>New Shipment
          </button>
        )}
      </PageHeader>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-5 g-3 mb-4">
        <div className="col"><StatsRow icon="bi-box-seam" color="primary" value={shipmentCounts.total} label="Total shipments" /></div>
        <div className="col"><StatsRow icon="bi-truck" color="info" value={shipmentCounts.inTransit} label="In transit" /></div>
        <div className="col"><StatsRow icon="bi-clock-history" color="warning" value={shipmentCounts.delayed} label="Delayed" /></div>
        <div className="col"><StatsRow icon="bi-exclamation-triangle" color="danger" value={shipmentCounts.critical} label="Critical" /></div>
        <div className="col"><StatsRow icon="bi-check-circle" color="success" value={shipmentCounts.delivered} label="Delivered" /></div>
      </div>

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
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("q", e.target.value);
              else next.delete("q");
              setParams(next);
            }}
          />
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Cargo</th>
                <th>Source company</th>
                <th>Destination facility</th>
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
                  <td className="shipment-route-cell">
                    <details className="shipment-detail-disclosure">
                      <summary>
                        <span className="fw-semibold">{s.companyName || s.sourceName || s.origin}</span>
                        <i className="bi bi-chevron-down" aria-hidden="true" />
                      </summary>
                      <div className="shipment-detail-content">
                        <div><strong>ID:</strong> {s.companyId || "—"}</div>
                        <div><strong>Dispatch:</strong> {s.sourceName || "Dispatch location"} · {s.originCity || s.origin || "—"}</div>
                      </div>
                    </details>
                  </td>
                  <td className="shipment-route-cell">
                    <details className="shipment-detail-disclosure">
                      <summary>
                        <span className="fw-semibold">{s.destinationOrganizationName || s.facilityName || s.destination}</span>
                        <i className="bi bi-chevron-down" aria-hidden="true" />
                      </summary>
                      <div className="shipment-detail-content">
                        <div><strong>Facility / login ID:</strong> {s.destinationOrganizationId || s.facilityId || s.destinationFacilityId || "—"}</div>
                        <div><strong>Location:</strong> {s.destinationCity || s.destination} · <strong>Auditor:</strong> {s.auditorName || "Unassigned"}</div>
                      </div>
                    </details>
                    <small className={`shipment-delivery-date ${s.displayStatus === "Delivered" ? "is-delivered" : "is-expected"}`}>
                      {s.displayStatus === "Delivered" ? "Delivered" : "Expected delivery"}: {formatDeliveryDate(s.displayStatus === "Delivered" ? (s.deliveryDate || s.deliveredAt) : (s.expectedDeliveryDate || s.expectedDeliveryAt))}
                    </small>
                  </td>
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
  const { vehicles, showToast } = useLive();
  const options = useFetch("/options");

  const [form, setForm] = useState({
    cargo: "Pharmaceuticals & Vaccines",
    origin: "Pune",
    destination: "Delhi",
    destinationFacilityId: "",
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
    const matchingSources = options.data.sources.filter((source) => source.cargoCategory === type.name);
    const matchingFacilities = options.data.facilities.filter((facility) => facility.cargoType === type.name);
    const origin = matchingSources.some((source) => source.location === form.origin)
      ? form.origin
      : matchingSources[0]?.location || "";
    const selectedFacility = matchingFacilities.find((facility) => facility.id === form.destinationFacilityId)
      || matchingFacilities.find((facility) => facility.location === form.destination)
      || matchingFacilities[0];
    const destination = selectedFacility?.location || "";
    setForm({ ...form, cargo: type.name, origin, destination, destinationFacilityId: selectedFacility?.id || "", minTemp: type.min, maxTemp: type.max });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/shipments/create", { method: "POST", body: form });
      showToast({ title: "Shipment created", message: `${form.cargo} · ${form.origin} → ${form.destination}`, kind: "success" });
      onCreated();
    } catch (err) {
      setError(err.message);
      showToast({ title: "Could not create shipment", message: err.message, kind: "error" });
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
              <label className="form-label">Cargo source company</label>
              <select className="form-select" name="origin" value={form.origin} onChange={handleChange}>
                {options.data.sources.filter((source) => source.cargoCategory === form.cargo).map((source) => (
                  <option key={source.id} value={source.location}>{source.companyName} · {source.name} · {source.location}</option>
                ))}
              </select>
            </div>
            <div className="col">
              <label className="form-label">Receiving facility</label>
              <select
                className="form-select"
                name="destinationFacilityId"
                value={form.destinationFacilityId || options.data.facilities.find((facility) => facility.location === form.destination && facility.cargoType === form.cargo)?.id || ""}
                onChange={(event) => {
                  const facility = options.data.facilities.find((entry) => entry.id === event.target.value);
                  setForm({ ...form, destinationFacilityId: facility?.id || "", destination: facility?.location || "" });
                }}
                required
              >
                <option value="">Choose a receiving organization</option>
                {options.data.facilities.filter((facility) => facility.cargoType === form.cargo).map((facility) => (
                  <option key={facility.id} value={facility.id}>{facility.name} · {facility.location} · {facility.id}</option>
                ))}
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
