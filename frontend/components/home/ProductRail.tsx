import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";

export function ProductRail({
  title,
  viewAllHref,
  products,
}: {
  title: string;
  viewAllHref: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="container-editorial py-20">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-h2">{title}</h2>
        <Link href={viewAllHref} className="text-caption uppercase tracking-[0.06em] hover:underline">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
