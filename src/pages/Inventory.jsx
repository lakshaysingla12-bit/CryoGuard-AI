
import { useEffect, useState } from "react";
import "./Inventory.css";

const API_URL = "/api/inventory";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    minStock: "",
    location: "",
  });

  // GET: Fetch inventory from JSON Server
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch inventory.");
      }

      const data = await response.json();
      setInventory(data);
    } catch (err) {
      setError("Cannot load inventory. Check whether JSON Server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatus = (item) => {
    if (Number(item.quantity) === 0) return "Out of Stock";
    if (Number(item.quantity) <= Number(item.minStock)) {
      return "Low Stock";
    }
    return "In Stock";
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      (item.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (item.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (item.sku ?? item.id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (item.category ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || getStatus(item) === filter;

    return matchesSearch && matchesFilter;
  });

  const totalItems = inventory.length;

  const totalUnits = inventory.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const lowStock = inventory.filter(
    (item) =>
      Number(item.quantity) > 0 &&
      Number(item.quantity) <= Number(item.minStock)
  ).length;

  const outOfStock = inventory.filter(
    (item) => Number(item.quantity) === 0
  ).length;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // POST: Save a new product in db.json
  const handleAddInventory = async (e) => {
    e.preventDefault();

    const quantity = Number(form.quantity);
    const minStock = Number(form.minStock);

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.category.trim() ||
      !form.location.trim() ||
      form.quantity === "" ||
      form.minStock === "" ||
      !Number.isInteger(quantity) ||
      !Number.isInteger(minStock) ||
      quantity < 0 ||
      minStock < 0
    ) {
      alert("Please enter valid inventory details.");
      return;
    }

    const duplicateSKU = inventory.some(
      (item) =>
        (item.sku ?? "").toLowerCase() === form.sku.trim().toLowerCase()
    );

    if (duplicateSKU) {
      alert("This SKU already exists. Please use a unique SKU.");
      return;
    }

    const newItem = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      quantity,
      minStock,
      location: form.location.trim(),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error("Could not save inventory item.");
      }

      const savedItem = await response.json();

      setInventory((previous) => [...previous, savedItem]);

      setForm({
        name: "",
        sku: "",
        category: "",
        quantity: "",
        minStock: "",
        location: "",
      });

      setShowForm(false);
      alert("Inventory item saved successfully!");
    } catch (err) {
      alert("Failed to save item. Check whether JSON Server is running.");
    }
  };

  // DELETE: Remove a product from db.json
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Could not delete inventory item.");
      }

      setInventory((previous) =>
        previous.filter((item) => String(item.id) !== String(id))
      );
    } catch (err) {
      alert("Failed to delete item. Please try again.");
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-heading">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor stock levels and manage warehouse inventory.</p>
        </div>

        <button
          className="inventory-add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Cancel" : "+ Add Inventory"}
        </button>
      </div>

      <div className="inventory-stats">
        <div className="inventory-stat-card">
          <span className="inventory-stat-icon">📦</span>
          <p>Total Products</p>
          <h2>{totalItems}</h2>
        </div>

        <div className="inventory-stat-card">
          <span className="inventory-stat-icon">🔢</span>
          <p>Total Units</p>
          <h2>{totalUnits}</h2>
        </div>

        <div className="inventory-stat-card">
          <span className="inventory-stat-icon">⚠️</span>
          <p>Low Stock</p>
          <h2>{lowStock}</h2>
        </div>

        <div className="inventory-stat-card">
          <span className="inventory-stat-icon">🚫</span>
          <p>Out of Stock</p>
          <h2>{outOfStock}</h2>
        </div>
      </div>

      {showForm && (
        <form
          className="inventory-form"
          onSubmit={handleAddInventory}
        >
          <h2>Add New Inventory Item</h2>

          <div className="inventory-form-grid">
            <input
              name="name"
              placeholder="Product name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="sku"
              placeholder="SKU / Product ID"
              value={form.sku}
              onChange={handleChange}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
            />

            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              placeholder="Available quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />

            <input
              name="minStock"
              type="number"
              min="0"
              step="1"
              placeholder="Minimum stock level"
              value={form.minStock}
              onChange={handleChange}
              required
            />

            <input
              name="location"
              placeholder="Warehouse location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <button className="inventory-save-btn" type="submit">
            Save Inventory
          </button>
        </form>
      )}

      <div className="inventory-table-card">
        <div className="inventory-toolbar">
          <div>
            <h2>Inventory Items</h2>
            <p>View and manage available stock.</p>
          </div>

          <div className="inventory-controls">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Min. Stock</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="inventory-empty">
                    Loading inventory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="inventory-empty">
                    {error}
                    <br />
                    <button
                      className="inventory-save-btn"
                      onClick={fetchInventory}
                      style={{ marginTop: "12px" }}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="inventory-empty">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStatus(item);

                  return (
                    <tr key={item.id}>
                      <td className="inventory-product-name">
                        {item.name}
                      </td>
                      <td>{item.sku ?? item.id}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.minStock}</td>
                      <td>{item.location ?? item.unit ?? "—"}</td>
                      <td>
                        <span
                          className={`inventory-status ${status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="inventory-delete-btn"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Delete ${item.name}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
