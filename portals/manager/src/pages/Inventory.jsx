import { useState } from "react";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import StatsRow from "../components/StatsRow";
import Modal from "../components/Modal";
import { ErrorMessage, Loading } from "../components/Loading";
import { useLive } from "../context/LiveContext.jsx";

function Inventory() {
  const { data, loading, error, reload } = useFetch("/inventory", { interval: 10000 });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  if (loading && !data) return <Loading />;
  if (!data?.items || !data?.units) return <ErrorMessage message={error || "Inventory could not be loaded."} />;

  const items = data.items;
  const filteredItems = items.filter((item) =>
    `${item.name} ${item.sku}`.toLowerCase().includes(search.toLowerCase())
  );
  const lowCount = items.filter((item) => item.status === "Low").length;

  return (
    <>
      <PageHeader title="Inventory" subtitle="Temperature-controlled stock in your storage units">
        <button className="btn btn-info btn-sm" onClick={() => setAdding(true)}>
          <i className="bi bi-plus-lg me-1"></i>Add Item
        </button>
      </PageHeader>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-box-seam" color="info" value={items.length} label="Total items" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-exclamation-triangle" color="warning" value={lowCount} label="Low stock" />
        </div>
        <div className="col-sm-6 col-xl-4">
          <StatsRow icon="bi-thermometer-snow" color="primary" value={data.units.length} label="Storage locations" />
        </div>
      </div>

      <div className="card-box">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 className="card-title-text mb-1">Stock at a glance</h2>
            <p className="text-secondary small mb-0">
              {items.length} items{lowCount ? ` · ${lowCount} need restocking` : " · All items are above their restock levels"}
            </p>
          </div>
          <input
            type="search"
            className="form-control form-control-sm w-auto"
            placeholder="Search item or SKU..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Storage location</th>
                <th>In stock</th>
                <th>Restock at</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-semibold">{item.name}</div>
                    <small className="text-secondary">SKU {item.sku}</small>
                  </td>
                  <td>{item.unitName}</td>
                  <td className="num">{item.qty}</td>
                  <td className="num text-secondary">{item.minStock}</td>
                  <td><StatusBadge status={item.status === "Low" ? "Low stock" : "In stock"} /></td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(item)}>Edit quantity</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <p className="text-secondary text-center mt-3 mb-0">No items found.</p>
          )}
        </div>
      </div>
      {editing && <UpdateStockModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {adding && <AddItemModal units={data.units} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(); }} />}
    </>
  );
}

function UpdateStockModal({ item, onClose, onSaved }) {
  const { showToast } = useLive();
  const [qty, setQty] = useState(item.qty);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await api(`/inventory/${item.sku}`, { method: "PATCH", body: { qty: Number(qty) } });
      showToast({ title: "Stock updated", message: `${item.name} quantity is now ${qty}.`, kind: "success" });
      onSaved();
    } catch (err) {
      setError(err.message);
      showToast({ title: "Could not update stock", message: err.message, kind: "error" });
    }
  }

  return (
    <Modal title={`Update ${item.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label className="form-label">Current quantity</label>
        <input type="number" min="0" className="form-control mb-4" value={qty} onChange={(event) => setQty(event.target.value)} autoFocus />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-info">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function AddItemModal({ units, onClose, onSaved }) {
  const { showToast } = useLive();
  const [form, setForm] = useState({ sku: "", name: "", unitId: units[0]?.id || "", qty: 0, minStock: 100 });
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await api("/inventory", { method: "POST", body: { ...form, qty: Number(form.qty), minStock: Number(form.minStock) } });
      showToast({ title: "Inventory item added", message: `${form.name} · ${form.sku}`, kind: "success" });
      onSaved();
    } catch (err) {
      setError(err.message);
      showToast({ title: "Could not add inventory item", message: err.message, kind: "error" });
    }
  }

  return (
    <Modal title="Add inventory item" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <div className="row g-3 mb-3">
          <div className="col-5">
            <label className="form-label">SKU</label>
            <input className="form-control" name="sku" value={form.sku} onChange={handleChange} placeholder="VAC-002" required />
          </div>
          <div className="col-7">
            <label className="form-label">Item name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
        </div>
        <label className="form-label">Storage location</label>
        <select className="form-select mb-3" name="unitId" value={form.unitId} onChange={handleChange}>
          {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
        </select>
        <div className="row g-3 mb-4">
          <div className="col-6">
            <label className="form-label">Quantity</label>
            <input type="number" min="0" className="form-control" name="qty" value={form.qty} onChange={handleChange} />
          </div>
          <div className="col-6">
            <label className="form-label">Restock when below</label>
            <input type="number" min="0" className="form-control" name="minStock" value={form.minStock} onChange={handleChange} />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-info">Add item</button>
        </div>
      </form>
    </Modal>
  );
}

export default Inventory;
