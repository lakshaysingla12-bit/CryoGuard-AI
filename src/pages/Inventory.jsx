
import { useState } from "react";
import "./Inventory.css";

const initialInventory = [
  {
    id: 1,
    name: "Temperature Sensors",
    sku: "CG-SEN-001",
    category: "Sensors",
    quantity: 45,
    minStock: 10,
    location: "Warehouse A",
  },
  {
    id: 2,
    name: "Cooling Units",
    sku: "CG-CL-002",
    category: "Cooling Equipment",
    quantity: 8,
    minStock: 10,
    location: "Warehouse B",
  },
  {
    id: 3,
    name: "Insulated Containers",
    sku: "CG-CON-003",
    category: "Packaging",
    quantity: 0,
    minStock: 5,
    location: "Warehouse A",
  },
  {
    id: 4,
    name: "GPS Trackers",
    sku: "CG-GPS-004",
    category: "Tracking Devices",
    quantity: 22,
    minStock: 8,
    location: "Warehouse C",
  },
];

function Inventory() {
  const [inventory, setInventory] = useState(initialInventory);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    minStock: "",
    location: "",
  });

  const getStatus = (item) => {
    if (item.quantity === 0) return "Out of Stock";
    if (item.quantity <= item.minStock) return "Low Stock";
    return "In Stock";
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const status = getStatus(item);
    const matchesFilter = filter === "All" || status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalItems = inventory.length;
  const lowStock = inventory.filter(
    (item) => item.quantity > 0 && item.quantity <= item.minStock
  ).length;
  const outOfStock = inventory.filter(
    (item) => item.quantity === 0
  ).length;
  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddInventory = (e) => {
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

    if (
      inventory.some(
        (item) => item.sku.toLowerCase() === form.sku.trim().toLowerCase()
      )
    ) {
      alert("This SKU already exists. Please use a unique SKU.");
      return;
    }

    const newItem = {
      id: Date.now(),
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      location: form.location.trim(),
      quantity,
      minStock,
    };

    setInventory((previous) => [...previous, newItem]);

    setForm({
      name: "",
      sku: "",
      category: "",
      quantity: "",
      minStock: "",
      location: "",
    });

    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      setInventory((previous) =>
        previous.filter((item) => item.id !== id)
      );
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
        <form className="inventory-form" onSubmit={handleAddInventory}>
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
              {filteredInventory.map((item) => {
                const status = getStatus(item);

                return (
                  <tr key={item.id}>
                    <td className="inventory-product-name">{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.minStock}</td>
                    <td>{item.location}</td>
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
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan="8" className="inventory-empty">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
