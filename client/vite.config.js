import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development the React app runs on :5173 and forwards
// API and socket requests to the Express server on :5000.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5001",
      "/socket.io": { target: "http://localhost:5001", ws: true },
    },
  },
});
