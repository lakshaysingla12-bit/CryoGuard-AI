import { useState } from "react";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { ErrorMessage, Loading } from "../components/Loading";

function Inventory() {
  const { data, loading, error, reload } = useFetch("/inventory", { interval: 10000 });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // the item whose quantity is being changed
  const [adding, setAdding] = useState(false);

  if (loading && !data) return <Loading />;
  if (!data) return <ErrorMessage message={error} />;

  const items = data.items.filter((i) =>
    (i.name + i.sku).toLowerCase().includes(search.toLowerCase())
  );
  const lowCount = data.items.filter((i) => i.status === "Low").length;

  return (
    <>
      <PageHeader title="Inventory" subtitle="Temperature-controlled stock in your storage units">
        <button className="btn btn-info btn-sm" onClick={() => setAdding(true)}>
          <i className="bi bi-plus-lg me-1"></i>Add Item
        </button>
      </PageHeader>

      {/* storage units */}
      <div className="row g-3 mb-3">
        {data.units.map((u) => {
          const percent = Math.min(100, Math.round((u.used / u.capacity) * 100));
          return (
            <div className="col-md-4" key={u.id}>
              <div className="card-box h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{u.name}</div>
                    <small className="text-secondary">Safe range {u.min}°C to {u.max}°C</small>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
                <div className="stat-value num mb-2">{u.temp}°C</div>
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Capacity used</span>
                  <span className="num">{u.used} / {u.capacity} ({percent}%)</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div className={"progress-bar " + (percent > 85 ? "bg-warning" : "bg-info")} style={{ width: percent + "%" }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* stock table */}
      <div className="card-box">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className="card-title-text mb-0">
            Stock list {lowCount > 0 && <span className="badge bg-warning-subtle text-warning-emphasis ms-2">{lowCount} low</span>}
          </h2>
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Search item or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr><th>SKU</th><th>Item</th><th>Stored in</th><th>Quantity</th><th>Minimum</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.sku}>
                  <td>{i.sku}</td>
                  <td>{i.name}</td>
                  <td>{i.unitName}</td>
                  <td className="num">{i.qty}</td>
                  <td className="num text-secondary">{i.minStock}</td>
                  <td><StatusBadge status={i.status} /></td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(i)}>Update stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-secondary text-center mt-3 mb-0">No items found.</p>}
        </div>
      </div>

      {editing && <UpdateStockModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {adding && <AddItemModal units={data.units} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(); }} />}
    </>
  );
}

function UpdateStockModal({ item, onClose, onSaved }) {
  const [qty, setQty] = useState(item.qty);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api(`/inventory/${item.sku}`, { method: "PATCH", body: { qty: Number(qty) } });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal title={`Update ${item.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label className="form-label">Quantity in stock</label>
        <input type="number" min="0" className="form-control mb-4" value={qty} onChange={(e) => setQty(e.target.value)} autoFocus />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-info">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function AddItemModal({ units, onClose, onSaved }) {
  const [form, setForm] = useState({ sku: "", name: "", unitId: units[0].id, qty: 0, minStock: 100 });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api("/inventory", { method: "POST", body: form });
      onSaved();
    } catch (err) {
      setError(err.message);
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

        <label className="form-label">Storage unit</label>
        <select className="form-select mb-3" name="unitId" value={form.unitId} onChange={handleChange}>
          {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.min}°C to {u.max}°C)</option>)}
        </select>

        <div className="row g-3 mb-4">
          <div className="col-6">
            <label className="form-label">Quantity</label>
            <input type="number" min="0" className="form-control" name="qty" value={form.qty} onChange={handleChange} />
          </div>
          <div className="col-6">
            <label className="form-label">Minimum stock</label>
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
