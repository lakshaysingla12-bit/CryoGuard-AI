import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Download, Eye, ShieldCheck, Search } from "lucide-react";
import { generateGRN } from "../utils/reportUtils";

export default function GRNReportsView({ consignments: propConsignments, onPreviewGRN, onToast }) {
  const reduxConsignments = useSelector((state) => state.consignments?.items);
  const consignments = propConsignments || reduxConsignments || [];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = consignments.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.drugName.toLowerCase().includes(search.toLowerCase()) ||
      c.carrierDriver.toLowerCase().includes(search.toLowerCase());

    if (filter === "admitted") return matchSearch && c.receiverDisposition === "ADMITTED";
    if (filter === "quarantined") return matchSearch && c.receiverDisposition === "QUARANTINED";
    return matchSearch;
  });

  const handleDownload = (c) => {
    generateGRN(c);
    if (onToast) {
      onToast({
        type: "success",
        title: "GRN PDF Generated",
        message: `Goods Receiving Note for ${c.id} exported successfully.`,
      });
    }
  };

  return (
    <div className="reports-view">
      <div className="reports-header-card">
        <div>
          <h2>GxP Goods Receiving Notes (GRN) Archive</h2>
          <p>
            FDA 21 CFR Part 11 &amp; EU Annex 11 Electronic Receiving Records
          </p>
        </div>
        <div className="reports-header-badge">
          <ShieldCheck size={18} className="text-emerald" />
          <span>Legally Binding Electronic Repository</span>
        </div>
      </div>

      <div className="reports-filter-bar">
        <div className="reports-search">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search archive by Batch ID, Drug Name, Pharmacist, Driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="reports-tabs">
          <button
            className={`tab-btn ${filter === "all" ? "tab-btn--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Notes ({consignments.length})
          </button>
          <button
            className={`tab-btn ${filter === "admitted" ? "tab-btn--active" : ""}`}
            onClick={() => setFilter("admitted")}
          >
            Admitted ({consignments.filter((c) => c.receiverDisposition === "ADMITTED").length})
          </button>
          <button
            className={`tab-btn ${filter === "quarantined" ? "tab-btn--active" : ""}`}
            onClick={() => setFilter("quarantined")}
          >
            Quarantined ({consignments.filter((c) => c.receiverDisposition === "QUARANTINED").length})
          </button>
        </div>
      </div>

      <div className="reports-grid">
        {filtered.map((c) => {
          const isAdmitted = c.receiverDisposition === "ADMITTED";
          const isQuarantined = c.receiverDisposition === "QUARANTINED";

          return (
            <div key={c.id} className="report-card">
              <div className="report-card__header">
                <div>
                  <div className="report-ref mono">GRN-{c.id}</div>
                  <h3 className="report-drug">{c.drugName}</h3>
                </div>
                <span
                  className={`badge ${
                    isAdmitted
                      ? "badge--admitted"
                      : isQuarantined
                      ? "badge--quarantined"
                      : "badge--pending"
                  }`}
                >
                  {isAdmitted ? "✓ Admitted" : isQuarantined ? "✕ Quarantined" : "Pending Inspection"}
                </span>
              </div>

              <div className="report-card__details">
                <div className="detail-row">
                  <span className="label">Vehicle / Transport:</span>
                  <span className="val">{c.vehicleId} ({c.origin})</span>
                </div>
                <div className="detail-row">
                  <span className="label">Arrival Reading:</span>
                  <span className="val mono">
                    {c.currentTemp}°C · {c.currentHumidity}% RH
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Excursion Record:</span>
                  <span className={`val ${c.transitExcursionCount > 0 ? "text-rose font-bold" : "text-emerald"}`}>
                    {c.transitExcursionCount === 0 ? "Zero Breaches (Intact)" : `${c.transitExcursionCount} Critical Excursion(s)`}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Sign-Off Authority:</span>
                  <span className="val">Dr. Elena Rostova, PharmD</span>
                </div>
              </div>

              <div className="report-card__actions">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onPreviewGRN(c)}
                >
                  <Eye size={14} />
                  Preview Record
                </button>
                <button
                  className="btn-primary btn-sm btn-primary--cyan"
                  onClick={() => handleDownload(c)}
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
