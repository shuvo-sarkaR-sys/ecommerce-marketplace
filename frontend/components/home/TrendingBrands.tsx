import Link from "next/link";
import { getTrendingBrands } from "@/lib/data/home";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export async function TrendingBrands() {
  const brands = await getTrendingBrands(4);
  if (brands.length === 0) return null;

  return (
    <section className="bg-paper py-20">
      <div className="container-editorial">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-h2">Brands to Watch</h2>
          <Link href="/brands" className="text-caption uppercase tracking-[0.06em] underline underline-offset-4">
            Explore all brands
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {brands.map((brand) => (
            <Link key={brand.slug} href={`/shop/new?brand=${encodeURIComponent(brand.slug)}`} className="group block">
              <ImagePlaceholder label={brand.name} aspect="aspect-[4/3]" />
              <div className="mt-4">
                <h3 className="font-display text-h3">{brand.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-caption text-charcoal">
                  {brand.description}
                </p>
                <p className="mt-2 text-caption text-stone">{brand.productCount} products</p>
                <span className="mt-2 inline-block text-caption uppercase tracking-[0.06em] text-ink group-hover:underline">
                  Explore Brand
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
