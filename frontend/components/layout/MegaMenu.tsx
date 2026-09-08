import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const MENUS = {
  women: {
    groups: [
      { title: "Clothing", items: ["Dresses", "Tops", "Shirts", "Jeans", "Trousers", "Skirts", "Outerwear"] },
      { title: "Shoes", items: ["Sneakers", "Heels", "Sandals", "Boots"] },
      { title: "Accessories", items: ["Bags", "Jewelry", "Watches", "Sunglasses"] },
    ],
    promo: "The Autumn Edit",
  },
  men: {
    groups: [
      { title: "Clothing", items: ["Shirts", "T-Shirts", "Jeans", "Trousers", "Jackets", "Suits"] },
      { title: "Shoes", items: ["Sneakers", "Loafers", "Boots", "Sandals"] },
      { title: "Accessories", items: ["Bags", "Watches", "Belts", "Sunglasses"] },
    ],
    promo: "Tailored Essentials",
  },
} as const;

export function MegaMenu({ section }: { section: "women" | "men" }) {
  const menu = MENUS[section];

  return (
    <div className="absolute inset-x-0 top-full z-40 border-b border-sand bg-ivory shadow-none">
      <div className="container-editorial grid grid-cols-4 gap-10 py-10">
        {menu.groups.map((group) => (
          <div key={group.title}>
            <p className="label-caps mb-4">{group.title}</p>
            <ul className="flex flex-col gap-3">
              {group.items.map((item) => (
                <li key={item}>
                  <Link
                    href={`/shop/${section}?tag=${encodeURIComponent(item.toLowerCase())}`}
                    className="text-body text-ink hover:text-charcoal"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link href={`/shop/${section}`} className="block">
          <ImagePlaceholder label={menu.promo} aspect="aspect-[4/5]" />
          <p className="mt-3 font-display text-h3 italic">{menu.promo}</p>
        </Link>
      </div>
    </div>
  );
}
