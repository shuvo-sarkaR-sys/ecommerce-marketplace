import { LinkButton } from "@/components/ui/Button";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/checkout");

  return (
    <div className="container-editorial flex flex-col items-center py-24 text-center">
      <p className="label-caps mb-4">Checkout</p>
      <h1 className="font-display text-h1">Coming Soon</h1>
      <p className="mt-3 max-w-md text-body text-charcoal">
        The checkout flow (shipping details, bKash/Nagad/COD/card payment) is the
        next phase of this build. Your bag is saved, so it&apos;ll be here when
        checkout is ready.
      </p>
      <LinkButton href="/cart" variant="secondary" size="lg" className="mt-8">
        Back to Bag
      </LinkButton>
    </div>
  );
}
