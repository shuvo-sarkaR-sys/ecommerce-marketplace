"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/DashboardShell";
import { formatBDT } from "@/lib/utils";

type Overview = {
  stats: { customers: number; sellers: number; brands: number; products: number; orders: number; revenue: number };
  pendingBrands: Array<{ _id: string; name: string; status: string; owner?: { name?: string; email?: string } }>;
  pendingProducts: Array<{ _id: string; name: string; price: number; brand?: { name?: string } }>;
  recentOrders: Array<{ _id: string; total: number; status: string; paymentStatus: string; createdAt: string; user?: { name?: string } }>;
};

const money = (value: number) => formatBDT(value);

export function AdminOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Overview>("/admin/overview");
      setOverview(data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function update(path: string, status: string) {
    try {
      await apiFetch(path, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update this record");
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading && !overview) return <p className="text-body text-charcoal">Loading dashboard…</p>;
  if (error && !overview) {
    return <div><p className="text-body text-oxblood">{error}</p><Button className="mt-4" size="sm" onClick={() => void load()}>Retry</Button></div>;
  }
  if (!overview) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-body text-charcoal">Live marketplace operations overview.</p>
        <Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button>
      </div>
      {error && <p className="mb-4 text-caption text-oxblood">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Customers" value={String(overview.stats.customers)} />
        <StatCard label="Sellers" value={String(overview.stats.sellers)} />
        <StatCard label="Brands" value={String(overview.stats.brands)} />
        <StatCard label="Products" value={String(overview.stats.products)} />
        <StatCard label="Orders" value={String(overview.stats.orders)} />
        <StatCard label="Paid Revenue" value={money(overview.stats.revenue)} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-h3">Seller approvals</h2><span className="text-caption text-stone">{overview.pendingBrands.length} pending</span></div>
        {overview.pendingBrands.length === 0 ? <p className="text-body text-stone">No seller applications are waiting.</p> : <div className="divide-y divide-sand border-y border-sand">
          {overview.pendingBrands.map((brand) => <div key={brand._id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-medium">{brand.name}</p><p className="text-caption text-stone">{brand.owner?.name ?? brand.owner?.email ?? "Seller"}</p></div><div className="flex gap-2"><Button size="sm" onClick={() => void update(`/admin/brands/${brand._id}/status`, "approved")}>Approve</Button><Button size="sm" variant="secondary" onClick={() => void update(`/admin/brands/${brand._id}/status`, "rejected")}>Reject</Button></div></div>)}
        </div>}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-h3">Product approvals</h2><span className="text-caption text-stone">{overview.pendingProducts.length} pending</span></div>
        {overview.pendingProducts.length === 0 ? <p className="text-body text-stone">No products are waiting for review.</p> : <div className="divide-y divide-sand border-y border-sand">
          {overview.pendingProducts.map((product) => <div key={product._id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-medium">{product.name}</p><p className="text-caption text-stone">{product.brand?.name ?? "Unbranded"} · {money(product.price)}</p></div><div className="flex gap-2"><Button size="sm" onClick={() => void update(`/admin/products/${product._id}/status`, "approved")}>Approve</Button><Button size="sm" variant="secondary" onClick={() => void update(`/admin/products/${product._id}/status`, "rejected")}>Reject</Button></div></div>)}
        </div>}
      </section>

      <section className="mt-10"><h2 className="mb-4 font-display text-h3">Recent orders</h2><div className="overflow-x-auto border-y border-sand"><table className="w-full min-w-[640px] text-left text-caption"><thead><tr className="border-b border-sand text-stone"><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Total</th><th className="py-3 pr-4">Payment</th><th className="py-3 pr-4">Status</th><th className="py-3">Update</th></tr></thead><tbody>{overview.recentOrders.map((order) => <tr key={order._id} className="border-b border-sand last:border-0"><td className="py-3 pr-4">{order.user?.name ?? "Customer"}</td><td className="py-3 pr-4">{money(order.total)}</td><td className="py-3 pr-4 capitalize">{order.paymentStatus}</td><td className="py-3 pr-4 capitalize">{order.status}</td><td className="py-3"><select className="border border-sand bg-transparent px-2 py-1" value={order.status} onChange={(event) => void update(`/admin/orders/${order._id}/status`, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option></select></td></tr>)}</tbody></table></div></section>
    </div>
  );
}