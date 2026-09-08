import Link from "next/link";
import { notFound } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const response = await fetch(`${BACKEND_URL}/api/brands`, { cache: "no-store" });
  if (!response.ok) notFound();
  const json = await response.json() as { data: { brands: Array<{ slug: string; name: string; description: string }> } };

  return <main className="container-editorial py-12 md:py-16">
    <div className="mb-10 border-b border-sand pb-6"><p className="label-caps">The MAISON directory</p><h1 className="mt-2 font-display text-h1">Brands</h1><p className="mt-3 max-w-xl text-body text-charcoal">Independent labels and considered makers from across the marketplace.</p></div>
    <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">{json.data.brands.map((brand) => <Link key={brand.slug} href={`/shop/new?brand=${encodeURIComponent(brand.slug)}`} className="border-b border-sand pb-6 hover:text-charcoal"><p className="font-display text-h3">{brand.name}</p><p className="mt-2 text-body text-charcoal">{brand.description}</p><span className="mt-4 inline-block text-caption uppercase tracking-[0.08em] underline">Shop label</span></Link>)}</div>
  </main>;
}