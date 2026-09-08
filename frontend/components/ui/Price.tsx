import { formatBDT, percentOff } from "@/lib/utils";

export function Price({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md";
}) {
  const discount = percentOff(price, compareAtPrice);
  const priceClass = size === "sm" ? "text-caption" : "text-body";

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={`font-medium text-ink ${priceClass}`}>{formatBDT(price)}</span>
      {discount && compareAtPrice && (
        <>
          <span className="text-caption text-stone line-through">
            {formatBDT(compareAtPrice)}
          </span>
          <span className="text-caption text-oxblood">-{discount}%</span>
        </>
      )}
    </span>
  );
}
