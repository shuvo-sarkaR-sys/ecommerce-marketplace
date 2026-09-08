"use client";

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the backend through the /api rewrite proxy (see next.config.ts) so
 * the request stays same-origin from the browser's point of view and auth
 * cookies work the same in dev and once frontend/backend are on separate
 * production domains.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
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
}
