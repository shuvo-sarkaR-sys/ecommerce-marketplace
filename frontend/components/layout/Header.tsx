"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { MegaMenu } from "./MegaMenu";
import { useCartStore, cartCount } from "@/lib/store/cart";

const NAV_LINKS = [
  { label: "Women", href: "/shop/women", menu: "women" as const },
  { label: "Men", href: "/shop/men", menu: "men" as const },
  { label: "New Arrivals", href: "/shop/new" },
  { label: "Collections", href: "/collections" },
  { label: "Brands", href: "/brands" },
  { label: "Sale", href: "/shop/sale" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<"women" | "men" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The cart store hydrates from localStorage, which the server can't see --
  // rendering the real count before mount would mismatch SSR output, so it
  // shows 0 until the client has hydrated.
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  return (
    <header
      className="sticky top-0 z-50 border-b border-sand bg-ivory/95 backdrop-blur"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div
        className={`container-editorial flex items-center justify-between transition-[height] duration-200 ease-editorial ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="font-display text-h3 tracking-wide">
          MAISON
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              onMouseEnter={() => setOpenMenu(link.menu ?? null)}
              className="py-2"
            >
              <Link
                href={link.href}
                className="font-sans text-caption uppercase tracking-[0.06em] text-ink hover:text-charcoal"
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button aria-label="Search" className="hidden md:block">
            <Search size={19} />
          </button>
          <button aria-label="Search" className="md:hidden">
            <Search size={19} />
          </button>
          <Link href="/wishlist" aria-label="Wishlist" className="hidden md:block">
            <Heart size={19} />
          </Link>
          <Link href="/account" aria-label="Account" className="hidden md:block">
            <User size={19} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center bg-ink text-[10px] text-ivory">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {openMenu && (
        <div onMouseEnter={() => setOpenMenu(openMenu)}>
          <MegaMenu section={openMenu} />
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex bg-ivory md:hidden">
          <div className="flex w-full flex-col">
            <div className="flex items-center justify-between border-b border-sand px-6 py-5">
              <span className="font-display text-h3">MAISON</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-sand py-4 text-h3 font-display"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
