import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedCategories } from "@/lib/data/home";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";
import mens from "@/aseets/men-img.png";
import women from "@/aseets/womens.png";
import accessories from "@/aseets/accessories.png"
import shoe from "@/aseets/shoe.jpg"
import bag from "@/aseets/bags.jpg" 
import beauty from "@/aseets/beauty.png" 

// Asymmetric spans for up to six categories: first two form a wide top row,
// the rest sit in an even row beneath -- avoids a uniform card grid.
const SPANS = [
  "col-span-2 md:col-span-7",
  "col-span-2 md:col-span-5",
  "col-span-1 md:col-span-3",
  "col-span-1 md:col-span-3",
  "col-span-1 md:col-span-3",
  "col-span-1 md:col-span-3",
];

const CATEGORY_IMAGES = [
  women,
  mens,
  accessories,
  shoe,
  bag,
   beauty,
];

export async function FeaturedCategories() {
  const categories = await getFeaturedCategories();
  if (categories.length === 0) return null;

  return (
    <section className="container-editorial py-20">
      <h2 className="mb-8 text-h2">Category</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-12">
        {categories.map((category, i) => {
          const image = category.image ?? CATEGORY_IMAGES[i];
          const isWideCategory = i < 2 || /men/i.test(category.name);

          return (
          <Link
            key={category.slug}
            href={`/shop/${category.slug}`}
            className={cn("group relative block", SPANS[i] ?? "col-span-1 md:col-span-3")}
          >
            {image ? (
              <div className="relative overflow-hidden rounded-[1.6rem] border border-sand bg-stone-100 transition-transform duration-500 ease-editorial group-hover:scale-[1.02]">
                <Image
                  src={image}
                  width={1200}
                  height={1200}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt={category.name}
                  className={cn(
                    "w-full object-cover object-top",
                    isWideCategory
                      ? i === 1
                        ? "aspect-[16/10] md:aspect-[8/7]"
                        : "aspect-[16/10]"
                      : "aspect-square",
                  )}
                />
              </div>
            ) : (
              <ImagePlaceholder
                label={category.name}
                aspect={
                  isWideCategory && i === 1
                    ? "aspect-[16/10] md:aspect-[8/7]"
                    : isWideCategory
                      ? "aspect-[16/10]"
                      : "aspect-square"
                }
                className="transition-transform duration-500 ease-editorial group-hover:scale-[1.02]"
              />
            )}
            <div className="mt-3 flex items-center gap-1.5">
              <span className="font-display text-h3 transition-transform duration-200 group-hover:translate-x-1">
                {category.name}
              </span>
              <ArrowUpRight
                size={18}
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
