import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { LinkButton } from "@/components/ui/Button";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";
const categoryNames: Record<string, string> = {
  women: "Women",
  men: "Men",
  accessories: "Accessories",
  shoe: "Shoe",
  bags: "Bags",
  beauty: "Beauty",
  new: "New Arrivals",
  sale: "Sale",
};

const categorySlugs = ["women", "men", "accessories", "shoe", "bags", "beauty"] as const;
const backendCategorySlugs: Record<string, string> = { shoe: "shoes" };

interface ApiProduct {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  colors: string[];
  images: string[];
  badges?: ProductCardData["badges"];
  brand: { name?: string } | null;
}

export const dynamic = "force-dynamic";

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ tag?: string; brand?: string }>;
}) {
  const { category } = await params;
  const { tag, brand } = await searchParams;
  const title = categoryNames[category];
  if (!title) notFound();

  const query = new URLSearchParams({ limit: "48", sort: category === "new" ? "newest" : "featured" });
  if (!["new", "sale"].includes(category)) {
    query.set("category", backendCategorySlugs[category] ?? category);
  }
  if (category === "sale") query.set("badge", "sale");
  if (tag) query.set("tag", tag);
  if (brand) query.set("brand", brand);

  const response = await fetch(`${BACKEND_URL}/api/products?${query.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load products");
  const json = await response.json() as { data: { products: ApiProduct[]; total: number } };
  const products = json.data.products.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    brandName: product.brand?.name ?? "MAISON",
    colors: product.colors,
    images: product.images,
    badges: product.badges ?? [],
  }));

  return (
    <main className="container-editorial py-10 md:py-16">
      {/* <nav aria-label="Shop categories" className="mb-10 overflow-x-auto border-y border-sand">
        <ul className="flex min-w-max items-center gap-6 py-4 md:justify-center md:gap-8">
          {categorySlugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/shop/${slug}`}
                className={`text-caption uppercase tracking-[0.08em] transition-colors hover:text-charcoal ${
                  slug === category ? "border-b border-ink pb-1 text-ink" : "text-stone"
                }`}
                aria-current={slug === category ? "page" : undefined}
              >
                {categoryNames[slug]}
              </Link>
            </li>
          ))}
        </ul>
      </nav> */}

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-6">
        <div>
          <p className="label-caps">Shop MAISON</p>
          <h1 className="mt-2 font-display text-h1">{title}</h1>
          {tag && <p className="mt-2 text-body text-charcoal">Showing {tag}.</p>}
          {brand && <p className="mt-2 text-body text-charcoal">Filtered by {brand}.</p>}
        </div>
        <p className="text-caption text-stone">{json.data.total} {json.data.total === 1 ? "piece" : "pieces"}</p>
      </header>

      {products.length === 0 ? (
        <div className="border-y border-sand py-20 text-center">
          <p className="font-display text-h3">No pieces found</p>
          <p className="mx-auto mt-2 max-w-md text-body text-stone">Try another category or clear the current selection to browse the full edit.</p>
          <LinkButton href={`/shop/${category}`} variant="secondary" className="mt-6">View all</LinkButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
      )}
    </main>
  );
}