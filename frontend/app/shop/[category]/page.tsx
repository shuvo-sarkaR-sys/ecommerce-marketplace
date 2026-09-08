import { notFound } from "next/navigation";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { LinkButton } from "@/components/ui/Button";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";
const categoryNames: Record<string, string> = {
  women: "Women",
  men: "Men",
  new: "New Arrivals",
  sale: "Sale",
};

interface ApiProduct {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  colors: string[];
  badges?: ProductCardData["badges"];
  brand: { name?: string } | null;
}

export const dynamic = "force-dynamic";

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { category } = await params;
  const { tag, brand } = await searchParams as { tag?: string; brand?: string };
  const title = categoryNames[category];
  if (!title) notFound();

  const query = new URLSearchParams({ limit: "48", sort: category === "new" ? "newest" : "featured" });
  if (category === "women" || category === "men") query.set("category", category);
  if (category === "sale") query.set("badge", "sale");
  if (tag) query.set("tag", tag);
  if (brand) query.set("brand", brand);

  const response = await fetch(`${BACKEND_URL}/api/products?${query.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load products");
  const json = await response.json() as { data: { products: ApiProduct[] } };
  const products = json.data.products.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    brandName: product.brand?.name ?? "MAISON",
    colors: product.colors,
    badges: product.badges ?? [],
  }));

  return <main className="container-editorial py-12 md:py-16">
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-6">
      <div><p className="label-caps">Shop MAISON</p><h1 className="mt-2 font-display text-h1">{title}</h1>{tag && <p className="mt-2 text-body text-charcoal">Showing {tag}.</p>}</div>
      <p className="text-caption text-stone">{products.length} pieces</p>
    </div>
    {products.length === 0 ? <div className="border-y border-sand py-16 text-center"><p className="font-display text-h3">No pieces found</p><p className="mt-2 text-body text-stone">Try another category or browse the full edit.</p><LinkButton href={`/shop/${category}`} variant="secondary" className="mt-6">View all</LinkButton></div> : <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div>}
  </main>;
}