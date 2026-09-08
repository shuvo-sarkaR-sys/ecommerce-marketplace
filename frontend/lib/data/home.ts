import "server-only";
import type { ProductCardData } from "@/components/product/ProductCard";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

// Shape returned by the backend's /api/products (see
// backend/src/services/product.service.ts) once populated -- declared here
// rather than shared as a package, since frontend and backend are separate
// deployable apps with no shared types across the boundary.
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

interface ApiBrand {
  slug: string;
  name: string;
  description: string;
}

interface ApiCategory {
  slug: string;
  name: string;
  image?: string | null;
}

function toCardData(doc: ApiProduct): ProductCardData {
  return {
    slug: doc.slug,
    name: doc.name,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? null,
    brandName: doc.brand?.name ?? "MAISON",
    colors: doc.colors,
    images: doc.images,
    badges: doc.badges ?? [],
  };
}

/**
 * Homepage sections are Server Components, so they fetch the backend
 * directly (server-to-server) rather than going through the /api rewrite
 * proxy in next.config.ts, which exists for browser-originated requests so
 * their cookies stay same-origin. `next: { revalidate }` gives Next's data
 * cache a TTL instead of hitting the backend on every request.
 */
async function fetchJSON<T>(path: string, revalidateSeconds = 60): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`Backend request failed: ${path} (${res.status})`);
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

export async function getNewArrivals(limit = 8): Promise<ProductCardData[]> {
  const { products } = await fetchJSON<{ products: ApiProduct[] }>(
    `/api/products?sort=newest&limit=${limit}`,
  );
  return products.map(toCardData);
}

export async function getTrendingProducts(limit = 8): Promise<ProductCardData[]> {
  const { products } = await fetchJSON<{ products: ApiProduct[] }>(
    `/api/products?sort=popular&limit=${limit}`,
  );
  return products.map(toCardData);
}

export interface TrendingBrandData {
  slug: string;
  name: string;
  description: string;
  productCount: number;
}

export async function getTrendingBrands(limit = 4): Promise<TrendingBrandData[]> {
  const { brands } = await fetchJSON<{ brands: ApiBrand[] }>("/api/brands");
  const trimmed = brands.slice(0, limit);

  // The backend's /api/brands doesn't currently return a product count
  // (it's a per-brand aggregate the seller dashboard will need too) --
  // fetched per brand here until that's added as a dedicated field.
  const counts = await Promise.all(
    trimmed.map((b) =>
      fetchJSON<{ total: number }>(`/api/products?brand=${b.slug}&limit=1`).then(
        (r) => r.total,
      ),
    ),
  );

  return trimmed.map((b, i) => ({
    slug: b.slug,
    name: b.name,
    description: b.description,
    productCount: counts[i] ?? 0,
  }));
}

export interface FeaturedCategoryData {
  slug: string;
  name: string;
  image?: string | null;
}

export async function getFeaturedCategories(): Promise<FeaturedCategoryData[]> {
  const { categories } = await fetchJSON<{ categories: ApiCategory[] }>('/api/categories');
  const categoryOrder = ["women", "men", "accessories", "shoe", "bags", "beauty"];
  const bySlug = new Map(categories.map((category) => [category.slug === "shoes" ? "shoe" : category.slug, category]));

  return categoryOrder
    .map((slug) => bySlug.get(slug))
    .filter((category): category is ApiCategory => Boolean(category))
    .map((category) => ({
      slug: category.slug === "shoes" ? "shoe" : category.slug,
      name: category.slug === "shoes" ? "Shoe" : category.name,
      image: category.image ?? null,
    }));
}
