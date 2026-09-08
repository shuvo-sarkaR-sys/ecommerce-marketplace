import { getTrendingProducts } from "@/lib/data/home";
import { ProductRail } from "./ProductRail";

export async function TrendingProducts() {
  const products = await getTrendingProducts(8);
  return <ProductRail title="Trending Now" viewAllHref="/shop?sort=popular" products={products} />;
}
