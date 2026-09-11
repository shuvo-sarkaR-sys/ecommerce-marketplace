import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { NewArrivals } from "@/components/home/NewArrivals";
import { TrendingBrands } from "@/components/home/TrendingBrands";
import { Editorial } from "@/components/home/Editorial";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { StyleInspiration } from "@/components/home/StyleInspiration";
import { Newsletter } from "@/components/home/Newsletter";

// This page's data (new arrivals, trending brands/products, categories)
// changes as sellers add inventory -- render on each request rather than
// freezing it into the build output. Individual fetches in lib/data/home.ts
// still use Next's data cache (next: { revalidate }), so this doesn't mean
// hitting the backend on every single request.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <NewArrivals />
      <TrendingBrands />
      <Editorial />
      <TrendingProducts />
      {/* <StyleInspiration /> */}
      <Newsletter />
    </>
  );
}
