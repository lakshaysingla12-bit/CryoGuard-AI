import { Package2, MapPin, AlertTriangle } from "lucide-react";
import "./Inventory.css";

function Inventory() {
  const inventoryItems = [
    {
      id: "INV-1021",
      name: "Vaccines",
      quantity: "120 Units",
      location: "Cold Room 1",
      status: "Available"
    },
    {
      id: "INV-1022",
      name: "Insulin",
      quantity: "85 Units",
      location: "Cold Room 2",
      status: "Available"
    },
    {
      id: "INV-1023",
      name: "Biological Samples",
      quantity: "42 Units",
      location: "Storage Area 3",
      status: "Low Stock"
    }
  ];

  return (
    <div className="inventory-page">

      <div className="inventory-header">
        <div>
          <h1>Inventory</h1>
          <p>Monitor cold-chain inventory and storage status.</p>
        </div>

        <span className="inventory-count">
          3 Items
        </span>
      </div>

      <div className="inventory-list">

        {inventoryItems.map((item) => (
          <div className="inventory-card" key={item.id}>

            <div className="inventory-icon">
              <Package2 size={22} />
            </div>

            <div className="inventory-info">
              <h3>{item.name}</h3>

              <p className="inventory-id">
                {item.id}
              </p>

              <p>
                <MapPin size={14} />
                {item.location}
              </p>
            </div>

            <div className="inventory-quantity">
              <strong>{item.quantity}</strong>
              <span>Quantity</span>
            </div>

            <div className="inventory-status">
              {item.status === "Low Stock" && (
                <AlertTriangle size={14} />
              )}

              <span className={item.status === "Low Stock" ? "low-stock" : "available"}>
                {item.status}
              </span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Inventory;