import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { DashboardShell, StatCard, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

// Auth-gated and per-user -- never statically cached.
export const dynamic = "force-dynamic";

const NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/account" },
  { label: "Orders" },
  { label: "Wishlist" },
  { label: "Addresses" },
  { label: "Profile" },
  { label: "Notifications" },
  { label: "Settings" },
];

export default async function AccountPage() {
  const user = await getSessionUser();
  // middleware.ts already redirects unauthenticated requests before they
  // reach this page -- this is a defense-in-depth fallback, not the primary
  // guard.
  if (!user) redirect("/login?next=/account");

  return (
    <DashboardShell title="My Account" subtitle="Welcome back" activeHref="/account" navItems={NAV}>
      <div className="mb-8">
        <p className="text-body text-charcoal">
          Signed in as <span className="text-ink">{user.name}</span> ({user.email})
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value="0" note="Order history connects in a later phase" />
        <StatCard label="Wishlist" value="0" note="Saved items connect in a later phase" />
        <StatCard label="Addresses" value={String(0)} note="Add one at checkout for now" />
      </div>
    </DashboardShell>
  );
}
