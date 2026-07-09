// Frontend-Backend server health
// Development only component

import { useEffect, useState } from "react";
import { serverHealthApi } from "../../services/api";

export default function ServerHealth() {
  // Tracks connection status: loading, success,  error
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    // Call backend health endpoint
    serverHealthApi
      .check()
      .then((res) => {
        // Connection success
        if (cancelled) return;
        setStatus("success");

        // Log response only in development
        if (import.meta.env.DEV) {
          console.log("Backend Connection SUCCESS:", res);
        }
      })
      // Connection failed
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");

        // Log error only in development
        console.error("Backend Connection ERROR:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing in production
  if (!import.meta.env.DEV) return null;

  // Map status to display color
  const colorMap = {
    loading: "orange",
    success: "green",
    error: "red",
  };

  // Map status to display text
  const statusText = {
    loading: "Checking...",
    success: "Connected",
    error: "Offline",
  };

  return (
    <div style={{ color: colorMap[status] }}>
      Server Status: {statusText[status]}
    </div>
  );
}