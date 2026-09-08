"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiRequestError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { formatBDT } from "@/lib/utils";

const titles: Record<string, string> = {
  orders: "Orders", products: "Products", sellers: "Sellers", customers: "Customers",
  categories: "Categories", brands: "Brands", coupons: "Coupons", reviews: "Reviews",
  payments: "Payments", returns: "Returns", reports: "Reports", settings: "Settings",
};

type Row = Record<string, unknown>;

function text(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return String(object.name ?? object.email ?? object._id ?? "-");
  }
  return String(value);
}

function columnsFor(section: string) {
  if (section === "orders" || section === "payments" || section === "returns") return ["user", "total", "paymentMethod", "paymentStatus", "status", "createdAt"];
  if (section === "products") return ["name", "brand", "price", "status", "totalSold", "viewCount"];
  if (section === "sellers" || section === "customers") return ["name", "email", "emailVerified", "createdAt"];
  if (section === "reviews") return ["product", "user", "rating", "title", "verifiedPurchase", "createdAt"];
  if (section === "categories") return ["name", "slug", "order"];
  if (section === "reports" || section === "settings") return ["name", "value"];
  return ["name", "description", "status", "createdAt"];
}

export function AdminResourcePage({ section }: { section: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editingProduct, setEditingProduct] = useState<Row | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [catalogOptions, setCatalogOptions] = useState<{ brands: Row[]; categories: Row[] }>({ brands: [], categories: [] });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [note, setNote] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ rows?: Row[]; note?: string }>(`/admin/resources/${section}`);
      setRows(data.rows ?? []);
      setNote(data.note);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load this section");
    } finally { setLoading(false); }
  }

  async function update(path: string, body: Record<string, unknown>) {
    try {
      await apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
      setEditingProduct(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update this record");
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingProduct(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
      if (files.length === 0) throw new ApiRequestError("Select at least one product image", 400);
      const uploadForm = new FormData();
      files.forEach((file) => uploadForm.append("images", file));
      const { images } = await apiFetch<{ images: string[] }>("/admin/uploads/products", { method: "POST", body: uploadForm });
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          brand: form.get("brand"), category: form.get("category"), name: form.get("name"),
          description: form.get("description"), sku: form.get("sku"), price: Number(form.get("price")),
          compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : undefined,
          images, colors: [], sizes: [], tags: [],
        }),
      });
      setShowCreateProduct(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create this product");
    } finally { setCreatingProduct(false); }
  }

  const columns = columnsFor(section);
  const isProduct = section === "products";
  const isOrder = section === "orders";

  useEffect(() => { void load(); }, [section]);
  useEffect(() => {
    if (!isProduct) return;
    void Promise.all([
      apiFetch<{ brands: Row[] }>("/brands?status=all"),
      apiFetch<{ categories: Row[] }>("/categories"),
    ]).then(([brands, categories]) => setCatalogOptions({ brands: brands.brands, categories: categories.categories }))
      .catch(() => setError("Could not load brands and categories"));
  }, [isProduct]);

  return <div>
    <div className="mb-6 flex items-center justify-between gap-4"><div><p className="label-caps">MAISON Control Panel</p><h2 className="mt-1 font-display text-h2">{titles[section] ?? section}</h2></div><div className="flex gap-2">{isProduct && <Button size="sm" onClick={() => setShowCreateProduct((value) => !value)}>{showCreateProduct ? "Close" : "Add product"}</Button>}<Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div></div>
    {error && <p className="mb-4 text-caption text-oxblood">{error}</p>}
    {note && <p className="mb-4 border border-sand p-4 text-body text-charcoal">{note}</p>}
    {isProduct && showCreateProduct && <form className="mb-6 grid gap-4 border border-sand p-5" onSubmit={(event) => void createProduct(event)}><div className="flex items-center justify-between"><h3 className="font-display text-h3">Add product</h3><span className="text-caption text-stone">Images are required</span></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Brand<select name="brand" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required><option value="">Select brand</option>{catalogOptions.brands.map((brand) => <option key={String(brand._id)} value={String(brand._id)}>{text(brand.name)}</option>)}</select></label><label className="label-caps">Category<select name="category" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required><option value="">Select category</option>{catalogOptions.categories.map((category) => <option key={String(category._id)} value={String(category._id)}>{text(category.name)}</option>)}</select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Name<input name="name" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">SKU<input name="sku" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label></div><label className="label-caps">Description<textarea name="description" className="mt-1 min-h-24 w-full border border-stone/40 bg-paper p-3.5 text-body" minLength={20} required /></label><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Price<input name="price" type="number" min="1" step="0.01" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">Compare-at price<input name="compareAtPrice" type="number" min="1" step="0.01" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" /></label></div><label className="label-caps">Product images<input name="images" type="file" accept="image/*" multiple className="mt-1 block w-full text-body" required /></label><Button type="submit" size="sm" disabled={creatingProduct}>{creatingProduct ? "Uploading..." : "Create product"}</Button></form>}
    {isProduct && editingProduct && <form className="mb-6 grid gap-4 border border-sand p-5" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void update(`/admin/products/${String(editingProduct._id)}`, { name: form.get("name"), description: form.get("description"), price: Number(form.get("price")), compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : null }); }}><div className="flex items-center justify-between"><h3 className="font-display text-h3">Edit product</h3><Button type="button" size="sm" variant="ghost" onClick={() => setEditingProduct(null)}>Cancel</Button></div><label className="label-caps">Name<input name="name" defaultValue={text(editingProduct.name)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">Description<textarea name="description" defaultValue={text(editingProduct.description)} className="mt-1 min-h-24 w-full border border-stone/40 bg-paper p-3.5 text-body" required /></label><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Price<input name="price" type="number" min="1" defaultValue={String(editingProduct.price ?? "")} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">Compare-at price<input name="compareAtPrice" type="number" min="1" defaultValue={editingProduct.compareAtPrice ? String(editingProduct.compareAtPrice) : ""} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" /></label></div><Button type="submit" size="sm">Save product</Button></form>}
    {loading ? <p className="text-body text-stone">Loading…</p> : rows.length === 0 ? <div className="border-y border-sand py-10 text-center text-body text-stone">Nothing to show yet.</div> : <div className="overflow-x-auto border-y border-sand"><table className="w-full min-w-[720px] text-left text-caption"><thead><tr className="border-b border-sand text-stone">{columns.map((column) => <th key={column} className="py-3 pr-5 capitalize">{column.replace(/([A-Z])/g, " $1")}</th>)}{(isProduct || isOrder) && <th className="py-3 pr-5">Actions</th>}</tr></thead><tbody>{rows.map((row) => <tr key={String(row._id)} className="border-b border-sand last:border-0">{columns.map((column) => <td key={column} className="max-w-[240px] truncate py-3 pr-5">{column === "price" || column === "total" ? formatBDT(Number(row[column] ?? 0)) : column.endsWith("At") ? new Date(String(row[column])).toLocaleDateString() : text(row[column])}</td>)}{isProduct && <td className="py-3 pr-5"><div className="flex items-center gap-2"><select className="border border-sand bg-transparent px-2 py-1" value={String(row.status ?? "pending")} onChange={(event) => void update(`/admin/products/${String(row._id)}/status`, { status: event.target.value })}><option value="draft">Draft</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><Button size="sm" variant="secondary" onClick={() => setEditingProduct(row)}>Edit</Button></div></td>}{isOrder && <td className="py-3 pr-5"><select className="border border-sand bg-transparent px-2 py-1" value={String(row.status ?? "pending")} onChange={(event) => void update(`/admin/orders/${String(row._id)}/status`, { status: event.target.value })}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option></select></td>}</tr>)}</tbody></table></div>}
  </div>;
}