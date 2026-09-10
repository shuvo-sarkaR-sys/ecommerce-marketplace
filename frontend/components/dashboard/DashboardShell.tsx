import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export interface DashboardNavItem {
  label: string;
  href?: string; // omitted = not built yet, shown disabled instead of a dead link
}

export function DashboardShell({
  title,
  subtitle,
  navItems,
  activeHref,
  showLogout = false,
  children,
}: {
  title: string;
  subtitle: string;
  navItems: DashboardNavItem[];
  activeHref: string;
  showLogout?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="container-editorial grid grid-cols-1 gap-10 py-12 md:grid-cols-4">
      <aside className="md:col-span-1">
        <p className="label-caps mb-1">{subtitle}</p>
        <h1 className="mb-6 font-display text-h2">{title}</h1>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-caption",
                  item.href === activeHref
                    ? "bg-ink text-ivory"
                    : "text-ink hover:bg-sand/60",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="cursor-not-allowed px-3 py-2 text-caption text-stone/60"
              >
                {item.label} · Soon
              </span>
            ),
          )}
        </nav>
        {showLogout && <LogoutButton />}
      </aside>
      <div className="md:col-span-3">{children}</div>
    </div>
  );
}

export function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-sand p-5">
      <p className="label-caps mb-2">{label}</p>
      <p className="font-display text-h2">{value}</p>
      {note && <p className="mt-1 text-caption text-stone">{note}</p>}
    </div>
  );
}
