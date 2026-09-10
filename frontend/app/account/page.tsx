import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { AccountClient } from "@/components/dashboard/AccountClient";

// Auth-gated and per-user -- never statically cached.
export const dynamic = "force-dynamic";

const validSections = new Set(["overview", "orders", "wishlist", "addresses", "profile", "notifications", "settings"]);

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const user = await getSessionUser();
  // middleware.ts already redirects unauthenticated requests before they
  // reach this page -- this is a defense-in-depth fallback, not the primary
  // guard.
  if (!user) redirect("/login?next=/account");
  const requestedSection = (await searchParams).section;
  const initialSection = validSections.has(requestedSection ?? "") ? requestedSection : "overview";
  return <main className="container-editorial"><AccountClient user={user} initialSection={initialSection as Parameters<typeof AccountClient>[0]["initialSection"]} /></main>;
}
