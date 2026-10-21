/**
 * Cryptographic Utility for GxP Telemetry Verification
 * Implements Web Crypto API SHA-256 digest validation
 */

export async function calculateSHA256(payload) {
  const jsonString = typeof payload === "string" ? payload : JSON.stringify(payload);
  const msgBuffer = new TextEncoder().encode(jsonString);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

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
