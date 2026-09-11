"use client";

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_REQUEST_STARTED = "maison:api-request-started";
const API_REQUEST_FINISHED = "maison:api-request-finished";

function dispatchRequestEvent(name: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
}

/**
 * Calls the backend through the /api rewrite proxy (see next.config.ts) so
 * the request stays same-origin from the browser's point of view and auth
 * cookies work the same in dev and once frontend/backend are on separate
 * production domains.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
  dispatchRequestEvent(API_REQUEST_STARTED);

  try {
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...options?.headers },
      credentials: "include",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      throw new ApiRequestError(json?.error ?? "Something went wrong", res.status);
    }

    return json.data as T;
  } finally {
    dispatchRequestEvent(API_REQUEST_FINISHED);
  }
}

export { API_REQUEST_FINISHED, API_REQUEST_STARTED };
