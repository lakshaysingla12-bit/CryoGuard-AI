import React from "react";
import { useSelector } from "react-redux";
import { Package, ShieldCheck, AlertOctagon, Activity } from "lucide-react";

export default function KPIStrip({ consignments: propConsignments, activeFilter, onFilterChange }) {
  const reduxConsignments = useSelector((state) => state.consignments?.items);
  const consignments = propConsignments || reduxConsignments || [];

  // Compute for today's inbound consignments
  const todaysConsignments = consignments.filter((c) => c.isToday !== false);
  const total = todaysConsignments.length;
  const admitted = todaysConsignments.filter(
    (c) => c.receiverDisposition === "ADMITTED"
  ).length;
  const quarantined = todaysConsignments.filter(
    (c) => c.receiverDisposition === "QUARANTINED"
  ).length;

  const totalExcursions = todaysConsignments.reduce(
    (acc, c) => acc + c.transitExcursionCount,
    0
  );
  const totalDataPoints = todaysConsignments.reduce(
    (acc, c) => acc + c.timeSeriesData.length,
    0
  );
  const compliantPoints = todaysConsignments.reduce((acc, c) => {
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
        <div className="kpi-card__metric">
          <Package size={18} className="kpi-card__icon text-cyan" />
          <div>
            <div className="kpi-card__value">{total}</div>
            <div className="kpi-card__label">Inbound Assignments</div>
          </div>
        </div>
        <div className="kpi-card__sub">
          {todaysConsignments.filter((c) => c.receiverDisposition === "PENDING").length} awaiting quality check
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
        <div className="kpi-card__metric">
          <ShieldCheck size={18} className="kpi-card__icon text-emerald" />
          <div>
            <div className="kpi-card__value">{admitted}</div>
            <div className="kpi-card__label">Cleared &amp; Admitted</div>
          </div>
        </div>
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
        <div className="kpi-card__metric">
          <AlertOctagon size={18} className="kpi-card__icon text-rose" />
          <div>
            <div className="kpi-card__value">{quarantined}</div>
            <div className="kpi-card__label">Rejected &amp; Quarantined</div>
          </div>
        </div>
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
        <div className="kpi-card__metric">
          <Activity size={18} className="kpi-card__icon text-amber" />
          <div>
            <div className="kpi-card__value">{compliancePercent}%</div>
            <div className="kpi-card__label">Thermal Compliance Integrity</div>
          </div>
        </div>
        <div className="kpi-card__sub">
          {compliantPoints} / {totalDataPoints} data points compliant
        </div>
      </div>
    </div>
  );
}
