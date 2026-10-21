import React from "react";
import { Package, ShieldCheck, AlertOctagon, Activity } from "lucide-react";
import { sound } from "../utils/soundFx";

export default function KPIStrip({ consignments, activeFilter, onFilterChange }) {
  // Show the full facility queue; shipments may span multiple delivery dates.
  const facilityConsignments = consignments;
  const total = facilityConsignments.length;
  const admitted = facilityConsignments.filter(
    (c) => c.receiverDisposition === "ADMITTED"
  ).length;
  const quarantined = facilityConsignments.filter(
    (c) => c.receiverDisposition === "QUARANTINED"
  ).length;

  const totalExcursions = facilityConsignments.reduce(
    (acc, c) => acc + c.transitExcursionCount,
    0
  );
  const totalDataPoints = facilityConsignments.reduce(
    (acc, c) => acc + c.timeSeriesData.length,
    0
  );
  const compliantPoints = facilityConsignments.reduce((acc, c) => {
    const inSpec = c.timeSeriesData.filter(
      (dp) =>
        dp.temp >= c.targetTempBand.min && dp.temp <= c.targetTempBand.max
    ).length;
    return acc + inSpec;
  }, 0);
  const compliancePercent =
    totalDataPoints > 0
      ? ((compliantPoints / totalDataPoints) * 100).toFixed(1)
      : "100.0";

  const handleCardClick = (filterKey) => {
    sound.click();
    if (onFilterChange) {
      onFilterChange(activeFilter === filterKey ? "ALL" : filterKey);
    }
  };

  return (
    <div className="kpi-strip">
      {/* 1. Inbound Assignments */}
      <div
        className={`kpi-card kpi-card--cyan ${
          activeFilter === "ALL" ? "kpi-card--selected" : ""
        }`}
        onClick={() => handleCardClick("ALL")}
        role="button"
        tabIndex={0}
      >
        <div className="kpi-card__top">
          <div className="kpi-card__label">Inbound Assignments</div>
          <Package size={18} className="kpi-card__icon text-cyan" />
        </div>
        <div className="kpi-card__value">{total}</div>
        <div className="kpi-card__sub">
          {facilityConsignments.filter((c) => c.receiverDisposition === "PENDING").length} awaiting quality check
        </div>
      </div>

      {/* 2. Cleared & Admitted */}
      <div
        className={`kpi-card kpi-card--emerald ${
          activeFilter === "ADMITTED" ? "kpi-card--selected" : ""
        }`}
        onClick={() => handleCardClick("ADMITTED")}
        role="button"
        tabIndex={0}
      >
        <div className="kpi-card__top">
          <div className="kpi-card__label">Cleared &amp; Admitted</div>
          <ShieldCheck size={18} className="kpi-card__icon text-emerald" />
        </div>
        <div className="kpi-card__value">{admitted}</div>
        <div className="kpi-card__sub">Cleared for storage</div>
      </div>

      {/* 3. Rejected & Quarantined */}
      <div
        className={`kpi-card kpi-card--rose ${
          activeFilter === "QUARANTINED" ? "kpi-card--selected" : ""
        }`}
        onClick={() => handleCardClick("QUARANTINED")}
        role="button"
        tabIndex={0}
      >
        <div className="kpi-card__top">
          <div className="kpi-card__label">Rejected &amp; Quarantined</div>
          <AlertOctagon size={18} className="kpi-card__icon text-rose" />
        </div>
        <div className="kpi-card__value">{quarantined}</div>
        <div className="kpi-card__sub">
          {totalExcursions} excursion breach(es)
        </div>
      </div>

      {/* 4. Thermal Compliance Integrity */}
      <div
        className={`kpi-card kpi-card--amber ${
          activeFilter === "EXCURSIONS" ? "kpi-card--selected" : ""
        }`}
        onClick={() => handleCardClick("EXCURSIONS")}
        role="button"
        tabIndex={0}
      >
        <div className="kpi-card__top">
          <div className="kpi-card__label">Thermal Compliance Integrity</div>
          <Activity size={18} className="kpi-card__icon text-amber" />
        </div>
        <div className="kpi-card__value">{compliancePercent}%</div>
        <div className="kpi-card__sub">
          {compliantPoints} / {totalDataPoints} data points compliant
        </div>
      </div>
    </div>
  );
}
