import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductRail } from "@/components/home/ProductRail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.category
    ? await getRelatedProducts(product.category.slug, product.slug)
    : [];

  return (
    <div className="container-editorial py-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <ProductGallery name={product.name} images={product.images} />
        <PurchasePanel
          slug={product.slug}
          name={product.name}
          brandName={product.brand?.name ?? "MAISON"}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          colors={product.colors}
          sizes={product.sizes}
        />
      </div>

      <div className="hairline mt-16 grid grid-cols-1 gap-10 pt-10 md:grid-cols-3">
        <div>
          <p className="label-caps mb-2">Description</p>
          <p className="text-body text-charcoal">{product.description}</p>
        </div>
        <div>
          <p className="label-caps mb-2">Materials & Care</p>
          <p className="text-body text-charcoal">
            {product.material ?? "See product tag for material composition."}
          </p>
        </div>
        <div>
          <p className="label-caps mb-2">Shipping & Returns</p>
          <p className="text-body text-charcoal">
            Standard delivery in 3–5 days across Bangladesh. Free returns within 14
            days of delivery.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="-mx-6 mt-8 md:-mx-20">
          <ProductRail title="You May Also Like" viewAllHref="/shop" products={related} />
        </div>
      )}
    </div>
  );
}
