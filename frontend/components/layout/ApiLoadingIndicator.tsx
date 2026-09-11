"use client";

import { useEffect, useState } from "react";
import { API_REQUEST_FINISHED, API_REQUEST_STARTED } from "@/lib/api-client";

export function ApiLoadingIndicator() {
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const start = () => setActiveRequests((count) => count + 1);
    const finish = () => setActiveRequests((count) => Math.max(0, count - 1));

    window.addEventListener(API_REQUEST_STARTED, start);
    window.addEventListener(API_REQUEST_FINISHED, finish);

    return () => {
      window.removeEventListener(API_REQUEST_STARTED, start);
      window.removeEventListener(API_REQUEST_FINISHED, finish);
    };
  }, []);

  if (activeRequests === 0) return null;

  return (
    <div className="api-loading-indicator" role="status" aria-label="Loading">
      <span />
    </div>
  );
}