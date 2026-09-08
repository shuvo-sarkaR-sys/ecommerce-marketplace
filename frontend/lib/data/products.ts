import "server-only";
import type { ProductBadge } from "@/types/product";
import type { ProductCardData } from "@/components/product/ProductCard";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export interface ProductDetail {
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  colors: string[];
  sizes: { size: string; stock: number }[];
  material?: string;
  tags: string[];
  badges: ProductBadge[];
  ratingAverage: number;
  ratingCount: number;
  brand: { name: string; slug: string; logo?: string } | null;
  category: { name: string; slug: string } | null;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${BACKEND_URL}/api/products/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load product: ${slug}`);
  const json = (await res.json()) as { data: { product: ProductDetail } };
  return json.data.product;
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): Promise<ProductCardData[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/products?category=${categorySlug}&limit=${limit + 1}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return [];

  interface ApiProduct {
    slug: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    colors: string[];
    badges?: ProductBadge[];
    brand: { name?: string } | null;
  }

  const json = (await res.json()) as { data: { products: ApiProduct[] } };
  return json.data.products
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      brandName: p.brand?.name ?? "MAISON",
      colors: p.colors,
      badges: p.badges ?? [],
    }));
}
