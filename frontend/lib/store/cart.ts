"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  name: string;
  brandName: string;
  price: number;
  color?: string;
  size?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: Pick<CartItem, "slug" | "color" | "size">) => void;
  updateQuantity: (key: Pick<CartItem, "slug" | "color" | "size">, quantity: number) => void;
  clear: () => void;
}

/** Two items are the "same line" only if slug + chosen color + chosen size all match. */
function sameLine(a: Pick<CartItem, "slug" | "color" | "size">, b: Pick<CartItem, "slug" | "color" | "size">) {
  return a.slug === b.slug && a.color === b.color && a.size === b.size;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, key)) })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !sameLine(i, key))
              : state.items.map((i) => (sameLine(i, key) ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "maison-cart" },
  ),
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
