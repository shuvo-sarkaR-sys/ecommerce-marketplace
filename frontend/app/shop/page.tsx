import Link from "next/link";

const edits = [
  ["Women", "women", "Fluid layers, considered tailoring, and everyday pieces."],
  ["Men", "men", "Quiet essentials with a sharper point of view."],
  ["New Arrivals", "new", "The latest pieces added to MAISON."],
  ["Sale", "sale", "A focused selection at considered prices."],
  ["All pieces", "all", "Browse the complete MAISON edit."],
];

export default function ShopPage() {
  return <main className="container-editorial py-12 md:py-16"><header className="mb-10 border-b border-sand pb-6"><p className="label-caps">The MAISON edit</p><h1 className="mt-2 font-display text-h1">Shop</h1></header><div className="grid gap-6 md:grid-cols-2">{edits.map(([title, slug, description]) => <Link key={slug} href={`/shop/${slug}`} className="border border-sand p-8 transition-colors hover:bg-sand/40"><h2 className="font-display text-h2">{title}</h2><p className="mt-3 text-body text-charcoal">{description}</p><span className="mt-8 inline-block text-caption uppercase tracking-[0.08em] underline">Explore edit</span></Link>)}</div></main>;
}
