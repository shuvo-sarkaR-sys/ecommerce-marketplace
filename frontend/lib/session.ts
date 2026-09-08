import "server-only";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
}

/**
 * Reads the current user for use in Server Components (dashboard pages).
 * middleware.ts already gates access to /account, /seller, /admin by
 * calling this same backend endpoint -- this second check inside the page
 * itself is defense in depth, and gives the page the user's name/email/role
 * to render without a second client-side round trip.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: { user: SessionUser } };
    return json.data.user;
  } catch {
    return null;
  }
}
