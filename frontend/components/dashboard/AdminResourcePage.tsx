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
  const [editingBrand, setEditingBrand] = useState<Row | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Row | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [catalogOptions, setCatalogOptions] = useState<{ brands: Row[]; categories: Row[] }>({ brands: [], categories: [] });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [customBrandName, setCustomBrandName] = useState("");
  const [customBrandImageFile, setCustomBrandImageFile] = useState<File | null>(null);
  const [productColors, setProductColors] = useState("");
  const [productSizes, setProductSizes] = useState("");
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [editingProductImages, setEditingProductImages] = useState<string[]>([]);
  const [editingProductImageFiles, setEditingProductImageFiles] = useState<File[]>([]);
  const [editingProductImagePreviews, setEditingProductImagePreviews] = useState<string[]>([]);
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
      setEditingBrand(null);
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
      let customBrandImage: string | undefined;
      const selectedCustomBrandName = customBrandName.trim();
      const existingBrand = catalogOptions.brands.find((brand) => text(brand.name).trim().toLowerCase() === selectedCustomBrandName.toLowerCase());
      if (selectedCustomBrandName && !existingBrand) {
        if (!customBrandImageFile) throw new ApiRequestError("Add an image for the custom brand", 400);
        const brandUpload = new FormData();
        brandUpload.append("image", customBrandImageFile);
        const uploadedBrand = await apiFetch<{ image: string }>("/admin/uploads/brand", { method: "POST", body: brandUpload });
        customBrandImage = uploadedBrand.image;
      }
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          brand: existingBrand ? String(existingBrand._id) : selectedCustomBrandName ? undefined : form.get("brand") || undefined,
          customBrandName: existingBrand ? undefined : selectedCustomBrandName || undefined, customBrandImage,
          category: form.get("category"), name: form.get("name"),
          description: form.get("description"), sku: form.get("sku"), price: Number(form.get("price")),
          compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : undefined,
          images, colors: parseList(productColors), sizes: parseSizes(productSizes), tags: [],
        }),
      });
      setShowCreateProduct(false);
      setProductImageFiles([]);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create this product");
    } finally { setCreatingProduct(false); }
  }

  const columns = columnsFor(section);
  const isProduct = section === "products";
  const isOrder = section === "orders";
  const isBrand = section === "brands";

  useEffect(() => { void load(); }, [section]);
  useEffect(() => {
    if (!isProduct) return;
    void Promise.all([
      apiFetch<{ brands: Row[] }>("/brands?status=all"),
      apiFetch<{ categories: Row[] }>("/categories"),
    ]).then(([brands, categories]) => setCatalogOptions({ brands: brands.brands, categories: categories.categories }))
      .catch(() => setError("Could not load brands and categories"));
  }, [isProduct]);
  useEffect(() => {
    const previews = productImageFiles.map((file) => URL.createObjectURL(file));
    setProductImagePreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [productImageFiles]);
  useEffect(() => {
    const previews = editingProductImageFiles.map((file) => URL.createObjectURL(file));
    setEditingProductImagePreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [editingProductImageFiles]);
  useEffect(() => {
    if (!isProduct || !showCreateProduct) return;
    const input = document.querySelector<HTMLInputElement>('input[name="images"]');
    if (!input) return;
    const handleChange = () => setProductImageFiles(Array.from(input.files ?? []).slice(0, 6));
    input.addEventListener("change", handleChange);
    return () => input.removeEventListener("change", handleChange);
  }, [isProduct, showCreateProduct]);
  useEffect(() => {
    if (!editingProduct) return;
    setEditingProductImages(Array.isArray(editingProduct.images) ? editingProduct.images.filter((image): image is string => typeof image === "string") : []);
    setEditingProductImageFiles([]);
  }, [editingProduct]);

  function selectProductForEditing(product: Row) {
    setEditingProduct(product);
    setEditingProductImages(Array.isArray(product.images) ? product.images.filter((image): image is string => typeof image === "string") : []);
    setEditingProductImageFiles([]);
  }

  function removeNewImage(index: number) {
    setProductImageFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
  }

  function moveNewImage(index: number, direction: -1 | 1) {
    setProductImageFiles((files) => moveItem(files, index, direction));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingProduct(true);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      const uploadForm = new FormData();
      editingProductImageFiles.forEach((file) => uploadForm.append("images", file));
      const uploaded = editingProductImageFiles.length > 0
        ? await apiFetch<{ images: string[] }>("/admin/uploads/products", { method: "POST", body: uploadForm })
        : { images: [] };
      await update(`/admin/products/${String(editingProduct?._id)}`, {
        brand: form.get("brand"), category: form.get("category"), name: form.get("name"), sku: form.get("sku"),
        description: form.get("description"), price: Number(form.get("price")),
        compareAtPrice: form.get("compareAtPrice") ? Number(form.get("compareAtPrice")) : null,
        colors: parseList(form.get("colors")), sizes: parseSizes(form.get("sizes")), material: form.get("material"),
        tags: parseList(form.get("tags")), badges: parseList(form.get("badges")),
        images: [...editingProductImages, ...uploaded.images],
      });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update this product");
    } finally { setCreatingProduct(false); }
  }
  return <div>
    <div className="mb-6 flex items-center justify-between gap-4"><div><p className="label-caps">MAISON Control Panel</p><h2 className="mt-1 font-display text-h2">{titles[section] ?? section}</h2></div><div className="flex gap-2">{isProduct && <Button size="sm" className="text-white" onClick={() => setShowCreateProduct((value) => !value)}>{showCreateProduct ? "Close" : "Add product"}</Button>}<Button size="sm" variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div></div>
    {error && <p className="mb-4 text-caption text-oxblood">{error}</p>}
    {note && <p className="mb-4 border border-sand p-4 text-body text-charcoal">{note}</p>}
    {isOrder && selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    {isProduct && showCreateProduct && <form className="mb-6 grid gap-4 border border-sand p-5" onSubmit={(event) => void createProduct(event)}><div className="flex items-center justify-between"><h3 className="font-display text-h3">Add product</h3><span className="text-caption text-stone">Images are required</span></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Custom brand name<input value={customBrandName} onChange={(event) => setCustomBrandName(event.target.value)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" placeholder="Optional if selecting an existing brand" /></label><label className="label-caps">Brand image<input type="file" accept="image/*" onChange={(event) => setCustomBrandImageFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-body" /></label><label className="label-caps">Colors<input value={productColors} onChange={(event) => setProductColors(event.target.value)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" placeholder="Black, Ivory, Navy" /></label><label className="label-caps">Sizes and stock<input value={productSizes} onChange={(event) => setProductSizes(event.target.value)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" placeholder="S:10, M:15, L:8" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Brand<select name="brand" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body"><option value="">Select brand</option>{catalogOptions.brands.map((brand) => <option key={String(brand._id)} value={String(brand._id)}>{text(brand.name)}</option>)}</select></label><label className="label-caps">Category<select name="category" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required><option value="">Select category</option>{catalogOptions.categories.map((category) => <option key={String(category._id)} value={String(category._id)}>{text(category.name)}</option>)}</select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Name<input name="name" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">SKU<input name="sku" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label></div><label className="label-caps">Description<textarea name="description" className="mt-1 min-h-24 w-full border border-stone/40 bg-paper p-3.5 text-body" minLength={20} required /></label><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Price<input name="price" type="number" min="1" step="0.01" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">Compare-at price<input name="compareAtPrice" type="number" min="1" step="0.01" className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" /></label></div><label className="label-caps">Product images<input name="images" type="file" accept="image/*" multiple className="mt-1 block w-full text-body" required /></label>
        {isProduct && showCreateProduct && productImagePreviews.length > 0 && <div className="mb-4 grid grid-cols-2 gap-3 border border-sand p-4 sm:grid-cols-4">{productImagePreviews.map((preview, index) => <div key={preview} className="relative overflow-hidden border border-sand bg-sand/20"><img src={preview} alt={`Product preview ${index + 1}`} className="aspect-square w-full object-cover" /><p className="truncate px-2 py-1 text-caption text-stone">{productImageFiles[index]?.name}</p><div className="flex gap-1 p-2"><button type="button" className="border border-sand px-2 py-1 text-caption" onClick={() => moveNewImage(index, -1)} disabled={index === 0}>Left</button><button type="button" className="border border-sand px-2 py-1 text-caption" onClick={() => moveNewImage(index, 1)} disabled={index === productImageFiles.length - 1}>Right</button><button type="button" className="border border-sand px-2 py-1 text-caption" onClick={() => removeNewImage(index)}>Remove</button></div></div>)}</div>}

    <Button type="submit" size="sm" className="text-white" disabled={creatingProduct}>{creatingProduct ? "Uploading..." : "Create product"}</Button></form>}
    {isProduct && editingProduct && <form className="mb-6 grid gap-4 border border-sand p-5" onSubmit={(event) => void saveProduct(event)}><div className="flex items-center justify-between"><h3 className="font-display text-h3">Edit product</h3><Button type="button" size="sm" variant="ghost" onClick={() => setEditingProduct(null)}>Cancel</Button></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Brand<select name="brand" defaultValue={text(editingProduct.brand) === "-" ? "" : String((editingProduct.brand as Row)?._id ?? editingProduct.brand)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required><option value="">Select brand</option>{catalogOptions.brands.map((brand) => <option key={String(brand._id)} value={String(brand._id)}>{text(brand.name)}</option>)}</select></label><label className="label-caps">Category<select name="category" defaultValue={text(editingProduct.category) === "-" ? "" : String((editingProduct.category as Row)?._id ?? editingProduct.category)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required><option value="">Select category</option>{catalogOptions.categories.map((category) => <option key={String(category._id)} value={String(category._id)}>{text(category.name)}</option>)}</select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Name<input name="name" defaultValue={text(editingProduct.name)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">SKU<input name="sku" defaultValue={text(editingProduct.sku)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" minLength={3} required /></label></div><label className="label-caps">Description<textarea name="description" defaultValue={text(editingProduct.description)} className="mt-1 min-h-24 w-full border border-stone/40 bg-paper p-3.5 text-body" required /></label><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Price<input name="price" type="number" min="1" defaultValue={String(editingProduct.price ?? "")} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><label className="label-caps">Compare-at price<input name="compareAtPrice" type="number" min="1" defaultValue={editingProduct.compareAtPrice ? String(editingProduct.compareAtPrice) : ""} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="label-caps">Colors<input name="colors" defaultValue={listValue(editingProduct.colors)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" placeholder="Black, Ivory, Navy" /></label><label className="label-caps">Sizes and stock<input name="sizes" defaultValue={sizesValue(editingProduct.sizes)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" placeholder="S:10, M:15" /></label><label className="label-caps">Material<input name="material" defaultValue={text(editingProduct.material) === "-" ? "" : text(editingProduct.material)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" /></label><label className="label-caps">Tags<input name="tags" defaultValue={listValue(editingProduct.tags)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" placeholder="new, featured" /></label><label className="label-caps sm:col-span-2">Badges<input name="badges" defaultValue={listValue(editingProduct.badges)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" placeholder="new, bestseller, limited, sale" /></label></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{editingProductImages.map((image, index) => <div key={image} className="relative overflow-hidden border border-sand"><img src={image} alt={`Product image ${index + 1}`} className="aspect-square w-full object-cover" /><button type="button" className="absolute right-1 top-1 bg-paper px-2 py-1 text-caption" onClick={() => setEditingProductImages((images) => images.filter((_, imageIndex) => imageIndex !== index))}>Remove</button></div>)}{editingProductImagePreviews.map((image, index) => <div key={image} className="relative overflow-hidden border border-sand"><img src={image} alt={`New product image ${index + 1}`} className="aspect-square w-full object-cover" /><button type="button" className="absolute right-1 top-1 bg-paper px-2 py-1 text-caption" onClick={() => setEditingProductImageFiles((files) => files.filter((_, fileIndex) => fileIndex !== index))}>Remove</button></div>)}</div><label className="label-caps">Add product images<input type="file" accept="image/*" multiple onChange={(event) => setEditingProductImageFiles(Array.from(event.target.files ?? []).slice(0, 6 - editingProductImages.length))} className="mt-1 block w-full text-body" /></label><Button type="submit" size="sm" disabled={creatingProduct || editingProductImages.length + editingProductImageFiles.length === 0}>{creatingProduct ? "Uploading..." : "Save product"}</Button></form>}
    {isBrand && editingBrand && <form className="mb-6 grid gap-4 border border-sand p-5" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void update(`/admin/brands/${String(editingBrand._id)}`, { name: form.get("name"), description: form.get("description"), category: form.get("category") }); }}><div className="flex items-center justify-between"><h3 className="font-display text-h3">Edit brand</h3><Button type="button" size="sm" variant="ghost" onClick={() => setEditingBrand(null)}>Cancel</Button></div><label className="label-caps">Name<input name="name" defaultValue={text(editingBrand.name)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" minLength={2} maxLength={80} required /></label><label className="label-caps">Description<textarea name="description" defaultValue={text(editingBrand.description)} className="mt-1 min-h-24 w-full border border-stone/40 bg-paper p-3.5 text-body" minLength={20} required /></label><label className="label-caps">Category<input name="category" defaultValue={text(editingBrand.category)} className="mt-1 h-11 w-full border border-stone/40 bg-paper px-3.5 text-body" required /></label><Button type="submit" size="sm">Save brand</Button></form>}
    {loading ? <p className="text-body text-stone">Loading…</p> : rows.length === 0 ? <div className="border-y border-sand py-10 text-center text-body text-stone">Nothing to show yet.</div> : <div className="overflow-x-auto border-y border-sand"><table className="w-full min-w-[720px] text-left text-caption"><thead><tr className="border-b border-sand text-stone">{columns.map((column) => <th key={column} className="py-3 pr-5 capitalize">{column.replace(/([A-Z])/g, " $1")}</th>)}{(isProduct || isOrder || isBrand) && <th className="py-3 pr-5">Actions</th>}</tr></thead><tbody>{rows.map((row) => <tr key={String(row._id)} className="border-b border-sand last:border-0">{columns.map((column) => <td key={column} className="max-w-[240px] truncate py-3 pr-5">{column === "price" || column === "total" ? formatBDT(Number(row[column] ?? 0)) : column.endsWith("At") ? new Date(String(row[column])).toLocaleDateString() : text(row[column])}</td>)}{isProduct && <td className="py-3 pr-5"><div className="flex items-center gap-2"><select className="border border-sand bg-transparent px-2 py-1" value={String(row.status ?? "pending")} onChange={(event) => void update(`/admin/products/${String(row._id)}/status`, { status: event.target.value })}><option value="draft">Draft</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><Button size="sm" variant="secondary" onClick={() => selectProductForEditing(row)}>Edit</Button></div></td>}{isBrand && <td className="py-3 pr-5"><div className="flex items-center gap-2"><select className="border border-sand bg-transparent px-2 py-1" value={String(row.status ?? "pending")} onChange={(event) => void update(`/admin/brands/${String(row._id)}/status`, { status: event.target.value })}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select><Button size="sm" variant="secondary" onClick={() => setEditingBrand(row)}>Edit</Button></div></td>}{isOrder && <td className="py-3 pr-5"><div className="flex items-center gap-2"><select className="border border-sand bg-transparent px-2 py-1" value={String(row.status ?? "pending")} onChange={(event) => void update(`/admin/orders/${String(row._id)}/status`, { status: event.target.value })}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="returned">Returned</option></select><Button size="sm" variant="secondary" onClick={() => setSelectedOrder(row)}>View details</Button></div></td>}</tr>)}</tbody></table></div>}
  </div>;
}

function OrderDetails({ order, onClose }: { order: Row; onClose: () => void }) {
  const customer = order.user && typeof order.user === "object" ? order.user as Row : {};
  const address = order.shippingAddress && typeof order.shippingAddress === "object" ? order.shippingAddress as Row : {};
  const items = Array.isArray(order.items) ? order.items : [];
  return <section className="mb-6 border border-sand bg-paper p-5">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="label-caps">Order details</p><h3 className="mt-1 font-display text-h3">#{String(order._id)}</h3><p className="text-caption text-stone">Placed {new Date(String(order.createdAt)).toLocaleString()}</p></div><Button type="button" size="sm" variant="ghost" onClick={onClose}>Close</Button></div>
    <div className="grid gap-5 border-y border-sand py-5 sm:grid-cols-3"><div><p className="label-caps mb-1">Customer</p><p className="text-body">{text(customer.name)}</p><p className="text-caption text-stone">{text(customer.email)}</p></div><div><p className="label-caps mb-1">Payment</p><p className="text-body capitalize">{text(order.paymentMethod)} · {text(order.paymentStatus)}</p><p className="text-caption text-stone">Status: {text(order.status)}</p></div><div><p className="label-caps mb-1">Shipping address</p><p className="text-body">{text(address.fullName)} · {text(address.phone)}</p><p className="text-caption text-stone">{[address.addressLine, address.area, address.city, address.postalCode].filter(Boolean).map(String).join(", ")}</p></div></div>
    <div className="py-5"><p className="label-caps mb-3">Items</p><div className="divide-y divide-sand border-y border-sand">{items.map((item, index) => { const detail = item && typeof item === "object" ? item as Row : {}; return <div key={`${String(detail.product ?? index)}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{text(detail.name)}</p><p className="text-caption text-stone">Qty {text(detail.quantity)}{detail.color ? ` · ${String(detail.color)}` : ""}{detail.size ? ` · Size ${String(detail.size)}` : ""}</p></div><div className="text-right"><p className="font-medium">{formatBDT(Number(detail.price ?? 0) * Number(detail.quantity ?? 0))}</p><p className="text-caption text-stone">{formatBDT(Number(detail.price ?? 0))} each</p></div></div>; })}</div></div>
    <div className="ml-auto grid max-w-sm gap-2 text-body"><div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(Number(order.subtotal ?? 0))}</span></div><div className="flex justify-between"><span>Shipping</span><span>{formatBDT(Number(order.shippingFee ?? 0))}</span></div><div className="flex justify-between"><span>Discount</span><span>- {formatBDT(Number(order.discount ?? 0))}</span></div><div className="flex justify-between border-t border-sand pt-2 font-medium"><span>Total</span><span>{formatBDT(Number(order.total ?? 0))}</span></div></div>
  </section>;
}

function parseList(value: FormDataEntryValue | string | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function listValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join(", ") : "";
}

function sizesValue(value: unknown) {
  return Array.isArray(value) ? value.map((item) => {
    if (!item || typeof item !== "object") return "";
    const size = item as { size?: unknown; stock?: unknown };
    return typeof size.size === "string" ? `${size.size}:${typeof size.stock === "number" ? size.stock : 0}` : "";
  }).filter(Boolean).join(", ") : "";
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  if (item === undefined) return items;
  nextItems.splice(targetIndex, 0, item);
  return nextItems;
}

function parseSizes(value: FormDataEntryValue | string | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean).map((item) => {
    const [size, stock = "0"] = item.split(":");
    return { size: (size ?? "").trim(), stock: Number(stock.trim()) || 0 };
  }).filter((item) => item.size);
}