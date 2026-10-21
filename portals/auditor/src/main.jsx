import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

let portalSession = null;
try {
  portalSession = JSON.parse(localStorage.getItem("cryoguard_demo_session") || "null");
} catch {
  portalSession = null;
}
const isAuditor = String(portalSession?.role || "").toLowerCase() === "auditor";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isAuditor ? <App /> : (
      <main style={{ minHeight: "100vh", padding: 32, background: "#0d1117", color: "#e6edf3", fontFamily: "system-ui, sans-serif" }} role="alert">
        <h1>Auditor sign-in required</h1>
        <p>Return to CryoGuard sign-in and use the destination facility ID.</p>
        <a href="/" style={{ color: "#22c8ef" }}>Back to sign in</a>
      </main>
    )}
  </StrictMode>
);
