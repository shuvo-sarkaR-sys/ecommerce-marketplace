import Link from "next/link";

export default function SellWithUsPage() {
  return <main className="container-editorial max-w-3xl py-12 md:py-16"><p className="label-caps">For independent labels</p><h1 className="mt-2 font-display text-h1">Sell with MAISON</h1><p className="mt-8 text-body text-charcoal">MAISON gives thoughtful local brands a considered place to meet customers who care about how things are made and worn.</p><div className="mt-10 border-y border-sand py-8"><h2 className="font-display text-h3">Start a conversation</h2><p className="mt-3 text-body text-charcoal">Tell us about your label and what you would like to build with us.</p><a className="mt-6 inline-block text-caption uppercase tracking-[0.08em] underline" href="mailto:partners@maison.example">partners@maison.example</a></div><Link href="/brands" className="mt-8 inline-block text-caption uppercase tracking-[0.08em] underline">Meet our brands</Link></main>;
}
