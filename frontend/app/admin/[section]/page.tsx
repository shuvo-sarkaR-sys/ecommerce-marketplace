import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";
import { AdminResourcePage } from "@/components/dashboard/AdminResourcePage";

export const dynamic = "force-dynamic";

const sections = ["orders", "products", "sellers", "customers", "categories", "brands", "coupons", "reviews", "payments", "returns", "reports", "settings"] as const;
const nav: DashboardNavItem[] = [{ label: "Overview", href: "/admin" }, ...sections.map((section) => ({ label: section.charAt(0).toUpperCase() + section.slice(1), href: `/admin/${section}` }))];

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as typeof sections[number])) notFound();
  const user = await getSessionUser();
  if (!user) redirect(`/admin/login?next=/admin/${section}`);
  if (user.role !== "admin") redirect("/");
  return <DashboardShell title="Admin" subtitle="MAISON Control Panel" activeHref={`/admin/${section}`} navItems={nav} showLogout><AdminResourcePage section={section} /></DashboardShell>;
}