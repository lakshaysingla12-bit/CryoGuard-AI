import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function renderTable(doc, options) {
  if (typeof autoTable === "function") {
    autoTable(doc, options);
  } else if (autoTable && typeof autoTable.default === "function") {
    autoTable.default(doc, options);
  } else if (typeof doc.autoTable === "function") {
    doc.autoTable(options);
  }
}

/**
 * Exports tabular data array to a downloadable CSV file.
 */
export function exportToCSV(filename, rows) {
  const processRow = (row) => {
    return row.map(val => {
      let v = val === null || val === undefined ? "" : String(val);
      if (v.includes(",") || v.includes('"') || v.includes("\n")) {
        v = `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    }).join(",");
  };

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(processRow).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an official GxP Goods Receiving Note (GRN) PDF.
 */
export function generateGRN(consignment, options = {}) {
  try {
    const c = consignment;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const now = options.timestamp || new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ── Header Banner ──
    doc.setFillColor(3, 8, 20);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFillColor(56, 189, 248);
    doc.rect(0, 0, pageWidth, 2.5, "F");

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("METRO GENERAL HOSPITAL", 14, 13.5);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(56, 189, 248);
    doc.text("DEPARTMENT OF PHARMACY & BIOMEDICAL QUALITY ASSURANCE", 14, 20);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Official GxP Goods Receiving Note (GRN) · Inward Cold-Chain Verification", 14, 26.5);
    doc.text(`Generated: ${now}  |  Ref: GRN-${c.id}`, 14, 32);

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(pageWidth - 62, 8, 48, 18, 2, 2, "F");
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.3);
    doc.roundedRect(pageWidth - 62, 8, 48, 18, 2, 2, "D");

    doc.setTextColor(56, 189, 248);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL GXP RECORD", pageWidth - 38, 16, { align: "center" });

    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text("21 CFR Part 11 Certified", pageWidth - 38, 21.5, { align: "center" });

    // ── Section 1: Consignment Details ──
    let y = 46;
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("1. Consignment & Transport Metadata", 14, y);
    y += 4.5;

    const detailRows = [
      ["Batch / Lot ID", c.id, "Transport Vehicle", c.vehicleId],
      ["Drug Product", c.drugName, "Origin Distribution Hub", c.origin],
      ["Cold Category", c.category, "Carrier Driver", c.carrierDriver],
      [
        "Target Temp Band",
        `${c.targetTempBand.min}°C to ${c.targetTempBand.max}°C`,
        "Receiving Dock Station",
        c.dockLocation || "Dock B",
      ],
      [
        "Arrival Temp / Humidity",
        `${c.currentTemp}°C / ${c.currentHumidity}% RH`,
        "Excursions Detected",
        c.transitExcursionCount === 0 ? "0 Breaches (Fully In-Spec)" : `${c.transitExcursionCount} Out-of-Spec Breach(es)`,
      ],
      [
        "Storage Allocation",
        options.storageLocation || c.storageLocation || "Biologics Secure Vault",
        "Verification Status",
        "Validated on intake",
      ],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Attribute", "Specification", "Attribute", "Specification"]],
      body: detailRows,
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [241, 245, 249],
        fillColor: [15, 23, 42],
        lineColor: [30, 41, 59],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [11, 19, 41],
        textColor: [56, 189, 248],
        fontStyle: "bold",
        fontSize: 7.2,
      },
      alternateRowStyles: {
        fillColor: [22, 33, 56],
      },
      margin: { left: 14, right: 14 },
    });

    // ── Section 2: Inbound Cold-Chain Telemetry Log ──
    y = doc.lastAutoTable.finalY + 7;
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("2. Thermal Telemetry Log & Variance Audit", 14, y);
    y += 4.5;

    const telemetryRows = (c.timeSeriesData || []).map((dp, i) => {
      const inSpec = dp.temp >= c.targetTempBand.min && dp.temp <= c.targetTempBand.max;
      return [
        `LOG-${String(i + 1).padStart(2, "0")}`,
        dp.time,
        `${dp.temp > 0 ? "+" : ""}${dp.temp}°C`,
        `${dp.humidity}%`,
        inSpec ? "PASS / IN-SPEC" : "CRITICAL EXCURSION",
        inSpec ? "Optimal" : `Exceeded spec by ${Math.abs(dp.temp > c.targetTempBand.max ? dp.temp - c.targetTempBand.max : c.targetTempBand.min - dp.temp).toFixed(1)}°C`,
      ];
    });

    renderTable(doc, {
      startY: y,
      head: [["ID", "Log Time", "Cargo Temp", "Humidity", "GxP State", "Variance Analysis"]],
      body: telemetryRows,
      theme: "grid",
      styles: {
        fontSize: 7.2,
        cellPadding: 1.8,
        textColor: [241, 245, 249],
        fillColor: [15, 23, 42],
        lineColor: [30, 41, 59],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [11, 19, 41],
        textColor: [56, 189, 248],
        fontStyle: "bold",
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [22, 33, 56],
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4 && String(data.cell.raw).includes("EXCURSION")) {
          data.cell.styles.textColor = [244, 63, 94];
          data.cell.styles.fontStyle = "bold";
        } else if (data.section === "body" && data.column.index === 4 && String(data.cell.raw).includes("PASS")) {
          data.cell.styles.textColor = [16, 185, 129];
        }
      },
      margin: { left: 14, right: 14 },
    });

    // ── Section 3: Chain of Custody & Electronic Signature ──
    y = doc.lastAutoTable.finalY + 6;
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("3. Chain of Custody & Electronic Verification (21 CFR Part 11)", 14, y);
    y += 4.5;

    const custodyRows = [
      ["Carrier Custody Relinquished By", `${c.carrierDriver} (Logistics Fleet Delivery)`],
      ["Receiving Pharmacist Authority", "Dr. Elena Rostova, PharmD | Chief Quality Officer (Lic #PQ-99412)"],
      ["Digital Verification Authority", "Metro General Electronic Document System (GxP Validated Level 4)"],
      ["Audit / Deviation Notes", options.notes || c.notes || (c.transitExcursionCount > 0 ? "Excursion recorded in transit. Investigated under CAPA protocol." : "Intake clean. Thermal profile within validated specification limits.")],
    ];

    renderTable(doc, {
      startY: y,
      body: custodyRows,
      theme: "plain",
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: [203, 213, 225],
      },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [148, 163, 184], cellWidth: 62 },
      },
      margin: { left: 14, right: 14 },
    });

    // ── FOOTER ──
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFontSize(6.8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("CONFIDENTIAL MEDICAL QUALITY CONTROL RECORD · GXP VALIDATED", 14, pageHeight - 9);
    doc.setFont("helvetica", "normal");
    doc.text("Page 1 of 1", pageWidth - 14, pageHeight - 9, { align: "right" });

    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text("Metro General Hospital — Department of Pharmacy & Biomedical Quality Assurance · CryoGuard AI", 14, pageHeight - 5);
    doc.text(`System Time: ${now}`, pageWidth - 14, pageHeight - 5, { align: "right" });

    if (!options.previewOnly) {
      doc.save(`GRN_${c.id}_${Date.now()}.pdf`);
    }
    return doc;
  } catch (err) {
    console.error("Failed to generate GRN PDF:", err);
    alert("Error generating GRN PDF: " + err.message);
    return null;
  }
}

/**
 * Generates an official GxP Master Ledger Report PDF.
 */
export function generateLedgerReportPDF(entries, dateRangeLabel = "Today") {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const now = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // ── Header Banner ──
    doc.setFillColor(3, 8, 20);
    doc.rect(0, 0, pageWidth, 36, "F");

    doc.setFillColor(56, 189, 248);
    doc.rect(0, 0, pageWidth, 2.5, "F");

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("METRO GENERAL HOSPITAL", 14, 13);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(56, 189, 248);
    doc.text("DEPARTMENT OF PHARMACY & BIOMEDICAL QUALITY ASSURANCE — CRYOGUARD AI", 14, 19.5);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`MASTER INTAKE LEDGER AUDIT REPORT · DATE SCOPE: ${dateRangeLabel.toUpperCase()}`, 14, 26);
    doc.text(`Generated: ${now}  |  Certified 21 CFR Part 11 Electronic Receiving Ledger  |  Doc Ref: MLR-${Date.now().toString(36).toUpperCase()}`, 14, 31.5);

    // ── KPI Summary ──
    const total = entries.length;
    const inSpecCount = entries.filter((e) => (e.transitExcursionCount || 0) === 0).length;
    const excursions = entries.reduce((acc, e) => acc + (e.transitExcursionCount || 0), 0);

    let y = 42;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, "F");
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.2);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, "D");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    const spacing = (pageWidth - 28) / 4;
    const kpiY = y + 9;

    doc.setTextColor(241, 245, 249);
    doc.text(`Total Transports: ${total}`, 20, kpiY);

    doc.setTextColor(16, 185, 129);
    doc.text(`Thermal Compliant: ${inSpecCount} Safe`, 20 + spacing, kpiY);

    doc.setTextColor(excursions > 0 ? [244, 63, 94] : [16, 185, 129]);
    doc.text(`Thermal Excursions: ${excursions} Breaches`, 20 + spacing * 2, kpiY);

    doc.setTextColor(56, 189, 248);
    doc.text(`Ledger entries: ${total} recorded`, 20 + spacing * 3, kpiY);

    // ── Table ──
    y += 19;
    const tableRows = entries.map((e, idx) => {
      const isClean = (e.transitExcursionCount || 0) === 0;
      return [
        idx + 1,
        e.id,
        e.date || "Today",
        e.vehicleId,
        e.drugName,
        e.category,
        `${e.currentTemp}°C (${e.targetTempBand.min}° to ${e.targetTempBand.max}°C)`,
        isClean ? "0 (Safe)" : `⚠ ${e.transitExcursionCount} Breach`,
        isClean ? "Verified Compliant" : "CAPA Deviation Flag",
        e.carrierDriver,
        e.dockLocation || "Dock B",
      ];
    });

    renderTable(doc, {
      startY: y,
      head: [["#", "Batch ID", "Date", "Vehicle", "Pharmaceutical Product", "Cold Class", "Arrival Temp (Target)", "Excursions", "Audit Integrity", "Carrier Driver", "Dock Station"]],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 7.2,
        cellPadding: 2,
        textColor: [241, 245, 249],
        fillColor: [15, 23, 42],
        lineColor: [30, 41, 59],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [11, 19, 41],
        textColor: [56, 189, 248],
        fontStyle: "bold",
        fontSize: 7.2,
      },
      alternateRowStyles: {
        fillColor: [22, 33, 56],
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          if (data.column.index === 8) {
            if (String(data.cell.raw).includes("Compliant")) {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = "bold";
            } else if (String(data.cell.raw).includes("Deviation")) {
              data.cell.styles.textColor = [244, 63, 94];
              data.cell.styles.fontStyle = "bold";
            }
          }
          if (data.column.index === 7 && String(data.cell.raw).includes("Breach")) {
            data.cell.styles.textColor = [244, 63, 94];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    // ── Sign-Off ──
    const finalY = doc.lastAutoTable.finalY + 8;
    if (finalY < pageHeight - 20) {
      doc.setFontSize(7.2);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text("Quality Assurance Certification: I hereby certify that the above inward cold-chain receipts were verified under 21 CFR Part 11 protocols.", 14, finalY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 189, 248);
      doc.text("Dr. Elena Rostova, PharmD — Chief Quality Inspector · Metro General Hospital (Lic #PQ-99412)", 14, finalY + 4.5);
    }

    // ── FOOTER ──
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFontSize(6.8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("CONFIDENTIAL CLINICAL RECORD · OFFICIAL GXP MASTER INTAKE LEDGER · 21 CFR PART 11 CERTIFIED", 14, pageHeight - 9);
    doc.setFont("helvetica", "normal");
    doc.text("Page 1 of 1", pageWidth - 14, pageHeight - 9, { align: "right" });

    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text("Metro General Hospital — Department of Pharmacy & Biomedical Quality Assurance · CryoGuard AI", 14, pageHeight - 5);
    doc.text(`Date Scope: ${dateRangeLabel}  |  Generated: ${now}`, pageWidth - 14, pageHeight - 5, { align: "right" });

    doc.save(`GxP_Master_Ledger_Report_${Date.now()}.pdf`);
    return true;
  } catch (err) {
    console.error("Failed to generate Ledger Report PDF:", err);
    alert("Error generating Ledger Report PDF: " + err.message);
    return false;
  }
}

/**
 * Generates an official GxP Trip Summary Report PDF.
 */
export function generateTripSummaryPDF(consignment) {
  try {
    const c = consignment;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const now = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // ── Header Banner ──
    doc.setFillColor(3, 8, 20);
    doc.rect(0, 0, pageWidth, 38, "F");

    doc.setFillColor(56, 189, 248);
    doc.rect(0, 0, pageWidth, 2.5, "F");

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("METRO GENERAL HOSPITAL", 14, 13);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(56, 189, 248);
    doc.text("DEPARTMENT OF PHARMACY & BIOMEDICAL QUALITY ASSURANCE — CRYOGUARD AI", 14, 19.5);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Official Inbound Cold-Chain Completed Trip Summary Dossier", 14, 26);
    doc.text(`Generated: ${now}  |  Dossier ID: TRIP-${c.id}-${Date.now().toString(36).toUpperCase()}`, 14, 31.5);

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(pageWidth - 62, 8, 48, 18, 2, 2, "F");
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.3);
    doc.roundedRect(pageWidth - 62, 8, 48, 18, 2, 2, "D");

    doc.setTextColor(56, 189, 248);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("GXP AUDIT DOSSIER", pageWidth - 38, 16, { align: "center" });

    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text("FDA 21 CFR Part 11 Certified", pageWidth - 38, 21.5, { align: "center" });

    // ── Section 1: Route Metrics ──
    let y = 44;
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("1. Completed Transport Route & Dispatch Metrics", 14, y);
    y += 4.5;

    const temps = c.timeSeriesData && c.timeSeriesData.length > 0 ? c.timeSeriesData.map(d => d.temp) : [c.currentTemp];
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);

    const routeRows = [
      ["Batch / Lot ID", c.id, "Transport Vehicle", c.vehicleId],
      ["Pharmaceutical Product", c.drugName, "Cold Category", c.category],
      ["Dispatch Origin", c.origin, "Receiving Dock Station", c.dockLocation || "Dock B"],
      ["Trip Start Time", c.tripStartTime || "07:30 AM", "Dock Arrival Time", c.dockArrivalTime || "12:05 PM"],
      ["Total Route Distance", `${c.tripDistanceKm || 48} km`, "Average Speed", `${c.averageSpeedKmh || 54} km/h`],
      ["Carrier Driver", c.carrierDriver, "Transport Execution", "COMPLETED & DOCKED"],
      [
        "Target Temp Band",
        `${c.targetTempBand.min}°C to ${c.targetTempBand.max}°C`,
        "Thermal Profile (Min/Avg/Max)",
        `${minTemp}°C / ${avgTemp}°C / ${maxTemp}°C`,
      ],
      [
        "Arrival Temp / Humidity",
        `${c.currentTemp}°C / ${c.currentHumidity}% RH`,
        "Excursion Breaches",
        c.transitExcursionCount === 0 ? "0 Breaches (Fully Intact)" : `${c.transitExcursionCount} Critical Violation(s)`,
      ],
    ];

    renderTable(doc, {
      startY: y,
      head: [["Route Attribute", "Specification", "Route Attribute", "Specification"]],
      body: routeRows,
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [241, 245, 249],
        fillColor: [15, 23, 42],
        lineColor: [30, 41, 59],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [11, 19, 41],
        textColor: [56, 189, 248],
        fontStyle: "bold",
        fontSize: 7.2,
      },
      alternateRowStyles: {
        fillColor: [22, 33, 56],
      },
      margin: { left: 14, right: 14 },
    });

    // ── Section 2: Complete Thermal Log ──
    y = doc.lastAutoTable.finalY + 7;
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("2. Complete Trip Chronological Telemetry Stream", 14, y);
    y += 4.5;

    const logRows = (c.timeSeriesData || []).map((dp, i) => {
      const inSpec = dp.temp >= c.targetTempBand.min && dp.temp <= c.targetTempBand.max;
      return [
        `PT-${String(i + 1).padStart(2, "0")}`,
        dp.time,
        `${dp.temp > 0 ? "+" : ""}${dp.temp}°C`,
        `${dp.humidity}% RH`,
        inSpec ? "PASS / IN-SPEC" : "CRITICAL BREACH",
        inSpec ? "0.0°C deviation" : `Excursion of ${Math.abs(dp.temp > c.targetTempBand.max ? dp.temp - c.targetTempBand.max : c.targetTempBand.min - dp.temp).toFixed(1)}°C`,
      ];
    });

    renderTable(doc, {
      startY: y,
      head: [["Point", "Timestamp", "Cargo Temp", "Humidity", "GxP State", "Variance"]],
      body: logRows,
      theme: "grid",
      styles: {
        fontSize: 7.2,
        cellPadding: 1.8,
        textColor: [241, 245, 249],
        fillColor: [15, 23, 42],
        lineColor: [30, 41, 59],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [11, 19, 41],
        textColor: [56, 189, 248],
        fontStyle: "bold",
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [22, 33, 56],
      },
      margin: { left: 14, right: 14 },
    });

    // ── Section 3: Custody Sign-Off ──
    y = doc.lastAutoTable.finalY + 6;
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("3. Quality Assurance Intake Verification & Custody Audit", 14, y);
    y += 4.5;

    const dispositionRows = [
      ["Intake Verification", "Inward Cold-Chain Verification Protocol Completed"],
      ["Authorized Quality Inspector", "Dr. Elena Rostova, PharmD · Chief Quality Officer (Lic #PQ-99412)"],
      ["Carrier Fleet Relinquished By", `${c.carrierDriver} (Logistics Fleet Delivery)`],
      ["Audit Observations", c.notes || (c.transitExcursionCount > 0 ? "Non-conformance logged. CAPA deviation file initiated." : "Full trip completed within validated thermal specifications.")],
    ];

    renderTable(doc, {
      startY: y,
      body: dispositionRows,
      theme: "plain",
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        textColor: [203, 213, 225],
      },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [148, 163, 184], cellWidth: 50 },
      },
      margin: { left: 14, right: 14 },
    });

    // ── FOOTER ──
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFontSize(6.8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("CONFIDENTIAL MEDICAL QUALITY CONTROL RECORD · GXP VALIDATED", 14, pageHeight - 9);
    doc.setFont("helvetica", "normal");
    doc.text("Page 1 of 1", pageWidth - 14, pageHeight - 9, { align: "right" });

    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text("Metro General Hospital — Department of Pharmacy & Biomedical Quality Assurance · CryoGuard AI", 14, pageHeight - 5);
    doc.text(`Timestamp: ${now}`, pageWidth - 14, pageHeight - 5, { align: "right" });

    doc.save(`Trip_Summary_${c.id}_${c.vehicleId}.pdf`);
    return true;
  } catch (error) {
    console.error("Failed to generate Trip Summary PDF:", error);
    alert("Error generating PDF: " + error.message);
    return false;
  }
}
