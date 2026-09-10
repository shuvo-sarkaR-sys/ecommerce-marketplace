import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { AdminOverview } from "@/components/dashboard/AdminOverview";

// Auth-gated and per-user -- never statically cached.
export const dynamic = "force-dynamic";

const NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/admin" },
  ...["orders", "products", "sellers", "customers", "categories", "brands", "coupons", "reviews", "payments", "returns", "reports", "settings"].map((section) => ({ label: section.charAt(0).toUpperCase() + section.slice(1), href: `/admin/${section}` })),
];

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  return (
    <DashboardShell title="Admin" subtitle="MAISON Control Panel" activeHref="/admin" navItems={NAV} showLogout>
      <p className="mb-8 text-body text-charcoal">Signed in as <span className="text-ink">{user.name}</span>.</p>
      <AdminOverview />
    </DashboardShell>
  );
}
