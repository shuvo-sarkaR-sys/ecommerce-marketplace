import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Women", href: "/shop/women" },
      { label: "Men", href: "/shop/men" },
      { label: "New Arrivals", href: "/shop/new" },
      { label: "Sale", href: "/shop/sale" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Brands", href: "/brands" },
      { label: "Sell With Us", href: "/sell-with-us" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="hairline mt-24 bg-ivory">
      <div className="container-editorial grid grid-cols-2 gap-10 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <span className="font-display text-h3">MAISON</span>
          <p className="mt-3 max-w-xs text-caption text-charcoal">
            A curated marketplace for Bangladesh&apos;s most distinctive independent fashion
            brands.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="label-caps mb-4">{column.title}</p>
            <ul className="flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-caption text-charcoal hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="hairline container-editorial flex flex-col gap-2 py-6 text-caption text-stone md:flex-row md:items-center md:justify-between">
        <span>&copy; {new Date().getFullYear()} MAISON. All rights reserved.</span>
        <span>Dhaka, Bangladesh</span>
      </div>
    </footer>
  );
}
