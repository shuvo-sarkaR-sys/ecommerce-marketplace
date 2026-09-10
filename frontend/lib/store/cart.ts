"use client";

import { create } from "zustand";

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
  ownerId: string | null;
  setOwner: (ownerId: string | null) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: Pick<CartItem, "slug" | "color" | "size">) => void;
  updateQuantity: (key: Pick<CartItem, "slug" | "color" | "size">, quantity: number) => void;
  clear: () => void;
}

/** Two items are the "same line" only if slug + chosen color + chosen size all match. */
function sameLine(a: Pick<CartItem, "slug" | "color" | "size">, b: Pick<CartItem, "slug" | "color" | "size">) {
  return a.slug === b.slug && a.color === b.color && a.size === b.size;
}

function storageKey(ownerId: string | null) {
  return ownerId ? `maison-cart:user:${ownerId}` : "maison-cart:guest";
}

function readItems(ownerId: string | null): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(storageKey(ownerId));
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function updateItems(ownerId: string | null, items: CartItem[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey(ownerId), JSON.stringify(items));
  return { items };
}

export const useCartStore = create<CartState>()((set) => ({
      ownerId: null,
      items: [],

      setOwner: (ownerId) => set({ ownerId, items: readItems(ownerId) }),

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return updateItems(state.ownerId, state.items.map((i) =>
              sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i,
            ));
          }
          return updateItems(state.ownerId, [...state.items, { ...item, quantity }]);
        }),

      removeItem: (key) =>
        set((state) => updateItems(state.ownerId, state.items.filter((i) => !sameLine(i, key)))),

      updateQuantity: (key, quantity) =>
        set((state) => updateItems(state.ownerId, quantity <= 0
          ? state.items.filter((i) => !sameLine(i, key))
          : state.items.map((i) => (sameLine(i, key) ? { ...i, quantity } : i)))),

      clear: () => set((state) => updateItems(state.ownerId, [])),
    }));

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
