import Link from "next/link";

const collections = [
  { title: "The Women's Edit", description: "Fluid layers, considered tailoring, and everyday pieces.", href: "/shop/women" },
  { title: "The Men's Edit", description: "Quiet essentials with a sharper point of view.", href: "/shop/men" },
  { title: "New Arrivals", description: "The latest pieces added to MAISON.", href: "/shop/new" },
  { title: "On Sale", description: "A focused selection at considered prices.", href: "/shop/sale" },
];

export default function CollectionsPage() {
  return <main className="container-editorial py-12 md:py-16">
    <div className="mb-10 border-b border-sand pb-6"><p className="label-caps">Curated by MAISON</p><h1 className="mt-2 font-display text-h1">Collections</h1></div>
    <div className="grid gap-6 md:grid-cols-2">{collections.map((collection) => <Link key={collection.href} href={collection.href} className="border border-sand p-8 transition-colors hover:bg-sand/40"><h2 className="font-display text-h2">{collection.title}</h2><p className="mt-3 text-body text-charcoal">{collection.description}</p><span className="mt-8 inline-block text-caption uppercase tracking-[0.08em] underline">Explore collection</span></Link>)}</div>
  </main>;
}