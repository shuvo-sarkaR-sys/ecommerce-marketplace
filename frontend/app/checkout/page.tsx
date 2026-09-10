import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getSessionUser } from "@/lib/session";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/checkout");

  return <CheckoutClient userName={user.name} />;
}
