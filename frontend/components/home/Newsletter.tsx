"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: wire to a real /api/newsletter route once email delivery
    // (Section 24, Notifications) is built -- kept client-only for now.
    setStatus("submitted");
  }

  return (
    <section className="hairline bg-ink py-20">
      <div className="container-editorial flex flex-col items-center text-center">
        <h2 className="font-display text-h1 italic text-ivory">Your Edit, Delivered.</h2>
        <p className="mt-4 max-w-md text-body text-ivory/75">
          New arrivals, brand launches, and early access to sales -- straight to your
          inbox.
        </p>

        {status === "submitted" ? (
          <p className="mt-8 text-body text-ivory">You&apos;re on the list.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-sm gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 flex-1 border border-ivory/30 bg-transparent px-4 text-ivory placeholder:text-ivory/50 focus-visible:border-ivory"
            />
            <Button
              type="submit"
              variant="secondary"
              className="border-ivory text-ivory hover:bg-ivory hover:text-ink"
            >
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
