import { cn } from "@/lib/utils";
import type { ProductBadge } from "@/types/product";

const LABELS: Record<ProductBadge, string> = {
  new: "New",
  bestseller: "Bestseller",
  limited: "Limited",
  sale: "Sale",
};

export function Badge({ type }: { type: ProductBadge }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-label uppercase tracking-[0.08em]",
        type === "sale" ? "bg-oxblood text-ivory" : "bg-ink text-ivory",
      )}
    >
      {LABELS[type]}
    </span>
  );
}
