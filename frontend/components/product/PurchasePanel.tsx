"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";

interface SizeStock {
  size: string;
  stock: number;
}

export function PurchasePanel({
  slug,
  name,
  brandName,
  price,
  compareAtPrice,
  colors,
  sizes,
}: {
  slug: string;
  name: string;
  brandName: string;
  price: number;
  compareAtPrice?: number | null;
  colors: string[];
  sizes: SizeStock[];
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [size, setSize] = useState<string | undefined>(
    sizes.find((s) => s.stock > 0)?.size,
  );
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    apiFetch<{ wishlist: { product?: { slug: string } }[] }>("/account/wishlist")
      .then(({ wishlist }) => setWishlisted(wishlist.some((item) => item.product?.slug === slug)))
      .catch(() => setWishlisted(false));
  }, [slug]);

  const needsSize = sizes.length > 0;
  const selectedStock = sizes.find((s) => s.size === size)?.stock ?? null;
  const canAdd = !needsSize || (Boolean(size) && (selectedStock ?? 0) > 0);

  async function toggleWishlist() {
    try {
      if (wishlisted) {
        await apiFetch(`/account/wishlist/${slug}`, { method: "DELETE" });
      } else {
        await apiFetch(`/account/wishlist/${slug}`, { method: "POST" });
      }
      setWishlisted((value) => !value);
    } catch {
      router.push(`/login?next=${encodeURIComponent(`/product/${slug}`)}`);
    }
  }

  function addToBag() {
    if (!canAdd) return;
    addItem({ slug, name, brandName, price, color, size }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function buyNow() {
    if (!canAdd) return;
    addItem({ slug, name, brandName, price, color, size }, quantity);
    router.push("/cart");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-caps mb-2">{brandName}</p>
        <h1 className="font-display text-h1">{name}</h1>
        <div className="mt-3">
          <Price price={price} compareAtPrice={compareAtPrice} />
        </div>
      </div>

      {colors.length > 0 && (
        <div>
          <p className="label-caps mb-3">Color{colors.length > 1 ? "s" : ""}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={color === c}
                className={cn(
                  "border px-4 py-2 text-caption",
                  color === c ? "border-ink bg-ink text-ivory" : "border-stone/40 text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {needsSize && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="label-caps">Size</p>
            <button type="button" className="text-caption text-stone hover:underline">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const disabled = s.stock === 0;
              return (
                <button
                  key={s.size}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSize(s.size)}
                  aria-pressed={size === s.size}
                  className={cn(
                    "h-11 min-w-[2.75rem] border px-3 text-caption",
                    disabled &&
                      "cursor-not-allowed border-sand text-stone/50 line-through",
                    !disabled && size === s.size && "border-ink bg-ink text-ivory",
                    !disabled && size !== s.size && "border-stone/40 text-ink",
                  )}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="label-caps mb-3">Quantity</p>
        <div className="flex h-11 w-32 items-center border border-stone/40">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex-1 text-body"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex-1 text-center text-body">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex-1 text-body"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" className="text-white" onClick={addToBag} disabled={!canAdd}>
          {justAdded ? "Added to Cart" : "Add to Cart"}
        </Button>
        <Button size="lg" variant="secondary" onClick={buyNow} disabled={!canAdd}>
          Buy Now
        </Button>
        <button
          type="button"
          onClick={toggleWishlist}
          className="flex items-center justify-center gap-2 py-2 text-caption uppercase tracking-[0.06em] text-charcoal"
          aria-pressed={wishlisted}
        >
          <Heart size={16} className={wishlisted ? "fill-oxblood text-oxblood" : ""} />
          {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
        </button>
      </div>

      {needsSize && !size && (
        <p className="text-caption text-oxblood">Select a size to continue.</p>
      )}
    </div>
  );
}
