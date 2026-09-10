"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useCartStore } from "@/lib/store/cart";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const setCartOwner = useCartStore((state) => state.setOwner);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setCartOwner(null);
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-label="Log out"
      title="Log out"
      className="mt-6 inline-flex items-center gap-2 px-3 py-2 text-caption text-stone transition-colors hover:bg-sand/60 hover:text-ink disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
      {isLoggingOut ? "Logging out..." : "Log out"}
    </button>
  );
}