import React, { useState, useMemo } from "react";
import {
  Calendar,
  Download,
  FileText,
  Search,
  CheckCircle2,
  AlertOctagon,
  ArrowUpDown,
  Eye,
  RotateCcw,
  Clock,
  CalendarRange
} from "lucide-react";
import { generateTripSummaryPDF } from "../utils/generateTripSummary";
import { generateLedgerReportPDF } from "../utils/generateLedgerReport";
import { exportToCSV } from "../utils/cryptoUtils";
import { sound } from "../utils/soundFx";

export default function IntakeLedgerView({
  consignments,
  activeId,
  onSelect,
  onOpenAdmit,
  onOpenQuarantine,
  onToast,
}) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date(`${todayISO}T00:00:00`);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayISO = yesterdayDate.toISOString().slice(0, 10);

  // Date Filter State: "today" (default) | "yesterday" | "specific" | "all"
  const [dateMode, setDateMode] = useState("all");
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(todayISO);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // 1. FILTER ONLY COMPLETED / DOCKED TRIPS
  const completedTrips = useMemo(() => {
    return consignments.filter(
      (c) =>
        c.isDocked ||
        c.tripStatus === "COMPLETED" ||
        (c.eta && (c.eta.startsWith("Docked") || c.eta.startsWith("Completed")))
    );
  }, [consignments]);

  // 2. APPLY DATE / RANGE FILTER
  const dateFilteredTrips = useMemo(() => {
    return completedTrips.filter((c) => {
      const tripDate = c.date || (c.isToday ? todayISO : yesterdayISO);

      if (dateMode === "today") {
        return tripDate === todayISO || c.isToday === true;
      }
      if (dateMode === "yesterday") {
        return tripDate === yesterdayISO;
      }
      if (dateMode === "specific") {
        const from = startDate && endDate && startDate > endDate ? endDate : startDate;
        const to = startDate && endDate && startDate > endDate ? startDate : endDate;
        if (!from && !to) return true;
        if (from && !to) return tripDate >= from;
        if (!from && to) return tripDate <= to;
        return tripDate >= from && tripDate <= to;
      }
      if (dateMode === "all") {
        return true;
      }
      return true;
    });
  }, [completedTrips, dateMode, startDate, endDate, todayISO, yesterdayISO]);

  // 3. SEARCH & STATUS FILTER
  const displayTrips = useMemo(() => {
    return dateFilteredTrips
      .filter((c) => {
        const matchSearch =
          c.id.toLowerCase().includes(search.toLowerCase()) ||
          c.drugName.toLowerCase().includes(search.toLowerCase()) ||
          c.vehicleId.toLowerCase().includes(search.toLowerCase()) ||
          c.carrierDriver.toLowerCase().includes(search.toLowerCase());

        const matchStatus =
          statusFilter === "ALL" || c.receiverDisposition === statusFilter;

        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === "temp") {
          valA = a.currentTemp;
          valB = b.currentTemp;
        } else if (sortField === "excursions") {
          valA = a.transitExcursionCount;
          valB = b.transitExcursionCount;
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [dateFilteredTrips, search, statusFilter, sortField, sortOrder]);

  // Date Range Label
  const dateRangeLabel = useMemo(() => {
    if (dateMode === "today") return "Today (Oct 21, 2026)";
    if (dateMode === "yesterday") return "Yesterday (Oct 20, 2026)";
    if (dateMode === "specific") {
      const from = startDate && endDate && startDate > endDate ? endDate : startDate;
      const to = startDate && endDate && startDate > endDate ? startDate : endDate;
      if (from === to) {
        return `Date: ${from}`;
      }
      return `Date Range: ${from} to ${to}`;
    }
    return "All Records";
  }, [dateMode, startDate, endDate]);

  // Master Ledger Report PDF Download (All Entries)
  const handleDownloadLedgerReport = () => {
    sound.click();
    generateLedgerReportPDF(displayTrips, dateRangeLabel);
    if (onToast) {
      onToast({
        type: "success",
        title: "Master Ledger Report Generated",
        message: `Official GxP report downloaded for ${displayTrips.length} completed trips.`,
      });
    }
  };

  // Master Ledger CSV Export
  const handleExportCSV = () => {
    sound.click();
    const rows = [
      ["Batch ID", "Trip Date", "Vehicle", "Drug Product", "Category", "Dock Location", "Arrival Temp (°C)", "Excursion Count", "Disposition", "Carrier Driver", "SHA-256 Seal"],
      ...displayTrips.map((c) => [
        c.id,
        c.date || "Today",
        c.vehicleId,
        c.drugName,
        c.category,
        c.dockLocation || "Bay 03",
        c.currentTemp,
        c.transitExcursionCount,
        c.receiverDisposition,
        c.carrierDriver,
        c.sha256Seal,
      ]),
    ];
    exportToCSV(`GxP_Ledger_Entries_${Date.now()}.csv`, rows);
    if (onToast) {
      onToast({
        type: "success",
        title: "CSV Exported",
        message: `${displayTrips.length} entries exported to CSV.`,
      });
    }
  };

  // Individual Whole Trip Summary PDF Download
  const handleDownloadTripSummary = (e, consignment) => {
    e.stopPropagation();
    sound.click();
    generateTripSummaryPDF(consignment);
    if (onToast) {
      onToast({
        type: "success",
        title: "Trip Summary PDF Exported",
        message: `Whole trip dossier for ${consignment.id} (${consignment.vehicleId}) downloaded.`,
      });
    }
  };

  const handleSort = (field) => {
    sound.click();
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="ledger-view-full">
      {/* ── HEADER BANNER & MASTER REPORT DOWNLOAD BUTTONS ── */}
      <div className="ledger-master-header">
        <div className="header-left">
          <h2>Master GxP Intake Ledger</h2>
          <p>
            Official Hospital Receiving Ledger for Completed &amp; Docked Cargo Transports
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            className="btn-primary btn-primary--cyan font-bold"
            onClick={handleDownloadLedgerReport}
          >
            <FileText size={16} />
            <span>Download Ledger Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* ── CALENDAR DATE & RANGE SELECTOR STRIP: ONLY TODAY, YESTERDAY, SPECIFIC DATES, ALL RECORDS ── */}
      <div className="calendar-filter-bar">
        <div className="calendar-filter-bar__top">
          <div className="cal-title">
            <Calendar size={16} className="text-cyan" />
            <span>Inspection Date Scope:</span>
          </div>

          <div className="date-quick-chips">
            <button
              className={`chip-btn ${dateMode === "today" ? "chip-btn--active" : ""}`}
              onClick={() => {
                sound.click();
                setDateMode("today");
              }}
            >
              Today
            </button>
            <button
              className={`chip-btn ${dateMode === "yesterday" ? "chip-btn--active" : ""}`}
              onClick={() => {
                sound.click();
                setDateMode("yesterday");
              }}
            >
              Yesterday
            </button>
            <button
              className={`chip-btn ${dateMode === "specific" ? "chip-btn--active" : ""}`}
              onClick={() => {
                sound.click();
                setDateMode("specific");
              }}
            >
              Specific Dates
            </button>
            <button
              className={`chip-btn ${dateMode === "all" ? "chip-btn--active" : ""}`}
              onClick={() => {
                sound.click();
                setDateMode("all");
              }}
            >
              All Records
            </button>
          </div>

          <button
            className="btn-reset-cal"
            title="Reset to Today"
            onClick={() => {
              sound.click();
              setDateMode("today");
              setStartDate(todayISO);
              setEndDate(todayISO);
            }}
          >
            <RotateCcw size={13} />
            <span>Reset to Today</span>
          </button>
        </div>

        {/* ── SPECIFIC DATES: OPTION FOR DATE RANGE (IF FROM === TO, OBVIOUSLY SINGLE DAY) ── */}
        {dateMode === "specific" && (
          <div className="calendar-filter-bar__sub">
            <div className="cal-picker-row">
              <div className="picker-group">
                <label>From Date:</label>
                <input
                  type="date"
                  className="cal-input"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                  onClick={(e) => {
                    try {
                      e.target.showPicker?.();
                    } catch (err) {}
                  }}
                />
              </div>

              <span className="range-arrow">→</span>

              <div className="picker-group">
                <label>To Date:</label>
                <input
                  type="date"
                  className="cal-input"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                  }}
                  onClick={(e) => {
                    try {
                      e.target.showPicker?.();
                    } catch (err) {}
                  }}
                />
              </div>

              <div className="cal-quick-pills">
                <span className="pills-label">Quick select:</span>
                <button
                  className={`pill-date-chip ${startDate === todayISO && endDate === todayISO ? "pill-date-chip--active" : ""}`}
                  onClick={() => {
                    sound.click();
                    setStartDate(todayISO);
                    setEndDate(todayISO);
                  }}
                >
                  Oct 21 (Single Day)
                </button>
                <button
                  className={`pill-date-chip ${startDate === yesterdayISO && endDate === yesterdayISO ? "pill-date-chip--active" : ""}`}
                  onClick={() => {
                    sound.click();
                    setStartDate(yesterdayISO);
                    setEndDate(yesterdayISO);
                  }}
                >
                  Oct 20 (Single Day)
                </button>
                <button
                  className={`pill-date-chip ${startDate === "2026-10-19" && endDate === "2026-10-19" ? "pill-date-chip--active" : ""}`}
                  onClick={() => {
                    sound.click();
                    setStartDate("2026-10-19");
                    setEndDate("2026-10-19");
                  }}
                >
                  Oct 19 (Single Day)
                </button>
                <button
                  className={`pill-date-chip ${startDate === "2026-10-15" && endDate === todayISO ? "pill-date-chip--active" : ""}`}
                  onClick={() => {
                    sound.click();
                    setStartDate("2026-10-15");
                    setEndDate(todayISO);
                  }}
                >
                  Oct 15 - 21 (7-Day Range)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="ledger-controls">
        <div className="ledger-controls__search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search completed cargos by Lot, Drug, Vehicle, Driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="ledger-controls__filters">
          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Disposition States</option>
            <option value="PENDING">Pending Acceptance / Rejection</option>
            <option value="ADMITTED">Accepted &amp; Admitted</option>
            <option value="QUARANTINED">Rejected &amp; Quarantined</option>
          </select>
        </div>

        <div className="active-scope-badge">
          <Clock size={13} className="text-cyan" />
          <span>Active Scope: <strong>{dateRangeLabel}</strong> ({displayTrips.length} completed trips)</span>
        </div>
      </div>

      {/* ── COMPLETED TRIPS TABLE (WITH ACCEPT / REJECT & TRIP SUMMARY PDF) ── */}
      <div className="ledger-table-wrap ledger-table-wrap--full">
        <table className="ledger-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")} className="sortable">
                <div className="th-content">
                  <span>Batch ID</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Date</th>
              <th>Vehicle &amp; Dock</th>
              <th>Pharmaceutical Product</th>
              <th onClick={() => handleSort("temp")} className="sortable">
                <div className="th-content">
                  <span>Arrival Temp</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort("excursions")} className="sortable">
                <div className="th-content">
                  <span>Excursions</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Intake Disposition (Accept / Reject)</th>
              <th>Carrier Driver</th>
              <th style={{ textAlign: "right" }}>Whole Trip Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayTrips.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-table-cell">
                  <div className="empty-ledger-state">
                    <p>No completed cargos found for <strong>{dateRangeLabel}</strong>.</p>
                    <div className="empty-actions">
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          sound.click();
                          setDateMode("today");
                        }}
                      >
                        Switch to Today's Completed Cargos
                      </button>
                      <button
                        className="btn-primary btn-sm btn-primary--cyan"
                        onClick={() => {
                          sound.click();
                          setDateMode("all");
                        }}
                      >
                        Show All Historical Cargos ({completedTrips.length})
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              displayTrips.map((c) => {
                const isActive = c.id === activeId;
                const isInSpec =
                  c.currentTemp >= c.targetTempBand.min &&
                  c.currentTemp <= c.targetTempBand.max;
                const isLocked = c.receiverDisposition !== "PENDING";
                const isAdmitted = c.receiverDisposition === "ADMITTED";
                const isQuarantined = c.receiverDisposition === "QUARANTINED";

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
                      <span className="text-secondary mono">{c.date || (c.isToday ? todayISO : yesterdayISO)}</span>
                    </td>
                    <td>
                      <div className="vehicle-cell">
                        <div className="vid mono">{c.vehicleId}</div>
                        <div className="origin text-cyan">{c.dockLocation || "Bay 03 · Dock B"}</div>
                      </div>
                    </td>
                    <td>
                      <div className="drug-cell">
                        <div className="name">{c.drugName}</div>
                        <div className="band mono">
                          Spec: {c.targetTempBand.min}° to {c.targetTempBand.max}°{c.targetTempBand.unit}
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

                    {/* ─────────────────────────────────────────────────────────
                        MARK AS ACCEPTED OR REJECTED
                        ───────────────────────────────────────────────────────── */}
                    <td>
                      {isLocked ? (
                        <span
                          className={`badge ${
                            isAdmitted ? "badge--admitted" : "badge--quarantined"
                          }`}
                        >
                          {isAdmitted ? "✓ Accepted & Admitted" : "✕ Rejected & Quarantined"}
                        </span>
                      ) : (
                        <div className="intake-inline-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-mark-accept"
                            title="Mark as Accepted (Admit to Cold Storage)"
                            onClick={() => onOpenAdmit(c)}
                          >
                            <CheckCircle2 size={13} />
                            <span>Accept</span>
                          </button>
                          <button
                            className="btn-mark-reject"
                            title="Mark as Rejected (Quarantine Batch)"
                            onClick={() => onOpenQuarantine(c)}
                          >
                            <AlertOctagon size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="text-secondary">{c.carrierDriver}</span>
                    </td>

                    {/* ─────────────────────────────────────────────────────────
                        WHOLE TRIP SUMMARY PDF BUTTON
                        ───────────────────────────────────────────────────────── */}
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-trip-summary-pdf"
                          title="Download Whole Trip Summary & Telemetry PDF"
                          onClick={(e) => handleDownloadTripSummary(e, c)}
                        >
                          <FileText size={14} className="text-cyan" />
                          <span>Trip Summary (PDF)</span>
                        </button>

                        <button
                          className="btn-icon"
                          title="Inspect Telemetry Details"
                          onClick={() => onSelect(c.id)}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
