"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useCartStore } from "@/lib/store/cart";

export function Providers({ children }: { children: React.ReactNode }) {
  const setCartOwner = useCartStore((state) => state.setOwner);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    apiFetch<{ user: { id: string } }>("/auth/me")
      .then(({ user }) => setCartOwner(user.id))
      .catch(() => setCartOwner(null));
  }, [setCartOwner]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
