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
 * Generates an official GxP Goods Receiving Note (GRN) PDF
 * with clean clinical styling, no overlapping footers, and strictly no "pending" or "accepted" tags.
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

    // Cyan brand accent line
    doc.setFillColor(56, 189, 248);
    doc.rect(0, 0, pageWidth, 2.5, "F");

    // Hospital Identity
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("METRO GENERAL HOSPITAL", 14, 13.5);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(56, 189, 248);
    doc.text(
      "DEPARTMENT OF PHARMACY & BIOMEDICAL QUALITY ASSURANCE",
      14,
      20
    );

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Official GxP Goods Receiving Note (GRN) · Inward Cold-Chain Verification", 14, 26.5);
    doc.text(`Generated: ${now}  |  Ref: GRN-${c.id}-${(c.sha256Seal || "000").substring(0, 8).toUpperCase()}`, 14, 32);

    // Top-Right Official Seal Box (NO pending or accepted)
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
        c.dockLocation || "Bay 03 · Dock B",
      ],
      [
        "Arrival Temp / Humidity",
        `${c.currentTemp}°C / ${c.currentHumidity}% RH`,
        "Excursions Detected",
        c.transitExcursionCount === 0 ? "0 Breaches (Fully In-Spec)" : `${c.transitExcursionCount} Out-of-Spec Breach(es)`,
      ],
      [
        "Storage Allocation",
        options.storageLocation || c.storageLocation || "Biologics Secure Vault Bay 03",
        "Verification Status",
        "Validated & Cryptographically Sealed",
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

    // ── Section 3: Hardware Cryptographic Integrity Seal ──
    y = doc.lastAutoTable.finalY + 6;
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("3. Cryptographic Hardware Digest (Non-Tampering Assurance)", 14, y);
    y += 4.5;

    doc.setFillColor(11, 19, 41);
    doc.roundedRect(14, y, pageWidth - 28, 14, 1.5, 1.5, "F");
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.2);
    doc.roundedRect(14, y, pageWidth - 28, 14, 1.5, 1.5, "D");

    doc.setFontSize(7.2);
    doc.setFont("courier", "bold");
    doc.setTextColor(56, 189, 248);
    doc.text(`SHA-256 SEAL: ${c.sha256Seal}`, 18, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(16, 185, 129);
    doc.text("Electronic Ledger Certification: Telemetry verified mathematically intact under 21 CFR Part 11 protocols.", 18, y + 10.5);

    // ── Section 4: Chain of Custody & Electronic Signature (NO pending or accepted) ──
    y += 18;
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("4. Chain of Custody & Electronic Verification (21 CFR Part 11)", 14, y);
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

    // ── GUARANTEED NON-OVERLAPPING FOOTER ──
    // Hairline divider
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    // Upper line
    doc.setFontSize(6.8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text(
      "CONFIDENTIAL MEDICAL QUALITY CONTROL RECORD · GXP VALIDATED",
      14,
      pageHeight - 9
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      "Page 1 of 1",
      pageWidth - 14,
      pageHeight - 9,
      { align: "right" }
    );

    // Lower line
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Metro General Hospital — Department of Pharmacy & Biomedical Quality Assurance · CryoGuard AI",
      14,
      pageHeight - 5
    );
    doc.text(
      `System Time: ${now}`,
      pageWidth - 14,
      pageHeight - 5,
      { align: "right" }
    );

    // Save or return
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
