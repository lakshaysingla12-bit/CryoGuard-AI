import React, { useState } from "react";
import { Search, Eye, Calendar, ClipboardList } from "lucide-react";
import { sound } from "../utils/soundFx";

export default function IntakeLedger({
  consignments,
  activeId,
  onSelect,
  filterType,
}) {
  const [localSearch, setLocalSearch] = useState("");

  const filtered = consignments.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(localSearch.toLowerCase()) ||
      c.drugName.toLowerCase().includes(localSearch.toLowerCase()) ||
      c.vehicleId.toLowerCase().includes(localSearch.toLowerCase()) ||
      c.carrierDriver.toLowerCase().includes(localSearch.toLowerCase());

    if (filterType === "ADMITTED") return matchSearch && c.receiverDisposition === "ADMITTED";
    if (filterType === "QUARANTINED") return matchSearch && c.receiverDisposition === "QUARANTINED";
    if (filterType === "EXCURSIONS") return matchSearch && c.transitExcursionCount > 0;
    return matchSearch;
  });

  return (
    <section className="ledger-section">
      <div className="ledger-table-wrap">
        <div className="section-header-compact">
          <div className="title-group">
            <ClipboardList size={16} className="text-cyan" />
            <h2>Master Intake Ledger</h2>
            <span className="today-badge">
              <Calendar size={11} />
              All Facility Shipments
            </span>
          </div>

          <div className="compact-search">
            <Search size={14} className="text-muted" />
            <input
              type="text"
              placeholder="Search facility shipments..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Batch / Lot</th>
                <th>Vehicle</th>
                <th>Cargo Product</th>
                <th>Live Temp</th>
                <th>Excursions</th>
                <th>Disposition</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    No matching shipments for this facility.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isInSpec =
                    c.currentTemp >= c.targetTempBand.min &&
                    c.currentTemp <= c.targetTempBand.max;
                  const isActive = activeId === c.id;

                  return (
                    <tr
                      key={c.id}
                      className={isActive ? "row--active" : ""}
                      onClick={() => {
                        sound.click();
                        onSelect(c.id);
                      }}
                    >
                      <td>
                        <span className="batch-id mono">{c.id}</span>
                      </td>
                      <td>
                        <div className="vehicle-cell">
                          <div className="vid mono">{c.vehicleId}</div>
                          <div className="origin">{c.origin}</div>
                        </div>
                      </td>
                      <td>
                        <div className="drug-cell">
                          <div className="name">{c.drugName}</div>
                          <div className="band mono">
                            Target: {c.targetTempBand.min}° to {c.targetTempBand.max}°{c.targetTempBand.unit}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`temp-value ${
                            isInSpec ? "temp-value--safe" : "temp-value--breach"
                          }`}
                        >
                          {c.currentTemp > 0 ? "+" : ""}
                          {c.currentTemp}°C
                        </span>
                      </td>
                      <td>
                        {c.transitExcursionCount === 0 ? (
                          <span className="badge badge--safe">Safe</span>
                        ) : (
                          <span className="badge badge--breach">
                            ⚠ {c.transitExcursionCount} Breach(es)
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge badge--${c.receiverDisposition.toLowerCase()}`}
                        >
                          {c.receiverDisposition === "ADMITTED"
                            ? "✓ Admitted"
                            : c.receiverDisposition === "QUARANTINED"
                            ? "✕ Quarantined"
                            : "Pending"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-inspect"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.click();
                            onSelect(c.id);
                            // Scroll downward to cargo inspection panel
                            const el = document.getElementById("inspection-hub");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          Inspect
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
    </section>
  );
}
