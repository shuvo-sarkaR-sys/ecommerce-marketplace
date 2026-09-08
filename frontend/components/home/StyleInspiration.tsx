import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const STYLES = [
  { name: "Summer Collection", slug: "summer" },
  { name: "Streetwear", slug: "streetwear" },
  { name: "Minimal Style", slug: "minimal" },
  { name: "Festive Collection", slug: "festive" },
  { name: "Office Wear", slug: "office" },
  { name: "Weekend Style", slug: "weekend" },
];

export function StyleInspiration() {
  return (
    <section className="py-20">
      <div className="container-editorial mb-8">
        <h2 className="text-h2">Style Inspiration</h2>
      </div>
      <div className="scrollbar-none flex gap-4 overflow-x-auto px-6 pb-2 md:px-20">
        {STYLES.map((style) => (
          <Link
            key={style.slug}
            href={`/collections/${style.slug}`}
            className="group w-56 flex-none md:w-72"
          >
            <ImagePlaceholder
              label={style.name}
              aspect="aspect-[3/4]"
              className="transition-transform duration-500 ease-editorial group-hover:scale-[1.02]"
            />
            <p className="mt-3 font-display text-h3">{style.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
