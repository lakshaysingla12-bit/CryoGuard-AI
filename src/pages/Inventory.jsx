
import { useEffect, useState } from "react";
import { Package2, MapPin, AlertTriangle } from "lucide-react";
import "./Inventory.css";

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://dummyjson.com/c/08db-491d-47fe-9815";

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch inventory data");
        }

        const data = await response.json();

        // Your API returns an object containing an items array
        setInventoryItems(data.items || []);
      } catch (err) {
        setError("Unable to load inventory. Please try again.");
        console.error("Inventory API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <h1>Inventory</h1>
          <p>Monitor cold-chain inventory and storage status.</p>
        </div>

        <span className="inventory-count">
          {inventoryItems.length} Items
        </span>
      </div>

      {loading && (
        <p className="inventory-message">Loading inventory...</p>
      )}

      {error && (
        <div className="inventory-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && inventoryItems.length === 0 && (
        <p className="inventory-message">No inventory items found.</p>
      )}

      {!loading && !error && (
        <div className="inventory-list">
          {inventoryItems.map((item) => (
            <div className="inventory-card" key={item.id}>
              <div className="inventory-icon">
                <Package2 size={22} />
              </div>

              <div className="inventory-info">
                <h3>{item.name}</h3>

                <p className="inventory-id">{item.id}</p>

                <p>
                  <MapPin size={14} />
                  {item.location}
                </p>

                <p>
                  Category: {item.category || "N/A"}
                </p>

                <p>
                  Storage Temperature: {item.temperature || "N/A"}
                </p>

                <p>
                  Minimum Stock: {item.minStock ?? "N/A"}
                </p>
              </div>

              <div className="inventory-quantity">
                <strong>{item.quantity} {item.unit || "Units"}</strong>
                <span>Quantity</span>
              </div>

              <div className="inventory-status">
                {item.status === "Low Stock" && (
                  <AlertTriangle size={14} />
                )}

                <span
                  className={
                    item.status === "Low Stock"
                      ? "low-stock"
                      : "available"
                  }
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inventory;
