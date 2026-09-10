"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore, cartSubtotal } from "@/lib/store/cart";
import { LinkButton } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { formatBDT } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 3000;

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Cart hydrates from localStorage on the client only -- avoid rendering
  // "empty cart" for a moment before hydration completes.
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-editorial flex flex-col items-center py-24 text-center">
        <h1 className="font-display text-h1">Your Bag is Empty</h1>
        <p className="mt-3 max-w-sm text-body text-charcoal">
          Everything you add will show up here.
        </p>
        <LinkButton href="/" variant="primary" size="lg" className="mt-8 text-white">
          Continue Shopping
        </LinkButton>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="container-editorial py-12">
      <h1 className="mb-8 font-display text-h1">Your Bag</h1>

      <div className="mb-10 border border-sand p-4">
        <p className="text-caption text-charcoal">
          {remaining > 0 ? (
            <>
              You&apos;re <span className="font-medium text-ink">{formatBDT(remaining)}</span>{" "}
              away from free delivery.
            </>
          ) : (
            "You've unlocked free delivery."
          )}
        </p>
        <div className="mt-2 h-1 w-full bg-sand">
          <div className="h-1 bg-ink transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.slug}-${item.color ?? ""}-${item.size ?? ""}`}
              className="hairline flex gap-4 pt-6 first:border-t-0 first:pt-0"
            >
              <Link href={`/product/${item.slug}`} className="w-28 flex-none">
                <ImagePlaceholder label={item.name} aspect="aspect-[3/4]" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="label-caps">{item.brandName}</p>
                  <Link href={`/product/${item.slug}`} className="text-body hover:underline">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-caption text-stone">
                    {[item.color, item.size].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-24 items-center border border-stone/40">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item, item.quantity - 1)
                      }
                      className="flex-1"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-caption">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item, item.quantity + 1)
                      }
                      className="flex-1"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-body">{formatBDT(item.price * item.quantity)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item)}
                aria-label={`Remove ${item.name} from bag`}
                className="self-start text-stone hover:text-oxblood"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit border border-sand p-6">
          <h2 className="mb-4 text-h3">Order Summary</h2>
          <div className="flex justify-between text-caption text-charcoal">
            <span>Subtotal</span>
            <span>{formatBDT(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-caption text-charcoal">
            <span>Shipping</span>
            <span>{remaining > 0 ? "Calculated at checkout" : "Free"}</span>
          </div>
          <div className="hairline mt-4 flex justify-between pt-4 text-body font-medium">
            <span>Total</span>
            <span>{formatBDT(subtotal)}</span>
          </div>
          <LinkButton href="/checkout" variant="primary" size="lg" className="mt-6 w-full">
            Proceed to Checkout
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
