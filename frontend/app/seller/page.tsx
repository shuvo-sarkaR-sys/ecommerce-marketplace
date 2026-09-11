import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { DashboardShell, StatCard, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

// Auth-gated and per-user -- never statically cached.
export const dynamic = "force-dynamic";

const NAV: DashboardNavItem[] = [
  { label: "Dashboard", href: "/seller" },
  { label: "Products" },
  { label: "Orders" },
  { label: "Analytics" },
];

export default async function SellerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/seller/login?next=/seller");
  if (user.role !== "seller" && user.role !== "admin") redirect("/");

  return (
    <DashboardShell title="Seller Dashboard" subtitle="MAISON for Business" activeHref="/seller" navItems={NAV} showLogout>
      <p className="mb-8 text-body text-charcoal">
        Welcome, <span className="text-ink">{user.name}</span>. Product management, order
        handling, and analytics land in the next phase — this connects to the same
        <code className="mx-1 text-caption">/api/products</code> endpoints already live on
        the backend.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value="—" note="Needs the Orders API" />
        <StatCard label="Orders" value="—" note="Needs the Orders API" />
        <StatCard label="Products" value="—" note="Needs a seller-scoped products view" />
        <StatCard label="Conversion" value="—" note="Needs order + view data" />
      </div>
    </DashboardShell>
  );
}
