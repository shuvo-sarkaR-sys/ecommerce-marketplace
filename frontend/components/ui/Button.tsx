import Link from "next/link";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

function buttonClasses(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap font-sans font-medium tracking-[0.02em] transition-colors duration-200 ease-editorial disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-ink text-white hover:bg-charcoal",
    variant === "secondary" &&
      "border border-ink bg-transparent text-white hover:bg-ink hover:text-ivory",
    variant === "ghost" && "bg-transparent text-white hover:bg-sand/60",
    size === "sm" && "h-9 px-4 text-caption",
    size === "md" && "h-11 px-6 text-body",
    size === "lg" && "h-14 px-8 text-body",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
    );
  },
);
Button.displayName = "Button";

// Same visual system as Button but renders an actual <a>/<Link> -- for CTAs that
// navigate rather than trigger an action. Keeps semantics correct (no <a> nested
// in <button>) without a second copy of the class logic.
interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
}

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: LinkButtonProps) {
  return <Link href={href} className={buttonClasses(variant, size, className)} {...props} />;
}
