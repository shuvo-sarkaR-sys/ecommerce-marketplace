import { cn } from "@/lib/utils";

/**
 * Stands in for real product/brand photography during development and in seed
 * data. Swap for next/image against Cloudinary URLs once assets exist --
 * every call site already reads from `product.images[0]`, so this component
 * is the only thing to remove.
 */
export function ImagePlaceholder({
  label,
  className,
  aspect = "aspect-[3/4]",
}: {
  label: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={cn(
        "placeholder-surface relative flex items-end overflow-hidden border border-sand",
        aspect,
        className,
      )}
      role="img"
      aria-label={label}
    >
      <span className="p-4 font-display text-h3 italic text-charcoal/40">{label}</span>
    </div>
  );
}
