"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useCartStore } from "@/lib/store/cart";
import type { ProductBadge } from "@/types/product";

export interface ProductCardData {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  brandName: string;
  colors: string[];
  badges: ProductBadge[];
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const badges = product.badges ?? [];
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="relative block">
        <ImagePlaceholder
          label={product.name}
          className="transition-transform duration-500 ease-editorial group-hover:scale-[1.03]"
        />

        {badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {badges.map((badge) => (
              <Badge key={badge} type={badge} />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((w) => !w);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-paper/90 text-ink transition-transform duration-200 hover:scale-110"
        >
          <Heart
            size={16}
            className={wishlisted ? "fill-oxblood text-oxblood" : "text-ink"}
          />
        </button>

        <div
          className={`absolute inset-x-3 bottom-3 transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // Quick Add skips size/color selection (the card doesn't carry
              // stock-per-size data) -- adds the first color with no size.
              // A shopper needing a specific size still uses the PDP.
              addItem({
                slug: product.slug,
                name: product.name,
                brandName: product.brandName,
                price: product.price,
                color: product.colors[0],
              });
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 1500);
            }}
            className="w-full bg-ink py-2.5 text-label uppercase tracking-[0.08em] text-ivory hover:bg-charcoal"
          >
            {justAdded ? "Added" : "Quick Add"}
          </button>
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-1">
        <span className="label-caps">{product.brandName}</span>
        <Link href={`/product/${product.slug}`} className="text-body text-ink hover:underline">
          {product.name}
        </Link>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
        {product.colors.length > 1 && (
          <span className="text-caption text-stone">{product.colors.length} colors</span>
        )}
      </div>
    </div>
  );
}
